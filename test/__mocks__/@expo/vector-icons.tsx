import React from 'react';
import { Text } from 'react-native';

interface MockedIconProps {
  name: string;
  size?: number;
  color?: string;
}

const MockedIcon: React.FC<MockedIconProps> = ({ name }) => {
  return (
    <Text>
      {name}
    </Text>
  );
};

const AntDesign = MockedIcon;
const FontAwesome = MockedIcon;
const Feather = MockedIcon
const Ionicons = MockedIcon

export {AntDesign, FontAwesome, Feather, Ionicons}