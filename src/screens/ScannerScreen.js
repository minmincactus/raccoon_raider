import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActionSheetIOS,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firestore } from "../../firebaseConfig"; // Correct import path
import { collection, addDoc } from "firebase/firestore"; // Firestore functions
import * as Location from "expo-location"; // For location
import { Yomogi_400Regular } from "@expo-google-fonts/yomogi";

const GEMINI_API_KEY = "AIzaSyChPgNlspmn7HAkkhFyZmAL3LaRl0dBPME"; // Replace with your Gemini API Key
const GOOGLE_VISION_API_KEY = "AIzaSyCsF8HzcR82Qhob28LjyK8eo-VKvTlbiYQ"; // Replace with your Vision API Key

const ScannerScreen = () => {
  const [image, setImage] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [imageName, setImageName] = useState(""); // For image name input
  const [location, setLocation] = useState(null); // For user location
  const [showAssessButton, setShowAssessButton] = useState(false); // Show "Assess Loot" button
  const [detectedLabels, setDetectedLabels] = useState([]); // Store detected labels from the image
  const [showStashButton, setShowStashButton] = useState(false); // Show "Stash It" button

  // Request camera and location permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (
        cameraStatus !== "granted" ||
        mediaStatus !== "granted" ||
        locationStatus !== "granted"
      ) {
        Alert.alert(
          "Permission Denied",
          "We need camera, media library, and location permissions to scan images."
        );
      }
    })();
  }, []);

  // Get user location
  const getLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location.");
    }
  };

  // Take a photo
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const imageUri = result.assets ? result.assets[0].uri : result.uri;
      setImage(imageUri);
      setShowAssessButton(true); // Show "Assess Loot" button immediately
      analyzeImage(imageUri);
      await getLocation(); // Get location after taking a photo
    }
  };

  // Pick an image from the gallery
  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const imageUri = result.assets ? result.assets[0].uri : result.uri;
      setImage(imageUri);
      setShowAssessButton(true); // Show "Assess Loot" button immediately
      analyzeImage(imageUri);
      await getLocation(); // Get location after picking an image
    }
  };

  // Show image picker options
  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take a Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        "Upload Image",
        "Choose an option:",
        [
          { text: "Take a Photo", onPress: takePhoto },
          { text: "Choose from Library", onPress: pickImageFromGallery },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  };

  // Analyze the image using Google Vision API
  const analyzeImage = async (imageUri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const body = JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "LABEL_DETECTION" }],
          },
        ],
      });

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }
      );

      const data = await response.json();
      console.log("🔍 Labeled Data:", data);

      const labels =
        data.responses[0]?.labelAnnotations?.map((label) => label.description) ||
        [];

      setDetectedLabels(labels); // Store detected labels
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze the image.");
    }
  };

  // Generate AI response using Gemini API
  // Generate AI response using Gemini API
