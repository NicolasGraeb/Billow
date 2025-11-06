import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '@/components/common/UserAvatar';
import UserInfo from '@/components/common/UserInfo';

interface FriendRequest {
  id: number;
  from_user: {
    id: number;
    username: string;
    email: string;
  } | null;
  to_user: {
    id: number;
    username: string;
    email: string;
  } | null;
  status: string;
  created_at: string;
}

interface ReceivedRequestItemProps {
  item: FriendRequest;
  processing: number | null;
  onAccept: (friendshipId: number) => void;
  onReject: (friendshipId: number) => void;
}

export default function ReceivedRequestItem({ 
  item, 
  processing, 
  onAccept, 
  onReject 
}: ReceivedRequestItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isProcessing = processing === item.id;

  return (
    <View style={[
      styles.requestItem,
      {
        padding: isSmallScreen ? 12 : 16,
      },
    ]}>
      <View style={styles.userInfo}>
        <UserAvatar />
        <UserInfo 
          username={item.from_user?.username || 'Nieznany użytkownik'}
          email={item.from_user?.email || ''}
        />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.acceptButton, isProcessing && styles.buttonDisabled]}
          onPress={() => onAccept(item.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#22C55E" />
          ) : (
            <Ionicons name="checkmark" size={isSmallScreen ? 18 : 20} color="#22C55E" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
          onPress={() => onReject(item.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="close" size={isSmallScreen ? 18 : 20} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  requestItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});


