
import React, { useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View
} from "react-native";

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        testID="test-loading"
        size="large"
        color="#CB0C9F"
        style={styles.loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    transform: [
      {
        scale: 2.0,
      },
    ],
  },
});

export default Loading

