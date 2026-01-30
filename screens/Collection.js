import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, FlatList, Alert, Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_MARGIN = 8;
const IMAGE_SIZE =
  (SCREEN_WIDTH - IMAGE_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

export default function Collection() {
  const [images, setImages] = useState([]);
  const tabBarHeight = useBottomTabBarHeight();

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (uri) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const buildFormData = () => {
    const data = new FormData();

    images.forEach((image, index) => {
      data.append("photos", {
        uri: image.uri,
        name: image.fileName ?? `image_${index}.jpg`,
        type: "image/jpeg",
      });
    });

    console.log("Prepared FormData with", images.length, "images");
    return data;
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      Alert.alert("Please select at least one image");
      return;
    }

    buildFormData();
    Alert.alert(`Prepared ${images.length} images for submission`);
  };

  return (
    <View 
      style={[
        styles.container,
        { paddingBottom: 32 + tabBarHeight },
      ]}
    >
      <Text style={styles.title}>Upload Photos</Text>
      <Text style={styles.captionInput}>Share to our community repository of Solidago images.</Text>

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>Add Photos</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>
      </View>
  <View style={{flex: 1}}>
      {images.length === 0 ? (
      
        <Text style={styles.emptyText}>No photos selected</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, index) => item.uri + index}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeImage(item.uri)}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}
      </View>

      <Pressable
        style={[
          styles.submitButton,
          images.length === 0 && styles.submitDisabled,
        ]}
        onPress={handleSubmit}
        disabled={images.length === 0}
      >
        <Text style={styles.submitText}>
          Submit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#EAE2DC",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "left",
  },
  captionInput: {
    textAlign: "left",
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4c5345",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 24,
  },
  grid: {
    marginTop: IMAGE_MARGIN,
  },
  imageWrapper: {
    position: "relative",
    margin: IMAGE_MARGIN / 2,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 6,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 16,
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: "#4c5345",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  submitDisabled: {
    backgroundColor: "#aaa",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
