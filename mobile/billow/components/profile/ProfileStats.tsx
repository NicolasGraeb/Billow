import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileStatsProps {
  friendsCount: number;
}

export default function ProfileStats({ friendsCount }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      {/* Blur background */}
      <BlurView
        intensity={15}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      
      {/* Semi-transparent overlay */}
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

      <View style={styles.content}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{friendsCount}</Text>
          <Text style={styles.statLabel}>Znajomi</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 80,
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#E5E7EB',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    color: '#A7B0C0',
    fontSize: 14,
    textAlign: 'center',
  },
});

