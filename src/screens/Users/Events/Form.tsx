import { useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFocusEffect } from "@react-navigation/native";
import DatePicker from "../../../components/Input/DatePicker";
import { UserContext } from "Contexts/UserContext";
import { format } from "date-fns/format";
import { sub } from "date-fns/fp";
import React, { useCallback, useContext, useEffect, useState } from "react";
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
import Loading from "screens/Loading";
import { EventFormScreenProps, EventInfo, ScreenProps } from "types/types";
import { date, number, object } from "yup";

interface EventFormInput extends FieldValues {
  date: Date;
  guests: number;
  budget: number;
}

const EventFormInputValidation = object().shape({
  date: date()
    .required("Please enter the date of you event")
    .min(sub({ days: 1 }, new Date())),
  guests: number()
    .required("Please enter number of your guests")
    .moreThan(-1, "Input must be a postive number")
    .integer("Input must be an integer"),
  budget: number()
    .required("Please enter number of your guests")
    .moreThan(-1, "Input must be a postive number")
    .integer("Input must be an integer")

});

function EventForm({ navigation }: EventFormScreenProps) {
  const userContext = useContext(UserContext);
  const { userId, isLoaded, getToken } = useAuth();

  if (!isLoaded) {
    throw new Error("Clerk failed to load");
  }

  if (!userContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  const { user, setUser } = userContext;

  if (!userId) {
    throw new Error("User does not exist! Please SignUp again");
  }

  const [step, setStep] = useState(0);
  const [description, setDescription] = useState(
    "Please select the date of your event",
  );
  const [title, setTitle] = useState("When is the date of your event?");
  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      guests: 0,
      budget: 0,
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
          const onValueChange = (input: string) => {
            const convertedInput = Number.isNaN(Number(input))
              ? 0
              : Number(input);

            onChange(convertedInput);
          };

          return (
            <TextInput
              id="event-attendee-input"
              testID="test-event-attendee-input"
              style={styles.input}
              onBlur={onBlur}
              value={String(value)}
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
          const onValueChange = (input: string) => {
            const convertedInput = Number.isNaN(Number(input))
              ? 0
              : Number(input);

            onChange(convertedInput);
          };
          return (
            <TextInput
              id="event-budget-input"
              testID="test-event-budget-input"
              style={styles.input}
              onBlur={onBlur}
              value={String(value)}
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
        return <EventDateInput />;
      case 1:
        return <EventguestsInput />;
      case 2:
        return <EventBudgetInput />;
      case 3:
    }
  };

  const submitEventInput = async (input: EventFormInput) => {
    setLoading(true);

    const navigateToSuccessError = (props: ScreenProps["SuccessError"]) => {
      if (props.status == "error") {
        navigation.navigate("SuccessError", { ...props });
      } else {
        navigation.replace("SuccessError", { ...props });
      }
    };

    try {
      const token = getToken({ template: "event-hand-jwt" });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events`;

      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: userId,
          attendees: input.guests,
          date: input.date,
          budget: input.budget,
        }),
      };

      const response = await fetch(url, request);

      switch (response.status) {
        case 201:
          const data = await response.json();
          const event: EventInfo = {
            _id: data._id as string,
            attendees: input.guests,
            ...input,
          };

          if (user.events) {
            setUser({ ...user, events: [...user.events, event] });
          } else {
            setUser({ ...user, events: [event] });
          }
          const dateString = format(event.date, "MMMM dd, yyyy");

          setLoading(false);
          navigation.replace("EventView", {
            _id: event._id,
            date: dateString,
            budget: event.budget,
            attendees: event.attendees,
          });

          break;
        case 403:
          setSubmitErrMessage("Forbidden - Access denied.");
          throw new Error("Forbidden - Access denied."); // Forbidden
        case 404:
          setSubmitErrMessage("Server is unreachable.");
          throw new Error("Server is unreachable."); // Not Found
        default:
          setSubmitErrMessage("Unexpected error occurred.");
          throw new Error("Unexpected error occurred."); // Other status codes
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      navigateToSuccessError({
        description: submitErrMessage,
        buttonText: "Continue",
        status: "error",
      });
    }
  };

  const onSubmitPress = handleSubmit(submitEventInput);

  const EventButton = () => {
    if (step == 2) {
      return <Button title="SUBMIT" color="#6495ed" onPress={onSubmitPress} />;
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

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <EventInput />
      <EventButton />
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {step == 0 && errors["date"]?.message}
        {step == 1 && errors["guests"]?.message}
        {step == 2 && errors["budget"]?.message}
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
