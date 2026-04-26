import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import SafeAlert, { AlertButton, AlertOptions } from '../utils/safeAlert';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

const GlobalAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Register listener
    SafeAlert.setListener((title, message, buttons, options) => {
      setAlertState({ visible: true, title, message, buttons, options });
      SafeAlert.isShowing = true;
      
      // Animate in
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 7,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    });

    return () => {
      SafeAlert.clearListener();
    };
  }, []);

  const closeAlert = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setAlertState(prev => ({ ...prev, visible: false }));
      SafeAlert.isShowing = false;
      if (alertState.options?.onDismiss) {
        alertState.options.onDismiss();
      }
      if (callback) {
        callback();
      }
    });
  };

  if (!alertState.visible) return null;

  const { title, message, buttons, options } = alertState;
  const type = options?.type || 'info';

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: theme.colors.success[500], bg: theme.colors.success[50] };
      case 'error':
        return { name: 'error', color: theme.colors.error[500], bg: theme.colors.error[50] };
      case 'warning':
        return { name: 'warning', color: theme.colors.warning[500], bg: theme.colors.warning[50] };
      default:
        return { name: 'info', color: theme.colors.primary[500], bg: theme.colors.primary[50] };
    }
  };

  const iconConfig = getIconConfig();

  // Determine buttons to render
  const defaultButtons: AlertButton[] = [{ text: 'OK', style: 'default' }];
  const renderButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal transparent visible={alertState.visible} animationType="none" onRequestClose={() => closeAlert()}>
      <TouchableWithoutFeedback onPress={() => closeAlert()}>
        <View style={styles.overlay}>
          {Platform.OS === 'ios' ? (
            <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={5} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          )}

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  opacity: opacityValue,
                  transform: [{ scale: scaleValue }]
                }
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
                <Icon name={iconConfig.name} size={40} color={iconConfig.color} />
              </View>

              <Text style={styles.title}>{title}</Text>
              
              {message && <Text style={styles.message}>{message}</Text>}

              <View style={styles.buttonContainer}>
                {renderButtons.map((btn, index) => {
                  const isPrimary = btn.style !== 'cancel';
                  const isDestructive = btn.style === 'destructive';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        renderButtons.length > 1 && { flex: 1, marginHorizontal: 6 },
                        !isPrimary && styles.cancelButton,
                        isDestructive && styles.destructiveButton
                      ]}
                      onPress={() => {
                        closeAlert(btn.onPress);
                      }}
                      activeOpacity={0.8}
                    >
                      {isPrimary && !isDestructive ? (
                        <LinearGradient
                          colors={[theme.colors.primary[500], theme.colors.primary[600]]}
                          style={styles.gradientButton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Text style={styles.primaryButtonText}>{btn.text}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={[
                          styles.buttonText,
                          isDestructive && styles.destructiveButtonText
                        ]}>
                          {btn.text}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  cancelButton: {
    backgroundColor: theme.colors.neutral[100],
  },
  destructiveButton: {
    backgroundColor: theme.colors.error[50],
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonText: {
    color: theme.colors.neutral[700],
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: theme.colors.error[600],
  }
});

export default GlobalAlert;
