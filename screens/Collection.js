import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { uploadToFirebase } from "../services/uploadImage";

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_MARGIN = 8;
const IMAGE_SIZE = (SCREEN_WIDTH - IMAGE_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

// Give every selected photo its own id so it can be removed individually.
let nextId = 0;
const withId = (asset) => ({ ...asset, id: `img-${Date.now()}-${nextId++}` });

export default function Collection() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const tabBarHeight = useBottomTabBarHeight();

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map(withId)]);
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
      setImages((prev) => [...prev, withId(result.assets[0])]);
    }
  };

  // Remove by the image's own id (not its uri) so picking the same photo
  // twice still lets each copy be removed individually.
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Uploads go straight to Firebase Storage (repository/<uid>/...), the same
  // way sighting photos are uploaded, so no backend storage config is needed.
  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert("Please select at least one image");
      return;
    }
    if (uploading) return;

    setUploading(true);
    const failed = [];

    try {
      for (let i = 0; i < images.length; i++) {
        setProgress({ current: i + 1, total: images.length });
        try {
          await uploadToFirebase(images[i].uri, "repository");
        } catch (err) {
          console.log("Upload error:", err);
          failed.push(images[i]);
        }
      }
    } finally {
      setUploading(false);
      setProgress(null);
    }

    // Keep only the photos that failed so the user can retry them.
    setImages(failed);

    if (failed.length === 0) {
      Alert.alert("Success", "Images uploaded successfully!");
    } else {
      Alert.alert(
        "Upload incomplete",
        `${images.length - failed.length} of ${images.length} photos uploaded. ` +
          "The remaining photos are still selected. Check your connection and tap Submit to retry."
      );
    }
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
        <Pressable
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={pickImages}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>Add Photos</Text>
        </Pressable>

        <Pressable
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        {images.length === 0 ? (
          <Text style={styles.emptyText}>No photos selected</Text>
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.uri }} style={styles.image} />
                {!uploading && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeImage(item.id)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}
          />
        )}
      </View>

      <Pressable
        style={[
          styles.submitButton,
          (images.length === 0 || uploading) && styles.submitDisabled,
        ]}
        onPress={handleSubmit}
        disabled={images.length === 0 || uploading}
      >
        {uploading ? (
          <View style={styles.submitContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitText}>
              {progress
                ? `Uploading ${progress.current} of ${progress.total}…`
                : "Uploading…"}
            </Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </Pressable>

      {uploading && (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color="#4c5345" />
            <Text style={styles.overlayText}>
              {progress
                ? `Uploading photo ${progress.current} of ${progress.total}…`
                : "Uploading…"}
            </Text>
          </View>
        </View>
      )}
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
  buttonDisabled: {
    opacity: 0.5,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    // Keep the button above the image so Android delivers the tap to it.
    zIndex: 2,
    elevation: 2,
  },
  removeText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
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
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  overlayCard: {
    backgroundColor: "#EAE2DC",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  overlayText: {
    color: "#4c5345",
    fontSize: 15,
    fontWeight: "600",
  },
});
