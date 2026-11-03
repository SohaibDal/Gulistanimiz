import { Alert } from "react-native";
import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle
} from "../lib/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0e0e0e",
        padding: 24,
        justifyContent: "center"
      }}
    >
      <Text style={{ color: "#e8e6e3", fontSize: 24, marginBottom: 24 }}>
        Welcome back
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        style={{
          borderBottomWidth: 1,
          borderColor: "#444",
          color: "#e8e6e3",
          marginBottom: 20,
          paddingVertical: 8
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderBottomWidth: 1,
          borderColor: "#444",
          color: "#e8e6e3",
          marginBottom: 30,
          paddingVertical: 8
        }}
      />

      <Pressable
        onPress={async () => {
            const { error } = await signInWithEmail(email, password);
            if (error) {
                Alert.alert("Error", error.message);
            } else {
                router.replace("/(tabs)");
            }
        }}
        style={{ marginBottom: 16 }}
      >
        <Text style={{ color: "#e8e6e3" }}>Sign In</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
            const { error } = await signUpWithEmail(email, password);
            if (error) {
                Alert.alert("Error", error.message);
            } else {
                router.replace("/(tabs)");
            }
        }}
        style={{ marginBottom: 24 }}
      >
        <Text style={{ color: "#aaa" }}>Create Account</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          try {
            await signInWithGoogle();
            // ✅ Do nothing else here
            // Auth success will be handled by onAuthChange
          } catch (e) {
            Alert.alert("Error", "Unable to start Google sign-in");
          }
        }}
        style={{
          backgroundColor: "#fff",
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <Text style={{ color: "#000", fontWeight: "600" }}>
          Continue with Google
        </Text>
      </Pressable>


      <Pressable onPress={() => router.replace("/(tabs)")}>
        <Text style={{ color: "#666" }}>Continue without account</Text>
      </Pressable>
    </View>
  );
}
