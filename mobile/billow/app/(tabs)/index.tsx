import { TouchableOpacity, Text, StyleSheet, View, FlatList, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_ENDPOINTS } from '@/urls/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import CreateEventModal from '@/components/modals/CreateEventModal';

interface Event {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  status: string;
  created_at: string;
  finished_at: string | null;
  participants: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  creator: {
    id: number;
    username: string;
    email: string;
  };
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export default function Home() {
  const { accessToken, userId } = useAuth();
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const PAGE_SIZE = 5;

  useEffect(() => {
    resetAndFetchEvents();
  }, [accessToken]);

  // Odśwież listę eventów gdy użytkownik wraca na ekran
  useFocusEffect(
    useCallback(() => {
      if (accessToken) {
        resetAndFetchEvents();
      }
    }, [accessToken])
  );

  const resetAndFetchEvents = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setPage(0);
    setEvents([]);
    setHasMore(true);
    setLoading(true);
    await fetchActiveEvents(0, true);
  };

  const fetchActiveEvents = async (pageNum: number = 0, isInitial: boolean = false) => {
    if (!accessToken) return;

    if (!isInitial) {
      setLoadingMore(true);
    }

    try {
      const skip = pageNum * PAGE_SIZE;
      const response = await fetch(`${API_ENDPOINTS.EVENTS.ACTIVE}?skip=${skip}&limit=${PAGE_SIZE}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać eventów');
      }

      const data = await response.json();
      const newEvents = data || [];
      
      if (isInitial) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }
      
      setHasMore(newEvents.length === PAGE_SIZE);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      if (isInitial) {
        Alert.alert('Błąd', error.message || 'Nie udało się pobrać eventów');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && accessToken) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActiveEvents(nextPage, false);
    }
  }, [loadingMore, hasMore, loading, page, accessToken]);

  const handleEventPress = (eventId: number) => {
    console.log('Navigating to event:', eventId);
    router.push(`/event/${eventId}` as any);
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        {
          padding: isSmallScreen ? 16 : 20,
        },
      ]}
      onPress={() => handleEventPress(item.id)}
    >
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(22,24,30,0.35)',
          },
        ]}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 20,
          },
        ]}
      />

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[
            styles.eventName,
            {
              fontSize: isSmallScreen ? 18 : 20,
            },
          ]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.creator && (
            <Text style={[
              styles.eventCreator,
              {
                fontSize: isSmallScreen ? 12 : 13,
              },
            ]}>
              Utworzył: {item.creator.username}
            </Text>
          )}
        </View>
        
        {item.description && (
          <Text style={[
            styles.eventDescription,
            {
              fontSize: isSmallScreen ? 13 : 14,
            },
          ]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.eventFooter}>
          <View style={styles.participantsInfo}>
            <Ionicons name="people" size={isSmallScreen ? 16 : 18} color="#0080FF" />
            <Text style={[
              styles.participantsCount,
              {
                fontSize: isSmallScreen ? 12 : 13,
              },
            ]}>
              {item.participants?.length || 0} uczestników
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={isSmallScreen ? 18 : 20} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0080FF" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={isSmallScreen ? 64 : 80} color="#6B7280" />
          <Text style={[
            styles.emptyText,
            {
              fontSize: isSmallScreen ? 16 : 18,
            },
          ]}>Brak aktywnych eventów</Text>
          <Text style={[
            styles.emptySubtext,
            {
              fontSize: isSmallScreen ? 13 : 14,
            },
          ]}>Utwórz nowy event aby zacząć</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEventItem}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={[
                styles.headerTitle,
                {
                  fontSize: isSmallScreen ? 24 : 28,
                },
              ]}>Moje eventy</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={isSmallScreen ? 24 : 28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={[
            styles.eventsList,
            {
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: (isSmallScreen ? 55 : 60) + insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#0080FF" />
              </View>
            ) : null
          }
        />
      )}

      {userId !== null && (
        <CreateEventModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={() => {
            resetAndFetchEvents();
            setShowCreateModal(false);
          }}
          currentUserId={userId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  headerTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0080FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#6B7280',
  },
  eventsList: {
    gap: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  eventContent: {
    gap: 12,
  },
  eventHeader: {
    gap: 4,
  },
  eventName: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  eventCreator: {
    color: '#A7B0C0',
  },
  eventDescription: {
    color: '#A7B0C0',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsCount: {
    color: '#0080FF',
    fontWeight: '600',
  },
});
