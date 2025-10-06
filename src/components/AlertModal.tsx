import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Button from './Button';

interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: AlertAction[];
  onDismiss?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  actions,
  onDismiss,
}) => {
  const handleActionPress = (action: AlertAction) => {
    action.onPress?.();
    onDismiss?.();
  };

  const handleBackdropPress = () => {
    onDismiss?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable style={styles.container} onPress={() => {}}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
            </View>

            <View style={styles.actions}>
              {actions.map((action, index) => {
                const variant =
                  action.style === 'destructive'
                    ? 'danger'
                    : action.style === 'cancel'
                    ? 'secondary'
                    : 'primary';

                return (
                  <Button
                    key={index}
                    title={action.text}
                    variant={variant}
                    onPress={() => handleActionPress(action)}
                    style={[
                      styles.actionButton,
                      ...(actions.length === 1 ? [styles.singleAction] : []),
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: Math.min(width - 40, 340),
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  singleAction: {
    alignSelf: 'center',
    minWidth: 120,
  },
});

export default AlertModal;
