import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { useFonts } from "expo-font";
import { Yomogi_400Regular } from "@expo-google-fonts/yomogi";

const GEMINI_API_KEY = "AIzaSyChPgNlspmn7HAkkhFyZmAL3LaRl0dBPME"; // Replace with actual key

const HomeScreen = () => {
  const [raccoonMessage, setRaccoonMessage] = useState("...");
  const [chatVisible, setChatVisible] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [raccoonUp, setRaccoonUp] = useState(false); 

  const [fontsLoaded] = useFonts({ Yomogi: Yomogi_400Regular });
  const scrollViewRef = useRef(null); // Ref for ScrollView

  useEffect(() => {
    fetchRaccoonMessage();
    const interval = setInterval(fetchRaccoonMessage, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  const fetchRaccoonMessage = async () => {
    try {
      const prompts = [
        "Ask me how I am in a raccoon way in a few words (5 words or less).",
        "Say something mischievous a raccoon would say in a few words (5 words or less).",
        "Give me a raccoon's life advice in a funny way in a few words (5 words or less).",
        "What would a raccoon pirate say in a few words (5 words or less)?",
      ];

      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: randomPrompt }] }]
          }),
        }
      );

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!data?.candidates?.length) throw new Error("No AI response");

      let message = data.candidates[0]?.content?.parts?.[0]?.text || "Hmm...";
      message = message.replace(/^"|"$/g, ''); // Removes quotes
      message = message.split(".")[0];

      setRaccoonMessage(message);
    } catch (error) {
      console.error("🚨 AI Error:", error);
      setRaccoonMessage("Yarr! The AI ship has sunk! 🏴‍☠️");
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newChat = [...chatHistory, { sender: "user", text: userInput }];
    setChatHistory(newChat);
    setUserInput("");

    try {
      // Add a prompt to make the AI respond as a funny raccoon
      const raccoonPrompt = `Respond to the following as if you are a funny raccoon in a few words: ${userInput}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: raccoonPrompt }] }]
          }),
        }
      );

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (!data?.candidates?.length) throw new Error("No AI response");

      let reply = data.candidates[0]?.content?.parts?.[0]?.text || "Hmm... 🦝";
      reply = reply.replace(/^"|"$/g, ""); // Removes quotes

      setChatHistory([...newChat, { sender: "raccoon", text: reply }]);
    } catch (error) {
      console.error("🚨 AI Error:", error);
      setChatHistory([...newChat, { sender: "raccoon", text: "Oops! Something went wrong! 🦝" }]);
    }
  };

  if (!fontsLoaded) return null; 

  return (
    <ImageBackground source={require("../components/grid.webp")} style={styles.background}>
      <Pressable style={styles.container} onPress={() => { setChatVisible(false); setRaccoonUp(false); }}>

        {/* Speech Bubble and Text (Hidden when chatbox is open) */}
        {!chatVisible && (
          <View style={styles.speechContainer}>
            <Image source={require("../components/speechbubble.webp")} style={styles.speechBubble} />
            <View style={styles.textWrapper}>
              <Text style={styles.speechText}>{raccoonMessage}</Text>
            </View>
          </View>
        )}

        {/* Raccoon - Moves up when chatbox is open */}
        <Image source={require("../components/raccoon.gif")} style={[styles.raccoonImage, raccoonUp && styles.raccoonUp]} resizeMode="contain" />

        {/* Chat Button (Hidden when chatbox is open) */}
        {!chatVisible && (
          <TouchableOpacity style={styles.chatButton} onPress={() => { setChatVisible(true); setRaccoonUp(true); }}>
            <Text style={styles.chatButtonText}>Let's Chat!</Text>
          </TouchableOpacity>
        )}

        {/* Chatbox */}
        {chatVisible && (
          <Pressable style={styles.chatBoxContainer} onPress={(e) => e.stopPropagation()}>
            <ImageBackground 
              source={require("../components/orangepaper.jpg")} 
              style={styles.chatBoxBackground}
              resizeMode="cover" // Ensures the image is not blurry
            >
              <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.chatBox}
                keyboardVerticalOffset={Platform.OS === "ios" ? 240 : 0} // Adjust for iOS
              >
                <ScrollView 
                  ref={scrollViewRef} // Attach ref to ScrollView
                  style={styles.chatMessages} 
                  contentContainerStyle={{ paddingBottom: 0, paddingRight: 0 }} // Add padding for input
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Auto-scroll to bottom
                >
                  {chatHistory.map((msg, index) => (
                    <View key={index} style={msg.sender === "user" ? styles.userMessage : styles.raccoonMessage}>
                      <Text style={styles.chatText}>{msg.text}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                  <TextInput 
                    style={styles.chatInput} 
                    placeholder="Say something..." 
                    value={userInput} 
                    onChangeText={setUserInput} 
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                  />
                  <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </ImageBackground>
          </Pressable>
        )}

      </Pressable>
    </ImageBackground>
  );
};

// **Styles**
const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  },
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  speechContainer: { 
    position: "absolute", 
    top: 160, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  speechBubble: { 
    width: 350, 
    height: 150, 
    resizeMode: "contain" 
  },
  textWrapper: { 
    position: "absolute", 
    width: "45%", 
    height: "70%", 
    justifyContent: "center", 
    alignItems: "center", 
    paddingBottom: 30 
  },
  speechText: { 
    fontSize: 20, 
    fontFamily: "Yomogi", 
    textAlign: "center", 
    color: "#241d2e" 
  },
  raccoonImage: { 
    width: 350, 
    height: 350, 
    marginTop: 100 
  },
  raccoonUp: { 
    marginBottom: 450, 
    marginLeft: 20,
  },
  chatButton: { 
    position: "absolute", 
    bottom: 120, 
    backgroundColor: "rgba(179, 255, 207, 0.6)", 
    padding: 15, 
    borderRadius: 50, 
  },
  chatButtonText: { 
    fontSize: 16, 
    fontFamily: "Yomogi", 
    color: "#241d2e" ,
  },
  chatBoxContainer: { 
    position: "absolute", 
    bottom: 100, 
    width: "90%", 
    height: "60%", 
    justifyContent: "flex-end" 
  },
  chatBoxBackground: { 
    flex: 1, 
    borderRadius: 15, 
    overflow: "hidden", 
  },
  chatBox: { 
    flex: 1, 
    padding: 15 
  },
  chatMessages: { 
    flex: 1, 
    marginBottom: 10,
    padding: 0,
  },
  userMessage: { 
    alignSelf: "flex-end", 
    backgroundColor: "rgba(212, 255, 69, 0.6)", 
    padding: 6, 
    borderRadius: 50, 
    paddingHorizontal: 20,
  },
  raccoonMessage: { 
    alignSelf: "flex-start", 
    backgroundColor: "rgba(255, 243, 69, 0.3)", 
    padding: 8, 
    borderRadius: 50, 
    paddingHorizontal: 20,
    marginVertical: 2 
  },
  chatText: { 
    fontSize: 16, 
    fontFamily: "Yomogi", 
    color: "#241d2e", 
    
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 0, 
    marginBottom: 10 
  },
  chatInput: { 
    flex: 1, 
    borderRadius: 50, 
    padding: 8, 
    backgroundColor: "#fff" ,
    fontSize: 16,
    fontFamily: "Yomogi", 
  },
  sendButton: { 
    marginLeft: 8, 
    backgroundColor: "rgba(179, 255, 207, 0.6)", 
    padding: 8, 
    borderRadius: 50 
  },
  sendButtonText: { 
    fontWeight: "bold", 
    fontFamily: "Yomogi", 
    color: "#241d2e" 
  },
});

export default HomeScreen;