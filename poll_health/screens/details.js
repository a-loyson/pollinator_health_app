import React, { useState } from "react";
import { Button, Image, Text, TextInput, View, StyleSheet } from "react-native";

export default function DetailsScreen({ route, navigation }) {
  const { image } = route.params;
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    console.log({ image, description, location });
    alert("Submitted!\n" + JSON.stringify({ description, location }, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Details</Text>

      <Image source={{ uri: image }} style={styles.imageSmall} />

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

      <Button title="Submit" onPress={handleSubmit} />
    </View>
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
  },
  imageSmall: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 20,
  },
});
