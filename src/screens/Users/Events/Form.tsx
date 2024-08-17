import { useAuth } from '@clerk/clerk-expo';
import { Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DatePicker from 'src/Components/Input/DatePicker';
import { UserContext } from 'Contexts/UserContext';
import { format } from 'date-fns/format';
import { sub } from 'date-fns/fp';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
  useForm,
  useFormState,
} from 'react-hook-form';
import {
  BackHandler,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Pressable,
} from 'react-native';
import Loading from 'screens/Loading';
import { EventFormScreenProps, EventInfo, ScreenProps, UserProfile } from 'types/types';
import { array, boolean, date, number, object, string } from 'yup';
import Block from 'Components/Ui/Block';
import useTheme from 'src/core/theme';

type SelectedCategories = {
  eventPlanning: boolean;
  eventCoordination: boolean;
  venue: boolean;
  catering: boolean;
  photography: boolean;
  videography: boolean;
}

type EventFormInputType = {
  name: string;
  categories: SelectedCategories;
  date: Date;
  guests: number;
  budget: number;
}

interface EventFormInput extends FieldValues {
  name: string;
  date: Date;
  guests: number;
  budget: number;
}


const EventFormInputValidation = object().shape({
  name: string().required("Please enter a name for your event"),
  date: date()
    .required('Please enter the date of your event')
    .min(sub({ days: 1 }, new Date())),
  guests: number()
    .required('Please enter number of your guests')
    .moreThan(-1, 'Input must be a positive number')
    .integer('Input must be an integer'),
  budget: number()
    .required('Please enter your budget')
    .moreThan(-1, 'Input must be a positive number')
    .integer('Input must be an integer'),
});

const totalSteps = 5;

type Category = {
  name: string;
  label: string;
  icon: string;
  color: string;
};


interface EventInputProps  {
  title: string;
  description: string;
  buttonLabel: string;
  onBackBtnPress: () => boolean;
  onBtnPress: () => void;
  eventFormValuesRef: React.MutableRefObject<EventFormInputType>;
};

interface FormError {
  error: boolean;
  message: string;
};

interface EventNameInputProps extends EventInputProps {
  user: UserProfile
}

