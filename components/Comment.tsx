import { styles } from "@/styles/feed.styles";
import { Image, Text, View } from "react-native";

interface Comment {
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    image: string;
  };
}

export default function Comment({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user.image }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>{timeAgo(comment._creationTime)}</Text>
      </View>
    </View>
  );
}

function timeAgo(creationTime) {
  // Convert Convex microseconds to milliseconds
  const date = new Date(creationTime / 1000);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  // For older dates, return date string
  return date.toLocaleDateString();
}
