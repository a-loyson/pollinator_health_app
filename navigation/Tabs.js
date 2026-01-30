import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Map from "../screens/Map";
import Home from "../screens/Home"; 
import MySightings from "../screens/MySightings";
import Collection from "../screens/Collection";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CameraOptions from "../components/CameraOptions.js";
import { StyleSheet, Pressable } from "react-native";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          height: 70,
          elevation: 5,
          backgroundColor: "#7E8973",
          borderTopWidth: 0,
        },
        tabBarIconStyle: { marginTop: 5 },
        tabBarActiveTintColor: "#EAE2DC",
        tabBarInactiveTintColor: "#EAE2DC",
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={({ navigation }) => ({
          headerShown: true,
          title: "Home",
          headerStyle: {
            backgroundColor: "#dcd8ce",
          },
          headerTintColor: "#4c5345",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // headerRight: () => (
          //   <Pressable 
          //     style={styles.profileButton} 
          //     onPress={() => navigation.navigate("MySightings")}
          //   >
          //     <Ionicons name="person-outline" size={20} color="#EAE2DC" />
          //   </Pressable>
          // ),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={color}
            />
          ),
        })}
      />
      <Tab.Screen
        name="My Sightings"
        component={MySightings}
        options = {{
          headerShown: true,
          title: "My Sightings",
          headerStyle: {
            backgroundColor: "#dcd8ce",
          },
          headerTintColor: "#4c5345",
          headerTitleStyle: {
            fontWeight: "bold",
          },
            tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "binoculars" : "binoculars-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      >
      </Tab.Screen>
      <Tab.Screen
        name="Camera"
        component={Home}
        options={{
          tabBarButton: (props) => <CameraOptions {...props} />,
        }}
      />

      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name={focused ? "map" : "map-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Image Repository"
        component={Collection}
        options = {{
          headerShown: true,
          title: "Image Repository",
          headerStyle: {
            backgroundColor: "#dcd8ce",
          },
          headerTintColor: "#4c5345",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? "cloud-upload" : "cloud-upload-outline"}
            size={28}
            color={color}
          />
          ),
        }}
      ></Tab.Screen>
    </Tab.Navigator>
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
