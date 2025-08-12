import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProfileTabNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores';
import { useLogout } from '../../services/authApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Screen } from '../../components/common/Screen';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileTabNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleUserSettings = () => {
    navigation.navigate('UserSettings');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logoutMutation.mutate();
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            >
              <Text
                style={[styles.avatarText, { color: theme.colors.background }]}
              >
                {user?.name ? getInitials(user.name) : 'U'}
              </Text>
            </View>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {user?.name || 'User Name'}
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Account
            </Text>
            <View style={styles.buttonGroup}>
              <Button
                title='Edit Profile'
                onPress={handleEditProfile}
                variant='secondary'
                style={styles.menuButton}
              />
              <Button
                title='User Settings'
                onPress={handleUserSettings}
                variant='secondary'
                style={styles.menuButton}
              />
              <Button
                title='Change Password'
                onPress={handleChangePassword}
                variant='secondary'
                style={styles.menuButton}
              />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Profile Information
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Member since
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Email verified
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: user?.isEmailVerified
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              >
                {user?.isEmailVerified ? 'Yes' : 'No'}
              </Text>
            </View>
          </Card>

          <Card style={styles.card}>
            <Button
              title='Sign Out'
              onPress={handleLogout}
              variant='danger'
              style={styles.logoutButton}
              loading={logoutMutation.isPending}
              disabled={logoutMutation.isPending}
            />
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
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
  logoutButton: {
    marginBottom: 0,
  },
});
