import { Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BalanceButtonProps {
  onPress: () => void;
}

export default function BalanceButton({ onPress }: BalanceButtonProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <TouchableOpacity
      style={styles.balanceButton}
      onPress={onPress}
    >
      <Ionicons name="calculator" size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
      <Text style={[
        styles.balanceButtonText,
        { fontSize: isSmallScreen ? 14 : 16 },
      ]}>
        Podsumowanie
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  balanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  balanceButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

