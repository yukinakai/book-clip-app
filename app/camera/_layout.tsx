import { Stack } from "expo-router";
import React from "react";

export default function CameraLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_bottom",
      }}
    />
  );
}
