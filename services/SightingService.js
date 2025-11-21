import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sightings";

export async function saveSighting(sighting) {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    parsed.push(sighting);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

    console.log("Sighting saved:", sighting);
    return true;
  } catch (err) {
    console.log("Error saving sighting:", err);
    return false;
  }
}

export async function getSightings() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.log("Error loading sightings:", err);
    return [];
  }
}
