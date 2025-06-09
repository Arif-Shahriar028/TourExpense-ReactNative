import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ name, color, size = 40 }) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Avatar;