import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import CommentsModal from "./CommentsModal";

type PostProps = {
  post: {
    _id: Id<"posts">;
    videoUrl: string;
    caption: string;
    likes: number;
    comments: string;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
};

export default function Post({
  post,
  activeVideoId,
  setActiveVideoId,
}: PostProps) {
  const { user } = useUser();
  const [isLiked, setIsliked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);

  // Determine if this post is currently the active (unmuted) video
  const isActive = activeVideoId === post._id;
  const [muted, setMuted] = useState(!isActive);
  const isPlayerReleased = useRef(false);
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user?.id } : "skip"
  );

  const toggleBookmark = useMutation(api.bookmarks.toggleBookMark);
  const toggleLike = useMutation(api.posts.toggleLike);
  const deletePost = useMutation(api.posts.deletePost);

  const player = useVideoPlayer(post.videoUrl ?? null, (p) => {
    if (post.videoUrl) {
      p.loop = true;
      p.play();
      p.muted = muted;
    }
  });

  // Pause and cleanup video when leaving screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          if (player && !isPlayerReleased.current) {
            player.pause?.();
            player.replaceAsync?.(null);
            isPlayerReleased.current = true; // mark as released
          }
        } catch (err) {
          console.log("Cleanup video error (ignored):", err);
        }
      };
    }, [player])
  );

  // Sync muted state with activeVideoId
  useEffect(() => {
    const shouldBeMuted = activeVideoId !== post._id;
    if (player) player.muted = shouldBeMuted;
    setMuted(shouldBeMuted);
  }, [activeVideoId]);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsliked(newIsLiked);
    } catch (error) {
      console.log("Error toggling like: ", error);
    }
  };

  const handleBookMark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (error) {
      console.log("Error deleting the post", error);
    }
  };

  return (
    <View style={styles.post}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Link
          href={
            currentUser?._id === post.author._id
              ? "/(tabs)/profile"
              : `/user/${post.author._id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {post?.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Video */}
      {post.videoUrl && (
        <Pressable
          style={styles.postImage}
          onPress={() => {
            if (activeVideoId === post._id) {
              const newMuted = !muted;
              setMuted(newMuted);
              if (player) player.muted = newMuted;
              if (!newMuted) setActiveVideoId(post._id);
              else setActiveVideoId(null);
            } else {
              setActiveVideoId(post._id);
              setMuted(false);
              if (player) player.muted = false;
            }
          }}
        >
          {player ? (
            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls={false}
              contentFit="cover"
            />
          ) : (
            <Text style={{ color: "white" }}>Loading video...</Text>
          )}

          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={28}
            color="white"
            style={{ position: "absolute", bottom: 10, right: 10 }}
          />
        </Pressable>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookMark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post?.likes > 0
            ? `${post?.likes.toLocaleString()} likes`
            : "Be the first to like"}
        </Text>

        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {Number(post.comments) > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentText}>
              View all {post?.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post?._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}
