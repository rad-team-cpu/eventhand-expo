import React, { useCallback, useState } from 'react';
import { View, Text,  StyleSheet, BackHandler } from 'react-native';
import { ScreenProps, VendorProfileFormScreenProps } from 'types/types';
import VerificationForm from './VerificationForm';
import AboutForm from './AboutForm';
import AddressForm from './AddressForm';
import { useFocusEffect } from '@react-navigation/native';
import BlockedDays from './BlockedDays';

const MultiStepForm = ({ navigation, route }: VendorProfileFormScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    vendorProfile: { logo: {} || null, name: '', email: '', contactNumber: '' },
    verification: {
      idType: '',
      credentials: {
        fileSize: 0,
        uri: '',
        mimeType: 'png',
        fileExtension: 'png',
      },
    },
    about: { bio: '', tags: [] },
    address: { street: '', city: '', region: '', postalCode: 0 },
    menu: {},
    blockedDays: { days: [] },
  });

  const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
    navigation.replace('SuccessError', { ...props });
  };

  const handleFormSubmit = (stepData: any, step: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: stepData,
    }));
    handleNextStep();
  };

  const handleNextStep = () => {
    if (currentStep === 4) {
      navigateToSuccessError({
        description: 'Your information was saved successfully.',
        buttonText: 'Continue',
        navigateTo: 'VendorHome',
        status: 'success',
      });
    } else {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleConfirm = () => {
    handleNextStep();
  };

  const handleGoBack = () => {
    handlePrevStep();
  };

  interface StepperProps {
    currentStep: number;
    totalSteps: number;
  }

  const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
    return (
      <View style={styles.stepperContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.step,
              index < currentStep ? styles.activeStep : styles.inactiveStep,
            ]}
          >
            <Text
              style={[
                styles.stepText,
                index < currentStep
                  ? styles.activeStepText
                  : styles.inactiveStepText,
              ]}
            >
              {index + 1}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (currentStep > 1) {
          handleGoBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [currentStep])
  );

  return (
    <View style={{ flex: 1 }}>
      <Stepper currentStep={currentStep} totalSteps={totalSteps} />
      {currentStep === 1 && (
        <VerificationForm
          navigation={navigation}
          route={route}
          onSubmit={handleConfirm}
          initialData={formData.verification}
        />
      )}
      {currentStep === 2 && (
        <AboutForm
          navigation={navigation}
          route={route}
          onSubmit={(data) => handleFormSubmit(data, 'about')}
          onGoBack={handleGoBack}
          initialData={formData.about}
        />
      )}
      {currentStep === 3 && (
        <AddressForm
          navigation={navigation}
          route={route}
          onSubmit={(data) => handleFormSubmit(data, 'address')}
          onGoBack={handleGoBack}
          initialData={formData.address}
        />
      )}
      {currentStep === 4 && (
        <BlockedDays
          navigation={navigation}
          route={route}
          onSubmit={(data) => handleFormSubmit(data, 'blockedDays')}
          onGoBack={handleGoBack}
          initialData={formData.blockedDays}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
});

export default MultiStepForm;
