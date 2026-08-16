import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { loginStudent, loginAdmin } from "../../api/auth.api";
import useAuthStore from "../../store/authStore";

export default function LoginScreen({ navigation }) {
  const [loginType, setLoginType] = useState("student");

  const [matricule, setMatricule] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (loginType === "student") {
      if (!matricule || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
    } else {
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
    }

    try {
      setLoading(true);

      let result;

      if (loginType === "student") {
        result = await loginStudent(matricule, password);
      } else {
        result = await loginAdmin(email, password);
      }

      console.log("LOGIN RESULT:", result);

      setAuth(result.token, result.user);
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restau</Text>
      <Text style={styles.subtitle}>
        {loginType === "student" ? "Student Login" : "Admin Login"}
      </Text>

      {/* Login type selector */}

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            loginType === "student" && styles.activeSwitch,
          ]}
          onPress={() => setLoginType("student")}
        >
          <Text
            style={[
              styles.switchText,
              loginType === "student" && styles.activeSwitchText,
            ]}
          >
            Student
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchButton,
            loginType === "admin" && styles.activeSwitch,
          ]}
          onPress={() => setLoginType("admin")}
        >
          <Text
            style={[
              styles.switchText,
              loginType === "admin" && styles.activeSwitchText,
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Student email/matricule */}

      {loginType === "student" ? (
        <TextInput
          style={styles.input}
          placeholder="Matricule"
          value={matricule}
          onChangeText={setMatricule}
          autoCapitalize="characters"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Admin Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {loginType === "student" && (
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1B5E3A",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },

  switchContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1B5E3A",
    borderRadius: 8,
    overflow: "hidden",
  },

  switchButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },

  activeSwitch: {
    backgroundColor: "#1B5E3A",
  },

  switchText: {
    color: "#1B5E3A",
    fontWeight: "600",
  },

  activeSwitchText: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#1B5E3A",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  link: {
    color: "#1B5E3A",
    textAlign: "center",
    fontSize: 14,
  },
});