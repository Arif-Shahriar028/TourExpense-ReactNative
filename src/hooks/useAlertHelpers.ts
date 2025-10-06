import { useAlert, AlertAction } from '../context/AlertContext';

export const useAlertHelpers = () => {
  const { showAlert } = useAlert();

  const showSuccessAlert = (
    title: string,
    message?: string,
    actions?: AlertAction[]
  ) => {
    showAlert({
      title,
      message,
      actions: actions || [{ text: 'OK', style: 'default' }],
    });
  };

  const showErrorAlert = (
    title: string = 'Error',
    message?: string,
    actions?: AlertAction[]
  ) => {
    showAlert({
      title,
      message,
      actions: actions || [{ text: 'OK', style: 'default' }],
    });
  };

  const showConfirmAlert = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showAlert({
      title,
      message,
      actions: [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: 'default',
          onPress: onConfirm,
        },
      ],
    });
  };

  const showDestructiveAlert = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ) => {
    showAlert({
      title,
      message,
      actions: [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
    });
  };

  const showCustomAlert = (
    title: string,
    message?: string,
    actions: AlertAction[] = [{ text: 'OK', style: 'default' }]
  ) => {
    showAlert({
      title,
      message,
      actions,
    });
  };

  return {
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showConfirmAlert,
    showDestructiveAlert,
    showCustomAlert,
  };
};