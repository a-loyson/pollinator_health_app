import { API_URL } from "../config";
import { getAuthHeader } from "./authHeader";

export async function getSightings() {
  try {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/sightings/`, {
      headers: authHeader,
    });

    if (!res.ok) return [];

    return await res.json();
  } catch (err) {
    console.log("getSightings error:", err);
    return [];
  }
}
