import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.js handles navigation
    } catch (e) {
      setError("Invalid email or password.");
      console.log("login error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.title}>Log in</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.prompt}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.prompt}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitButton} onPress={login}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={{ fontWeight: "bold" }}>Register</Text>
        </TouchableOpacity>
      </View>
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
  },
  fieldContainer: {
    width: "85%",
    alignSelf: "center",
    marginBottom: 20,
  },
  submitButton: {
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
