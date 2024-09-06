import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import VendorProfileForm from './Form';
import { ScreenProps, VendorProfileFormScreenProps } from 'types/types';
import VerificationForm from './VerificationForm';
import AboutForm from './AboutForm';
import AddressForm from './AddressForm';
import MenuForm from './MenuForm';

const MultiStepForm = ({ navigation, route }: VendorProfileFormScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Total number of steps

  const navigateToSuccessError = (props: ScreenProps['SuccessError']) => {
    navigation.replace('SuccessError', { ...props });
  };

  const handleNextStep = () => {
    if (currentStep === 5) {
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

  return (
    <View style={{ flex: 1 }}>
      <Stepper currentStep={currentStep} totalSteps={totalSteps} />

      {currentStep === 1 && (
        <VendorProfileForm
          navigation={navigation}
          route={route}
          onSubmit={handleConfirm}
        />
      )}
      {currentStep === 2 && (
        <VerificationForm
          navigation={navigation}
          route={route}
          onSubmit={handleConfirm}
          onGoBack={handleGoBack}
        />
      )}
      {currentStep === 3 && (
        <AboutForm
          navigation={navigation}
          route={route}
          onSubmit={handleConfirm}
          onGoBack={handleGoBack}
        />
      )}
      {currentStep === 4 && (
        <AddressForm
          navigation={navigation}
          route={route}
          onSubmit={handleConfirm}
          onGoBack={handleGoBack}
        />
      )}
      {currentStep === 5 && (
        <MenuForm
          navigation={navigation}
          route={route}
          onConfirm={handleConfirm}
          onGoBack={handleGoBack}
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
