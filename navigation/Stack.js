import { createStackNavigator } from "@react-navigation/stack";
import Map from "../screens/Map";
import SubmissionDetails from "../screens/SubmissionDetails";
import SightingDetails from "../screens/SightingDetails";
import DetailsScreen from "../screens/details";
import MySightings from "../screens/MySightings";
import Tabs from "./Tabs";
import Collection from "../screens/Collection";
import { StyleSheet, Pressable } from "react-native";
import TermsOfService from "../screens/TermsOfService";
import PrivacyPolicy from "../screens/PrivacyPolicy";
import Upload from "../screens/upload";

const Stack = createStackNavigator();

export default function AppStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator initialRouteName="Tabs" 
      screenOptions={{
        headerStyle: {
          backgroundColor: "#dcd8ce",
        }, 
        headerTintColor: "#4c5345", 
        headerTitleStyle: {
          fontWeight: "bold",
      },}}>
      <Stack.Screen name="Tabs" options={{ headerShown: false }}>
        {(props) => (
          <Tabs {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Details"
        component={DetailsScreen}
        options={{
          title: "Species Identification Results",
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
          title: "Sighting Details",
          tabBarStyle: { display: "none" } 
        }}/>
      <Stack.Screen 
        name="MySightings" 
        component={MySightings}
        options={{
          title: "My Sightings",
        }}
      />
      <Stack.Screen
        name="Collection"
        component={Collection}
        options={{
          title: "Image Repository"
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsOfService}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}