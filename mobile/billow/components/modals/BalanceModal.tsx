import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import EmptyState from '@/components/common/EmptyState';

interface BalanceEntry {
  from_user_id: number;
  to_user_id: number;
  amount: number;
  from_user: {
    id: number;
    username: string;
    email: string;
  };
  to_user: {
    id: number;
    username: string;
    email: string;
  };
}

interface EventBalance {
  event_id: number;
  balances: BalanceEntry[];
  summary: Record<string, number>;
}

interface BalanceModalProps {
  visible: boolean;
  onClose: () => void;
  eventId: number;
}

export default function BalanceModal({ visible, onClose, eventId }: BalanceModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const { accessToken } = useAuth();

  const [balance, setBalance] = useState<EventBalance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && eventId) {
      fetchBalance();
    }
  }, [visible, eventId]);

  const fetchBalance = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.EXPENSES.BALANCE(eventId), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBalanceItem = ({ item }: { item: BalanceEntry }) => (
    <View style={[
      styles.balanceItem,
      {
        padding: isSmallScreen ? 12 : 16,
      },
    ]}>
      <View style={styles.balanceContent}>
        <View style={styles.balanceUser}>
          <Ionicons name="person" size={isSmallScreen ? 18 : 20} color="#EF4444" />
          <Text style={[
            styles.balanceUsername,
            {
              fontSize: isSmallScreen ? 14 : 16,
            },
          ]} numberOfLines={1}>
            {item.from_user.username}
          </Text>
        </View>
        <View style={styles.balanceArrow}>
          <Ionicons name="arrow-forward" size={isSmallScreen ? 18 : 20} color="#6B7280" />
        </View>
        <View style={styles.balanceUser}>
          <Ionicons name="person" size={isSmallScreen ? 18 : 20} color="#22C55E" />
          <Text style={[
            styles.balanceUsername,
            {
              fontSize: isSmallScreen ? 14 : 16,
            },
          ]} numberOfLines={1}>
            {item.to_user.username}
          </Text>
        </View>
        <Text style={[
          styles.balanceAmount,
          {
            fontSize: isSmallScreen ? 16 : 18,
          },
        ]}>
          {item.amount.toFixed(2)} zł
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Podsumowanie" onClose={onClose} />

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : !balance ? (
              <EmptyState
                icon="information-circle-outline"
                message="Brak danych"
              />
            ) : (
              <>
                {Object.keys(balance.summary).length > 0 && (
                  <View style={styles.summarySection}>
                    <Text style={[
                      styles.sectionTitle,
                      {
                        fontSize: isSmallScreen ? 16 : 18,
                      },
                    ]}>
                      Saldo
                    </Text>
                    {Object.entries(balance.summary).map(([username, amount]) => (
                      <View key={username} style={styles.summaryItem}>
                        <Text style={[
                          styles.summaryUsername,
                          {
                            fontSize: isSmallScreen ? 14 : 16,
                          },
                        ]}>
                          {username}
                        </Text>
                        <Text style={[
                          styles.summaryAmount,
                          {
                            fontSize: isSmallScreen ? 14 : 16,
                            color: amount >= 0 ? '#22C55E' : '#EF4444',
                          },
                        ]}>
                          {amount >= 0 ? '+' : ''}{amount.toFixed(2)} zł
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.balancesSection}>
                  <Text style={[
                    styles.sectionTitle,
                    {
                      fontSize: isSmallScreen ? 16 : 18,
                    },
                  ]}>
                    Optymalne przelewy ({balance.balances.length})
                  </Text>
                  {balance.balances.length === 0 ? (
                    <EmptyState
                      icon="checkmark-circle-outline"
                      message="Wszystko wyrównane"
                    />
                  ) : (
                    <FlatList
                      data={balance.balances}
                      keyExtractor={(item, index) => `${item.from_user_id}-${item.to_user_id}-${index}`}
                      renderItem={renderBalanceItem}
                      contentContainerStyle={styles.balancesList}
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#080B12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  summaryUsername: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  summaryAmount: {
    fontWeight: '700',
  },
  balancesSection: {
    flex: 1,
  },
  balancesList: {
    gap: 8,
  },
  balanceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  balanceUsername: {
    color: '#E5E7EB',
    fontWeight: '600',
    flex: 1,
  },
  balanceArrow: {
    marginHorizontal: 4,
  },
  balanceAmount: {
    color: '#0080FF',
    fontWeight: '700',
  },
});


