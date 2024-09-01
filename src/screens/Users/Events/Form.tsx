import { useAuth } from "@clerk/clerk-expo";
import { Feather, AntDesign, FontAwesome } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useFocusEffect } from "@react-navigation/native";
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DatePicker from "src/Components/Input/DatePicker";
import { UserContext } from "Contexts/UserContext";
import { format } from "date-fns/format";
import { sub } from "date-fns/fp";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
  useForm,
  useFormState,
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
import {
  EventFormScreenProps,
  EventInfo,
  ScreenProps,
  UserProfile,
  EventBudget,
} from "types/types";
import { array, boolean, date, number, object, string } from "yup";
import Block from "Components/Ui/Block";
import useTheme from "src/core/theme";
import SuccessScreen from "Components/Success";
import ErrorScreen from "Components/Error";

type SelectedCategories = {
  eventPlanning: boolean;
  eventCoordination: boolean;
  venue: boolean;
  decorations: boolean;
  catering: boolean;
  photography: boolean;
  videography: boolean;
};

type EventFormInputType = {
  name: string;
  categories: SelectedCategories;
  address?: string;
  date: Date;
  guests: number;
  budget: EventBudget;
};

type Category = {
  name: string;
  label: string;
  icon: string;
  color: string;
};

interface EventInputProps {
  title: string;
  description: string;
  buttonLabel: string;
  onBackBtnPress: () => boolean;
  onBtnPress: () => void;
  eventFormValuesRef: React.MutableRefObject<EventFormInputType>;
}

interface FormError {
  error: boolean;
  message: string;
}

interface EventNameInputProps extends EventInputProps {
  user: UserProfile;
}

const EventNameInput = (props: EventNameInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    user,
  } = props;
  const { assets, colors, sizes, gradients } = useTheme();

  const defaultName = eventFormValuesRef.current.name;

  const [errorState, setErrorState] = useState<FormError>({
    error: defaultName === "",
    message: "",
  });
  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    if (text === "") {
      setErrorState({
        error: true,
        message: "Please enter a name for your event",
      });
    } else {
      setErrorState({
        error: false,
        message: "",
      });
    }

    eventFormValuesRef.current = {
      ...eventFormValuesRef.current,
      name: text,
    };
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id="event-name-input"
        testID="test-event-name-input"
        placeholder={`ex. ${user.firstName}'s event`}
        defaultValue={defaultName}
        onChangeText={onValueChange}
        autoCapitalize="none"
        returnKeyType="done"
        className="my-4 p-2 rounded-lg border-gold border-2"
      />
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const categories: Category[] = [
  {
    name: "eventPlanning",
    label: "Event Planning",
    icon: "calendar",
    color: "#FF6347",
  },
  {
    name: "eventCoordination",
    label: "Event Coordination",
    icon: "handshake-o",
    color: "#4682B4",
  },
  { name: "venue", label: "Venue", icon: "building", color: "#32CD32" },
  {
    name: "decorations",
    label: "Decorations",
    icon: "paint-brush",
    color: "#FF4500",
  },
  { name: "catering", label: "Catering", icon: "cutlery", color: "#FFD700" },
  {
    name: "photography",
    label: "Photography",
    icon: "camera",
    color: "#FF69B4",
  },
  {
    name: "videography",
    label: "Videography",
    icon: "video-camera",
    color: "#8A2BE2",
  },
];

