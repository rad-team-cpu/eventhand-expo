import { Feather } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFocusEffect } from "@react-navigation/native";
import { sub } from "date-fns/fp";
import React, { useCallback, useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
  useForm,
} from "react-hook-form";
import {
  BackHandler,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Pressable,
} from "react-native";
import { date, object, string } from "yup";

import DatePicker from "../../Components/Input/DatePicker";
import { EventFormScreenProps } from "../../types/types";
1;

interface EventFormInput extends FieldValues {
  date: Date;
  guests: string;
  budget: string;
}

const EventFormInputValidation = object().shape({
  date: date()
    .required("Please enter the date of you event")
    .min(sub({ days: 1 }, new Date())),
  guests: string()
    .required("Please enter number of your guests")
    .matches(/^\d+$/, "Please enter a postive whole number."),
  budget: string()
    .required("Please enter number of your guests")
    .matches(/^\d+$/, "Please enter a postive whole number."),
});

function EventForm({ navigation }: EventFormScreenProps) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState(
    "Please select the date of your event",
  );
  const [title, setTitle] = useState("When is the date of your event?");

  const {
    control,
    register,
    handleSubmit,
    getValues,
    trigger,
    resetField,
    formState: { errors, isValid },
  } = useForm<EventFormInput, unknown>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      date: new Date(),
      guests: "0",
      budget: "0",
    },
    resolver: yupResolver(EventFormInputValidation),
  });

  const backAction = () => {
    if (step !== 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
    switch (step) {
      case 0:
        resetField("date");
        break;
      case 1:
        resetField("guests");
        break;
      case 2:
        resetField("budget");
        break;
    }

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [step]),
  );

  useEffect(() => {
    switch (step) {
      case 0:
        setTitle("When is the date of your event?");
        setDescription("Please select the date of your event");
        break;
      case 1:
        setTitle("How many will attend?");
        setDescription("Please enter the number of people that will attend.");
        break;
      case 2:
        setTitle("How much is your budget?");
        setDescription("Please enter your budget for the event.");
        break;
    }
  }, [step]);
  //     const userContext = useContext(UserContext);

  //   if (!userContext) {
  //     throw new Error("Profile must be used within a UserProvider");
  //   }

  const EventDateInput = () => {
    return (
      <>
        <DatePicker
          name="date"
          label={new Date().toLocaleDateString()}
          display="spinner"
          minimumDate={new Date()}
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
        />
      </>
    );
  };

  const EventguestsInput = () => {
    return (
      <Controller
        name="guests"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          const onValueChange = (input: string) => onChange(input);

          return (
            <TextInput
              id="event-attendee-input"
              testID="test-event-attendee-input"
              style={styles.input}
              placeholder="0"
              onBlur={onBlur}
              value={value}
              defaultValue={value}
              onChangeText={onValueChange}
              autoCapitalize="none"
              inputMode="numeric"
              keyboardType="numeric"
              returnKeyType="done"
            />
          );
        }}
      />
    );
  };

  const EventBudgetInput = () => {
    return (
      <Controller
        name="budget"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          const onValueChange = (input: string) => onChange(input);

          return (
            <TextInput
              id="event-budget-input"
              testID="test-event-budget-input"
              style={styles.input}
              placeholder="0"
              onBlur={onBlur}
              value={value}
              defaultValue={value}
              onChangeText={onValueChange}
              autoCapitalize="none"
              inputMode="numeric"
              keyboardType="numeric"
              returnKeyType="done"
            />
          );
        }}
      />
    );
  };

  const EventInput = () => {
    switch (step) {
      case 0:
        return <EventDateInput />;
      case 1:
        return <EventguestsInput />;
      case 2:
        return <EventBudgetInput />;
      case 3:
    }
  };

  const EventButton = () => {
    if (step == 2) {
      return <Button title="SUBMIT" color="#6495ed" onPress={() => {}} />;
    } else {
      return (
        <Pressable
          style={styles.button}
          android_ripple={{ radius: 60 }}
          onPress={onNextBtnPress}
        >
          <Feather name="chevrons-right" size={24} color="white" />
        </Pressable>
      );
    }
  };

  const onNextBtnPress = () => {
    switch (step) {
      case 0:
        trigger("date");
        break;
      case 1:
        trigger("guests");
        break;
      case 2:
        trigger("budget");
        break;
    }

    if (isValid) {
      if (step > 1) {
        setStep(0);
      } else {
        setStep(step + 1);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <EventInput />
      <EventButton />
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {step == 0 && errors["date"]?.message}
        {step == 1 && errors["guests"]?.message}
        {step == 2 && errors["guests"]?.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  ripple: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6495ed",
    paddingVertical: 5,
    paddingHorizontal: 30,
    // borderWidth: 1,
    borderRadius: 5,
    // borderColor: "#6495ed",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
});

export default EventForm;
