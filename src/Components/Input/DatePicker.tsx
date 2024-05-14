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
} from "react-native";

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
  errors: FieldValues;
  errorMessage?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  color?: ColorValue;
};

export const datePickerDate = {
  selectDate: (date: Date | undefined) => { console.log(date); return  date},
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
    color,
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
            console.log(event.type)
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
              testID: "test-date-picker"
            });
          };

          const showDatepicker = () => {
            showMode();
          };

          return (
            <Button
              title={selected != "" ? selected : label}
              testID="test-signup-btn"
              onPress={showDatepicker}
              color={color}
            />
          );
        }}
      />
      <Text
        testID="date-err-text"
        style={errorTextStyle ?? defaultStyles.errorText}
      >
        {errorMessage ?? errors[name]?.message}
      </Text>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default DatePicker;
