import { API_URL } from "../config";

export async function getSightings() {
  try {
    const res = await fetch(`${API_URL}/api/sightings/`, {
      credentials: "include",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (err) {
    console.log("getSightings error:", err);
    return [];
  }
}
