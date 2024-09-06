import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import VendorProfileForm from './Form';
import { MultiStepFormScreenProps } from 'types/types';
import AboutForm from './AboutForm';
import VerificationForm from './VerificationForm';
import MenuForm from './MenuForm';

const MultiStepForm = ({ navigation }: MultiStepFormScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepCompletion = (stepData: any) => {
    if (currentStep < totalSteps) {
      nextStep();
    } else {
      navigation.replace('VendorHome', { initialTab: 'Profile' });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VendorProfileForm
            navigation={navigation}
            isPartOfMultiStep={true}
            onComplete={handleStepCompletion}
          />
        );
      case 2:
        return <VerificationForm onComplete={handleStepCompletion} />;
      case 3:
        return <AboutForm onComplete={handleStepCompletion} />;
      case 4:
        return <MenuForm onComplete={handleStepCompletion} />;
      case 5:
        return <AboutForm onComplete={handleStepCompletion} />;
      default:
        return null;
    }
  };


  return (
    <View style={styles.container}>
      {/* <Text style={styles.stepIndicator}>
        Step {currentStep} of {totalSteps}
      </Text> */}
      {renderStep()}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && <Button title='Previous' onPress={prevStep} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  stepIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default MultiStepForm;
