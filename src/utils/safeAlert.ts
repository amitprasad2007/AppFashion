import { Platform } from 'react-native';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
  onDismiss?: () => void;
  type?: 'success' | 'error' | 'info' | 'warning';
};

type AlertListener = (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => void;

// Create a global registry for the listener to survive Fast Refresh in React Native
const globalAny: any = global;

/**
 * Safe Alert utility to prevent "Tried to show an alert while not attached to an Activity" errors
 * and provides a beautiful custom UI.
 */
export class SafeAlert {
  public static get isShowing(): boolean {
    return !!globalAny.__safeAlertIsShowing;
  }
  public static set isShowing(value: boolean) {
    globalAny.__safeAlertIsShowing = value;
  }

  static setListener(listener: AlertListener) {
    globalAny.__safeAlertListener = listener;
  }

  static clearListener() {
    globalAny.__safeAlertListener = null;
  }

  /**
   * Show an alert safely. Triggers the GlobalAlert component if mounted.
   */
  static show(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    if (SafeAlert.isShowing) {
      console.warn('SafeAlert: Alert already showing, skipping new alert');
      return;
    }

    if (globalAny.__safeAlertListener) {
      globalAny.__safeAlertListener(title, message, buttons, options);
    } else {
      // Fallback to native Alert if listener isn't mounted yet
      console.warn('SafeAlert: Custom listener not mounted, falling back to native alert.');
      import('react-native').then(({ Alert }) => {
        Alert.alert(title, message, buttons, options);
      });
    }
  }

  /**
   * Show a simple success alert
   */
  static success(title: string, message?: string): void {
    SafeAlert.show(title, message, [{ text: 'OK', style: 'default' }], { type: 'success' });
  }

  /**
   * Show a simple error alert
   */
  static error(title: string, message?: string): void {
    SafeAlert.show(title, message, [{ text: 'OK', style: 'cancel' }], { type: 'error' });
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
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Yes', style: 'default', onPress: onConfirm },
      ],
      { type: 'warning' }
    );
  }
}

export default SafeAlert;