const EventCategorySelect = (props: EventInputProps) => {
  const { assets, colors, sizes, gradients } = useTheme();

  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;

  const defaultCategories = eventFormValuesRef.current.categories;

  const [isPressed, setIsPressed] = useState(false);
  const [selectedCategories, setSelectedCategories] =
    useState<SelectedCategories>(defaultCategories);
  const defaultSelected = Object.values(selectedCategories).filter(
    (value) => value
  );
  const [errorState, setErrorState] = useState<FormError>({
    error: defaultSelected.length < 1,
    message: "",
  });

  const handlePress = (index: number, name: keyof SelectedCategories) => {
    const updatedSelection = { ...selectedCategories };
    updatedSelection[name] = !updatedSelection[name];
    const selected = Object.values(updatedSelection).filter((value) => value);

    if (selected.length > 0) {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: false,
        };
      });
    } else {
      setErrorState({
        error: true,
        message: "Must select at least 1 category",
      });
    }

    if (name === "venue") {
      updatedSelection[name]
        ? (eventFormValuesRef.current = {
            ...eventFormValuesRef.current,
            address: undefined,
          })
        : null;
    }

    setSelectedCategories(updatedSelection);

    eventFormValuesRef.current = {
      ...eventFormValuesRef.current,
      categories: {
        ...updatedSelection,
      },
    };
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.eventCategorySelectContainer}>
        {categories.map((category, index) => {
          const categoryName = categories[index][
            "name"
          ] as keyof SelectedCategories;
          const isSelected = selectedCategories[categoryName];

          return (
            <Pressable
              key={index}
              onPress={() => handlePress(index, categoryName)}
              style={[
                styles.eventCategorySelectButton,
                {
                  backgroundColor: isSelected ? category.color : "transparent",
                  borderColor: category.color,
                },
              ]}
            >
              <FontAwesome
                name={category.icon}
                size={20}
                color={isSelected ? "white" : category.color}
                style={styles.eventCategorySelectIcon}
              />
              <Text
                style={[
                  styles.eventCategorySelectLabel,
                  { color: isSelected ? "white" : category.color },
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const EventDateInput = (props: EventInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;
  const currentDate = eventFormValuesRef.current.date;
  const { assets, colors, sizes, gradients } = useTheme();
  const [errorState, setErrorState] = useState<FormError>({
    error: false,
    message: "",
  });
  const [isPressed, setIsPressed] = useState(false);
  const [selected, setSelected] = useState<string>(
    format(currentDate, "MMMM dd, yyyy")
  );

  const datePickerDate = {
    selectDate: (date: Date | undefined) => {
      return date;
    },
    selectStringDate: (date: Date | undefined) =>
      date ? format(date, "MMMM dd, yyyy") : "",
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate;
    setSelected(datePickerDate.selectStringDate(currentDate));

    if (currentDate) {
      eventFormValuesRef.current = {
        ...eventFormValuesRef.current,
        date: currentDate,
      };
    }
  };

  const showMode = () => {
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: onDateChange,
      mode: "date",
      display: "spinner",
      minimumDate: new Date(),
      testID: "test-date-picker",
    });
  };

  const showDatepicker = () => {
    showMode();
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.eventDateButton} onPress={showDatepicker}>
        <Text style={styles.eventDateButtonText}>
          {selected !== "" ? selected : currentDate.toLocaleDateString()}
        </Text>
      </Pressable>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const EventAddressInput = (props: EventInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;
  const { assets, colors, sizes, gradients } = useTheme();

  const defaultAddress = eventFormValuesRef.current.address
    ? eventFormValuesRef.current.address
    : "";

  const [errorState, setErrorState] = useState<FormError>({
    error: defaultAddress === undefined || defaultAddress === "",
    message: "",
  });
  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    if (text === "") {
      setErrorState({
        error: true,
        message: "Please enter an address for your event",
      });
    } else {
      setErrorState({
        error: false,
        message: "",
      });
    }

    eventFormValuesRef.current = {
      ...eventFormValuesRef.current,
      address: text,
    };
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id="event-name-input"
        testID="test-event-name-input"
        placeholder={`Event Address`}
        defaultValue={defaultAddress}
        onChangeText={onValueChange}
        autoCapitalize="none"
        returnKeyType="done"
        className="my-4 p-2 rounded-lg border-gold border-2"
      />
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const isPositiveWholeNumber = (input: string) => {
  const regex = /^[1-9]\d*$/;
  return regex.test(input);
};

const EventGuestsInput = (props: EventInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;
  const { assets, colors, sizes, gradients } = useTheme();

  const defaultGuests = eventFormValuesRef.current.guests;

  const [touched, setTouched] = useState(false);
  const [errorState, setErrorState] = useState<FormError>({
    error: defaultGuests <= 1,
    message: "",
  });
  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    const numericValue = parseInt(text);

    if (text === "") {
      setErrorState({
        error: true,
        message:
          "Please enter the number of guests that will be attending your event",
      });
    } else if (numericValue <= 1) {
      setErrorState({
        error: true,
        message: "Please enter a value above 1",
      });
    } else if(!isPositiveWholeNumber(text)){
      setErrorState({
        error: true,
        message: "Please enter a valid value",
      });
    } else {
      setErrorState({
        error: false,
        message: "",
      });

      eventFormValuesRef.current = {
        ...eventFormValuesRef.current,
        guests: numericValue,
      };
    }
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id="event-attendee-input"
        testID="test-event-attendee-input"
        defaultValue={""}
        onChangeText={onValueChange}
        autoCapitalize="none"
        inputMode="numeric"
        keyboardType="numeric"
        returnKeyType="done"
        className="my-4 p-2 rounded-lg border-gold border-2"
      />
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};


interface EventBudgetError extends FormError {
  messages: {
    eventPlanning: string;
    eventCoordination: string;
    decorations: string;
    venue: string;
    catering: string;
    photography: string;
    videography: string;
  };
}


const calculateTotal = (budget: { [key: string]: number | null }): number =>  {
  return Object.keys(budget)
    .filter(key => key !== 'total') // Exclude the total key
    .reduce((sum, key) => sum + (budget[key] ?? 0), 0); // Sum up non-null values
}

const EventBudgetInput = (props: EventInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;
  const { sizes } = useTheme();
  const selectedCategories = eventFormValuesRef.current.categories;
  const defaultBudget = eventFormValuesRef.current.budget;
  const [errorState, setErrorState] = useState<EventBudgetError>({
    error: true,
    message: "",
    messages: {
      eventPlanning: "",
      eventCoordination: "",
      venue: "",
      decorations: "",
      catering: "",
      photography: "",
      videography: "",
    },
  });
  const [isPressed, setIsPressed] = useState(false);


  const handleInputChange = (
    name: keyof EventBudgetError["messages"] | keyof EventBudget,
    value: string
  ) => {
    const numericValue = Number(value);
    const budget = eventFormValuesRef.current.budget;
    const total = calculateTotal(budget);


    if (Number.isNaN(numericValue)) {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: true,
          messages: {
            ...prevState.messages,
            [name]: "Must be a valid number",
          },
        };
      });
    } else if (numericValue <= 0) {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: true,
          messages: {
            ...prevState.messages,
            [name]: "Must be above 0",
          },
        };
      });
    } else if (numericValue < 1000) {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: true,
          messages: {
            ...prevState.messages,
            [name]: "Must not be less than 1000",
          },
        };
      });
    } else {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: false,
          messages: {
            ...prevState.messages,
            [name]: "",
          },
        };
      });

      eventFormValuesRef.current.budget = {
        ...eventFormValuesRef.current.budget,
        [name]: numericValue,
        total: total,
      };

    }
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.budgetInputContainer}>
        {categories.map((category) => {
          const { name, icon, color, label } = category;
          if (selectedCategories[name as keyof SelectedCategories]) {
            const hasValue =
              defaultBudget[name as keyof EventBudget] !== null &&
              defaultBudget[name as keyof EventBudget] !== 0;

            return (
              <View key={name} style={styles.budgetInputWrapper}>
                <View style={styles.budgetInputLabelContainer}>
                  <FontAwesome
                    name={icon}
                    size={20}
                    color={color}
                    style={styles.budgetInputIcon}
                  />
                  <Text style={[styles.budgetInputLabel, { color: color }]}>
                    {label}
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.budgetInputField,
                    { borderColor: category.color },
                  ]}
                  defaultValue={
                    hasValue
                      ? String(defaultBudget[name as keyof EventBudget])
                      : undefined
                  }
                  onChangeText={(text) =>
                    handleInputChange(
                      name as
                        | keyof EventBudgetError["messages"]
                        | keyof EventBudget,
                      text
                    )
                  }
                  keyboardType="numeric"
                  placeholder="Enter amount"
                />
                {errorState.messages[
                  name as keyof EventBudgetError["messages"]
                ] !== "" && (
                  <Text style={styles.budgetInputError}>
                    {
                      errorState.messages[
                        name as keyof EventBudgetError["messages"]
                      ]
                    }
                  </Text>
                )}
              </View>
            );
          }
        })}
                          <View style={styles.budgetInputWrapper}>
                    <View style={styles.budgetInputLabelContainer}>
                      <FontAwesome
                        name={"calculator"}
                        size={20}
                        color={"#4CAF50"}
                        style={styles.budgetInputIcon}
                      />
                      <Text style={[styles.budgetInputLabel, { color: "#4CAF50" }]}>
                        Total
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.budgetInputField,
                        { borderColor: "#4CAF50" },
                      ]}
                    >
                      ₱{eventFormValuesRef.current.budget.total}
                    </Text>
                  </View>
      </View>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        disabled={errorState.error}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: errorState.error
              ? "#D3D3D3" // Gray color when disabled
              : pressed || isPressed
                ? "#E91E8E"
                : "#CB0C9F",
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID="test-first-name-err-text" style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

