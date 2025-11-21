import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Pressable } from "react-native-gesture-handler";
import * as Location from "expo-location";
import { getSightings } from "../services/SightingService"
import AsyncStorage from "@react-native-async-storage/async-storage";

const initial_region = {
  latitude: 40.037945540082966,
  longitude: -75.34229987537816,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function Map({ route, navigation }) {
  const [region, setRegion] = useState(initial_region);
  const [selectedPin, setSelectedPin] = useState(null);
  const [savedSightings, setSavedSightings] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setRegion({
            ...region,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (err) {
          console.log("Location error:", err);
        }
      }

      const data = await getSightings();

  const cleaned = (data || []).map((s) => ({
    species: s.prediction?.species,
    latitude: s.location?.latitude,
    longitude: s.location?.longitude,
  }));

  setSavedSightings(cleaned);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} 
      provider={PROVIDER_GOOGLE} 
      initialRegion={region}
      showsUserLocation={true}
      onPress={() => setSelectedPin(null)}
      >
      {savedSightings.map((item, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          title={item.species}
          onPress={() => setSelectedPin({ name: item.species, coords: item })}
        />
      ))}
      </MapView>
      {selectedPin && (
        <View style={styles.bottomPanel}>
          <Text style={styles.panelTitle}>{selectedPin.name}</Text>
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