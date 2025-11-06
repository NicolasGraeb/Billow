import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingIndicator({ 
  size = 'large', 
  color = '#0080FF' 
}: LoadingIndicatorProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});


