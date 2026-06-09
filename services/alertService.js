import { Alert } from 'react-native';

let alertListener = null;

export const registerAlertListener = (listener) => {
  alertListener = listener;
};

export const CustomAlert = {
  alert: (title, message, buttons) => {
    if (alertListener) {
      alertListener(title, message, buttons);
    } else {
      // Fallback to native Alert if listener is not ready
      Alert.alert(title, message, buttons);
    }
  }
};
