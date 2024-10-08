import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
interface StarRatingProps {
  rating: number;
  starStyle?: string;
  starColor?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ starColor = '#FAAA33', rating }) => {
  const stars = [];
  const validRating = Math.min(Math.max(rating, 1), 5);

  for (let i = 0; i < 5; i++) {
    stars.push(
      <MaterialIcons
        key={i}
        name={i < validRating ? 'star' : 'star-outline'}
        size={10}
        color={starColor}
      />,
    );
  }

  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

export default StarRating;
