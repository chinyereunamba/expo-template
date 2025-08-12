import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Screen } from '@/components/common';
import { APP_CONFIG } from '@/config/environment';
import { useNetworkMonitor } from '@/utils/networkMonitor';
import { useStateInspector } from '@/utils/zustandDevtools';
import { useCrashReporter } from '@/utils/crashReporter';
import { AppLogger } from '@/utils/logger';

// Only show debug screen in development
if (!APP_CONFIG.DEBUG) {
  throw new Error('Debug screen should only be accessible in development mode');
}

interface DebugSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

const DebugSection: React.FC<DebugSectionProps> = ({
  title,
  children,
  collapsible = true,
}) => {
  const [collapsed, setCollapsed] = useState(collapsible);
  const { theme } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => collapsible && setCollapsed(!collapsed)}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {collapsible && (
          <Text style={[styles.collapseIcon, { color: theme.colors.text }]}>
            {collapsed ? '▶' : '▼'}
          </Text>
        )}
      </TouchableOpacity>
      {!collapsed && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

interface InfoRowProps {
  label: string;
  value: string | number;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
        {label}:
      </Text>
      <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
        {value}
      </Text>
    </View>
  );
};

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'secondary',
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.colors.primary };
      case 'danger':
        return { backgroundColor: theme.colors.error };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return { color: '#FFFFFF' };
      default:
        return { color: theme.colors.primary };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.actionButton, getButtonStyle()]}
      onPress={onPress}
    >
      <Text style={[styles.actionButtonText, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const DebugScreen: React.FC = () => {
  const { theme } = useTheme();
  const networkMonitor = useNetworkMonitor();
  const stateInspector = useStateInspector();
  const crashReporter = useCrashReporter();

  const handleExportLogs = async () => {
    try {
      const debugData = {
        timestamp: new Date().toISOString(),
        appInfo: {
          version: APP_CONFIG.VERSION,
          environment: APP_CONFIG.ENVIRONMENT,
          debug: APP_CONFIG.DEBUG,
        },
        networkStats: networkMonitor.stats,
        networkRequests: networkMonitor.requests.slice(0, 10), // Last 10 requests
        stateSnapshot: stateInspector.states,
        crashReports: crashReporter.crashes.slice(0, 5), // Last 5 crashes
      };

      const debugJson = JSON.stringify(debugData, null, 2);

      await Share.share({
        message: debugJson,
        title: 'Debug Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export debug data');
      AppLogger.setContext('DebugScreen').error(
        'Failed to export debug data',
        error
      );
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Debug Data',
      'This will clear all network logs, crash reports, and reset stores. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            networkMonitor.clear();
            crashReporter.clearCrashes();
            stateInspector.resetAllStores();
            Alert.alert('Success', 'All debug data cleared');
          },
        },
      ]
    );
  };

  const handleTestCrash = () => {
    Alert.alert(
      'Test Crash Reporting',
      'This will generate a test crash report. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: () => {
            crashReporter.testCrash();
            Alert.alert('Success', 'Test crash report generated');
          },
        },
      ]
    );
  };

  const handleMemoryCheck = () => {
    AppLogger.logMemoryUsage();
    Alert.alert('Memory Usage', 'Check console for memory usage details');
  };

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Debug Tools
        </Text>

        {/* App Information */}
        <DebugSection title='App Information' collapsible={false}>
          <InfoRow label='Version' value={APP_CONFIG.VERSION} />
          <InfoRow label='Environment' value={APP_CONFIG.ENVIRONMENT} />
          <InfoRow
            label='Debug Mode'
            value={APP_CONFIG.DEBUG ? 'Enabled' : 'Disabled'}
          />
          <InfoRow label='API URL' value='Not configured' />
        </DebugSection>

        {/* Network Monitoring */}
        <DebugSection title='Network Monitoring'>
          <InfoRow label='Total Requests' value={networkMonitor.stats.total} />
          <InfoRow label='Successful' value={networkMonitor.stats.successful} />
          <InfoRow label='Failed' value={networkMonitor.stats.failed} />
          <InfoRow
            label='Avg Response Time'
            value={`${networkMonitor.stats.averageResponseTime}ms`}
          />
          <InfoRow
            label='Slow Requests'
            value={networkMonitor.stats.slowRequests}
          />

          <View style={styles.buttonRow}>
            <ActionButton
              title='Clear Network Logs'
              onPress={networkMonitor.clear}
            />
          </View>

          {networkMonitor.failedRequests.length > 0 && (
            <View style={styles.failedRequests}>
              <Text style={[styles.subTitle, { color: theme.colors.error }]}>
                Recent Failed Requests:
              </Text>
              {networkMonitor.failedRequests.slice(0, 3).map(request => (
                <Text
                  key={request.id}
                  style={[styles.failedRequest, { color: theme.colors.text }]}
                >
                  {request.method} {request.url} - {request.status}
                </Text>
              ))}
            </View>
          )}
        </DebugSection>

        {/* State Management */}
        <DebugSection title='State Management'>
          {Object.entries(stateInspector.stats).map(([storeName, stats]) => (
            <View key={storeName} style={styles.storeInfo}>
              <Text style={[styles.storeName, { color: theme.colors.primary }]}>
                {storeName}
              </Text>
              <InfoRow label='Keys' value={(stats as any).keys} />
              <InfoRow label='Size' value={`${(stats as any).size} bytes`} />
              <InfoRow
                label='Has Subscribers'
                value={(stats as any).hasSubscribers ? 'Yes' : 'No'}
              />
            </View>
          ))}

          <View style={styles.buttonRow}>
            <ActionButton
              title='Export State'
              onPress={() => {
                const stateJson = stateInspector.exportState();
                Share.share({ message: stateJson, title: 'App State Export' });
              }}
            />
            <ActionButton
              title='Reset Stores'
              onPress={() => {
                Alert.alert(
                  'Reset All Stores',
                  'This will reset all stores to their initial state. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reset',
                      style: 'destructive',
                      onPress: stateInspector.resetAllStores,
                    },
                  ]
                );
              }}
              variant='danger'
            />
          </View>
        </DebugSection>

        {/* Crash Reporting */}
        <DebugSection title='Crash Reporting'>
          <InfoRow label='Total Crashes' value={crashReporter.stats.total} />
          <InfoRow label='Recent (24h)' value={crashReporter.stats.recent} />

          {crashReporter.stats.mostCommon.length > 0 && (
            <View style={styles.crashInfo}>
              <Text style={[styles.subTitle, { color: theme.colors.text }]}>
                Most Common Errors:
              </Text>
              {crashReporter.stats.mostCommon
                .slice(0, 3)
                .map((error: string, index: number) => (
                  <Text
                    key={index}
                    style={[styles.crashError, { color: theme.colors.text }]}
                  >
                    • {error}
                  </Text>
                ))}
            </View>
          )}

          <View style={styles.buttonRow}>
            <ActionButton
              title='Test Crash'
              onPress={handleTestCrash}
              variant='danger'
            />
            <ActionButton
              title='Export Crashes'
              onPress={() => {
                const crashesJson = crashReporter.exportCrashes();
                Share.share({
                  message: crashesJson,
                  title: 'Crash Reports Export',
                });
              }}
            />
            <ActionButton
              title='Clear Crashes'
              onPress={crashReporter.clearCrashes}
            />
          </View>
        </DebugSection>

        {/* Performance Tools */}
        <DebugSection title='Performance Tools'>
          <View style={styles.buttonRow}>
            <ActionButton title='Check Memory' onPress={handleMemoryCheck} />
            <ActionButton
              title='Force GC'
              onPress={() => {
                if (global.gc) {
                  global.gc();
                  Alert.alert('Success', 'Garbage collection triggered');
                } else {
                  Alert.alert(
                    'Not Available',
                    'Garbage collection not available'
                  );
                }
              }}
            />
          </View>
        </DebugSection>

        {/* Actions */}
        <DebugSection title='Actions' collapsible={false}>
          <View style={styles.buttonRow}>
            <ActionButton
              title='Export All Data'
              onPress={handleExportLogs}
              variant='primary'
            />
            <ActionButton
              title='Clear All Data'
              onPress={handleClearAllData}
              variant='danger'
            />
          </View>
        </DebugSection>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 6,
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  collapseIcon: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  crashError: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  crashInfo: {
    marginTop: 12,
  },
  failedRequest: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  failedRequests: {
    marginTop: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  section: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionContent: {
    padding: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  storeInfo: {
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
