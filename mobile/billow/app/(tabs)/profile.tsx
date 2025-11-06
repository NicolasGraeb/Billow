import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { API_ENDPOINTS } from '@/urls/api';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EventList from '@/components/events/EventList';
import FriendRequestsModal from '@/components/modals/FriendRequestsModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import FriendsListModal from '@/components/modals/FriendsListModal';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  friends_count: number | null;
}

interface Event {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  finished_at: string | null;
  status: string;
  created_by: number;
}

export default function Profile() {
  const { accessToken, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    router.replace('/(auth)/login');
  };

  const fetchProfile = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać profilu');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error: any) {
      Alert.alert('Błąd', error.message || 'Wystąpił błąd podczas ładowania profilu');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!accessToken) {
      setEventsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.EVENTS.ME, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać eventów');
      }

      const data = await response.json();
      const sortedEvents = data.sort((a: Event, b: Event) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setEvents(sortedEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchEvents();
  }, [accessToken]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nie udało się załadować profilu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <ProfileHeader 
              username={profile.username} 
              email={profile.email} 
              friendsCount={profile.friends_count || 0}
              onRequestsPress={() => setShowRequestsModal(true)}
              onLogoutPress={() => setShowLogoutModal(true)}
              onFriendsCountPress={() => setShowFriendsModal(true)}
            />
            <EventList events={events} loading={eventsLoading} />
          </>
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: (isSmallScreen ? 55 : 60) + insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />
      <FriendRequestsModal
        visible={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        onFriendAccepted={() => {
          fetchProfile();
        }}
      />
      <LogoutConfirmModal
        visible={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      <FriendsListModal
        visible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        currentUserId={profile.id}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  content: {
    paddingBottom: 20,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#A7B0C0',
    fontSize: 16,
  },
});
