import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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

import DatePicker from "../../Components/Input/DatePicker";

interface EventFormInput extends FieldValues {
  date: Date;
  attendees: number;
  budget: number;
}

function EventForm() {
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
    formState: { errors, isValid },
  } = useForm<EventFormInput, unknown>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      date: new Date(),
      attendees: 0,
      budget: 0,
    },
  });

  //   useFocusEffect(
  //     useCallback(() => {
  //       const backAction = () => {
  //         setConfirmDetails(!confirmDetails);
  //         return true;
  //       };

  //       const backHandler = BackHandler.addEventListener(
  //         "hardwareBackPress",
  //         backAction,
  //       );

  //       return () => backHandler.remove();
  //     }, [confirmDetails]),
  //   );

  useEffect(() => {
    const backAction = () => {
      if (step !== 0) {
        setStep(step - 1);
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  });
  //     const userContext = useContext(UserContext);

  //   if (!userContext) {
  //     throw new Error("Profile must be used within a UserProvider");
  //   }

  const EventDateInput = () => {
    return (
      <>
        <DatePicker
          name="date"
          label="Event Date"
          display="spinner"
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
        />
      </>
    );
  };

  const EventAttendeesInput = () => {
    return (
      <Controller
        name="attendees"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          const onValueChange = (input: string) => onChange(Number(input));

          return (
            <TextInput
              id="event-attendee-input"
              testID="test-event-attendee-input"
              style={styles.input}
              placeholder="0"
              onBlur={onBlur}
              defaultValue={String(value)}
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
          const onValueChange = (input: string) => onChange(Number(input));

          return (
            <TextInput
              id="event-budget-input"
              testID="test-event-budget-input"
              style={styles.input}
              placeholder="0"
              onBlur={onBlur}
              defaultValue={String(value)}
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
        setTitle("When is the date of your event?");
        setDescription("Please select the date of your event");
        return <EventDateInput />;
      case 1:
        setTitle("How many will attend?");
        setDescription("Please enter the number of people that will attend.");
        return <EventAttendeesInput />;
      case 2:
        setTitle("How much is your budget?");
        setDescription("Please enter your budget for the event.");
        return <EventBudgetInput />;
    }
  };

  const NextButton = () => {
    if (step == 2) {
      return (
        <Pressable
          style={styles.button}
          android_ripple={{ radius: 60 }}
          onPress={onNextBtnPress}
        >
          <Feather name="chevrons-right" size={24} color="white" />
        </Pressable>
      );
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
    if (step > 1) {
      setStep(0);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {/* <TextInput style={styles.input} placeholder="Enter something..." /> */}
      <EventInput />
      <Pressable
        style={styles.button}
        android_ripple={{ radius: 60 }}
        onPress={onNextBtnPress}
      >
        <Feather name="chevrons-right" size={24} color="white" />
      </Pressable>
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
  buttonText: {
    color: "white",
    fontSize: 16,
    marginRight: 20,
  },
});

export default EventForm;
