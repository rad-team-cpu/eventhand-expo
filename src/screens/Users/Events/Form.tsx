import { useAuth } from '@clerk/clerk-expo';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { UserContext } from 'Contexts/UserContext';
import { format } from 'date-fns/format';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import Loading from 'screens/Loading';
import {
  EventFormScreenProps,
  EventInfo,
  UserProfile,
  EventBudget,
  UpdateEventFormScreenProps,
} from 'types/types';
import Block from 'Components/Ui/Block';
import useTheme from 'src/core/theme';
import SuccessScreen from 'Components/Success';
import ErrorScreen from 'Components/Error';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import { compareAsc, isEqual } from 'date-fns';

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

interface EventInputWelcomeProps {
  onBackBtnPress: () => boolean | void;
  onBtnPress: () => void;
  canGoBack: boolean
}

const EventFormWelcome = (props: EventInputWelcomeProps) => {
  const {
    onBackBtnPress,
    onBtnPress,
    canGoBack
  } = props;
  const [isPressed, setIsPressed] = useState(false);
  const { sizes } = useTheme();

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className="flex flex-row mb-2">
          <AntDesign name="back" size={20} color={"#CB0C9F"} />
          <Text className="ml-1 text-primary">{canGoBack? "go back":"Sign out"}</Text>
        </Block>
      </Pressable>
      <Text style={{ ...styles.title, textAlign: 'center' }}>
        EVENT CREATION
      </Text>
      <Text style={{ ...styles.description, textAlign: 'center' }}>
        You'll be answering a series of prompts, your answers to this prompts
        will allow us to find the best possible event vendors
      </Text>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: pressed || isPressed ? '#E91E8E' : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>PROCEED</Text>
      </Pressable>
    </Block>
  );
};

interface EventInputProps {
  title: string;
  description: string;
  buttonLabel: string;
  onBackBtnPress: () => boolean | void;
  onBtnPress: () => void;
  eventFormValuesRef: React.MutableRefObject<EventFormInputType>;
  mode: 'CREATE' | 'UPDATE';
}

interface FormError {
  error: boolean;
  message: string;
}

