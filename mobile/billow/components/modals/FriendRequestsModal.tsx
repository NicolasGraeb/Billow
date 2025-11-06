import { View, StyleSheet, FlatList, Modal, Dimensions } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/urls/api';
import ModalHeader from '@/components/common/ModalHeader';
import TabButton from '@/components/common/TabButton';
import EmptyState from '@/components/common/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import ReceivedRequestItem from '@/components/friends/ReceivedRequestItem';
import SentRequestItem from '@/components/friends/SentRequestItem';

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

interface FriendRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  onFriendAccepted?: () => void;
}

type TabType = 'received' | 'sent';

export default function FriendRequestsModal({ visible, onClose, onFriendAccepted }: FriendRequestsModalProps) {
  const { accessToken } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch(API_ENDPOINTS.FRIENDS.PENDING, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(API_ENDPOINTS.FRIENDS.SENT, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (receivedRes.ok) {
        const received = await receivedRes.json();
        setReceivedRequests(received || []);
      }

      if (sentRes.ok) {
        const sent = await sentRes.json();
        setSentRequests(sent || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (visible) {
      fetchRequests();
    }
  }, [visible, fetchRequests]);

  const handleAccept = async (friendshipId: number) => {
    if (!accessToken || processing === friendshipId) return;

    setProcessing(friendshipId);
    try {
      const response = await fetch(API_ENDPOINTS.FRIENDS.ACCEPT(friendshipId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchRequests();
        if (onFriendAccepted) {
          onFriendAccepted();
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (friendshipId: number) => {
    if (!accessToken || processing === friendshipId) return;

    setProcessing(friendshipId);
    try {
      const response = await fetch(API_ENDPOINTS.FRIENDS.REJECT(friendshipId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchRequests();
        if (onFriendAccepted) {
          onFriendAccepted();
        }
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const currentRequests = activeTab === 'received' 
    ? receivedRequests.filter(req => req.from_user !== null)
    : sentRequests.filter(req => req.to_user !== null);

  const renderItem = ({ item }: { item: FriendRequest }) => {
    if (activeTab === 'received') {
      return (
        <ReceivedRequestItem
          item={item}
          processing={processing}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      );
    } else {
      return <SentRequestItem item={item} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ModalHeader title="Zaproszenia" onClose={onClose} />

          <View style={styles.tabs}>
            <TabButton
              label="Otrzymane"
              isActive={activeTab === 'received'}
              onPress={() => setActiveTab('received')}
            />
            <View style={styles.tabGap} />
            <TabButton
              label="Wysłane"
              isActive={activeTab === 'sent'}
              onPress={() => setActiveTab('sent')}
            />
          </View>

          <View style={styles.content}>
            {loading ? (
              <LoadingIndicator />
            ) : currentRequests.length === 0 ? (
              <EmptyState
                icon="mail-outline"
                message={activeTab === 'received' ? 'Brak otrzymanych zaproszeń' : 'Brak wysłanych zaproszeń'}
              />
            ) : (
              <FlatList
                data={currentRequests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.requestsList}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabGap: {
    width: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  requestsList: {
    gap: 8,
    paddingBottom: 20,
  },
});


