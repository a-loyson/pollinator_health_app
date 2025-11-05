import React, { useState } from "react";
import { Button, Image, Text, View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ModelService from "../services/modelService";

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      const prediction = await ModelService.predictSpecies(image);
      
      console.log('Prediction result:', prediction);
      
      // Navigate to Details screen with image and prediction results
      navigation.navigate("Details", { 
        image: image,
        prediction: prediction.topPrediction,
        allPredictions: prediction.allPredictions
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
          Take or select a photo of a Solidago (goldenrod) plant to identify its species
        </Text>

        <View style={styles.buttonGroup}>
          <Button title="Take a Photo" onPress={takePhoto} color="#007AFF" />
          <Text style={styles.mobileNote}>Mobile only</Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <Button title="Pick Image from Gallery" onPress={pickImage} color="#007AFF" />
        </View>

        {image && (
          <View style={styles.previewContainer}>
            <Text style={styles.subtitle}>Your Image:</Text>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}

        {image && (
          <View style={styles.buttonGroup}>
            <Button title="Clear Image" color="red" onPress={() => setImage(null)} />
          </View>
        )}

        <View style={styles.buttonGroup}>
          <Button 
            title={isAnalyzing ? "Analyzing..." : "Identify Species"} 
            onPress={handleRunModel}
            disabled={!image || isAnalyzing}
            color="#28A745"
          />
        </View>

        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing plant image...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
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
    marginBottom: 15,
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
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    borderRadius: 8,
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