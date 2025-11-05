import React, { useState } from "react";
import { Button, Image, Text, TextInput, View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Pressable } from "react-native-gesture-handler";

const initial_region = {
  latitude: 40.037945540082966,
  longitude: -75.34229987537816,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function Map({ route, navigation }) {
  const temp_locations = {
    "Solidago_juncea": { latitude: 40.037945540082966, longitude: -75.34229987537816 },
    "Solidago_mollis": { latitude: 40.047945540082966, longitude: -75.35229987537816 },
    "Solidago_canadensis": { latitude: 40.057945540082966, longitude: -75.36229987537816 },
  }; 
  
  const [selectedPin, setSelectedPin] = useState(null);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} 
      provider={PROVIDER_GOOGLE} 
      initialRegion={initial_region}
      showsUserLocation={true}
      onPress={() => setSelectedPin(null)}
      >
        {Object.entries(temp_locations).map(([name, coords]) => (
          <Marker
            key={name}
            coordinate={{
              latitude: coords.latitude,
              longitude: coords.longitude,
            }}
            title={name.replace("_", " ")}
            onPress={() => setSelectedPin({ name, coords })}
          />
        ))}
      </MapView>
      {selectedPin && (
        <View style={styles.bottomPanel}>
          <Text style={styles.panelTitle}>{selectedPin.name.replace("_", " ")}</Text>
          <Pressable
            style={styles.detailsButton}
            onPress={() => alert(`More details about ${selectedPin.name}`)}
          >
            <Text style={{ color: "#EAE2DC" }}>Details</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bottomPanel: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: "#EAE2DC",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: "#4c5345",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
  },
});