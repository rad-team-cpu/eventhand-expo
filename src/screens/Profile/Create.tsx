import { useAuth } from "@clerk/clerk-expo";
import { yupResolver } from "@hookform/resolvers/yup";
import { sub } from "date-fns/fp";
import React, { useState } from "react";
import {
  useForm,
  FieldValues,
  Controller,
  Control,
  UseFormRegister,
} from "react-hook-form";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { object, string, date } from "yup";

import DatePicker from "../../Components/Input/DatePicker";
import GenderPicker from "../../Components/Input/GenderPicker";
import Loading from "../Loading";

interface ProfileFormProps {
  setNewUserId: (newId: string) => void;
}

interface ProfileInput extends FieldValues {
  lastName: string;
  firstName: string;
  contactNumber: string;
  gender: string;
  birthDate: Date;
}

const signUpValidationSchema = object().shape({
  lastName: string()
    .required("Enter last name.")
    .matches(/^[a-zA-Z]+$/, "Please put a valid name"),
  firstName: string()
    .required("Enter first name.")
    .matches(/^[a-zA-Z]+$/, "Please put a valid name"),
  contactNumber: string()
    .required("Enter contact number.")
    .matches(/^09\d{9}$/, "Please enter a valid contact number.")
    .length(11, "Please enter a valid contact number"),
  gender: string().required("Please select a gender"),
  birthDate: date()
    .min(sub({ years: 100 })(new Date()), "Must be at most 100 years old.")
    .max(sub({ years: 18 })(new Date()), "Must be at least 18 years old.")
    .typeError("Enter Valid Date")
    .required("Enter date of birth."),
});

const ProfileForm = (props: ProfileFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProfileInput, unknown>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      gender: "",
      birthDate: new Date(),
    },
    resolver: yupResolver(signUpValidationSchema),
  });
  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const minDate = sub({ years: 100 })(new Date());
  const maxDate = sub({ years: 18 })(new Date());

  const createProfile = async (input: ProfileInput) => {
    setLoading(true);

    const { setNewUserId } = props;

    const token = getToken({ template: "event-hand-jwt" });

    const url = "";

    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    };

    fetch(url, request)
      .then((response) => {
        switch (response.status) {
          case 201:
            return response.json(); // User created successfully
          case 400:
            setSubmitErrMessage("Data provided is Invalid");
            throw new Error("Bad request - Invalid data provided."); // Bad request
          case 401:
            setSubmitErrMessage("Unauthorized user, please login again");
            throw new Error("Unauthorized - Authentication failed."); // Unauthorized
          case 403:
            setSubmitErrMessage("Forbidden - Access denied.");
            throw new Error("Forbidden - Access denied."); // Forbidden
          case 404:
            setSubmitErrMessage("Server is unreachable.");
            throw new Error("Server is unreachable."); // Not Found
          case 409:
            setSubmitErrMessage("User already exists");
            throw new Error("Conflict - User already exists."); // Conflict
          default:
            setSubmitErrMessage("Unexpected error occurred.");
            throw new Error("Unexpected error occurred."); // Other status codes
        }
      })
      .then((data) => {
        setNewUserId(data.id);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error); // Log any errors that occur
      });
  };

  const onSubmitPress = handleSubmit(createProfile);

  return (
    <View style={styles.container}>
      {loading && <Loading />}
      {!loading && (
        <View id="signup-form" testID="test-signup-form">
          <Text>Personal Information</Text>
          <Controller
            name="firstName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="first-name-text-input"
                  testID="test-first-name-input"
                  style={styles.input}
                  placeholder="ex. John"
                  onBlur={onBlur}
                  value={value}
                  onChangeText={onValueChange}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              );
            }}
          />
          <Text testID="first-name-err-text" style={styles.errorText}>
            {errors["firstName"]?.message}
          </Text>
          <Controller
            name="lastName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="last-name-text-input"
                  testID="test-last-name-input"
                  style={styles.input}
                  placeholder="ex. Doe"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onValueChange}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              );
            }}
          />
          <Text testID="last-name-err-text" style={styles.errorText}>
            {errors["lastName"]?.message}
          </Text>
          <Controller
            name="contactNumber"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              const onValueChange = (text: string) => onChange(text);

              return (
                <TextInput
                  id="contact-number-input"
                  testID="test-contact-number-input"
                  style={styles.input}
                  placeholder="ex. 09541238741"
                  onBlur={onBlur}
                  onChangeText={onValueChange}
                  value={value}
                  autoCapitalize="none"
                  returnKeyType="next"
                  keyboardType="phone-pad"
                  maxLength={11}
                  textContentType="telephoneNumber"
                  inputMode="tel"
                />
              );
            }}
          />
          <Text testID="contact-number-err-text" style={styles.errorText}>
            {errors["contactNumber"]?.message}
          </Text>

          <GenderPicker
            control={control as unknown as Control<FieldValues, unknown>}
            register={register as unknown as UseFormRegister<FieldValues>}
            errors={errors}
          />
          <DatePicker
            name="birthDate"
            control={control as unknown as Control<FieldValues, unknown>}
            register={register as unknown as UseFormRegister<FieldValues>}
            display="spinner"
            maximumDate={maxDate}
            minimumDate={minDate}
            label="Date of birth"
            errors={errors}
          />

          <Button
            title="Sign Up"
            testID="test-signup-btn"
            onPress={onSubmitPress}
            disabled={!isValid}
          />
          <Text testID="submit-err-text" style={styles.errorText}>
            {submitErrMessage}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  loading: {
    transform: [
      {
        scale: 2.0,
      },
    ],
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default ProfileForm;
