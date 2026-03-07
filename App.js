import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// --- DASHBOARD SCREEN ---
function Dashboard() {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Hi, AAJ 👋</Text>
          <Text style={styles.points}>140 Eco-Points</Text>
        </View>

        <View
          style={[
            styles.card,
            { borderLeftColor: "#2196F3", borderLeftWidth: 5 },
          ]}
        >
          <Text style={styles.cardTitle}>⚡ Smart Nudge</Text>
          <Text style={styles.cardBody}>
            It's raining! Switch AC to{" "}
            <Text style={{ fontWeight: "bold" }}>Dry Mode</Text> to save $1.50
            today.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Optimize Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Energy Usage (kWh)</Text>
        <View style={styles.mockChart}>
          <View style={[styles.bar, { height: 40 }]} />
          <View style={[styles.bar, { height: 60 }]} />
          <View
            style={[styles.bar, { height: 120, backgroundColor: "#f44336" }]}
          />
          <View style={[styles.bar, { height: 80 }]} />
          <View style={[styles.bar, { height: 50 }]} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>$42.10</Text>
            <Text style={styles.statLab}>Bill</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>12kg</Text>
            <Text style={styles.statLab}>CO2</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- COACH SCREEN ---
function Coach() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me about your energy spikes." },
  ]);
  const [input, setInput] = useState("");

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1, padding: 15 }}>
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={{ color: m.role === "user" ? "#fff" : "#000" }}>
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Coach..."
        />
        <TouchableOpacity
          onPress={() => {
            setMessages([
              ...messages,
              { role: "user", text: input },
              { role: "ai", text: "Analyzing ClickHouse data..." },
            ]);
            setInput("");
          }}
          style={styles.sendBtn}
        >
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- NAVIGATION ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { height: 80 },
          tabBarStyle: { height: 60 },
        }}
      >
        <Tab.Screen name="JouleBuddy" component={Dashboard} />
        <Tab.Screen name="AI Coach" component={Coach} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  points: { color: "#4CAF50", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#2196F3" },
  cardBody: { marginVertical: 10, lineHeight: 20, color: "#444" },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  mockChart: {
    flexDirection: "row",
    height: 150,
    alignItems: "flex-end",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  bar: { width: 30, backgroundColor: "#2196F3", borderRadius: 5 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statBox: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  statVal: { fontSize: 20, fontWeight: "bold" },
  statLab: { color: "#888" },
  bubble: { padding: 12, borderRadius: 15, marginVertical: 5, maxWidth: "80%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2196F3" },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#e0e0e0" },
  inputRow: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWeight: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
  },
  sendBtn: { backgroundColor: "#2196F3", padding: 10, borderRadius: 20 },
});
