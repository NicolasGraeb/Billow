import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExpenseCard from './ExpenseCard';

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
  participants: Array<{
    id: number;
    user_id: number;
    amount: number;
    user: {
      id: number;
      username: string;
      email: string;
    };
  }>;
}

interface ExpensesSectionProps {
  expenses: Expense[];
  sortedExpenses: Expense[];
  expensesLoading: boolean;
  sortBy: 'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc';
  onSortChange: (sortBy: 'amount_asc' | 'amount_desc' | 'date_asc' | 'date_desc') => void;
  isCreator: boolean;
  isActive: boolean;
  onEditExpense: (expense: Expense) => void;
}

export default function ExpensesSection({
  expenses,
  sortedExpenses,
  expensesLoading,
  sortBy,
  onSortChange,
  isCreator,
  isActive,
  onEditExpense,
}: ExpensesSectionProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.expensesSection}>
      <View style={styles.expensesHeader}>
        <Text style={[
          styles.sectionTitle,
          { fontSize: isSmallScreen ? 18 : 20 },
        ]}>
          Wydatki
        </Text>
        {expenses.length > 0 && (
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                (sortBy === 'amount_asc' || sortBy === 'amount_desc') && styles.sortButtonActive,
                { padding: isSmallScreen ? 6 : 8 },
              ]}
              onPress={() => {
                onSortChange(sortBy === 'amount_desc' ? 'amount_asc' : 'amount_desc');
              }}
            >
              <Ionicons 
                name={sortBy === 'amount_desc' ? 'arrow-down' : 'arrow-up'} 
                size={isSmallScreen ? 14 : 16} 
                color={(sortBy === 'amount_asc' || sortBy === 'amount_desc') ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.sortButtonText,
                (sortBy === 'amount_asc' || sortBy === 'amount_desc') && styles.sortButtonTextActive,
                { fontSize: isSmallScreen ? 11 : 12 },
              ]}>
                Kwota
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                (sortBy === 'date_asc' || sortBy === 'date_desc') && styles.sortButtonActive,
                { padding: isSmallScreen ? 6 : 8 },
              ]}
              onPress={() => {
                onSortChange(sortBy === 'date_desc' ? 'date_asc' : 'date_desc');
              }}
            >
              <Ionicons 
                name={sortBy === 'date_desc' ? 'arrow-down' : 'arrow-up'} 
                size={isSmallScreen ? 14 : 16} 
                color={(sortBy === 'date_asc' || sortBy === 'date_desc') ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[
                styles.sortButtonText,
                (sortBy === 'date_asc' || sortBy === 'date_desc') && styles.sortButtonTextActive,
                { fontSize: isSmallScreen ? 11 : 12 },
              ]}>
                Data
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {expensesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0080FF" />
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={isSmallScreen ? 48 : 56} color="#6B7280" />
          <Text style={[
            styles.emptyText,
            { fontSize: isSmallScreen ? 13 : 14 },
          ]}>
            Brak wydatków
          </Text>
        </View>
      ) : (
        <View style={styles.expensesList}>
          {sortedExpenses.map((item) => (
            <ExpenseCard
              key={item.id}
              expense={item}
              isCreator={isCreator}
              isActive={isActive}
              onEdit={onEditExpense}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  expensesSection: {
    gap: 12,
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  sortButtonActive: {
    backgroundColor: '#0080FF',
  },
  sortButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
  },
  expensesList: {
    gap: 16,
  },
});

