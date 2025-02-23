import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { firestore } from "../../firebaseConfig"; // Correct import path
import { collection, getDocs } from "firebase/firestore"; // Firestore functions
import { Yomogi_400Regular } from "@expo-google-fonts/yomogi";
import { useFonts } from "expo-font";

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [scanMarkers, setScanMarkers] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  // Load Yomogi font
  const [fontsLoaded] = useFonts({
    Yomogi: Yomogi_400Regular,
  });

  // Fetch scanned images and locations from Firestore
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "scannedImages"));
        const scans = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          scans.push({
            id: doc.id,
            image: data.imageUri,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            name: data.name,
            aiResponse: data.aiResponse,
          });
        });
        setScanMarkers(scans);
      } catch (error) {
        console.error("Error fetching scans from Firestore:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchScans();
  }, []);

  // Get user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied.");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Display */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 38.0316,
          longitude: location?.longitude || 78.5108,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
        showsUserLocation={false} // Disable default user location marker
      >
        {/* Display user location with custom raccoon marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            zIndex={2} // Ensure raccoon marker is always on top
          >
            <Image
              source={require("../components/raccoon.png")} // Update the path to your raccoon.png
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        )}

        {/* Display scanned locations as markers */}
        {scanMarkers.map((scan) => (
          <Marker
            key={scan.id}
            coordinate={{ latitude: scan.latitude, longitude: scan.longitude }}
            onPress={() => {
              setSelectedScan(scan);
              setModalVisible(true);
            }}
            zIndex={1} // Ensure scan markers are below the raccoon marker
          >
            <Image
              source={{ uri: scan.image }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </Marker>
        ))}
      </MapView>

      {/* Scan Details Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {selectedScan?.image && (
              <Image
                source={{ uri: selectedScan.image }}
                style={styles.scanImage}
              />
            )}
            <Text style={styles.modalText}>📍 Scanned at:</Text>
            <Text style={styles.modalText}>
              {selectedScan?.latitude.toFixed(4)}, {selectedScan?.longitude.toFixed(4)}
            </Text>
            <Text style={styles.modalText}>{selectedScan?.aiResponse}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Yomogi",
    fontSize: 18,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fffede",
    borderRadius: 20,
    alignItems: "center",
  },
  scanImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Yomogi",
    color: "#241d2e",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "rgba(179, 255, 207, 0.6)",
    padding: 10,
    borderRadius: 50,
  },
  closeButtonText: {
    fontWeight: "bold",
    color: "#241d2e",
    fontFamily: "Yomogi",
  },
});

export default MapScreen;