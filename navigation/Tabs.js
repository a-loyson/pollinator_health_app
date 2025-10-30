import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Map from "../screens/Map";
import AppStack from "./Stack"; 
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import CameraOptions from "../components/CameraOptions";

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
        component={AppStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Camera"
        component= {AppStack}
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
    </Tab.Navigator>
  );
}
