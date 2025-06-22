import { styles } from "@/styles/feed.styles";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Post({ post }: { post: any }) {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link href={"/notifications"}>
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
      </View>
    </View>
  );
}
