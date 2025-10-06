import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message?: string;
  actions: AlertAction[];
}

interface AlertContextValue {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const value: AlertContextValue = {
    showAlert,
    hideAlert,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {alertConfig && (
        <GlobalAlertModal
          visible={true}
          config={alertConfig}
          onDismiss={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

interface GlobalAlertModalProps {
  visible: boolean;
  config: AlertConfig;
  onDismiss: () => void;
}

import AlertModal from '../components/AlertModal';

const GlobalAlertModal: React.FC<GlobalAlertModalProps> = ({
  visible,
  config,
  onDismiss,
}) => {
  const handleActionPress = (action: AlertAction) => {
    action.onPress?.();
    onDismiss();
  };

  const actionsWithHandlers = config.actions.map(action => ({
    ...action,
    onPress: () => handleActionPress(action),
  }));

  return (
    <AlertModal
      visible={visible}
      title={config.title}
      message={config.message}
      actions={actionsWithHandlers}
      onDismiss={onDismiss}
    />
  );
};