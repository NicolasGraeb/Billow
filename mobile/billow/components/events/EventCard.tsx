import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.eventCard}>
      <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(22,24,30,0.35)' }]} />
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
          { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20 },
        ]}
      />

      <View style={[styles.eventContent, { padding: isSmallScreen ? 16 : 20 }]}>
        <Text style={[
          styles.eventName,
          { fontSize: isSmallScreen ? 22 : 26 },
        ]}>
          {event.name}
        </Text>
        {event.description && (
          <Text style={[
            styles.eventDescription,
            { fontSize: isSmallScreen ? 14 : 16 },
          ]}>
            {event.description}
          </Text>
        )}
        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={isSmallScreen ? 16 : 18} color="#0080FF" />
            <Text style={[
              styles.infoText,
              { fontSize: isSmallScreen ? 13 : 14 },
            ]}>
              {event.creator.username}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people" size={isSmallScreen ? 16 : 18} color="#0080FF" />
            <Text style={[
              styles.infoText,
              { fontSize: isSmallScreen ? 13 : 14 },
            ]}>
              {event.participants?.length || 0} uczestników
            </Text>
          </View>
          {event.status === 'finished' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Zakończony</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  eventContent: {
    gap: 12,
  },
  eventName: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  eventDescription: {
    color: '#A7B0C0',
    marginTop: 4,
  },
  eventInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#0080FF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
});

