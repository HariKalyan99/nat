import Loader from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { getItem, setItem } from "@/utils/storage";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/feed.styles";

export default function Index() {
  const { signOut } = useAuth();
  const convex = useConvex();

  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const FEED_CACHE_KEY = "@feed_posts";
  const FEED_TIMESTAMP_KEY = "@feed_posts_timestamp";
  const CACHE_DURATION_MS = 60 * 60 * 1000;

  useEffect(() => {
    loadPostsOnStartup();
  }, []);

  useEffect(() => {
    // Setup interval for auto-refresh every 1 hour
    const interval = setInterval(async () => {
      console.log("🔁 Auto-fetching feed after 1 hour...");

      try {
        const fresh = await convex.query(api.posts.getFeedPosts);
        if (fresh) {
          setPosts(fresh);
          await AsyncStorage.setItem(FEED_CACHE_KEY, JSON.stringify(fresh));
          await AsyncStorage.setItem(FEED_TIMESTAMP_KEY, Date.now().toString());
          console.log("✅ Auto-refresh complete.");
        }
      } catch (err) {
        console.error("Auto-refresh error:", err);
      }
    }, CACHE_DURATION_MS); // 1 hour

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const loadPostsOnStartup = async () => {
    try {
      const lastFetched = getItem(FEED_TIMESTAMP_KEY);
      const now = Date.now();

      if (lastFetched && now - lastFetched < CACHE_DURATION_MS) {
        const cached = getItem(FEED_CACHE_KEY);
        if (cached) {
          setPosts(cached);
          setLoading(false);
          return;
        }
      }

      const fresh = await convex.query(api.posts.getFeedPosts);
      if (fresh) {
        setPosts(fresh);
        setItem(FEED_CACHE_KEY, fresh);
        setItem(FEED_TIMESTAMP_KEY, now);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading posts:", err);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await convex.query(api.posts.getFeedPosts);
      if (fresh) {
        setPosts(fresh);
        setItem(FEED_CACHE_KEY, fresh);
        setItem(FEED_TIMESTAMP_KEY, Date.now());
        console.log("Manually refreshed feed.");
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <Loader />;

  if (posts.length === 0) return <NoPostsFound />;

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>nat</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            // onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

const NoPostsFound = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet!</Text>
    </View>
  );
};