const EventNameInput = (props: EventNameInputProps) => {
  const {title, description, buttonLabel, onBackBtnPress, onBtnPress, eventFormValuesRef, user} = props;
  const { assets, colors, sizes, gradients } = useTheme();

  const defaultName = eventFormValuesRef.current.name;

  const [errorState, setErrorState] = useState<FormError>({
    error: defaultName === "",
    message: ""
  })
  const [isPressed, setIsPressed] = useState(false);


  const onValueChange = (text: string) => {
    if(text === ""){
      setErrorState({
        error: true,
        message: "Please enter a name for your event"
      })
    } else{
      setErrorState({
        error: false,
        message: ""
      })
    }

    eventFormValuesRef.current = {
      ...eventFormValuesRef.current,
      name: text
    }

  }

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
          ? '#D3D3D3' // Gray color when disabled
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

const EventCategorySelect = (props: EventInputProps) => {
  const { assets, colors, sizes, gradients } = useTheme();
  const categories: Category[] = [
    { name: "eventPlanning", label: "Event Planning", icon: "calendar", color: "#FF6347" },
    { name: "eventCoordination", label: "Event Coordination", icon: "handshake-o", color: "#4682B4" },
    { name: "venue", label: "Venue", icon: "building", color: "#32CD32" },
    { name: "catering", label: "Catering", icon: "cutlery", color: "#FFD700" },
    { name: "photography", label: "Photography", icon: "camera", color: "#FF69B4" },
    { name: "videography", label: "Videography", icon: "video-camera", color: "#8A2BE2" },
  ];
  const {  title, description, buttonLabel, onBackBtnPress, onBtnPress, eventFormValuesRef } = props;

  const defaultCategories = eventFormValuesRef.current.categories


  const [isPressed, setIsPressed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>(defaultCategories);
  const defaultSelected = Object.values(selectedCategories).filter(value => value)
  const [errorState, setErrorState] = useState<FormError>({
    error: defaultSelected.length < 1,
    message: ""
  })


    const handlePress = (index: number, name: keyof SelectedCategories) => {
          const updatedSelection = {...selectedCategories};
          updatedSelection[name] = !updatedSelection[name];
          const selected = Object.values(updatedSelection).filter(value => value)

          if(selected.length > 0){
            setErrorState( prevState => {
              return {
                ...prevState,
                error: false
              }
            })
          } else{
            setErrorState({
              error: true,
              message: "Must select at least 1 category"
            })
          }

          setSelectedCategories(updatedSelection);

          eventFormValuesRef.current = {
            ...eventFormValuesRef.current,
            categories:{
              ...updatedSelection
            }
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
            const categoryName = categories[index]["name"] as keyof SelectedCategories;
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
                  name={category.icon}
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
                    ? '#D3D3D3' // Gray color when disabled
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
}

const EventDateInput = (props: EventInputProps) => {
  const {title, description, buttonLabel, onBackBtnPress, onBtnPress, eventFormValuesRef} = props;
  const currentDate = eventFormValuesRef.current.date;
  const { assets, colors, sizes, gradients } = useTheme();
  const [errorState, setErrorState] = useState<FormError>({
    error: false,
    message: ""
  })
  const [isPressed, setIsPressed] = useState(false);
  const [selected, setSelected] = useState<string>(format(currentDate, 'MMMM dd, yyyy'));

  const datePickerDate = {
    selectDate: (date: Date | undefined) => {
      return date;
    },
    selectStringDate: (date: Date | undefined) =>
      date ? format(date, 'MMMM dd, yyyy') : "",
  };

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    const currentDate = selectedDate;
    setSelected(datePickerDate.selectStringDate(currentDate));

    if(currentDate){
      eventFormValuesRef.current = {
        ...eventFormValuesRef.current,
        date: currentDate
      }
    };

  };

  const showMode = () => {
    DateTimePickerAndroid.open({
      value: currentDate, 
      onChange: onDateChange,
      mode: "date",
      display: 'spinner',
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
        <Block className='flex flex-row mb-2'>
          <AntDesign name='back' size={20} color={'#CB0C9F'} />
          <Text className='ml-1 text-primary'>Go back</Text>
        </Block>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable
              style={styles.eventDateButton}
              onPress={showDatepicker}
            >
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
          ? '#D3D3D3' // Gray color when disabled
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
}


function EventForm({ navigation }: EventFormScreenProps) {
  const userContext = useContext(UserContext);
  const { userId, isLoaded, getToken } = useAuth();
  const { assets, colors, sizes, gradients } = useTheme();

  if (!isLoaded) {
    throw new Error('Clerk failed to load');
  }

  if (!userContext) {
    throw new Error('Profile must be used within a UserProvider');
  }

  const { user, setUser } = userContext;

  if (!userId) {
    throw new Error('User does not exist! Please SignUp again');
  }

  const eventFormInputRef = useRef<EventFormInputType>({
    name: ``,
    categories: {
      eventPlanning: false,
      eventCoordination: false,
      venue: false,
      catering: false,
      photography: false,
      videography: false,
    },
    date: new Date(),
    guests: 0,
    budget: 0,
  })

  const [step, setStep] = useState(0);
  const [description, setDescription] = useState(
    'Please select the date of your event'
  );
  const [title, setTitle] = useState('When is the date of your event?');
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const [loading, setLoading] = useState(false);


  const {
    control,
    register,
    handleSubmit,
    trigger,
    resetField,
    formState: { errors, isValid, },
  } = useForm<EventFormInput, unknown>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: ``,
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

  useEffect(() => {
    switch (step) {
      case 3:
        setTitle('How many will attend?');
        setDescription('Please enter the number of people that will attend.');
        break;
      case 4:
        setTitle('How much is your budget?');
        setDescription('Please enter your budget for the event.');
        break;
    }
  }, [step]);

  const EventGuestsInput = () => {
    return (
      <Controller
        name='guests'
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
              id='event-attendee-input'
              testID='test-event-attendee-input'
              onBlur={onBlur}
              value={String(value)}
              defaultValue={String(value)}
              onChangeText={onValueChange}
              autoCapitalize='none'
              inputMode='numeric'
              keyboardType='numeric'
              returnKeyType='done'
              className='my-4 p-2 rounded-lg border-gold border-2'
            />
          );
        }}
      />
    );
  };

  const EventBudgetInput = () => {
    return (
      <Controller
        name='budget'
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
              id='event-budget-input'
              testID='test-event-budget-input'
              onBlur={onBlur}
              value={String(value)}
              defaultValue={String(value)}
              onChangeText={onValueChange}
              autoCapitalize='none'
              inputMode='numeric'
              keyboardType='numeric'
              returnKeyType='done'
              className='my-4 p-2 rounded-lg border-gold border-2'
            />
          );
        }}
      />
    );
  };

  const EventInput = () => {
    switch (step) {
      case 0:
        return <EventDateInput title='When is the date of your event?'  description='Please select the date of your event' buttonLabel='NEXT' onBtnPress={onNextBtnPress} onBackBtnPress={backAction} eventFormValuesRef={eventFormInputRef} />;
      case 1:
        return <EventNameInput title='What is the name for your event?'  description='Please enter the name of your event' buttonLabel='NEXT' onBtnPress={onNextBtnPress} onBackBtnPress={backAction} eventFormValuesRef={eventFormInputRef} user={user}/>;
      case 2:
        return <EventCategorySelect title="What type of vendors are you looking for?"  description="Please select at least one" buttonLabel='NEXT' onBtnPress={onNextBtnPress} onBackBtnPress={backAction} eventFormValuesRef={eventFormInputRef} />;
      case 3:
        return <EventGuestsInput />;
      case 4:
        return <EventBudgetInput />;
      default:
        return null;
    }
  };

  const submitEventInput = async (input: EventFormInput) => {
    setLoading(true);
    console.log(input);
    setLoading(false);

    // const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
    //   if (props.status === 'error') {
    //     navigation.navigate('SuccessError', { ...props });
    //   } else {
    //     navigation.replace('SuccessError', { ...props });
    //   }
    // };

    // try {
    //   const token = await getToken({ template: 'event-hand-jwt' });

    //   const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/events`;

    //   const request = {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       clerkId: userId,
    //       attendees: input.guests,
    //       date: input.date,
    //       budget: input.budget,
    //     }),
    //   };

    //   const response = await fetch(url, request);
    //   console.log(response.status)
    //   switch (response.status) {
    //     case 201:
    //       const data = await response.json();
          
    //       const event: EventInfo = {
    //         _id: data._id as string,
    //         attendees: input.guests,
    //         ...input,
    //       };

    //       if (user.events) {
    //         setUser({ ...user, events: [...user.events, event] });
    //       } else {
    //         setUser({ ...user, events: [event] });
    //       }
    //       const dateString = format(event.date, 'MMMM dd, yyyy');

    //       setLoading(false);
    //       navigation.replace('EventView', {
    //         _id: event._id,
    //         date: dateString,
    //         budget: event.budget,
    //         attendees: event.attendees,
    //       });

    //       break;
    //     case 403:
    //       setSubmitErrMessage('Forbidden - Access denied.');
    //       throw new Error('Forbidden - Access denied.'); // Forbidden
    //     case 404:
    //       setSubmitErrMessage('Server is unreachable.');
    //       throw new Error('Server is unreachable.'); // Not Found
    //     default:
    //       setSubmitErrMessage('Unexpected error occurred.');
    //       throw new Error('Unexpected error occurred.'); // Other status codes
    //   }
    // } catch (error) {
    //   console.error(error);
    //   setLoading(false);
    //   navigateToSuccessError({
    //     description: submitErrMessage,
    //     buttonText: 'Continue',
    //     status: 'error',
    //   });
    // }
  };

  const onSubmitPress = handleSubmit(submitEventInput);

  const EventButton = () => {
    if (step === 4) {
      return <Button title='SUBMIT' color='#CB0C9F' onPress={onSubmitPress} />;
    } else {
      return (
        <Pressable
          style={styles.button}
          android_ripple={{ radius: 60 }}
          onPress={onNextBtnPress}
        >
          <Feather name='chevrons-right' size={24} color='white' />
        </Pressable>
      );
    }
  };

  const onNextBtnPress = () => {
    switch (step) {
      case 2:
        trigger('date');
        break;
      case 3:
        trigger('guests');
        break;
      case 4:
        trigger('budget');
        break;
    }

    console.log(eventFormInputRef.current)

    if (step > 4) {
      setStep(0);
    } else {
      setStep(step => step + 1);
    }

    // if (isValid) {
    //   if (step > 4) {
    //     setStep(0);
    //   } else {
    //     setStep(step => step + 1);
    //   }
    // }
  };

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
      <EventInput/>
    </Block>
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
    borderColor: "#E8AE4C",
  },
  eventDateButtonText: {
    textAlign: "center",
    color: "#6495ed",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EventForm;
