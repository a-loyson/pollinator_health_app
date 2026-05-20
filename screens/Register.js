import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from "react-native";
import { API_URL } from "../config";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    await fetch(`${API_URL}/api/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    alert("Registered! Please login.");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.prompt}>Username</Text>
        <TextInput 
          style={styles.input}
          placeholder="Username" 
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.prompt}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={register}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ fontWeight: "bold" }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EAE2DC",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4c5345"
  },
  prompt: {
    color: "#2f2f28",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    width: "100%", 
  },
  fieldContainer: {
    width: "85%",
    alignSelf: "center",
    marginBottom: 20,
  },
  submitButton: {
    width: "85%",
    backgroundColor: "#4c5345",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cancelButton: {
    width: "85%",
    backgroundColor: "white",
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});