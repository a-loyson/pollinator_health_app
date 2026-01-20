import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  Pressable, 
  StyleSheet 
} from "react-native";
import { getSightings } from "../services/SightingService";

export default function MySightings({ navigation }) {
  const [sightings, setSightings] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const data = await getSightings();

      const cleaned = (data || []).map((s, index) => ({
        id: index,
        image: s.image,
        prediction: s.prediction,
        species: s.prediction?.top.species,
        date: s.date,
        description: s.description,
        location: s.location,
        latitude: s.location?.latitude,
        longitude: s.location?.longitude,
      }));
      console.log("Loaded sightings:", cleaned);
      setSightings(cleaned);
    });

    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("SightingDetails", { sighting: item })
      }
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.image} 
      />

      <Text style={styles.speciesText}>
        {item.species || "Unknown species"}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sightings}
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE2DC",
    paddingTop: 20,
  },

  header: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 15,
    marginBottom: 10,
    color: "#333",
  },

  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#fff",
    width: "47%",
    borderRadius: 12,
    marginBottom: 20,
    paddingBottom: 10,

    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },

  speciesText: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingTop: 6,
    color: "#333",
  },
});