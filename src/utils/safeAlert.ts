import { Alert, Platform } from 'react-native';

/**
 * Safe Alert utility to prevent "Tried to show an alert while not attached to an Activity" errors
 */
export class SafeAlert {
  private static isShowing = false;

  /**
   * Show an alert safely with delay to ensure Activity is available
   */
  static show(
    title: string,
    message?: string,
    buttons?: any[],
    options?: any
  ): void {
    // Prevent multiple alerts from showing simultaneously
    if (SafeAlert.isShowing) {
      console.warn('SafeAlert: Alert already showing, skipping new alert');
      return;
    }

    // Add small delay to ensure Activity is ready
    setTimeout(() => {
      try {
        SafeAlert.isShowing = true;

        Alert.alert(
          title,
          message,
          buttons,
          {
            ...(options || {}),
            onDismiss: () => {
              SafeAlert.isShowing = false;
              options?.onDismiss?.();
            }
          }
        );

        // Fallback to reset flag after 5 seconds
        setTimeout(() => {
          SafeAlert.isShowing = false;
        }, 5000);

      } catch (error) {
        console.error('SafeAlert Error:', error);
        SafeAlert.isShowing = false;

        // Fallback to console log if Alert fails
        console.log(`Alert: ${title} - ${message}`);
      }
    }, Platform.OS === 'android' ? 100 : 50);
  }

  /**
   * Show a simple success alert
   */
  static success(title: string, message?: string): void {
    SafeAlert.show(title, message, [{ text: 'OK', style: 'default' }]);
  }

  /**
   * Show a simple error alert
   */
  static error(title: string, message?: string): void {
    SafeAlert.show(title, message, [{ text: 'OK', style: 'default' }]);
  }

  /**
   * Show a confirmation alert with Yes/No buttons
   */
  static confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    SafeAlert.show(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Yes',
          style: 'default',
          onPress: onConfirm,
        },
      ]
    );
  }
}

export default SafeAlert;