import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthEvent } from "../types/auth";

interface SessionScreenProps {
  email: string;
  startedAt: number;
  duration: string;
  logs: AuthEvent[];
  onLogout: () => void;
}

export function SessionScreen({ email, startedAt, duration, logs, onLogout }: SessionScreenProps) {
  const startLabel = new Date(startedAt).toLocaleTimeString();

  return (
    <View style={styles.root}>
      <Text style={styles.step}>Step 3</Text>
      <Text style={styles.title}>Session Active</Text>
      <Text style={styles.subtitle}>Logged in as {email}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Session Started</Text>
          <Text style={styles.infoValue}>{startLabel}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Live Duration</Text>
          <Text style={styles.infoValue}>{duration}</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onLogout}>
        <Text style={styles.primaryButtonText}>Logout</Text>
      </Pressable>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Recent SDK Logs</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyLog}>No logs yet</Text>
        ) : (
          logs.map((item, index) => (
            <View key={`${item.createdAt}-${index}`} style={styles.logItem}>
              <Text style={styles.logType}>{item.type}</Text>
              <Text style={styles.logTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12
  },
  step: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#5b6672"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f1720"
  },
  subtitle: {
    fontSize: 14,
    color: "#526071"
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4
  },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cad3dc",
    backgroundColor: "#ffffff",
    padding: 10
  },
  infoLabel: {
    fontSize: 12,
    color: "#526071"
  },
  infoValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f1720"
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#1f7a6b",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  logContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d0d8df",
    paddingTop: 10,
    gap: 8
  },
  logTitle: {
    color: "#526071",
    fontSize: 13,
    fontWeight: "600"
  },
  emptyLog: {
    color: "#7f8d9b",
    fontSize: 13
  },
  logItem: {
    borderWidth: 1,
    borderColor: "#d6dee6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f2d3d"
  },
  logTime: {
    fontSize: 12,
    color: "#526071"
  }
});
