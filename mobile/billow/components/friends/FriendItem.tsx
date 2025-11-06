import { View, StyleSheet, Dimensions } from 'react-native';
import UserAvatar from '@/components/common/UserAvatar';
import UserInfo from '@/components/common/UserInfo';

interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  friend: {
    id: number;
    username: string;
    email: string;
  };
}

interface FriendItemProps {
  item: Friend;
  currentUserId?: number;
}

export default function FriendItem({ item, currentUserId }: FriendItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const getFriendUser = () => {
    if (!currentUserId) {
      return item.friend || item.user;
    }
    if (item.user && item.friend) {
      if (item.user.id === currentUserId) {
        return item.friend;
      } else if (item.friend.id === currentUserId) {
        return item.user;
      }
      return item.friend;
    }
    return item.user || item.friend;
  };

  const friendUser = getFriendUser();
  if (!friendUser) return null;

  return (
    <View style={[
      styles.friendItem,
      {
        padding: isSmallScreen ? 12 : 16,
      },
    ]}>
      <View style={styles.userInfo}>
        <UserAvatar />
        <UserInfo 
          username={friendUser.username}
          email={friendUser.email}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  friendItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});


