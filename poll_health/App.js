import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Stack from "./navigation/Stack";
import Tabs from "./navigation/Tabs";

export default function App() {
  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}