import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from "expo-location";
import { getSightings } from "../services/SightingService"

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
    const unsubscribe = navigation.addListener("focus", async () => {
      const data = await getSightings();

      const cleaned = (data || []).map((s, index) => ({
        id: index,
        image: s.image,
        prediction: s.prediction,
        species: s.prediction?.top?.species,
        date: s.date,
        description: s.description,
        location: s.location,
        latitude: s.location?.latitude,
        longitude: s.location?.longitude,
      }));

      setSavedSightings(cleaned);
    });

    return unsubscribe;
  }, [navigation]);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      } catch (err) {
        console.log("Location error:", err);
      }
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
          title={item.prediction?.top?.species}
          onPress={() => setSelectedPin(item)}
        />
      ))}
      </MapView>
      {selectedPin && (
        <View style={styles.bottomPanel}>
          <View style={styles.row}>
            <Image
              source={{ uri: selectedPin.image }}
              style={styles.thumbnail}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.speciesText}>{selectedPin.species}</Text>
              <Text style={styles.dateText}>
                {new Date(selectedPin.date).toLocaleDateString()}
              </Text>
            <Pressable
              style={styles.detailsButton}
              onPress={() => {
                console.log("navigating to details");
                console.log(navigation.getParent())
                navigation.navigate("SightingDetails", { sighting: selectedPin });
              }}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </Pressable>
            </View>
          </View>
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
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  thumbnail: {
  width: 80,
  height: 80,
  borderRadius: 10,
  backgroundColor: "#d0d0d0",
  },
  speciesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4c5345",
  },
  dateText: {
    marginTop: 2,
    fontSize: 14,
    color: "#333",
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: "#4c5345",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsButtonText: {
  color: "#EAE2DC",
  fontWeight: "500",
  },
});