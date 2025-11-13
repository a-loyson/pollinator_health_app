import React, { useState } from "react";
import { Button, Image, Text, TextInput, View, StyleSheet, ScrollView, Pressable } from "react-native";
import ModelService from "../services/modelService";

export default function SubmissionDetails({ route, navigation }) {
  const { image } = route.params;
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const handleSubmit = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      const prediction = await ModelService.predictSpecies(image);
      navigation.push("Details", {
        image,
        prediction: prediction.topPrediction,
        allPredictions: prediction.allPredictions,
        description,
        location,
      });

    } catch (error) {
      Alert.alert("Error", "Could not analyze image: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView style = {{ backgroundColor: "#EAE2DC" }} contentContainerStyle={{ paddingBottom: 50 }}>
      <Image source={{ uri: image }} style={styles.imageTop} />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Pressable style={styles.submitButton} 
        onPress={handleSubmit}             
        disabled={!image || isAnalyzing}>
        <Text style={{ color: "#ffffffff" }}>Submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    alignSelf: "center",
  },
  imageTop: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#606551",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
  },
});
