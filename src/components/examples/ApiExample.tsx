import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLogin, useProfile, useUpdateProfile } from '../../services/authApi';
import { useAuthStore } from '../../store';
import { useNetworkStore } from '../../store';

// Example component demonstrating API integration
export const ApiExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Auth state and actions
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { clearError } = useAuthActions();

  // Network state
  const { isOnline, isOffline, type } = useNetwork();

  // API hooks
  const loginMutation = useLogin();
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    loginMutation.mutate({
      email,
      password,
    });
  };

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    updateProfileMutation.mutate({
      name: name.trim(),
    });
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Integration Example</Text>

      {/* Network Status */}
      <View style={styles.networkStatus}>
        <Text style={styles.networkText}>
          Network: {isOnline ? '🟢 Online' : '🔴 Offline'} ({type})
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={handleClearError}
            style={styles.clearErrorButton}
          >
            <Text style={styles.clearErrorText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isAuthenticated ? (
        // Login Form
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder='Email'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
          />

          <TextInput
            style={styles.input}
            placeholder='Password'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || isOffline) && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading || isOffline}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // User Profile
        <View style={styles.profile}>
          <Text style={styles.sectionTitle}>Profile</Text>

          {profileQuery.isLoading && (
            <Text style={styles.loadingText}>Loading profile...</Text>
          )}

          {profileQuery.error && (
            <Text style={styles.errorText}>
              Failed to load profile: {profileQuery.error.message}
            </Text>
          )}

          {profileQuery.data && (
            <View style={styles.userInfo}>
              <Text style={styles.userText}>
                Name: {profileQuery.data.data.name}
              </Text>
              <Text style={styles.userText}>
                Email: {profileQuery.data.data.email}
              </Text>
              <Text style={styles.userText}>
                Verified: {profileQuery.data.data.isEmailVerified ? '✅' : '❌'}
              </Text>
            </View>
          )}

          {/* Update Profile Form */}
          <View style={styles.updateForm}>
            <Text style={styles.sectionTitle}>Update Name</Text>

            <TextInput
              style={styles.input}
              placeholder='New name'
              value={name}
              onChangeText={setName}
            />

            <TouchableOpacity
              style={[
                styles.button,
                (updateProfileMutation.isPending || isOffline) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleUpdateProfile}
              disabled={updateProfileMutation.isPending || isOffline}
            >
              <Text style={styles.buttonText}>
                {updateProfileMutation.isPending
                  ? 'Updating...'
                  : 'Update Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* API Status */}
      <View style={styles.apiStatus}>
        <Text style={styles.statusTitle}>API Status</Text>
        <Text style={styles.statusText}>
          Login: {loginMutation.isPending ? 'Loading...' : 'Ready'}
        </Text>
        <Text style={styles.statusText}>
          Profile: {profileQuery.isFetching ? 'Fetching...' : 'Ready'}
        </Text>
        <Text style={styles.statusText}>
          Update: {updateProfileMutation.isPending ? 'Updating...' : 'Ready'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  apiStatus: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearErrorButton: {
    backgroundColor: '#c62828',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearErrorText: {
    color: 'white',
    fontSize: 12,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
  },
  input: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 15,
    padding: 12,
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  networkStatus: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
  },
  networkText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  profile: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  statusText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  updateForm: {
    borderTopColor: '#eee',
    borderTopWidth: 1,
    paddingTop: 20,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
    padding: 15,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default ApiExample;
