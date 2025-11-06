import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface UserInfoProps {
  username: string;
  email?: string;
  usernameSize?: number;
  emailSize?: number;
}

export default function UserInfo({ username, email, usernameSize, emailSize }: UserInfoProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.userDetails}>
      <Text style={[
        styles.username,
        {
          fontSize: usernameSize || (isSmallScreen ? 15 : 16),
        },
      ]} numberOfLines={1}>
        {username}
      </Text>
      {email && (
        <Text style={[
          styles.userEmail,
          {
            fontSize: emailSize || (isSmallScreen ? 12 : 13),
          },
        ]} numberOfLines={1}>
          {email}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userDetails: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  userEmail: {
    color: '#A7B0C0',
  },
});


