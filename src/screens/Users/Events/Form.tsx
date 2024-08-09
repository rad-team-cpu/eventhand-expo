import { useAuth } from '@clerk/clerk-expo';
import { Feather, AntDesign, FontAwesome } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFocusEffect } from '@react-navigation/native';
import DatePicker from 'src/Components/Input/DatePicker';
import { UserContext } from 'Contexts/UserContext';
import { format } from 'date-fns/format';
import { sub } from 'date-fns/fp';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
  useForm,
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
import { EventFormScreenProps, EventInfo, ScreenProps } from 'types/types';
import { array, date, number, object, string } from 'yup';
import Block from 'Components/Ui/Block';
import useTheme from 'src/core/theme';

interface EventFormInput extends FieldValues {
  name: string,
  date: Date;
  guests: number;
  budget: number;
}

const EventFormInputValidation = object().shape({
  name: string().required("Please enter a name for your event"),
  categories: array().of(string()).length(1, "Must select at least one category"),
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

  const [step, setStep] = useState(1);
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
    formState: { errors, isValid },
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
    switch (step) {
      case 0:
        resetField('date');
        break;
      case 1:
        resetField('date');
        break;
      case 2:
        resetField('guests');
        break;
      case 3:
        resetField('budget');
        break;
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
      case 0:
        setTitle('What is the name for your event?');
        setDescription('Please enter the name of your event');
        break;
      case 1:
        setTitle('When is the date of your event?');
        setDescription('Please select the date of your event');
        break;
      case 2:
        setTitle('How many will attend?');
        setDescription('Please enter the number of people that will attend.');
        break;
      case 3:
        setTitle('How much is your budget?');
        setDescription('Please enter your budget for the event.');
        break;
    }
  }, [step]);

  const EventNameInput = () => {
    return (
      <Controller
        name='name'
        control={control}
        render={({ field: { onChange, onBlur, value } }) => {
          const onValueChange = (input: string) => {
            onChange(input);
          };

          return (
            <TextInput
              id='event-name-input'
              testID='test-event-name-input'
              onBlur={onBlur}
              placeholder={`ex. ${user.firstName}'s event`}
              defaultValue={value}
              onChangeText={onValueChange}
              autoCapitalize='none'
              returnKeyType='done'
              className='my-4 p-2 rounded-lg border-gold border-2'
            />
          );
        }}
      />
    );
  };

  type Category = {
    label: string;
    icon: string;
    color: string;
  };

  const EventCategorySelect = () => {
    const categories: Category[] = [
      { label: "Event Planning", icon: "calendar", color: "#FF6347" },
      { label: "Event Coordination", icon: "handshake-o", color: "#4682B4" },
      { label: "Venue", icon: "building", color: "#32CD32" },
      { label: "Catering", icon: "cutlery", color: "#FFD700" },
      { label: "Photography", icon: "camera", color: "#FF69B4" },
      { label: "Videography", icon: "video-camera", color: "#8A2BE2" },
    ];
  
    const [selectedCategories, setSelectedCategories] = useState<boolean[]>(new Array(categories.length).fill(false));
  
    const handlePress = (index: number) => {
      const updatedSelection = [...selectedCategories];
      updatedSelection[index] = !updatedSelection[index];
      setSelectedCategories(updatedSelection);
    };
  
    return (
      <View style={styles.eventCategorySelectContainer}>
        {categories.map((category, index) => {
          const isSelected = selectedCategories[index];
          return (
            <Pressable
              key={index}
              onPress={() => handlePress(index)}
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
    );
  }

  const EventDateInput = () => {
    return (
      <>
        <DatePicker
          name='date'
          label={new Date().toLocaleDateString()}
          display='spinner'
          minimumDate={new Date()}
          control={control as unknown as Control<FieldValues, unknown>}
          register={register as unknown as UseFormRegister<FieldValues>}
        />
      </>
    );
  };

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
        return <EventNameInput />;
      case 1:
        return <EventCategorySelect />;
      case 2:
        return <EventDateInput />;
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
      case 0:
        trigger('name');
        break;
      case 1:
        trigger('categories');
        break;
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

    if (isValid) {
      if (step > 3) {
        setStep(0);
      } else {
        setStep(step => step + 1);
      }
    }
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
      <Block card paddingVertical={sizes.md} paddingHorizontal={sizes.md}>
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
          {/* {step === 1 && errors['categories']?.message} */}
          {step === 2 && errors['date']?.message}
          {step === 3 && errors['guests']?.message}
          {step === 4 && errors['budget']?.message}
        </Text>
      </Block>
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
});

export default EventForm;
