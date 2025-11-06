import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({ visible, onConfirm, onCancel }: LogoutConfirmModalProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              },
            ]}
          />

          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="log-out-outline" size={isSmallScreen ? 48 : 56} color="#EF4444" />
            </View>
            
            <Text style={[
              styles.title,
              {
                fontSize: isSmallScreen ? 20 : 24,
              },
            ]}>
              Wylogować się?
            </Text>
            
            <Text style={[
              styles.message,
              {
                fontSize: isSmallScreen ? 14 : 16,
              },
            ]}>
              Czy na pewno chcesz się wylogować?
            </Text>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={[
                  styles.buttonText,
                  styles.cancelButtonText,
                  {
                    fontSize: isSmallScreen ? 14 : 16,
                  },
                ]}>
                  Anuluj
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={[
                  styles.buttonText,
                  styles.confirmButtonText,
                  {
                    fontSize: isSmallScreen ? 14 : 16,
                  },
                ]}>
                  Wyloguj
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    color: '#E5E7EB',
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: '#A7B0C0',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonText: {
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#E5E7EB',
  },
  confirmButtonText: {
    color: '#EF4444',
  },
});