interface EventNameInputProps extends EventInputProps {
  user: UserProfile;
  oldEventName?: string;
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
    mode,
    oldEventName,
  } = props;
  const { sizes } = useTheme();

  if (mode === 'UPDATE' && !oldEventName) {
    throw new Error('oldEvent Name must not be undefined');
  }

  const defaultName = eventFormValuesRef.current.name;

  const [errorState, setErrorState] = useState<FormError>({
    error: mode === 'UPDATE' ? defaultName == oldEventName : defaultName === '',
    message: '',
  });

  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    if (text === '') {
      setErrorState({
        error: true,
        message: 'Please enter a name for your event',
      });
    } else if (
      mode === 'UPDATE' &&
      text.toLocaleLowerCase() === oldEventName!.toLocaleLowerCase()
    ) {
      setErrorState({
        error: true,
        message: 'Please enter a different name ',
      });
    } else {
      setErrorState({
        error: false,
        message: '',
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
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id='event-name-input'
        testID='test-event-name-input'
        placeholder={`ex. ${user.firstName}'s event`}
        defaultValue={defaultName}
        onChangeText={onValueChange}
        autoCapitalize='none'
        returnKeyType='done'
        className='my-4 p-2 rounded-lg border-gold border-2'
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const categories: Category[] = [
  {
    name: 'eventPlanning',
    label: 'Event Planning',
    icon: 'calendar',
    color: '#FF6347',
  },
  {
    name: 'eventCoordination',
    label: 'Event Coordination',
    icon: 'handshake-o',
    color: '#4682B4',
  },
  { name: 'venue', label: 'Venue', icon: 'building', color: '#32CD32' },
  {
    name: 'decorations',
    label: 'Decorations',
    icon: 'paint-brush',
    color: '#FF4500',
  },
  { name: 'catering', label: 'Catering', icon: 'cutlery', color: '#FFD700' },
  {
    name: 'photography',
    label: 'Photography',
    icon: 'camera',
    color: '#FF69B4',
  },
  {
    name: 'videography',
    label: 'Videography',
    icon: 'video-camera',
    color: '#8A2BE2',
  },
];

const EventCategorySelect = (props: EventInputProps) => {
  const { sizes } = useTheme();

  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    mode,
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
    message: '',
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
        message: 'Must select at least 1 category',
      });
    }

    if (name === 'venue' && mode === 'CREATE') {
      updatedSelection[name]
        ? (eventFormValuesRef.current = {
            ...eventFormValuesRef.current,
            address: undefined,
          })
        : null;
    }

    setSelectedCategories(updatedSelection);

    if (updatedSelection[name] === false) {
      const budget = eventFormValuesRef.current.budget;
      budget[name] = null;

      eventFormValuesRef.current = {
        ...eventFormValuesRef.current,
        categories: {
          ...updatedSelection,
        },
        budget: {
          ...budget,
        },
      };
    } else {
      eventFormValuesRef.current = {
        ...eventFormValuesRef.current,
        categories: {
          ...updatedSelection,
        },
      };
    }
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.eventCategorySelectContainer}>
        {categories.map((category, index) => {
          const categoryName = categories[index][
            'name'
          ] as keyof SelectedCategories;
          const isSelected = selectedCategories[categoryName];

          return (
            <Pressable
              key={index}
              onPress={() => handlePress(index, categoryName)}
              style={[
                styles.eventCategorySelectButton,
                {
                  backgroundColor: isSelected ? category.color : 'transparent',
                  borderColor: category.color,
                },
              ]}
            >
              <FontAwesome
                size={20}
                color={isSelected ? 'white' : category.color}
                style={styles.eventCategorySelectIcon}
              />
              <Text
                style={[
                  styles.eventCategorySelectLabel,
                  { color: isSelected ? 'white' : category.color },
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

interface EventDateInputProps extends EventInputProps {
  oldDate?: Date;
}

const EventDateInput = (props: EventDateInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    mode,
    oldDate,
  } = props;
  const currentDate = eventFormValuesRef.current.date;
  const { sizes } = useTheme();

  if (mode === 'UPDATE' && !oldDate) {
    throw new Error('oldDate must not be undefined');
  }

  const [errorState, setErrorState] = useState<FormError>({
    error:
      mode === 'UPDATE'
        ? isEqual(currentDate, oldDate!)
        : false,
    message: '',
  });
  const [isPressed, setIsPressed] = useState(false);
  const [selected, setSelected] = useState<string>(
    format(currentDate, 'MMMM dd, yyyy')
  );

  const datePickerDate = {
    selectDate: (date: Date | undefined) => {
      return date;
    },
    selectStringDate: (date: Date | undefined) =>
      date ? format(date, 'MMMM dd, yyyy') : '',
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate? new Date(selectedDate.setHours(0, 0, 0, 0)): selectedDate;
    setSelected(datePickerDate.selectStringDate(currentDate));

    if (currentDate) {
      if (mode === 'UPDATE' && oldDate) {
        const startOfOldDate = new Date(oldDate.setHours(0, 0, 0, 0))
        if(isEqual(currentDate, startOfOldDate)){
          setErrorState({error: true, message: "Date must not be equal to old date"})
        } else{
          setErrorState({error: false, message: ""})

        }
      }
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
      mode: 'date',
      display: 'spinner',
      minimumDate: new Date(),
      testID: 'test-date-picker',
    });
  };

  const showDatepicker = () => {
    showMode();
  };

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable style={styles.eventDateButton} onPress={showDatepicker}>
        <Text style={styles.eventDateButtonText}>
          {selected !== '' ? selected : currentDate.toLocaleDateString()}
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

interface EventAddressInput extends EventInputProps {
  oldAddress?: string;
}

const EventAddressInput = (props: EventAddressInput) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    mode,
    oldAddress,
  } = props;
  const { sizes } = useTheme();

  if (mode === 'UPDATE' && !oldAddress) {
    throw new Error('oldAddress must not be undefined');
  }

  const defaultAddress = eventFormValuesRef.current.address
    ? eventFormValuesRef.current.address
    : '';

  const [errorState, setErrorState] = useState<FormError>({
    error:
      mode === 'UPDATE'
        ? oldAddress === defaultAddress
        : defaultAddress === undefined || defaultAddress === '',
    message: '',
  });
  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    if (text === '') {
      setErrorState({
        error: true,
        message: 'Please enter an address for your event',
      });
    } else if (
      mode === 'UPDATE' &&
      text.toLocaleLowerCase() === oldAddress!.toLocaleLowerCase()
    ) {
      setErrorState({
        error: true,
        message: 'Please enter a different address ',
      });
    } else {
      setErrorState({
        error: false,
        message: '',
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
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id='event-name-input'
        testID='test-event-name-input'
        placeholder={`Event Address`}
        defaultValue={defaultAddress}
        onChangeText={onValueChange}
        autoCapitalize='none'
        returnKeyType='done'
        className='my-4 p-2 rounded-lg border-gold border-2'
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const isPositiveWholeNumber = (input: string) => {
  const regex = /^[1-9]\d*$/;
  return regex.test(input);
};

interface EventGuestsInputProps extends EventInputProps {
  oldGuests?: number;
}

const EventGuestsInput = (props: EventGuestsInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    mode,
    oldGuests,
  } = props;
  const { sizes } = useTheme();

  const defaultGuests = eventFormValuesRef.current.guests;

  if (mode === 'UPDATE' && !oldGuests) {
    throw new Error('oldGuests must not be undefined');
  }

  const [touched, setTouched] = useState(false);
  const [errorState, setErrorState] = useState<FormError>({
    error:
      mode === 'UPDATE'
        ? defaultGuests <= 1 || defaultGuests === oldGuests
        : defaultGuests <= 1,
    message: '',
  });
  const [isPressed, setIsPressed] = useState(false);

  const onValueChange = (text: string) => {
    const numericValue = parseInt(text);

    if (text === '') {
      setErrorState({
        error: true,
        message:
          'Please enter the number of guests that will be attending your event',
      });
    } else if (numericValue <= 1) {
      setErrorState({
        error: true,
        message: 'Please enter a value above 1',
      });
    } else if (!isPositiveWholeNumber(text)) {
      setErrorState({
        error: true,
        message: 'Please enter a valid value',
      });
    } else if (mode === 'UPDATE' && oldGuests === numericValue) {
      setErrorState({
        error: true,
        message: 'Please enter a different value',
      });
    } else {
      setErrorState({
        error: false,
        message: '',
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
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TextInput
        id='event-attendee-input'
        testID='test-event-attendee-input'
        defaultValue={mode === 'UPDATE' ? String(oldGuests) : ''}
        onChangeText={onValueChange}
        autoCapitalize='none'
        inputMode='numeric'
        keyboardType='numeric'
        returnKeyType='done'
        className='my-4 p-2 rounded-lg border-gold border-2'
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
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

const calculateTotal = (budget: { [key: string]: number | null }): number => {
  return Object.keys(budget)
    .filter((key) => key !== 'total') 
    .reduce((sum, key) => sum + (budget[key] ?? 0), 0);
};

const addCommasToNumber = (number: number) => {
  let numberString = number.toFixed(2);

  let parts = numberString.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

const validateEventBudget = (input: EventFormInputType): boolean => {
  const { categories, budget } = input;

  const categoryBudgetMap: {
    [key in keyof SelectedCategories]: keyof EventBudget;
  } = {
    eventPlanning: 'eventPlanning',
    eventCoordination: 'eventCoordination',
    venue: 'venue',
    decorations: 'decorations',
    catering: 'catering',
    photography: 'photography',
    videography: 'videography',
  };

  for (const category in categories) {
    if (categories[category as keyof SelectedCategories]) {
      const budgetValue =
        budget[categoryBudgetMap[category as keyof SelectedCategories]];
      if (
        budgetValue === undefined ||
        budgetValue === null ||
        budgetValue < 1000
      ) {
        return false; 
      }
    }
  }

  return true;
}

const EventBudgetInput = (props: EventInputProps) => {
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
    mode,
  } = props;
  const { sizes } = useTheme();
  const selectedCategories = eventFormValuesRef.current.categories;
  const defaultBudget = eventFormValuesRef.current.budget;
  const [errorState, setErrorState] = useState<EventBudgetError>({
    error:
      mode === 'UPDATE'
        ? true
        : !validateEventBudget(eventFormValuesRef.current),
    message: '',
    messages: {
      eventPlanning: '',
      eventCoordination: '',
      venue: '',
      decorations: '',
      catering: '',
      photography: '',
      videography: '',
    },
  });
  const [total, setTotal] = useState<number>(calculateTotal(defaultBudget));
  const [isPressed, setIsPressed] = useState(false);

  const handleInputChange = (
    name: keyof EventBudgetError['messages'] | keyof EventBudget,
    value: string
  ) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      setErrorState((prevState) => {
        return {
          ...prevState,
          error: true,
          messages: {
            ...prevState.messages,
            [name]: 'Must be a valid number',
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
            [name]: 'Must be above 0',
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
            [name]: 'Must not be less than 1000',
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
            [name]: '',
          },
        };
      });

      setTotal(calculateTotal(eventFormValuesRef.current.budget));

      eventFormValuesRef.current.budget = {
        ...eventFormValuesRef.current.budget,
        [name]: numericValue,
        total: total,
      };
    }
  };

  useEffect(() => {
    setTotal(calculateTotal(eventFormValuesRef.current.budget));

    eventFormValuesRef.current.budget = {
      ...eventFormValuesRef.current.budget,
      total: total,
    };
  }, [eventFormValuesRef.current.budget]);

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
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
                        | keyof EventBudgetError['messages']
                        | keyof EventBudget,
                      text
                    )
                  }
                  keyboardType='numeric'
                  placeholder='Enter amount'
                />
                {errorState.messages[
                  name as keyof EventBudgetError['messages']
                ] !== '' && (
                  <Text style={styles.budgetInputError}>
                    {
                      errorState.messages[
                        name as keyof EventBudgetError['messages']
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
              name={'calculator'}
              size={20}
              color={'#4CAF50'}
              style={styles.budgetInputIcon}
            />
            <Text style={[styles.budgetInputLabel, { color: '#4CAF50' }]}>
              Total
            </Text>
          </View>
          <Text style={[styles.budgetInputField, { borderColor: '#4CAF50' }]}>
            ₱{addCommasToNumber(total)}
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
              ? '#D3D3D3' 
              : pressed || isPressed
                ? '#E91E8E'
                : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
      <Text testID='test-first-name-err-text' style={styles.errorText}>
        {errorState.message}
      </Text>
    </Block>
  );
};

const EventFormConfirmation = (props: EventInputProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const {
    title,
    description,
    buttonLabel,
    onBackBtnPress,
    onBtnPress,
    eventFormValuesRef,
  } = props;

  const input = eventFormValuesRef.current;
  const budget = input.budget;

  const { sizes } = useTheme();

  return (
    <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
      <Pressable onPress={onBackBtnPress}>
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={listStyles.eventContainer}>
        <View className='flex flex-row justify-between'>
          <View style={styles.container}></View>
        </View>
        <Text style={listStyles.nameText}>{input.name}</Text>
        <Text style={listStyles.dateText}>
          Date: {format(input.date, 'MMMM dd, yyyy')}
        </Text>
        {input.address && (
          <>
            <Text style={listStyles.capacityText}>
              Address: {input.address}
            </Text>
          </>
        )}
        <Text style={listStyles.capacityText}>Capacity: {input.guests}</Text>
        <View style={listStyles.separator} />
        <View style={styles.budgetInputContainer}>
          {categories.map((category) => {
            const { name, icon, color, label } = category;
            const budgetValue = budget[name as keyof EventBudget];
            if (budgetValue !== null && budgetValue !== undefined) {
              return (
                <View key={name} style={styles.budgetInputWrapper}>
                  <View style={styles.budgetInputLabelContainer}>
                    <FontAwesome
                      size={20}
                      color={color}
                      style={styles.budgetInputIcon}
                    />
                    <Text style={[styles.budgetInputLabel, { color: color }]}>
                      {label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.budgetInputField,
                      { borderColor: category.color },
                    ]}
                  >
                    ₱{addCommasToNumber(budgetValue)}
                  </Text>
                </View>
              );
            }
          })}
          {budget.total && (
            <View style={styles.budgetInputWrapper}>
              <View style={styles.budgetInputLabelContainer}>
                <FontAwesome
                  name={'calculator'}
                  size={20}
                  color={'#4CAF50'}
                  style={styles.budgetInputIcon}
                />
                <Text style={[styles.budgetInputLabel, { color: '#4CAF50' }]}>
                  Total
                </Text>
              </View>
              <Text
                style={[styles.budgetInputField, { borderColor: '#4CAF50' }]}
              >
                ₱{addCommasToNumber(budget.total)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onBtnPress}
        style={({ pressed }) => [
          styles.inputButton,
          {
            backgroundColor: pressed || isPressed ? '#E91E8E' : '#CB0C9F',
          },
        ]}
      >
        <Text style={styles.inputButtonText}>{buttonLabel}</Text>
      </Pressable>
    </Block>
  );
};

const sortByEventDate =(a: EventInfo, b : EventInfo,) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateA - dateB; // Sorts by ascending date (earliest date first)
};

function EventForm({ navigation }: EventFormScreenProps) {
  const userContext = useContext(UserContext);
  const { userId, isLoaded, getToken, signOut } = useAuth();
  const { sizes } = useTheme();

  if (!isLoaded) {
    throw new Error('Clerk failed to load');
  }

  if (!userContext) {
    throw new Error('Profile must be used within a UserProvider');
  }

  const { user, setEventList } = userContext;

  if (!userId) {
    throw new Error('User does not exist! Please SignUp again');
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
      total: 0,
    },
  });

  const totalSteps = eventFormInputRef.current.categories.venue ? 7 : 8;

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<EventInfo>({
    _id: '',
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
    pendingBookings: [],
    confirmedBookings: [],
    cancelledOrDeclinedBookings: [],
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const backAction = () => {
    if (step !== 0) {
      setStep(step - 1);
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        signOut();
      }
    }

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
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
            <EventFormWelcome
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction} canGoBack={false}            />
          );
        case 1:
          return (
            <EventDateInput
              title='When is the date of your event?'
              description='Please select the date of your event'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 2:
          return (
            <EventNameInput
              title='What is the name for your event?'
              description='Please enter the name of your event'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              user={user}
              mode='CREATE'
            />
          );
        case 3:
          return (
            <EventGuestsInput
              title='How many do you think will attend?'
              description='Please enter your estimated number of guests.'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 4:
          return (
            <EventCategorySelect
              title='What type of vendors are you looking for?'
              description='Please select at least one'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 5:
          return (
            <EventBudgetInput
              title='How much is your budget?'
              description='Please enter the budget for each category.'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 6:
          return (
            <EventFormConfirmation
              title='CONFIRMATION'
              description='Please confirm your details.'
              buttonLabel='SUBMIT'
              onBtnPress={onSubmitPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        default:
          return null;
      }
    } else {
      switch (step) {
        case 0:
          return (
            <EventFormWelcome
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction} canGoBack={false}            />
          );
        case 1:
          return (
            <EventDateInput
              title='When is the date of your event?'
              description='Please select the date of your event'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 2:
          return (
            <EventNameInput
              title='What is the name for your event?'
              description='Please enter the name of your event'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              user={user}
              mode='CREATE'
            />
          );
        case 3:
          return (
            <EventGuestsInput
              title='How many do you think will attend?'
              description='Please enter your estimated number of guests.'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 4:
          return (
            <EventCategorySelect
              title='What type of vendors are you looking for?'
              description='Please select at least one'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 5:
          return (
            <EventAddressInput
              title='Where will your event be held?'
              description='Please enter the address of your event venue'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 6:
          return (
            <EventBudgetInput
              title='How much is your budget?'
              description='Please enter the budget for each category.'
              buttonLabel='NEXT'
              onBtnPress={onNextBtnPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
            />
          );
        case 7:
          return (
            <EventFormConfirmation
              title='CONFIRMATION'
              description='Please confirm your details.'
              buttonLabel='SUBMIT'
              onBtnPress={onSubmitPress}
              onBackBtnPress={backAction}
              eventFormValuesRef={eventFormInputRef}
              mode='CREATE'
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
    const {
      eventPlanning,
      eventCoordination,
      decorations,
      venue,
      catering,
      photography,
      videography,
    } = budget;

    const input = {
      clientId: user._id,
      name,
      address,
      attendees: guests,
      date,
      budget: {
        eventPlanning,
        eventCoordination,
        decorations,
        venue,
        catering,
        photography,
        videography,
      },
    };

    try {
      const token = await getToken({ template: "eventhand-client" });

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events`;

      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      };

      const response = await fetch(url, request);

      switch (response.status) {
        case 201:
          const data = await response.json();
          const event: EventInfo = {
            _id: data._id,
            name: data.name,
            date: data.date,
            attendees: data.attendees,
            budget: {
              eventPlanning: data.budget.eventPlanning,
              eventCoordination: data.budget.eventCoordination,
              decorations: data.budget.decorations,
              venue: data.budget.venue,
              catering: data.budget.catering,
              photography: data.budget.photography,
              videography: data.budget.videography,
              total: data.total,
            },
            pendingBookings: [],
            confirmedBookings: [],
            cancelledOrDeclinedBookings: [],
          };
          setResult(event);
          setEventList((prevEventList) => {
            return {
              ...prevEventList,
              events: [
                ...prevEventList.events,
                { ...event },
              ].sort(sortByEventDate),
            };
          });

          setLoading(false);
          setSuccess(true);

          break;
        case 403:
          setSubmitErrMessage('Forbidden - Access denied.');
          throw new Error('Forbidden - Access denied.'); // Forbidden
        case 404:
          setSubmitErrMessage('Server is unreachable.');
          throw new Error('Server is unreachable.'); // Not Found
        default:
          setSubmitErrMessage('Unexpected error occurred.');
          throw new Error('Unexpected error occurred.'); // Other status codes
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
    navigation.replace('EventView', {
      ...result,
      date: result.date,
    });

  const onErrorPress = () => setError(false);

  if (success) {
    return (
      <SuccessScreen
        onPress={onSuccessPress}
        description='You event has been successfully Saved'
        buttonText='Confirm'
      />
    );
  }

  if (error) {
    return (
      <ErrorScreen
        onPress={onErrorPress}
        description={submitErrMessage}
        buttonText='Try Again'
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  const Stepper = () => {
    return (
      <Block className='m-10'>
        <View className='flex-row justify-center'>
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
      <EventInput />
    </Block>
  );
}

interface UpdateBudgetInputProps {
  onBackBtnPress: () => boolean | void;
  onBtnPress: () => void;
  eventFormValuesRef: React.MutableRefObject<EventFormInputType>;
  oldBudget: EventBudget;
  oldAddress?: string;
}

const UpdateBudgetInput = (props: UpdateBudgetInputProps) => {
  const { onBackBtnPress, onBtnPress, eventFormValuesRef, oldAddress } = props;
  const [step, setStep] = useState<number>(0);

  const categories = eventFormValuesRef.current.categories;

  const totalSteps = !categories.venue && !oldAddress ? 3 : 2;

  const onNextBtnPress = () => {
    if (step < totalSteps - 1) {
      setStep((prevStep) => prevStep + 1);
    }
  };
  const backAction = () => {
    if (step !== 0) {
      setStep(step - 1);
    }

    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [step])
  );

  if (!categories.venue && !oldAddress) {
    switch (step) {
      case 0:
        return (
          <EventCategorySelect
            title='What type of vendors are you looking too add/remove?'
            description='Please select at least one'
            buttonLabel='NEXT'
            onBtnPress={onNextBtnPress}
            onBackBtnPress={onBackBtnPress}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
      case 1:
        return (
          <EventAddressInput
            title='Where will your event be held?'
            description='Please enter the address of your event venue'
            buttonLabel='NEXT'
            onBtnPress={onNextBtnPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormValuesRef}
            mode='CREATE'
          />
        );
      case 2:
        return (
          <EventBudgetInput
            title='How much is your budget?'
            description='Please enter the budget for each category.'
            buttonLabel='SUBMIT'
            onBtnPress={onBtnPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
      default:
        return (
          <EventCategorySelect
            title='What type of vendors are you looking for?'
            description='Please select at least one'
            buttonLabel='NEXT'
            onBtnPress={onNextBtnPress}
            onBackBtnPress={onBackBtnPress}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
    }
  } else {
    switch (step) {
      case 0:
        return (
          <EventCategorySelect
            title='What type of vendors are you looking too add/remove?'
            description='Please select at least one'
            buttonLabel='NEXT'
            onBtnPress={onNextBtnPress}
            onBackBtnPress={onBackBtnPress}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
      case 1:
        return (
          <EventBudgetInput
            title='How much  is your budget?'
            description='Please enter the budget for each category.'
            buttonLabel='SUBMIT'
            onBtnPress={onBtnPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
      default:
        return (
          <EventCategorySelect
            title='What type of vendors are you looking for?'
            description='Please select at least one'
            buttonLabel='NEXT'
            onBtnPress={onNextBtnPress}
            onBackBtnPress={onBackBtnPress}
            eventFormValuesRef={eventFormValuesRef}
            mode='UPDATE'
          />
        );
    }
  }
};

function UpdateEventForm({ navigation, route }: UpdateEventFormScreenProps) {
  const userContext = useContext(UserContext);
  const { userId, isLoaded, getToken } = useAuth();
  const { assets, colors, sizes, gradients } = useTheme();

  if (!isLoaded) {
    throw new Error('Clerk failed to load');
  }

  if (!userContext) {
    throw new Error('Profile must be used within a UserProvider');
  }

  const { user, eventList, setEventList } = userContext;

  if (!userId) {
    throw new Error('User does not exist! Please SignUp again');
  }

  const { eventInfo, updateValue } = route.params;
  const { _id, date, attendees, address, name, budget } = eventInfo;
  const {
    eventPlanning,
    eventCoordination,
    venue,
    decorations,
    catering,
    photography,
    videography,
  } = budget;

  const [result, setResult] = useState<EventInfo>({ ...eventInfo });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const eventDate = typeof date === 'string' ? new Date(date) : date;

  const eventFormInputRef = useRef<EventFormInputType>({
    name,
    categories: {
      eventPlanning: eventPlanning !== null,
      eventCoordination: eventCoordination !== null,
      venue: venue !== null,
      decorations: decorations !== null,
      catering: catering !== null,
      photography: photography !== null,
      videography: videography !== null,
    },
    address,
    date: eventDate,
    guests: attendees,
    budget: {
      eventPlanning: eventPlanning ? eventPlanning : null,
      eventCoordination: eventCoordination ? eventCoordination : null,
      decorations: decorations ? decorations : null,
      venue: venue ? venue : null,
      catering: catering ? catering : null,
      photography: photography ? photography : null,
      videography: videography ? videography : null,
    },
  });

  const backAction = () => navigation.goBack();

  const onSubmitPress = async () => {
    setLoading(true);
    setErrorMessage('');

    const token = await getToken({ template: "eventhand-client" });

    let url = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

    let body = '';

    switch (updateValue) {
      case 'NAME':
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${_id}/name`;
        body = JSON.stringify({ name: eventFormInputRef.current.name });
        break;
      case 'DATE':
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${_id}/date`;
        body = JSON.stringify({ date: eventFormInputRef.current.date });
        break;
      case 'ADDRESS':
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${_id}/address`;
        body = JSON.stringify({ address: eventFormInputRef.current.address });
        break;
      case 'GUEST':
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${_id}/attendees`;
        body = JSON.stringify({ attendees: eventFormInputRef.current.guests });
        break;
      case 'BUDGET':
        const {
          eventPlanning,
          eventCoordination,
          venue,
          decorations,
          catering,
          photography,
          videography,
        } = eventFormInputRef.current.budget;
        url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events/${_id}/budget`;
        body =
          eventFormInputRef.current.budget.venue === null
            ? JSON.stringify({
                eventPlanning,
                eventCoordination,
                venue,
                decorations,
                catering,
                photography,
                videography,
                address: eventFormInputRef.current.address,
              })
            : JSON.stringify({
                eventPlanning,
                eventCoordination,
                venue,
                decorations,
                catering,
                photography,
                videography,
              });
        break;
    }

    const request = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    };

    try {
      const response = await fetch(url, request);

      if (response.ok) {
        const updatedEvent = await response.json();
        let updatedEvents = eventList.events;

        switch (updateValue) {
          case 'NAME':
            updatedEvents = eventList.events.map((event) =>
              event._id === _id ? { ...event, name: updatedEvent.name } : event
            );
            setResult({ ...eventInfo, name: updatedEvent.name });
            break;
          case 'DATE':
            updatedEvents = eventList.events.map((event) =>
              event._id === _id ? { ...event, date: updatedEvent.date } : event
            );
            setResult({ ...eventInfo, date: updatedEvent.date });
            break;
          case 'ADDRESS':
            updatedEvents = eventList.events.map((event) =>
              event._id === _id
                ? { ...event, address: updatedEvent.address }
                : event
            );
            setResult({ ...eventInfo, address: updatedEvent.address });
            break;
          case 'GUEST':
            updatedEvents = eventList.events.map((event) =>
              event._id === _id
                ? { ...event, attendees: updatedEvent.attendees }
                : event
            );
            setResult({ ...eventInfo, attendees: updatedEvent.attendees });
            break;
          case 'BUDGET':
            updatedEvents = eventList.events.map((event) =>
              event._id === _id
                ? event.budget.venue !== null
                  ? {
                      ...event,
                      budget: {
                        ...updatedEvent.budget,
                        total: updatedEvent.total,
                      },
                    }
                  : {
                      ...event,
                      budget: {
                        ...updatedEvent.budget,
                        total: updatedEvent.total,
                      },
                    }
                : event
            );
            updatedEvent.venue !== null
              ? setResult({
                  ...eventInfo,
                  budget: { ...updatedEvent.budget, total: updatedEvent.total },
                  address: updatedEvent.address,
                })
              : setResult({
                  ...eventInfo,
                  budget: { ...updatedEvent.budget, total: updatedEvent.total },
                });
            break;
        }

        setEventList((prevEventList) => {
          return {
            ...prevEventList,
            events: [...updatedEvents].sort(sortByEventDate)
          }
        })
        setSuccessMessage(`Your event ${updateValue.toLocaleLowerCase()}} has been successfully Updated`)
        setSuccess(true);
      } else {
        const errorData = await response.json();
        if (response.status === 404) {
          setError(true);
          setErrorMessage('Event not found.');
        } else if (response.status === 400) {
          setError(true);
          setErrorMessage(
            `Invalid input. Please check the event ${updateValue.toLocaleLowerCase()}.`
          );
        } else {
          setError(true);
          setErrorMessage(errorData.message || 'Failed to update the event.');
        }
      }
    } catch (error) {
      setError(true);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const EventInput = () => {
    switch (updateValue) {
      case 'NAME':
        return (
          <EventNameInput
            title='What is your new name of your event?'
            description='Please enter the new name of your event'
            buttonLabel='SUBMIT'
            onBtnPress={onSubmitPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormInputRef}
            user={user}
            mode='UPDATE'
            oldEventName={name}
          />
        );
      case 'DATE':
        return (
          <EventDateInput
            title='When is the new date of your event?'
            description='Please select the new date of your event.'
            buttonLabel='SUBMIT'
            onBtnPress={onSubmitPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormInputRef}
            mode='UPDATE'
            oldDate={new Date(date)}
          />
        );
      case 'ADDRESS':
        return (
          <EventAddressInput
            title='Where is your new venue?'
            description='Please enter the new address of your event venue'
            buttonLabel='SUBMIT'
            onBtnPress={onSubmitPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormInputRef}
            mode='UPDATE'
            oldAddress={address}
          />
        );
      case 'GUEST':
        return (
          <EventGuestsInput
            title='How many do you think will attend?'
            description='Please enter your new estimated number of guests.'
            buttonLabel='SUBMIT'
            onBtnPress={onSubmitPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormInputRef}
            mode='UPDATE'
            oldGuests={attendees}
          />
        );
      case 'BUDGET':
        return (
          <UpdateBudgetInput
            onBtnPress={onSubmitPress}
            onBackBtnPress={backAction}
            eventFormValuesRef={eventFormInputRef}
            oldBudget={budget}
            oldAddress={address}
          />
        );
      default:
        return <></>;
    }
  };

  const onSuccessPress = () => {
    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'EventView', params: { ...result } }],
    });
  };

  if (success) {
    return (
      <SuccessScreen
        onPress={onSuccessPress}
        description={successMessage}
        buttonText='Confirm'
      />
    );
  }

  const onErrorPress = () => setError(false);

  if (error) {
    return (
      <ErrorScreen
        onPress={onErrorPress}
        description={errorMessage}
        buttonText='Try Again'
      />
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ExpoStatusBar />
      <Block
        scroll
        marginTop={sizes.sm}
        padding={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.xxl }}
      >
        <EventInput />
      </Block>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  ripple: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CB0C9F',
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  inputButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginTop: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  step: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#CB0C9F',
  },
  inactiveStep: {
    backgroundColor: 'gray',
  },
  stepText: {
    color: 'white',
    fontSize: 16,
  },
  activeStepText: {
    color: 'white',
  },
  inactiveStepText: {
    color: 'white',
  },
  eventCategorySelectContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    margin: 10,
  },
  eventCategorySelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: '#E8AE4C',
  },
  eventDateButtonText: {
    textAlign: 'center',
    color: '#6495ed',
    fontWeight: 'bold',
    fontSize: 16,
  },

  budgetInputContainer: {
    padding: 10,
  },
  budgetInputWrapper: {
    marginBottom: 20,
  },
  budgetInputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  budgetInputIcon: {
    marginRight: 8,
  },
  budgetInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetInputField: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  budgetInputError: {
    color: 'red',
    marginTop: 5,
  },
});

const listStyles = StyleSheet.create({
  eventContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 8,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetText: {
    color: 'white',
    fontSize: 14,
  },
  capacityText: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export { EventForm, UpdateEventForm };
