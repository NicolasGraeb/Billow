import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function BackgroundGradient() {
  return (
    <>
      <LinearGradient
        colors={["#080B12", "#0B101A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(0,128,255,0.18)", "transparent"]}
        start={{ x: 0.06, y: 0.0 }}
        end={{ x: 0.6, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,128,255,0.12)"]}
        start={{ x: 0.4, y: 0.7 }}
        end={{ x: 1.0, y: 1.0 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