function EventForm({ navigation }: EventFormScreenProps) {
  const userContext = useContext(UserContext);
  const { userId, isLoaded, getToken } = useAuth();
  const { assets, colors, sizes, gradients } = useTheme();

  if (!isLoaded) {
    throw new Error("Clerk failed to load");
  }

  if (!userContext) {
    throw new Error("Profile must be used within a UserProvider");
  }

  const { user, setEventList } = userContext;

  if (!userId) {
    throw new Error("User does not exist! Please SignUp again");
  }

  const eventFormInputRef = useRef<EventFormInputType>({
    name: ``,
    categories: {
      eventPlanning: false,
      eventCoordination: false,
      venue: false,
      decorations: false,
      catering: false,
      photography: false,
      videography: false,
    },
    date: new Date(),
    guests: 0,
    budget: {
      eventPlanning: null,
      eventCoordination: null,
      venue: null,
      decorations: null,
      catering: null,
      photography: null,
      videography: null,
      total: 0
    },
  });

  const totalSteps = eventFormInputRef.current.categories.venue ? 5 : 6;

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<EventInfo>({
    _id: "",
    name: ``,
    date: new Date(),
    attendees: 0,
    budget: {
      eventPlanning: null,
      eventCoordination: null,
      venue: null,
      decorations: null,
      catering: null,
      photography: null,
      videography: null,
    },
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [submitErrMessage, setSubmitErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const backAction = () => {
    if (step !== 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [step])
  );

  const EventInput = () => {
    if (eventFormInputRef.current.categories.venue) {
      switch (step) {
        case 0:
          return (
            <EventDateInput
              title="When is the date of your event?"
              description="Please select the date of your event"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 1:
          return (
            <EventNameInput
              title="What is the name for your event?"
              description="Please enter the name of your event"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              user={user}
            />
          );
        case 2:
          return (
            <EventGuestsInput
              title="How many do you think will attend?"
              description="Please enter your estimated number of guests."
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 3:
          return (
            <EventCategorySelect
              title="What type of vendors are you looking for?"
              description="Please select at least one"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 4:
          return (
            <EventBudgetInput
              title="How much is your budget?"
              description="Please enter the budget for each category."
              buttonLabel="SUBMIT"
              onBtnPress={onSubmitPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        default:
          return null;
      }
    } else {
      switch (step) {
        case 0:
          return (
            <EventDateInput
              title="When is the date of your event?"
              description="Please select the date of your event"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 1:
          return (
            <EventNameInput
              title="What is the name for your event?"
              description="Please enter the name of your event"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              user={user}
            />
          );
        case 2:
          return (
            <EventGuestsInput
              title="How many do you think will attend?"
              description="Please enter your estimated number of guests."
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 3:
          return (
            <EventCategorySelect
              title="What type of vendors are you looking for?"
              description="Please select at least one"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 4:
          return (
            <EventAddressInput
              title="Where will your event be held?"
              description="Please enter the address of your event venue"
              buttonLabel="NEXT"
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        case 5:
          return (
            <EventBudgetInput
              title="How much is your budget?"
              description="Please enter the budget for each category."
              buttonLabel="SUBMIT"
              onBtnPress={onSubmitPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
            />
          );
        default:
          return null;
      }
    }
  };

  const onSubmitPress = async () => {
    setLoading(true);

    const { name, address, guests, budget, date } = eventFormInputRef.current;
    const {eventPlanning, eventCoordination, decorations, venue, catering, photography, videography} = budget;


    const input = {
      clientId: user._id,
      name,
      address,
      attendees: guests,
      date,
      budget:{
        eventPlanning,
        eventCoordination,
        decorations,
        venue,
        catering,
        photography,
        videography
      },
    };

    try {
      const token = await getToken({ template: "event-hand-jwt" });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events`;

      const request = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      };

      const response = await fetch(url, request);

      switch (response.status) {
        case 201:
          const data = await response.json();

          setResult({ ...data, budget: { ...data.budget, total: data.total} });
          setEventList((prevEventList) => {
            return {
              ...prevEventList,
              events: [...prevEventList.events, { ...data, budget: { ...data.budget, total: data.total} }],
            };
          });

          setLoading(false);
          setSuccess(true);

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
      setError(true);
    }
  };

  const onNextBtnPress = () => {
    if (step < totalSteps - 1) {
      setStep((step) => step + 1);
    }
  };

  const onSuccessPress = () =>
    navigation.replace("EventView", {
      ...result,
      date: format(result.date, "MMMM dd, yyyy"),
    });

  const onErrorPress = () => setError(false);

  if (success) {
    return (
      <SuccessScreen
        onPress={onSuccessPress}
        description="You event has been successfully Saved"
        buttonText="Confirm"
      />
    );
  }

  if (error) {
    return (
      <ErrorScreen
        onPress={onErrorPress}
        description={submitErrMessage}
        buttonText="Try Again"
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  const Stepper = () => {
    return (
      <Block className="m-10">
        <View className="flex-row justify-center">
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.step,
                index <= step ? styles.activeStep : styles.inactiveStep,
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  index <= step
                    ? styles.activeStepText
                    : styles.inactiveStepText,
                ]}
              >
                {index + 1}
              </Text>
            </View>
          ))}
        </View>
      </Block>
    );
  };

  return (
    <Block
      scroll
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.xxl }}
    >
      <Stepper />
      {/* <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
        <Pressable onPress={backAction}>
          <Block className='flex flex-row mb-2'>
            <AntDesign name='back' size={20} color={'#CB0C9F'} />
            <Text className='ml-1 text-primary'>Go back</Text>
          </Block>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <EventInput />
        <EventButton />
        <Text testID='test-first-name-err-text' style={styles.errorText}>
          {step === 0 && errors['name']?.message}
          {step === 2 && errors['date']?.message}
          {step === 3 && errors['guests']?.message}
          {step === 4 && errors['budget']?.message}
        </Text>
      </Block> */}
      <EventInput />
    </Block>
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
    backgroundColor: "#CB0C9F",
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  inputButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inputButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    marginTop: 10,
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: "#CB0C9F",
  },
  inactiveStep: {
    backgroundColor: "gray",
  },
  stepText: {
    color: "white",
    fontSize: 16,
  },
  activeStepText: {
    color: "white",
  },
  inactiveStepText: {
    color: "white",
  },
  eventCategorySelectContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    margin: 10,
  },
  eventCategorySelectButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 2,
  },
  eventCategorySelectIcon: {
    marginRight: 5,
  },
  eventCategorySelectLabel: {
    fontSize: 16,
  },
  eventDateButton: {
    margin: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2.5,
    borderRadius: 5,
    borderColor: "#E8AE4C",
  },
  eventDateButtonText: {
    textAlign: "center",
    color: "#6495ed",
    fontWeight: "bold",
    fontSize: 16,
  },

  budgetInputContainer: {
    padding: 10,
  },
  budgetInputWrapper: {
    marginBottom: 20,
  },
  budgetInputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  budgetInputIcon: {
    marginRight: 8,
  },
  budgetInputLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  budgetInputField: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  budgetInputError: {
    color: "red",
    marginTop: 5,
  },
});

export default EventForm;
