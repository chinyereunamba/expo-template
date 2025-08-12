import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { APP_CONFIG } from '@/config/environment';
import { AppLogger } from '@/utils/logger';
import { crashReporter } from '@/utils/crashReporter';
import { networkMonitor } from '@/utils/networkMonitor';
import { stateInspector } from '@/utils/zustandDevtools';

// Only render in development mode
if (!APP_CONFIG.DEBUG) {
  // Return empty component in production
   export  const DevMenu: React.FC = () => null;
    
} else {
  interface DevMenuProps {
    screenName?: string;
  }

 export const DevMenu: React.FC<DevMenuProps> = ({
    screenName = 'Unknown',
  }) => {
    const [visible, setVisible] = useState(false);
    const { theme } = useTheme();
    const logger = AppLogger.setContext(`DevMenu:${screenName}`);

    const handleLogScreenView = () => {
      logger.logUserAction('Screen View', { screen: screenName });
      Alert.alert('Logged', `Screen view logged for ${screenName}`);
    };

    const handleTestCrash = () => {
      Alert.alert('Test Crash', 'Generate a test crash report?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            crashReporter.testCrash();
            Alert.alert('Success', 'Test crash generated');
          },
        },
      ]);
    };

    const handleClearNetworkLogs = () => {
      networkMonitor.clear();
      Alert.alert('Success', 'Network logs cleared');
    };

    const handleExportState = () => {
      const state = stateInspector.exportState();
      logger.debug('Current app state', JSON.parse(state));
      Alert.alert('State Exported', 'Check console for current app state');
    };

    const handleMemoryCheck = () => {
      AppLogger.logMemoryUsage();
      Alert.alert('Memory Check', 'Check console for memory usage');
    };

    const menuItems = [
      { title: 'Log Screen View', onPress: handleLogScreenView },
      { title: 'Test Crash Report', onPress: handleTestCrash },
      { title: 'Clear Network Logs', onPress: handleClearNetworkLogs },
      { title: 'Export App State', onPress: handleExportState },
      { title: 'Check Memory Usage', onPress: handleMemoryCheck },
    ];

    return (
      <>
        {/* Floating debug button */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.floatingButtonText}>🐛</Text>
        </TouchableOpacity>

        {/* Debug menu modal */}
        <Modal
          visible={visible}
          transparent
          animationType='slide'
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Dev Menu - {screenName}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setVisible(false)}
                >
                  <Text
                    style={[
                      styles.closeButtonText,
                      { color: theme.colors.text },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.colors.border },
                    ]}
                    onPress={() => {
                      item.onPress();
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        { color: theme.colors.text },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Text
                  style={[
                    styles.footerText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Development Mode Only
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingButton: {
    alignItems: 'center',
    borderRadius: 25,
    bottom: 20,
    elevation: 5,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: 50,
    zIndex: 1000,
  },

  floatingButtonText: {
    fontSize: 20,
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  menuItem: {
    borderBottomWidth: 1,
    padding: 16,
  },

  menuItemText: {
    fontSize: 16,
  },
  menuItems: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalFooter: {
    alignItems: 'center',
    padding: 16,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

