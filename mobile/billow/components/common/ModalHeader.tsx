import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <View style={styles.header}>
      <Text style={[
        styles.headerTitle,
        {
          fontSize: isSmallScreen ? 20 : 24,
        },
      ]}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={isSmallScreen ? 24 : 28} color="#E5E7EB" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#E5E7EB',
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
});


