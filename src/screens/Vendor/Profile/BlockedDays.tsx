import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as yup from 'yup';

import Block from 'Components/Ui/Block';
import Button from 'Components/Ui/Button';
import Image from 'Components/Ui/Image';
import Text from 'Components/Ui/Text';
import useTheme from '../../../core/theme';
import { VendorProfileFormScreenProps } from '../../../types/types';
import Loading from '../../Loading';
import { VendorContext } from 'Contexts/VendorContext';
import axios from 'axios';

interface Day {
  id: string;
  name: string;
}

interface BlockedDaysInput {
  days: Day[];
}

interface BlockedDaysFormProps extends VendorProfileFormScreenProps {
  onSubmit: (data: BlockedDaysInput) => void;
  onGoBack: () => void;
  initialData: BlockedDaysInput;
}

const blockedDaysValidationSchema = yup.object().shape({
  days: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required('Day ID is required'),
        name: yup.string().required('Day name is required'),
      })
    )
    .min(1, 'At least one day is required')
    .required('Days are required'),
});

const days = [
  { id: '0', name: 'SUNDAY' },
  { id: '1', name: 'MONDAY' },
  { id: '2', name: 'TUESDAY' },
  { id: '3', name: 'WEDNESDAY' },
  { id: '4', name: 'THURSDAY' },
  { id: '5', name: 'FRIDAY' },
  { id: '6', name: 'SATURDAY' },
];

const BlockedDaysForm = ({
  onSubmit,
  onGoBack,
  initialData,
}: BlockedDaysFormProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<BlockedDaysInput>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: initialData,
    resolver: yupResolver(blockedDaysValidationSchema),
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.days.map((day) => day.id) || []
  );
  const [submitErrMessage, setSubmitErrMessage] = useState('');
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { assets, sizes } = useTheme();
  const vendorContext = useContext(VendorContext);

  if (!vendorContext) {
    throw new Error('Component must be under User Provider!!!');
  }

  const { vendor } = vendorContext;

  useEffect(() => {
    const selectedDayObjects = days.filter((day) =>
      selectedDays.includes(day.id)
    );
    setValue('days', selectedDayObjects);
  }, [selectedDays, setValue]);

  const toggleDaySelection = (dayId: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const createBlockedDays = async (input: BlockedDaysInput) => {
    setLoading(true);
    const vendorId = vendor?.id;

    try {
      const token = await getToken({ template: 'event-hand-jwt' });

      const blockedDays = selectedDays.map((dayId) => dayId);

      const payload = {
        blockedDays,
        visibility: true,
      };

      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/${vendorId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        onSubmit(input); // Trigger form submission callback
      } else {
        throw new Error('Unexpected error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setSubmitErrMessage('An error occurred while saving the data.');
    }
  };

  const onSubmitPress = handleSubmit((data: BlockedDaysInput) => {
    createBlockedDays(data);
  });

  return (
    <Block>
      {loading && <Loading />}
      {!loading && (
        <Block safe marginTop={sizes.md}>
          <Block
            id='blocked-days-form'
            testID='test-blocked-days-form'
            scroll
            paddingHorizontal={sizes.s}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: sizes.padding }}
          >
            <Block flex={0} style={{ zIndex: 0 }}>
              <Image
                background
                resizeMode='cover'
                padding={sizes.sm}
                paddingBottom={sizes.l}
                radius={sizes.cardRadius}
                source={assets.background}
              >
                <Button row flex={0} justify='flex-start' onPress={onGoBack}>
                  <AntDesign name='back' size={24} color='white' />
                  <Text p white marginLeft={sizes.s}>
                    Go back
                  </Text>
                </Button>
              </Image>
            </Block>

            <Block
              flex={0}
              radius={sizes.sm}
              marginTop={-sizes.l}
              marginHorizontal='8%'
              color='rgba(255,255,255,1)'
            >
              <Block align='flex-start' className='m-3'>
                <Text transform='uppercase'>Set up your Blocked Days:</Text>
              </Block>

              <Block>
                <Text marginLeft={sizes.sm}>Select your days:</Text>
                <ScrollView showsHorizontalScrollIndicator={false}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day.id}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day.id) &&
                          styles.selectedDayButton,
                      ]}
                      onPress={() => toggleDaySelection(day.id)}
                    >
                      <Text
                        color={
                          selectedDays.includes(day.id) ? 'white' : 'purple'
                        }
                        bold={selectedDays.includes(day.id)}
                        center
                      >
                        {day.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.days && <Text danger>{errors.days.message}</Text>}
              </Block>

              <Button
                testID='next-btn'
                onPress={onSubmitPress}
                primary
                outlined
                marginHorizontal={sizes.sm}
                marginBottom={sizes.sm}
                shadow={false}
                disabled={!isValid}
              >
                <Text bold primary transform='uppercase'>
                  Save Blocked Days
                </Text>
              </Button>
              {submitErrMessage && (
                <Text danger center>
                  {submitErrMessage}
                </Text>
              )}
            </Block>
          </Block>
        </Block>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'purple',
    borderRadius: 25,
    marginHorizontal: 30,
    marginVertical: 5,
  },
  selectedDayButton: {
    backgroundColor: 'purple',
  },
});

export default BlockedDaysForm;
