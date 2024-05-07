import React, { useState } from "react";
import {
  UseFormRegister,
  Control,
  FieldValues,
  Controller,
} from "react-hook-form";
import { View, Text, Pressable, StyleSheet } from "react-native";

type GenderPickerProps = {
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors: FieldValues;
};

const GenderPicker = (props: GenderPickerProps) => {
  const [isMale, setIsMale] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const { control, errors } = props;

  return (
    <View style={styles.container}>
      <Controller
        name="gender"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          const onMalePress = () => {
            setIsMale(true);
            setIsFemale(false);
            onChange("MALE");
          };

          const onFemalePress = () => {
            setIsMale(false);
            setIsFemale(true);
            onChange("FEMALE");
          };

          return (
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  styles.buttonMale,
                  isMale ? styles.highlightedMaleButton : null,
                ]}
                onPress={onMalePress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isMale ? styles.highlightedMaleButtonText : null,
                  ]}
                >
                  Male
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.buttonFemale,
                  isFemale ? styles.highlightedFemaleButton : null,
                ]}
                onPress={onFemalePress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isFemale ? styles.highlightedFemaleButtonText : null,
                  ]}
                >
                  Female
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
      <Text testID="gender-err-text" style={styles.errorText}>
        {errors["gender"]?.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    flex: 1,
    alignItems: "center",
  },
  button: {
    flex: 1,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 30,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonMale: {
    borderColor: "#1ecbe1",
  },
  buttonFemale: {
    borderColor: "#f30cc8",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  highlightedMaleButtonText: {
    color: "white",
  },
  highlightedFemaleButtonText: {
    color: "white",
  },
  highlightedMaleButton: {
    backgroundColor: "#1ecbe1", // Adjust the color when pressed
  },
  highlightedFemaleButton: {
    backgroundColor: "#f30cc8", // Adjust the color when pressed
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default GenderPicker;
