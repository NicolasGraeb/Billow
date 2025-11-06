import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Event {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  finished_at: string | null;
  status: string;
  created_by: number;
}

interface EventListProps {
  events: Event[];
  loading?: boolean;
}

export default function EventList({ events, loading }: EventListProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 414;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;

    const selectedDateOnly = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const nextDay = new Date(selectedDateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    return events.filter((event) => {
      const eventDate = new Date(event.created_at);
      const eventDateOnly = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
      
      return eventDateOnly >= selectedDateOnly && eventDateOnly < nextDay;
    });
  }, [events, selectedDate]);

  const formatSelectedDate = () => {
    if (!selectedDate) return 'Wybierz datę';
    return selectedDate.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Wczoraj';
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <View style={[
      styles.eventItem,
      {
        padding: isSmallScreen ? 10 : 12,
      },
    ]}>
      <View style={styles.eventContent}>
        <Text 
          style={[
            styles.eventName,
            {
              fontSize: isSmallScreen ? 15 : isLargeScreen ? 17 : 16,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {item.description && (
          <Text style={[
            styles.eventDescription,
            {
              fontSize: isSmallScreen ? 12 : 13,
            },
          ]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.eventFooter}>
          <Text style={[
            styles.eventDate,
            {
              fontSize: isSmallScreen ? 11 : 12,
            },
          ]}>{formatDate(item.created_at)}</Text>
          <View style={[styles.statusBadge, item.status === 'finished' && styles.statusFinished]}>
            <Text style={[
              styles.statusText,
              item.status === 'finished' && styles.statusTextFinished,
              {
                fontSize: isSmallScreen ? 10 : 11,
              },
            ]}>
              {item.status === 'active' ? 'Aktywny' : 'Zakończony'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const containerStyle = [
    styles.container,
    {
      marginHorizontal: isSmallScreen ? 16 : 20,
      marginTop: isSmallScreen ? 24 : 28,
    },
  ];

  const contentStyle = [
    styles.content,
    {
      paddingVertical: isSmallScreen ? 12 : 16,
      paddingHorizontal: isSmallScreen ? 12 : 16,
    },
  ];

  return (
    <View style={containerStyle}>
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: Platform.OS === 'android' 
              ? 'rgba(22,24,30,0.35)' 
              : 'rgba(22,24,30,0.22)',
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

      <View style={[contentStyle, { flex: 1 }]}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.datePickerButton,
              {
                paddingHorizontal: isSmallScreen ? 12 : 16,
                paddingVertical: isSmallScreen ? 8 : 10,
                maxWidth: width - (isSmallScreen ? 64 : 80),
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons 
              name="calendar-outline" 
              size={isSmallScreen ? 16 : 18} 
              color="#0080FF" 
            />
            <Text 
              style={[
                styles.datePickerText,
                {
                  fontSize: isSmallScreen ? 13 : 14,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formatSelectedDate()}
            </Text>
            {selectedDate && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedDate(null);
                }}
              >
                <Ionicons 
                  name="close-circle" 
                  size={isSmallScreen ? 16 : 18} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }
              if (event.type === 'set' && date) {
                setSelectedDate(date);
                if (Platform.OS === 'ios') {
                  setShowDatePicker(false);
                }
              } else if (event.type === 'dismissed') {
                setShowDatePicker(false);
              }
            }}
            locale="pl-PL"
          />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Ładowanie...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="calendar-outline" 
              size={isSmallScreen ? 40 : isLargeScreen ? 56 : 48} 
              color="#6B7280" 
            />
            <Text style={[
              styles.emptyText,
              {
                fontSize: isSmallScreen ? 13 : 14,
              },
            ]}>Brak eventów</Text>
          </View>
        ) : (
          <View style={styles.eventsList}>
            {filteredEvents.map((item) => (
              <View key={item.id}>
                {renderEventItem({ item })}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
  },
  filterContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  datePickerText: {
    color: '#E5E7EB',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    marginLeft: 4,
  },
  eventsList: {
    gap: 8,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  eventContent: {
    gap: 6,
  },
  eventName: {
    color: '#E5E7EB',
    fontWeight: '600',
  },
  eventDescription: {
    color: '#A7B0C0',
    lineHeight: 18,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDate: {
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusFinished: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    color: '#22C55E',
    fontWeight: '600',
  },
  statusTextFinished: {
    color: '#6B7280',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#A7B0C0',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#6B7280',
  },
});

