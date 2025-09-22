import React, { useState } from "react";
import { Button, Image, Text, View, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState();

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
        setImage(result.assets[0].uri);
        navigation.navigate("Details", { image: result.assets[0].uri });
    }
  };
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      navigation.navigate("Details", { image: result.assets[0].uri });
    }
  };

  const handleRunModel = () => {
    // placeholder for model result
    setResult("Model result will appear here");
  };

  return (
    <ScrollView>
    <View style={styles.container}>

      <View style={styles.buttonGroup}>
        <Button title="Take a Photo" onPress={takePhoto} />
      </View>
       <View style={styles.buttonGroup}>
        <Button title="Pick Image from Gallery" onPress={pickImage} />
      </View>
      {image && (
        <View style={styles.previewContainer}>
          <Text style={styles.subtitle}>Your Image:</Text>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}
    <View style={styles.buttonGroup}>
      <Button title="Clear Image" color="red" onPress={() => setImage(null)} />
    </View>
      <View style={styles.buttonGroup}>
        <Button title="Predict" onPress={handleRunModel} />
      </View>
      <View style={styles.resultContainer}>
        <Text style={styles.subtitle}>Result:</Text>
        <Text>{result}</Text>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    buttonGroup: {
    marginVertical: 12, 
    width: "80%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 30
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    borderRadius: 8,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});