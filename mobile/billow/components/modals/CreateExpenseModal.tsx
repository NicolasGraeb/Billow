import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Dimensions, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';

interface Participant {
  id: number;
  username: string;
  email: string;
}

interface CreateExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseCreated?: () => void;
  eventId: number;
  participants: Participant[];
  currentUserId: number;
}

interface ParticipantSplit {
  user_id: number;
  amount: number;
  selected: boolean;
  displayValue?: string; // Przechowuje surową wartość podczas edycji
}

export default function CreateExpenseModal({
  visible,
  onClose,
  onExpenseCreated,
  eventId,
  participants,
  currentUserId,
}: CreateExpenseModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const { accessToken } = useAuth();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payerId, setPayerId] = useState<number>(currentUserId);
  const [participantSplits, setParticipantSplits] = useState<ParticipantSplit[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setDescription('');
      setPayerId(currentUserId);
      setSplitType('equal');
      const splits: ParticipantSplit[] = participants.map((p) => ({
        user_id: p.id,
        amount: 0,
        selected: true,
        displayValue: undefined,
      }));
      setParticipantSplits(splits);
    }
  }, [visible, participants, currentUserId]);

  useEffect(() => {
    if (splitType === 'equal' && amount && participantSplits.length > 0) {
      const selectedCount = participantSplits.filter((p) => p.selected).length;
      if (selectedCount > 0) {
        const equalAmount = parseFloat(amount) / selectedCount;
        setParticipantSplits(
          participantSplits.map((p) => ({
            ...p,
            amount: p.selected ? equalAmount : 0,
            displayValue: undefined, // Reset display value dla równomiernego podziału
          }))
        );
      }
    }
  }, [amount, splitType, participantSplits.length]);

  const toggleParticipant = (userId: number) => {
    setParticipantSplits(
      participantSplits.map((p) =>
        p.user_id === userId ? { ...p, selected: !p.selected, amount: 0 } : p
      )
    );
  };

  const formatAmountInput = (value: string): string => {
    // Usuń wszystkie znaki oprócz cyfr, kropki i przecinka
    let cleaned = value.replace(/[^\d.,]/g, '');
    
    // Zamień przecinek na kropkę
    cleaned = cleaned.replace(',', '.');
    
    // Pozwól tylko na jedną kropkę
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Ogranicz do 2 miejsc po przecinku
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);
  };

  const updateParticipantAmount = (userId: number, value: string) => {
    const formatted = formatAmountInput(value);
    const numValue = formatted === '' || formatted === '.' ? 0 : parseFloat(formatted) || 0;
    setParticipantSplits(
      participantSplits.map((p) =>
        p.user_id === userId 
          ? { ...p, amount: numValue, displayValue: formatted }
          : { ...p, displayValue: p.amount > 0 ? p.amount.toFixed(2) : '' }
      )
    );
  };

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Błąd', 'Podaj poprawną kwotę');
      return;
    }

    const selectedParticipants = participantSplits.filter((p) => p.selected);
    if (selectedParticipants.length === 0) {
      Alert.alert('Błąd', 'Wybierz przynajmniej jednego uczestnika');
      return;
    }

    const total = selectedParticipants.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(total - parseFloat(amount)) > 0.01) {
      Alert.alert('Błąd', `Suma kwot uczestników (${total.toFixed(2)}) musi równać się kwocie wydatku (${parseFloat(amount).toFixed(2)})`);
      return;
    }

    if (!accessToken) return;

    setCreating(true);
    try {
      const response = await fetch(API_ENDPOINTS.EXPENSES.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          payer_id: payerId,
          amount: parseFloat(amount),
          description: description.trim() || null,
          participants: selectedParticipants.map((p) => ({
            user_id: p.user_id,
            amount: p.amount,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Nie udało się utworzyć wydatku' }));
        throw new Error(error.detail || 'Nie udało się utworzyć wydatku');
      }

      if (onExpenseCreated) {
        onExpenseCreated();
      }
      onClose();
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Nie udało się utworzyć wydatku');
    } finally {
      setCreating(false);
    }
  };

  const selectedCount = participantSplits.filter((p) => p.selected).length;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Nowy wydatek" onClose={onClose} />

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontSize: isSmallScreen ? 13 : 14 }]}>Kwota *</Text>
              <TextInput
                style={[styles.input, { fontSize: isSmallScreen ? 14 : 16 }]}
                placeholder="0.00"
                placeholderTextColor="#6B7280"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontSize: isSmallScreen ? 13 : 14 }]}>Opis (opcjonalnie)</Text>
              <TextInput
                style={[styles.input, { fontSize: isSmallScreen ? 14 : 16 }]}
                placeholder="Wpisz opis"
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { fontSize: isSmallScreen ? 13 : 14 }]}>Kto zapłacił *</Text>
              <FlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.participantOption,
                      payerId === item.id && styles.participantOptionSelected,
                      { padding: isSmallScreen ? 12 : 16 },
                    ]}
                    onPress={() => setPayerId(item.id)}
                  >
                    <View style={styles.participantOptionContent}>
                      <View style={[styles.radio, payerId === item.id && styles.radioSelected]}>
                        {payerId === item.id && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.participantName, { fontSize: isSmallScreen ? 14 : 16 }]}>
                        {item.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.splitTypeContainer}>
                <Text style={[styles.label, { fontSize: isSmallScreen ? 13 : 14 }]}>Podział wydatku</Text>
                <View style={styles.splitTypeButtons}>
                  <TouchableOpacity
                    style={[styles.splitTypeButton, splitType === 'equal' && styles.splitTypeButtonActive]}
                    onPress={() => setSplitType('equal')}
                  >
                    <Text style={[styles.splitTypeButtonText, splitType === 'equal' && styles.splitTypeButtonTextActive]}>
                      Równo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.splitTypeButton, splitType === 'custom' && styles.splitTypeButtonActive]}
                    onPress={() => setSplitType('custom')}
                  >
                    <Text style={[styles.splitTypeButtonText, splitType === 'custom' && styles.splitTypeButtonTextActive]}>
                      Własne kwoty
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={participants}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const split = participantSplits.find((p) => p.user_id === item.id);
                  const isSelected = split?.selected || false;

                  return (
                    <View style={[styles.participantSplitItem, { padding: isSmallScreen ? 12 : 16 }]}>
                      <TouchableOpacity
                        style={styles.participantSplitHeader}
                        onPress={() => toggleParticipant(item.id)}
                      >
                        <View style={styles.checkbox}>
                          {isSelected && <Ionicons name="checkmark" size={isSmallScreen ? 18 : 20} color="#0080FF" />}
                        </View>
                        <Text style={[styles.participantName, { fontSize: isSmallScreen ? 14 : 16 }]}>
                          {item.username}
                        </Text>
                      </TouchableOpacity>
                      {isSelected && (
                        <TextInput
                          style={[styles.amountInput, { fontSize: isSmallScreen ? 14 : 16 }]}
                          placeholder="0.00"
                          placeholderTextColor="#6B7280"
                          value={split?.displayValue !== undefined 
                            ? split.displayValue 
                            : (split?.amount > 0 ? split.amount.toFixed(2) : (split?.amount === 0 ? '0' : ''))}
                          onChangeText={(value) => updateParticipantAmount(item.id, value)}
                          keyboardType="decimal-pad"
                          editable={splitType === 'custom'}
                        />
                      )}
                    </View>
                  );
                }}
                scrollEnabled={false}
              />
              {splitType === 'equal' && (
                <Text style={[styles.hint, { fontSize: isSmallScreen ? 11 : 12 }]}>
                  {selectedCount > 0
                    ? `Każdy zapłaci: ${(parseFloat(amount || '0') / selectedCount).toFixed(2)} zł`
                    : 'Wybierz uczestników'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={creating || !amount || parseFloat(amount) <= 0}
            >
              {creating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.createButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>Dodaj wydatek</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#E5E7EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#E5E7EB',
  },
  participantOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  participantOptionSelected: {
    borderColor: '#0080FF',
    backgroundColor: 'rgba(0, 128, 255, 0.1)',
  },
  participantOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#0080FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0080FF',
  },
  participantName: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  splitTypeContainer: {
    marginBottom: 12,
  },
  splitTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  splitTypeButtonActive: {
    backgroundColor: '#0080FF',
  },
  splitTypeButtonText: {
    color: '#A7B0C0',
    fontWeight: '600',
    fontSize: 13,
  },
  splitTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  participantSplitItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  participantSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#E5E7EB',
    marginLeft: 36,
  },
  hint: {
    color: '#6B7280',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#0080FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


