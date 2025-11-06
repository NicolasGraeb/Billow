import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseParticipant {
  id: number;
  user_id: number;
  amount: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface Expense {
  id: number;
  event_id: number;
  payer_id: number;
  amount: number;
  description: string | null;
  created_at: string;
  payer: {
    id: number;
    username: string;
    email: string;
  };
  participants: ExpenseParticipant[];
}

interface ExpenseCardProps {
  expense: Expense;
  isCreator: boolean;
  isActive: boolean;
  onEdit: (expense: Expense) => void;
}

export default function ExpenseCard({ expense, isCreator, isActive, onEdit }: ExpenseCardProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={[styles.expenseCard, { padding: isSmallScreen ? 12 : 16 }]}>
      <View style={styles.expenseHeader}>
        <Text style={[
          styles.expenseAmount,
          { fontSize: isSmallScreen ? 18 : 20 },
        ]}>
          {expense.amount.toFixed(2)} zł
        </Text>
        {isCreator && isActive && (
          <TouchableOpacity onPress={() => onEdit(expense)}>
            <Ionicons name="create-outline" size={isSmallScreen ? 18 : 20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      {expense.description && (
        <Text style={[
          styles.expenseDescription,
          { fontSize: isSmallScreen ? 13 : 14 },
        ]}>
          {expense.description}
        </Text>
      )}
      <Text style={[
        styles.expensePayer,
        { fontSize: isSmallScreen ? 12 : 13 },
      ]}>
        Zapłacił: {expense.payer.username}
      </Text>
      {expense.participants && expense.participants.length > 0 && (
        <View style={styles.participantsList}>
          <Text style={[
            styles.participantsLabel,
            { fontSize: isSmallScreen ? 11 : 12 },
          ]}>
            Podział:
          </Text>
          {expense.participants.map((participant) => (
            <View key={participant.id} style={styles.participantRow}>
              <Text style={[
                styles.participantInfo,
                { fontSize: isSmallScreen ? 11 : 12 },
              ]}>
                {participant.user.username}: {participant.amount.toFixed(2)} zł
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    gap: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseAmount: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  expenseDescription: {
    color: '#A7B0C0',
  },
  expensePayer: {
    color: '#6B7280',
  },
  participantsList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  participantsLabel: {
    color: '#A7B0C0',
    fontWeight: '600',
    marginBottom: 4,
  },
  participantRow: {
    marginLeft: 8,
  },
  participantInfo: {
    color: '#A7B0C0',
  },
});

