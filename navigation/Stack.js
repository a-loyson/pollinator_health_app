import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Upload from "../screens/upload";
import DetailsScreen from "../screens/details";

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Upload" screenOptions={{
      headerStyle: {
        backgroundColor: "#dcd8ce",
      }, 
      headerTintColor: "#4c5345", 
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }}>
      <Stack.Screen 
        name="Upload" 
        component={Upload} 
        options={{
          title: "Solidago Species Identifier",
        }} 
      />
      <Stack.Screen 
        name="Details"
        component={DetailsScreen}
        options={{
          title: "Plant Details",
        }} 
      />
    </Stack.Navigator>
  );
}