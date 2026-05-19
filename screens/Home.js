import React, { useState } from "react";
import { Button, Image, Text, View, StyleSheet, ScrollView, Alert, ActivityIndicator, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ModelService from "../services/modelService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export default function Upload({ navigation, setIsLoggedIn }) {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plantDescription, setPlantDescription] = useState('');

    const logout = async () => {
    await fetch(`${API_URL}/api/logout/`, {
      method: "POST",
      credentials: "include",
    });

    setIsLoggedIn(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Photo library permission is required');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRunModel = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Starting prediction...');
      const prediction = await ModelService.predictSpecies(image, plantDescription);
      
      console.log('Prediction result:', prediction);
      
      navigation.navigate("Details", { 
        image: image,
        plantDescription: plantDescription,
        prediction: prediction.topPrediction,
        allPredictions: prediction.allPredictions,
        primaryModelAccuracy: prediction.primaryModelAccuracy,
        inceptionV3Prediction: prediction.inceptionV3TopPrediction,
        inceptionV3AllPredictions: prediction.inceptionV3AllPredictions,
        inceptionV3ModelAccuracy: prediction.inceptionV3ModelAccuracy,
        vgg19Prediction: prediction.vgg19TopPrediction,
        vgg19AllPredictions: prediction.vgg19AllPredictions,
        vgg19ModelAccuracy: prediction.vgg19ModelAccuracy,
        combinedAccuracy: prediction.combinedAccuracy,
        bertConfidence: prediction.bertConfidence,
        predictedSpecies: prediction.predictedSpecies,
        bestModel: prediction.bestModel
      });
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert(
        'Prediction Failed', 
        'Unable to analyze the image. Please make sure the model is loaded correctly.\n\nError: ' + error.message
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, image && styles.containerWithImage]}>
        <Text style={styles.title}>Solidago Species Identifier</Text>
        <Text style={styles.description}>
          Take or select a photo of a Solidago (goldenrod) plant to identify its species.
        </Text>
        <Pressable onPress={() => navigation.navigate("PrivacyPolicy")}>
          <Text>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Terms")} style={{marginTop: 2}}>
          <Text>Terms of Service</Text>
        </Pressable>
       </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
    backgroundColor: "#EAE2DC",
  },
  buttonGroup: {
    marginVertical: 8, 
    width: "80%",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    minHeight: '100%',
  },
  containerWithImage: {
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: "50%",
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 10,
    width: '100%',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 8,
  },
  textInputContainer: {
    width: '90%',
    marginTop: 15,
  },
  textInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  mobileNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});