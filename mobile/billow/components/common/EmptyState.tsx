import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  iconSize?: number;
  textSize?: number;
}

export default function EmptyState({ 
  icon = 'mail-outline', 
  message, 
  iconSize,
  textSize 
}: EmptyStateProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={icon} 
        size={iconSize || (isSmallScreen ? 48 : 56)} 
        color="#6B7280" 
      />
      <Text style={[
        styles.emptyText,
        {
          fontSize: textSize || (isSmallScreen ? 13 : 14),
        },
      ]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
});


