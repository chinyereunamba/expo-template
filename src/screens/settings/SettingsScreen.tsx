import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SettingsTabNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../stores';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsTabNavigationProp>();
  const { theme } = useTheme();
  const { theme: themeMode, appVersion, toggleTheme } = useAppStore();

  const handleAppSettings = () => {
    navigation.navigate('AppSettings');
  };

  const handlePrivacy = () => {
    navigation.navigate('Privacy');
  };

  const handleAbout = () => {
    navigation.navigate('About');
  };

  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Settings
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Manage your app preferences
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Appearance
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text
                  style={[styles.settingLabel, { color: theme.colors.text }]}
                >
                  Theme
                </Text>
                <Text
                  style={[
                    styles.settingValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Current: {themeMode}
                </Text>
              </View>
              <Button
                title='Toggle'
                onPress={handleToggleTheme}
                variant='secondary'
                size='small'
                style={styles.settingButton}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              General
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title='App Settings'
                onPress={handleAppSettings}
                variant='secondary'
                style={styles.menuButton}
              />
              <Button
                title='Privacy & Security'
                onPress={handlePrivacy}
                variant='secondary'
                style={styles.menuButton}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Support
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title='Help & Support'
                onPress={handleHelp}
                variant='secondary'
                style={styles.menuButton}
              />
              <Button
                title='About'
                onPress={handleAbout}
                variant='secondary'
                style={styles.menuButton}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              App Information
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Version
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {appVersion}
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  settingButton: {
    marginLeft: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  menuButton: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});
