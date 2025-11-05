import React, { useState } from "react";
import { Button, Image, Text, View, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function SightingDetails({ navigation }) {

  return (
    <ScrollView style = {{ backgroundColor: "#EAE2DC" }}>
      <Text>lol</Text>
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
    backgroundColor: "#EAE2DC",
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