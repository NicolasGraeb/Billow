import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserAvatarProps {
  size?: number;
}

export default function UserAvatar({ size }: UserAvatarProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const avatarSize = size || (isSmallScreen ? 40 : 44);
  const iconSize = size ? size * 0.6 : (isSmallScreen ? 20 : 24);

  return (
    <View style={[
      styles.userAvatar,
      {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
      },
    ]}>
      <Ionicons name="person" size={iconSize} color="#0080FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  userAvatar: {
    backgroundColor: 'rgba(0, 128, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});


