
import React, { useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const Loading = () => {
  return (
    <ActivityIndicator
      testID="test-loading"
      size="large"
      color="#007AFF"
      style={styles.loading}
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    transform: [
      {
        scale: 2.0,
      },
    ],
  },
});

export default Loading

