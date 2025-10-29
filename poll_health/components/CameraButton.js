import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CameraButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.button}>
        <Ionicons name="camera-outline" size={30} color="#EAE2DC" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    top: -15,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "#2f2f28", 
    justifyContent: "center",
    alignItems: "center",
  },
});
