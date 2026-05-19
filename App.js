import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as tf from '@tensorflow/tfjs';
import AppStack from "./navigation/Stack";
import AuthStack from "./navigation/AuthStack";
import ModelService from "./services/modelService";
import { API_URL } from "./config";
import PrivacyPolicy from './screens/PrivacyPolicy';
import TermsOfService from './screens/TermsOfService';

// const Drawer = createDrawerNavigator();

// export default function DrawerNavigator() {
//   return (
//     <Drawer.Navigator>
//       <Drawer.Screen name="Privacy Policy" component={PrivacyPolicy} />
//       <Drawer.Screen name="Terms of Service" component={TermsOfService} />
//     </Drawer.Navigator>
//   );
// }

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null); 

  useEffect(() => {
    async function initializeTensorFlow() {
      try {
        // Wait for TensorFlow.js to be ready
        await tf.ready();
        console.log('TensorFlow.js initialized');
        console.log('Backend:', tf.getBackend());
        
        // Initialize model service
        console.log("Initializing model service...");
        await ModelService.initializeTensorFlow();
        console.log("model done");
        console.log("Checking login...");
        await checkLogin();
        console.log("Login done");
        setIsTfReady(true);
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        setIsTfReady(true); // Continue anyway to show app
      }
    }

    initializeTensorFlow();
  }, []);

  async function checkLogin() {
    try {
      const res = await fetch(`${API_URL}/api/me/`, {
        credentials: "include",
      });

      if (res.status === 200) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  }

  if (!isTfReady || isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing App...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        {isLoggedIn
          ? <AppStack setIsLoggedIn={setIsLoggedIn} />
          : <AuthStack setIsLoggedIn={setIsLoggedIn} />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

// import React, { useState } from "react";
// import { Button, Image, Text, View, StyleSheet } from "react-native";
// import * as ImagePicker from "expo-image-picker";

// export default function App() {
//   const [image, setImage] = useState(null);
//   const [result, setResult] = useState();

//   const takePhoto = async () => {
//     let result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };
  
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.Images,
//       allowsEditing: true,
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const handleRunModel = () => {
//     // placeholder for model result
//     setResult("Model result will appear here");
//   };

//   return (
//     <View style={styles.container}>

//       <View style={styles.buttonGroup}>
//         <Button title="Take a Photo" onPress={takePhoto} />
//       </View>
//        <View style={styles.buttonGroup}>
//         <Button title="Pick Image from Gallery" onPress={pickImage} />
//       </View>
//       {image && (
//         <View style={styles.previewContainer}>
//           <Text style={styles.subtitle}>Your Image:</Text>
//           <Image source={{ uri: image }} style={styles.image} />
//         </View>
//       )}
//       <View style={styles.buttonGroup}>
//         <Button title="Predict" onPress={handleRunModel} />
//       </View>
//       <View style={styles.resultContainer}>
//         <Text style={styles.subtitle}>Result:</Text>
//         <Text>{result}</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     buttonGroup: {
//     marginVertical: 12, 
//     width: "80%",
//   },
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 30,
//     marginTop: 30
//   },
//   subtitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginVertical: 10,
//   },
//   previewContainer: {
//     alignItems: "center",
//     marginVertical: 20,
//   },
//   image: {
//     width: 300,
//     height: 300,
//     resizeMode: "contain",
//     borderRadius: 8,
//   },
//   resultContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
// });
