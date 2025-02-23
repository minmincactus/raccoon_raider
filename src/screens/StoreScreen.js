import React from "react";
import { View, ImageBackground, Image, StyleSheet } from "react-native";

const StoreScreen = () => {
  return (
    <ImageBackground source={require("../components/grid.webp")} style={styles.background}>
      <View style={styles.container}>
        
        {/* Store Title GIF */}
        <Image source={require("../components/store.gif")} style={styles.storeTitle} />

        {/* Torn Paper Background for Store */}
        <Image source={require("../components/whitepaper.png")} style={styles.storePaper} />

        {/* Store Items Would Go Here */}
        <View style={styles.storeContent}>
          {/* Add store item components here */}
        </View>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 50 },
  
  storeTitle: {
    width: 400, // Adjust to fit
    height: 200,
    resizeMode: "contain",
    left: 65,
    top: -35,
    marginBottom: -20, // Slight overlap with paper
    transform: [{ rotate: "-7deg" }],
  },

  storePaper: {
    width: "90%", // Almost full width
    height: 500, // Adjust height
    resizeMode: "contain",
    position: "absolute",
    top: 150, // Position it under the title
  },

  storeContent: {
    position: "absolute",
    top: 150, // Inside the paper area
    width: "80%",
    height: 400, // Adjust as needed
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StoreScreen;
