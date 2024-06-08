import React, { useEffect, useState } from "react";
import {
  UseFormRegister,
  Control,
  FieldValues,
  Controller,
  UseFormTrigger,
} from "react-hook-form";
import { View, Text, Pressable, StyleSheet } from "react-native";

type GenderPickerProps = {
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors: FieldValues;
  showLabel?: boolean;
  triggerValidation?: UseFormTrigger<any>;
};

const GenderPicker = (props: GenderPickerProps) => {
  const { showLabel } = props;
  const { control, errors, triggerValidation } = props;

  return (
    <>
      {showLabel && <Text style={styles.label}>Gender:</Text>}
      <View style={styles.container}>
        <Controller
          name="gender"
          control={control}
          render={({ field: { onChange, value } }) => {
            const onMalePress = () => {
              onChange("MALE");

              if (triggerValidation) {
                triggerValidation();
              }
            };
            const onFemalePress = () => {
              onChange("FEMALE");

              if (triggerValidation) {
                triggerValidation();
              }
            };

            return (
              <View style={styles.buttonContainer}>
                <Pressable
                  testID="test-male-btn"
                  style={[
                    styles.button,
                    styles.buttonMale,
                    value === "MALE" ? styles.highlightedMaleButton : null,
                  ]}
                  onPress={onMalePress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      value === "MALE"
                        ? styles.highlightedMaleButtonText
                        : null,
                    ]}
                  >
                    Male
                  </Text>
                </Pressable>
                <Pressable
                  testID="test-female-btn"
                  style={[
                    styles.button,
                    styles.buttonFemale,
                    value === "FEMALE" ? styles.highlightedFemaleButton : null,
                  ]}
                  onPress={onFemalePress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      value === "FEMALE"
                        ? styles.highlightedFemaleButtonText
                        : null,
                    ]}
                  >
                    Female
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
      <View>
        <Text testID="test-gender-err-text" style={styles.errorText}>
          {errors["gender"]?.message}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  label: {
    fontSize: 16, // Font size
    fontWeight: "500", // Medium weight text
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
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 20
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
    textAlign: "center",
  },
});

export default GenderPicker;
