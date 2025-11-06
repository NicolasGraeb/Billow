import { View, Text, StyleSheet, Dimensions } from 'react-native';
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

interface SentRequestItemProps {
  item: FriendRequest;
}

export default function SentRequestItem({ item }: SentRequestItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const targetUser = item.to_user;
  
  if (!targetUser) return null;

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
          username={targetUser.username}
          email={targetUser.email}
        />
      </View>
      <View style={styles.statusBadge}>
        <Text style={[
          styles.statusText,
          {
            fontSize: isSmallScreen ? 11 : 12,
          },
        ]}>Oczekujące</Text>
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    color: '#6B7280',
    fontWeight: '600',
  },
});


