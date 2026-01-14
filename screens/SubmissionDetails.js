import React, { useState, useEffect } from "react";
import { Button, Image, Text, TextInput, View, StyleSheet, ScrollView, Pressable } from "react-native";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModelService from "../services/modelService";
import { saveSighting } from "../services/SightingService";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function SubmissionDetails({ route, navigation }) {
  const { image, metadata } = route.params;
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(metadata?.location || null);
  const [date, setDate] = useState(metadata?.date ? new Date(metadata.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isFormValid = date && location;


  function parseLocationString(text) {
    try {
      const [lat, lon] = text.split(",").map(Number);
      if (isNaN(lat) || isNaN(lon)) return null;
      return { latitude: lat, longitude: lon };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (metadata?.location) {
      console.log("Using EXIF GPS:", metadata.location);
      return; // skip GPS lookup
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (e) {
        console.log("Error fetching location:", e);
      }
    })();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };
  
  const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert("Invalid Location", "Please enter a valid coordinate.");
    return;
    }

    setIsAnalyzing(true);

    try {
      const prediction = await ModelService.predictSpecies(image);

      const newSighting = {
        image,
        description,
        location,
        date: date.toISOString(),
        prediction: prediction.topPrediction,
      };

      await saveSighting(newSighting);
      console.log("Sighting saved:", newSighting);

      const all = await AsyncStorage.getItem("sightings");
      console.log("All saved sightings:", JSON.parse(all));

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
    <ScrollView style = {{ backgroundColor: "#EAE2DC" }} contentContainerStyle={{ paddingBottom: 100 }}>
      <Image source={{ uri: image }} style={styles.imageTop} />
      <View style={styles.fieldContainer}>
      <Text style={styles.prompt}>Confirm Date</Text>
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        <Text>{formatDate(date)}</Text>
      </Pressable>
      {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()} 
              />
            )}
      <Text style={styles.prompt}>Confirm Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter coordinates"
        value={
          location
            ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
            : ""
        }
        onChangeText={(text) => setLocation(parseLocationString(text))}
      />
    <Text style={styles.prompt}>Notes (optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <Pressable 
        style={[
          styles.submitButton,
          !isFormValid && { backgroundColor: "#aaa" },  // visually disabled
        ]} 
        onPress={handleSubmit}             
        disabled={!image || isAnalyzing || !isFormValid}>
        <Text style={{ color: "#ffffffff" }}>Submit</Text>
      </Pressable>
      <Pressable style={styles.cancelButton} 
        onPress={() => navigation.goBack()}>                  
        <Text style={{ color: "#000000ff" }}>Cancel</Text>
      </Pressable>
    </View>
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
  prompt: {
    color: "#2f2f28",
    fontSize:16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
  },
  fieldContainer: {
    width: "85%",       
    alignSelf: "center",
    marginBottom: 20,
  },
  imageTop: {
    width: "100%",
    height: "300",
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#606551",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    top: 10, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
