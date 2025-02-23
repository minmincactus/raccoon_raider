import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const dummyData = [
  { id: "1", name: "TrashMaster5000", score: 102 },
  { id: "2", name: "DumpsterKing", score: 98 },
  { id: "3", name: "RaccoonLord", score: 85 },
];

const LeaderboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.listItem}>
            {item.name} - {item.score} Points
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#222" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  listItem: { fontSize: 18, color: "#fff", marginBottom: 5 },
});

export default LeaderboardScreen;
