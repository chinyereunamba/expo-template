import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface FormValidationStatusProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  showDetailedStatus?: boolean;
  showFieldCount?: boolean;
  showNetworkStatus?: boolean;
  onValidateAll?: () => void;
  onClearErrors?: () => void;
  isOnline?: boolean;
  canSubmit?: boolean;
}

export function FormValidationStatus<T extends FieldValues>({
  form,
  showDetailedStatus = true,
  showFieldCount = true,
  showNetworkStatus = true,
  onValidateAll,
  onClearErrors,
  isOnline = true,
  canSubmit = true,
}: FormValidationStatusProps<T>) {
  const { theme } = useTheme();

  const {
    formState: {
      isValid,
      isDirty,
      isSubmitting,
      errors,
      touchedFields,
      dirtyFields,
    },
  } = form;

  const errorCount = Object.keys(errors).length;
  const touchedCount = Object.keys(touchedFields).length;
  const dirtyCount = Object.keys(dirtyFields).length;
  const totalFields = Object.keys(form.getValues()).length;

  const getValidationIcon = () => {
    if (isSubmitting) return 'hourglass-outline';
    if (errorCount > 0) return 'alert-circle-outline';
    if (isValid && isDirty) return 'checkmark-circle-outline';
    return 'help-circle-outline';
  };

  const getValidationColor = () => {
    if (isSubmitting) return theme.colors.primary;
    if (errorCount > 0) return theme.colors.error;
    if (isValid && isDirty) return theme.colors.success;
    return theme.colors.textSecondary;
  };

  const getValidationText = () => {
    if (isSubmitting) return 'Validating...';
    if (errorCount > 0)
      return `${errorCount} error${errorCount > 1 ? 's' : ''}`;
    if (isValid && isDirty) return 'Form is valid';
    if (!isDirty) return 'No changes made';
    return 'Ready to validate';
  };

  const getNetworkStatusIcon = () => {
    return isOnline ? 'wifi' : 'wifi-outline';
  };

  const getNetworkStatusColor = () => {
    return isOnline ? theme.colors.success : theme.colors.error;
  };

  const getSubmitStatusIcon = () => {
    if (!isOnline) return 'cloud-offline-outline';
    if (!isValid) return 'close-circle-outline';
    if (canSubmit) return 'checkmark-circle-outline';
    return 'pause-circle-outline';
  };

  const getSubmitStatusColor = () => {
    if (!isOnline || !isValid) return theme.colors.error;
    if (canSubmit) return theme.colors.success;
    return theme.colors.warning || '#FFA500';
  };

  const getSubmitStatusText = () => {
    if (!isOnline) return 'Offline - will queue';
    if (!isValid) return 'Cannot submit';
    if (canSubmit) return 'Ready to submit';
    return 'Preparing...';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Main Status Row */}
      <View style={styles.mainStatus}>
        <View style={styles.statusItem}>
          <Ionicons
            name={getValidationIcon()}
            size={20}
            color={getValidationColor()}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, { color: getValidationColor() }]}>
            {getValidationText()}
          </Text>
        </View>

        {showNetworkStatus && (
          <View style={styles.statusItem}>
            <Ionicons
              name={getNetworkStatusIcon()}
              size={16}
              color={getNetworkStatusColor()}
              style={styles.statusIcon}
            />
            <Text
              style={[styles.statusSubtext, { color: getNetworkStatusColor() }]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        )}
      </View>

      {/* Detailed Status */}
      {showDetailedStatus && (
        <View style={styles.detailedStatus}>
          {showFieldCount && (
            <View style={styles.fieldCounts}>
              <View style={styles.countItem}>
                <Text
                  style={[
                    styles.countLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Fields:
                </Text>
                <Text style={[styles.countValue, { color: theme.colors.text }]}>
                  {totalFields}
                </Text>
              </View>

              <View style={styles.countItem}>
                <Text
                  style={[
                    styles.countLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Touched:
                </Text>
                <Text style={[styles.countValue, { color: theme.colors.text }]}>
                  {touchedCount}
                </Text>
              </View>

              <View style={styles.countItem}>
                <Text
                  style={[
                    styles.countLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Modified:
                </Text>
                <Text style={[styles.countValue, { color: theme.colors.text }]}>
                  {dirtyCount}
                </Text>
              </View>

              <View style={styles.countItem}>
                <Text
                  style={[
                    styles.countLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Errors:
                </Text>
                <Text
                  style={[
                    styles.countValue,
                    {
                      color:
                        errorCount > 0 ? theme.colors.error : theme.colors.text,
                    },
                  ]}
                >
                  {errorCount}
                </Text>
              </View>
            </View>
          )}

          {/* Submit Status */}
          <View style={styles.submitStatus}>
            <Ionicons
              name={getSubmitStatusIcon()}
              size={16}
              color={getSubmitStatusColor()}
              style={styles.statusIcon}
            />
            <Text
              style={[styles.statusSubtext, { color: getSubmitStatusColor() }]}
            >
              {getSubmitStatusText()}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {onValidateAll && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={onValidateAll}
            disabled={isSubmitting}
          >
            <Ionicons
              name='checkmark-done-outline'
              size={14}
              color={theme.colors.primary}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              Validate All
            </Text>
          </TouchableOpacity>
        )}

        {onClearErrors && errorCount > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={onClearErrors}
            disabled={isSubmitting}
          >
            <Ionicons
              name='close-outline'
              size={14}
              color={theme.colors.error}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>
              Clear Errors
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error List (if any) */}
      {errorCount > 0 && showDetailedStatus && (
        <View style={styles.errorList}>
          <Text style={[styles.errorListTitle, { color: theme.colors.error }]}>
            Validation Errors:
          </Text>
          {Object.entries(errors).map(([fieldName, error]) => (
            <View key={fieldName} style={styles.errorItem}>
              <Ionicons
                name='alert-circle-outline'
                size={12}
                color={theme.colors.error}
                style={styles.errorIcon}
              />
              <Text
                style={[
                  styles.errorField,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {fieldName}:
              </Text>
              <Text
                style={[styles.errorMessage, { color: theme.colors.error }]}
              >
                {String(error?.message || 'Invalid value')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  container: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    padding: 12,
  },
  countItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  countLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  countValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailedStatus: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  errorField: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
    minWidth: 60,
  },
  errorIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  errorItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 4,
  },
  errorList: {
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  errorListTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  errorMessage: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
  },
  fieldCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
