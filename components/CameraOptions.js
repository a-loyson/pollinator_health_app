import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CameraButton from "./CameraButton";
import { useNavigation } from "@react-navigation/native";

export default function CameraOptions() {
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation();
  const [nextImage, setNextImage] = useState(null);

  useEffect(() => {
    if (!showOptions && nextImage) {
      navigation.navigate("Home", {
        screen: "SubmissionDetails",
        params: { image: nextImage },
      });
      setNextImage(null);
    }
  }, [showOptions]);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);
  
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNextImage(result.assets[0].uri);
      setShowOptions(false); 
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNextImage(result.assets[0].uri);
      setShowOptions(false);
    }
  };

  return (
    <>
      <CameraButton onPress={() => setShowOptions(true)} />
      <Modal
        visible={showOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.bottomSheet}>
            <Pressable style={styles.optionButton} onPress={takePhoto}>
              <Text style={styles.optionText}>Take Photo</Text>
            </Pressable>

            <Pressable style={styles.optionButton} onPress={pickImage}>
              <Text style={styles.optionText}>Upload from Library</Text>
            </Pressable>

            <Pressable
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={[styles.optionText, { color: "#4c5345" }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  optionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
});