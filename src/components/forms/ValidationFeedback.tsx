import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ValidationRule {
  label: string;
  isValid: boolean;
  required?: boolean;
}

interface ValidationFeedbackProps {
  rules: ValidationRule[];
  visible?: boolean;
  title?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  rules,
  visible = true,
  title = 'Password Requirements',
}) => {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}

      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleContainer}>
          <Ionicons
            name={rule.isValid ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={rule.isValid ? theme.colors.success : theme.colors.error}
            style={styles.icon}
          />
          <Text
            style={[
              styles.ruleText,
              {
                color: rule.isValid
                  ? theme.colors.success
                  : theme.colors.textSecondary,
              },
            ]}
          >
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Helper function to generate password validation rules
export const getPasswordValidationRules = (
  password: string
): ValidationRule[] => [
  {
    label: 'At least 8 characters',
    isValid: password.length >= 8,
    required: true,
  },
  {
    label: 'Contains uppercase letter',
    isValid: /[A-Z]/.test(password),
    required: true,
  },
  {
    label: 'Contains lowercase letter',
    isValid: /[a-z]/.test(password),
    required: true,
  },
  {
    label: 'Contains number',
    isValid: /\d/.test(password),
    required: true,
  },
  {
    label: 'Contains special character',
    isValid: /[@$!%*?&]/.test(password),
    required: false,
  },
];

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 12,
    flex: 1,
  },
});
