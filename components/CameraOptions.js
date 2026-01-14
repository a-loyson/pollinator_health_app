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
      navigation.navigate("SubmissionDetails", { 
        image: nextImage.uri, 
        metadata: nextImage.metadata 
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
      exif: false,
    });
    
    if (!result.canceled) {
      const asset = result.assets[0];

      setNextImage({
        uri: asset.uri,
        metadata: null,  
      });

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
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    console.log("raw exif:" , result.assets[0].exif);

    if (result.canceled) return;

    const asset = result.assets[0];
    const exif = asset.exif || {};

    // ---- GPS CONVERSION ----
    function parseGps(value, ref) {
      if (!value) return null;

      if (typeof value === "number") {
        return ref === "S" || ref === "W" ? -value : value;
      }

      const [d, m, s] = value;
      let decimal = d + m / 60 + s / 3600;
      if (ref === "S" || ref === "W") decimal = -decimal;
      return decimal;
    }

    // ---- DATE CONVERSION ----
    function parseExifDate(dateString) {
      if (!dateString) return null;

      const parts = dateString.split(/[: ]/);
      if (parts.length < 6) return null;
      const [year, month, day, hour, minute, sec] = parts.map(Number);

      return new Date(year, month - 1, day, hour, minute, sec).toISOString(); // <-- FIX
    }

    const gpsLat = parseGps(exif.GPSLatitude, exif.GPSLatitudeRef);
    const gpsLon = parseGps(exif.GPSLongitude, exif.GPSLongitudeRef);

    const metadata = {
      location:
        gpsLat && gpsLon ? { latitude: gpsLat, longitude: gpsLon } : null,
      date: parseExifDate(exif.DateTimeOriginal),
    };

    console.log("EXIF extracted:", metadata);

    // ---- IMPORTANT: only pass serializable params ----
    setNextImage({
      uri: asset.uri,
      metadata,
    });

    setShowOptions(false);
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