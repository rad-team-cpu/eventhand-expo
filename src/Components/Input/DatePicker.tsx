import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  UseFormRegister,
  Control,
  FieldValues,
  Controller,
} from "react-hook-form";
import {
  Button,
  Text,
  StyleSheet,
  TextStyle,
  StyleProp,
  ColorValue,
  Pressable,
  ViewStyle,
} from "react-native";

import { Feather } from "../../../test/__mocks__/@expo/vector-icons";

type DatePickerProps = {
  name: string;
  label: string;
  defaultValue?: string | Date | null;
  onSavedValue?: string | Date | null;
  display: "spinner" | "default" | "clock" | "calendar";
  maximumDate?: Date;
  minimumDate?: Date;
  control: Control<FieldValues, unknown>;
  register: UseFormRegister<FieldValues>;
  errors?: FieldValues;
  errorMessage?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
};

export const datePickerDate = {
  selectDate: (date: Date | undefined) => {
    return date;
  },
  selectStringDate: (date: Date | undefined) =>
    date ? date.toLocaleDateString() : "",
};

const DatePicker = (props: DatePickerProps) => {
  const {
    name,
    defaultValue,
    label,
    display,
    minimumDate,
    maximumDate,
    control,
    errors,
    errorMessage,
    errorTextStyle,
  } = props;
  const [selected, setSelected] = useState<string>("");

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { value, onChange } }) => {
          const onDateChange = (
            event: DateTimePickerEvent,
            selectedDate?: Date,
          ) => {
            const currentDate = selectedDate;
            onChange(datePickerDate.selectDate(currentDate));
            setSelected(datePickerDate.selectStringDate(currentDate));
          };
          const showMode = () => {
            DateTimePickerAndroid.open({
              value,
              onChange: onDateChange,
              mode: "date",
              display,
              minimumDate,
              maximumDate,
              testID: "test-date-picker",
            });
          };

          const showDatepicker = () => {
            showMode();
          };

          return (
            // <Button
            //   title={selected != "" ? selected : label}
            //   testID="test-signup-btn"
            //   onPress={showDatepicker}
            //   color={color}
            // />

            <Pressable
              style={defaultStyles.button}
              android_ripple={{ radius: 100, color: "#f8f8ff" }}
              onPress={showDatepicker}
            >
              <Text style={defaultStyles.buttonText}>
                {selected !== "" ? selected : label}
              </Text>
            </Pressable>
          );
        }}
      />
      <Text
        testID="date-err-text"
        style={errorTextStyle ?? defaultStyles.errorText}
      >
        {errors && (errorMessage ?? errors[name]?.message)}
      </Text>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#6495ed",
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderWidth: 2.5,
    borderRadius: 5,
    borderColor: "#6495ed",
  },
  buttonText: {
    color: "#6495ed",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default DatePicker;
