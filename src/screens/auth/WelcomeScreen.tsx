import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Screen } from '../../components/common/Screen';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { theme } = useTheme();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to Expo Mobile Skeleton
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          A scalable foundation for your mobile app
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title='Login'
          onPress={handleLogin}
          variant='primary'
          style={styles.button}
        />
        <Button
          title='Create Account'
          onPress={handleRegister}
          variant='secondary'
          style={styles.button}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 0,
  },
});
