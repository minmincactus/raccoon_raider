import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import HomeScreen from "./src/screens/HomeScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import StoreScreen from "./src/screens/StoreScreen";
import MapScreen from "./src/screens/MapScreen";

import { Yomogi_400Regular } from "@expo-google-fonts/yomogi";

// Initialize stack navigator
const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontsLoaded] = useFonts({ Yomogi: Yomogi_400Regular });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync(); // Hides the splash screen when ready
      } catch (e) {
        console.warn(e);
      }
      setAppReady(true);
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !appReady) {
    console.log("⚠️ Fonts are still loading...");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <Text style={{ fontSize: 20, color: "black" }}>Loading App...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppContent menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </NavigationContainer>
  );
}

function AppContent({ menuOpen, setMenuOpen }) {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="Home">
          {(props) => <ScreenWrapper {...props} menuOpen={menuOpen} setMenuOpen={setMenuOpen} component={HomeScreen} />}
        </Stack.Screen>
        <Stack.Screen name="Scanner">
          {(props) => <ScreenWrapper {...props} menuOpen={menuOpen} setMenuOpen={setMenuOpen} component={ScannerScreen} />}
        </Stack.Screen>
        <Stack.Screen name="Map">
          {(props) => <ScreenWrapper {...props} menuOpen={menuOpen} setMenuOpen={setMenuOpen} component={MapScreen} />}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
}

function ScreenWrapper({ component: Component, navigation, menuOpen, setMenuOpen }) {
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index]?.name || "Home";
  console.log("📌 Current Route:", currentRoute);

  return (
    <ImageBackground source={require("./src/components/grid.webp")} style={styles.background}>
      <Component navigation={navigation} />

      {!menuOpen && (
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuButton}>
          <ImageBackground source={require("./src/components/crumpled.png")} style={styles.menuImage} />
        </TouchableOpacity>
      )}

      {menuOpen && (
        <Pressable style={styles.fullScreenTouch} onPress={() => setMenuOpen(false)}>
          <ImageBackground source={require("./src/components/beigepaper.png")} style={styles.navContainer}>
            <TouchableOpacity style={styles.navButton} onPress={() => { setMenuOpen(false); navigation.navigate("Home"); }}>
              <Text style={[styles.navText, currentRoute === "Home" && styles.activeNavText]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => { setMenuOpen(false); navigation.navigate("Scanner"); }}>
              <Text style={[styles.navText, currentRoute === "Scanner" && styles.activeNavText]}>Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => { setMenuOpen(false); navigation.navigate("Map"); }}>
              <Text style={[styles.navText, currentRoute === "Map" && styles.activeNavText]}>Map</Text>
            </TouchableOpacity>
          </ImageBackground>
        </Pressable>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    width: "100%",
    height: "100%",
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 100,
    height: 100,
  },
  menuImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },
  fullScreenTouch: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  navContainer: {
    position: "absolute",
    top: 30,
    left: 10,
    width: 150,
    height: 150,
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    marginVertical: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  navText: {
    fontFamily: "Yomogi",
    fontSize: 20,
    color: "#241d2e",
  },
  activeNavText: {
    fontWeight: "bold",
    backgroundColor: "rgba(255, 255, 0, 0.3)", 
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 5,
  },
});