const generateAiResponse = async () => {
  try {
    const prompt = `You are a raccoon pirate searching for treasure. The player found an object named "${imageName}" labeled as: ${detectedLabels.join(
      ", "
    )}. Generate a funny, one-sentence response about how valuable this object is.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const responseText = await response.text();
    console.log("🔥 Raw AI Response:", responseText);

    const data = JSON.parse(responseText);

    if (!data || !data.candidates || data.candidates.length === 0) {
      throw new Error("No valid response from AI");
    }

    const aiText = data.candidates[0]?.content?.parts?.[0]?.text;

    // Remove double quotes from the AI response
    const cleanedAiText = aiText.replace(/"/g, "");

    setAiResponse(cleanedAiText || "Yarrr! I can't tell what it is, but it must be valuable! 🏴‍☠️");
    setShowStashButton(true); // Show "Stash It" button after AI response
    setShowAssessButton(false); // Hide "Assess Loot" button after it's pressed
  } catch (error) {
    console.error("🚨 Error getting AI response:", error);
    setAiResponse("Arrr! The AI ship has sunk! 🏴‍☠️");
  }
};
  // Save data to Firestore
  const saveToFirestore = async () => {
    if (!image || !imageName || !location) {
      Alert.alert("Error", "Please provide an image, name, and ensure location is available.");
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, "scannedImages"), {
        name: imageName,
        imageUri: image,
        aiResponse: aiResponse,
        location: location,
        timestamp: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);

      // Reset the screen after successful save
      resetScanner();
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      Alert.alert("Error", "Failed to save data to Firestore.");
    }
  };

  // Reset the scanner to allow scanning again
  const resetScanner = () => {
    setImage(null);
    setAiResponse("");
    setImageName("");
    setLocation(null);
    setShowAssessButton(false); // Hide the "Assess Loot" button
    setShowStashButton(false); // Hide the "Stash It" button
    setDetectedLabels([]); // Clear detected labels
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../components/grid.webp")}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* Raccoon and Camera GIFs - Only visible when no image is selected */}
          {!image && (
            <>
              <Image
                source={require("../components/camera.gif")} // Update the path to your GIF
                style={styles.cameraGif}
              />
              <Image
                source={require("../components/raccoon.gif")} // Update the path to your GIF
                style={styles.raccoonGif}
              />
            </>
          )}

          {/* "Snap Loot" button only appears when no image is selected */}
          {!image && (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={showImagePickerOptions}
            >
              <Text style={styles.buttonText}>Snap Loot</Text>
            </TouchableOpacity>
          )}

          {image && (
            <>
              {/* Display the image preview with onPress to change image */}
              <TouchableOpacity onPress={showImagePickerOptions}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
              </TouchableOpacity>

              {/* Input for image name */}
              <TextInput
                style={styles.input}
                placeholder="Enter image name"
                value={imageName}
                onChangeText={setImageName}
              />

              {/* "Assess Loot" button - Visible immediately after image is selected */}
              {showAssessButton && (
                <TouchableOpacity
                  style={styles.assessButton}
                  onPress={generateAiResponse}
                >
                  <Text style={styles.buttonText}>Assess Loot</Text>
                </TouchableOpacity>
              )}

              {/* AI-generated response */}
              {aiResponse !== "" && (
                <View style={styles.aiResponseContainer}>
                  <Text style={styles.aiResponseText}>{aiResponse}</Text>
                </View>
              )}

              {/* "Stash It" button - Only visible after AI response is generated */}
              {showStashButton && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveToFirestore}
                >
                  <Text style={styles.buttonText}>Stash It</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

// **Styles**
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cameraGif: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
    resizeMode: "contain",
    position: "absolute",
    top: "39%", // Adjust placement
    left: "75%",
    transform: [{ translateX: -100 }], // Centering
    zIndex: 2, // Higher zIndex to be in front
  },
  raccoonGif: {
    width: 400, // Adjust size as needed
    height: 400, // Adjust size as needed
    resizeMode: "contain",
    marginRight: 10,
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: "rgba(179, 255, 207, 0.6)",
    padding: 12,
    borderRadius: 50,
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  assessButton: {
    backgroundColor: "rgba(255, 181, 43, 0.4)",
    padding: 12,
    borderRadius: 50,
    width: "35%",
    alignItems: "center",
    marginTop: 0,
  },
  saveButton: {
    backgroundColor: "rgba(179, 255, 207, 0.6)",
    padding: 12,
    borderRadius: 50,
    marginTop: 0,
    width: "30%",
    alignItems: "center",
    marginBottom: -50,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Yomogi",
    fontWeight: "bold",
    color: "#241d2e",
  },
  input: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 10,
    fontSize: 16,
    borderRadius: 50,
    marginBottom: 20,
    fontFamily: "Yomogi",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
    marginTop: -20,
    fontFamily: "Yomogi",
  },
  aiResponseContainer: {
    backgroundColor: "rgba(255, 243, 69, 0.4)",
    padding: 10,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Add margin to prevent UI shift
  },
  aiResponseText: {
    fontSize: 16,
    color: "#241d2e",
    textAlign: "center",
    fontFamily: "Yomogi",
  },
});

export default ScannerScreen;