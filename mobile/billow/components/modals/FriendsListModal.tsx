import { View, StyleSheet, FlatList, Modal } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';
import EmptyState from '@/components/common/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import FriendItem from '@/components/friends/FriendItem';

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

interface FriendsListModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserId?: number;
}

export default function FriendsListModal({ visible, onClose, currentUserId }: FriendsListModalProps) {
  const { accessToken } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.FRIENDS.LIST, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible, fetchFriends]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Znajomi" onClose={onClose} />

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : friends.length === 0 ? (
              <EmptyState
                icon="people-outline"
                message="Brak znajomych"
              />
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <FriendItem item={item} currentUserId={currentUserId} />
                )}
                contentContainerStyle={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
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
  friendsList: {
    gap: 8,
    paddingBottom: 20,
  },
});


