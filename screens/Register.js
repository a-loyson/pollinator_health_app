import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.js handles navigation automatically
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (e.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
      console.log("register error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.prompt}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.prompt}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    color: "#4c5345",
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
  errorText: {
    color: "#c0392b",
    marginBottom: 10,
    fontSize: 14,
    width: "85%",
    textAlign: "center",
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
