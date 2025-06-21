import { useAuth } from "@clerk/clerk-expo";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from '../../styles/auth.styles';

export default function Index() {

  const {signOut} = useAuth();
  return (
    <View
      style={styles.container}
    >
      {/* <Text style={styles.title}>First app.</Text> */}

      {/* <TouchableOpacity onPress={() => alert("Touched")}>
        <Text>Press me</Text>
      </TouchableOpacity>

      <Pressable onPress={() => alert("You have touched")}>

        <Text>Press me now</Text>

      </Pressable>

      <Image source={require("../assets/images/icon.png")} style={{width: 100, height: 100}}>

      </Image>
      <Image source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhM6ZIOMUPj_K76n8DqAYAFDI8MLQUzcij5Q&s"}}  style={{width: 100, height: 100, resizeMode: 'cover'}}>

      </Image> */}


      {/* <Link href={"/notifications"}>
      <Text>Visit Notification page</Text>
      </Link>

      <Link href={"/profile"}>
      <Text>Visit Profile page</Text>
      </Link> */}

      <TouchableOpacity onPress={() => signOut()}>
         <Text style={{color: "white"}}>
          Sign out
         </Text>

      </TouchableOpacity>
    </View>
  );
}


