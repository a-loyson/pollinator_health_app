import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Upload from "../screens/upload";
import Details from "../screens/details";

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Upload">
      <Stack.Screen name="Upload" component={Upload} />
      <Stack.Screen name="Details" component={Details} />
    </Stack.Navigator>
  );
}
