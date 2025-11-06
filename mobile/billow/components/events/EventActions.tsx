import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventActionsProps {
  onAddExpense: () => void;
  onAddParticipant?: () => void;
  isCreator: boolean;
}

export default function EventActions({ onAddExpense, onAddParticipant, isCreator }: EventActionsProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.addExpenseButton}
        onPress={onAddExpense}
      >
        <Ionicons name="add-circle" size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
        <Text style={[
          styles.addExpenseButtonText,
          { fontSize: isSmallScreen ? 14 : 16 },
        ]}>
          Dodaj wydatek
        </Text>
      </TouchableOpacity>
      {isCreator && onAddParticipant && (
        <TouchableOpacity
          style={styles.addParticipantButton}
          onPress={onAddParticipant}
        >
          <Ionicons name="person-add" size={isSmallScreen ? 20 : 24} color="#FFFFFF" />
          <Text style={[
            styles.addParticipantButtonText,
            { fontSize: isSmallScreen ? 14 : 16 },
          ]}>
            Dodaj uczestnika
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 12,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 14,
  },
  addExpenseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addParticipantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
  },
  addParticipantButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

