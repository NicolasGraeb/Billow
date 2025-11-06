import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function TabButton({ label, isActive, onPress }: TabButtonProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabText,
        isActive && styles.tabTextActive,
        {
          fontSize: isSmallScreen ? 13 : 14,
        },
      ]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(0, 128, 255, 0.2)',
  },
  tabText: {
    color: '#A7B0C0',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0080FF',
    fontWeight: '600',
  },
});


