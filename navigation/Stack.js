import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Map from "../screens/Map";
import Home from "../screens/Home";
import SubmissionDetails from "../screens/SubmissionDetails";
import SightingDetails from "../screens/SightingDetails";
import DetailsScreen from "../screens/details";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Pressable} from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{
    headerStyle: {
      backgroundColor: "#dcd8ce",
    }, headerTintColor: "#4c5345", 
    headerTitleStyle: {
      fontWeight: "bold",
    },}}>
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{
          title:"Home",
          headerRight: () => (
            <Pressable style={styles.profileButton} onPress={() => console.log("Profile pressed")}>
              <Ionicons name="person-outline" size={20} color="#EAE2DC" />
            </Pressable>
          ),
        }} />
      <Stack.Screen 
        name = "Details"
        component={DetailsScreen}
        options={{
          title: "Plant Details",
        }} />
      <Stack.Screen 
        name="SubmissionDetails" 
        component={SubmissionDetails} 
        options={{
          title: "Confirm Sighting", 
          tabBarStyle: { display: "none" } 
        }}/>
      <Stack.Screen name="Map" component={Map} />
      <Stack.Screen 
        name="SightingDetails" 
        component={SightingDetails} 
        options={{
          tabBarStyle: { display: "none" } 
        }}/>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    backgroundColor: "#4c5345",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
});