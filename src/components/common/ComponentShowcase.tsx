import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/hooks';
import { Theme } from '@/types';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Loading,
  Screen,
  Container,
} from './index';

/**
 * Component showcase demonstrating the usage of all core UI components
 * This can be used for testing and as a reference for developers
 */
export const ComponentShowcase: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleButtonPress = () => {
    Alert.alert('Button Pressed', 'This is a demo button press');
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Screen scrollable padding='md'>
      <Container>
        <Text style={styles.title}>Component Showcase</Text>
        <Text style={styles.subtitle}>
          Demonstration of all core UI components
        </Text>

        {/* Button Examples */}
        <Card style={styles.section}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Buttons</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.buttonRow}>
              <Button
                title='Primary'
                variant='primary'
                onPress={handleButtonPress}
                style={styles.button}
              />
              <Button
                title='Secondary'
                variant='secondary'
                onPress={handleButtonPress}
                style={styles.button}
              />
            </View>
            <View style={styles.buttonRow}>
              <Button
                title='Outline'
                variant='outline'
                onPress={handleButtonPress}
                style={styles.button}
              />
              <Button
                title='Ghost'
                variant='ghost'
                onPress={handleButtonPress}
                style={styles.button}
              />
            </View>
            <Button
              title='Full Width Button'
              fullWidth
              onPress={handleButtonPress}
              style={styles.fullWidthButton}
            />
            <Button
              title='Loading Button'
              loading={loading}
              onPress={handleLoadingDemo}
              style={styles.fullWidthButton}
            />
          </CardContent>
        </Card>

        {/* Input Examples */}
        <Card style={styles.section}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Inputs</Text>
          </CardHeader>
          <CardContent>
            <Input
              label='Basic Input'
              placeholder='Enter some text'
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Input
              label='Required Input'
              placeholder='This field is required'
              required
              error={!inputValue ? 'This field is required' : undefined}
            />
            <Input
              label='Input with Helper Text'
              placeholder='Enter your email'
              helperText="We'll never share your email"
            />
            <Input
              label='Disabled Input'
              placeholder='This input is disabled'
              disabled
              value='Disabled value'
            />
          </CardContent>
        </Card>

        {/* Card Examples */}
        <Card style={styles.section}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Cards</Text>
          </CardHeader>
          <CardContent>
            <Card variant='elevated' style={styles.exampleCard}>
              <Text style={styles.cardText}>Elevated Card</Text>
            </Card>

            <Card variant='outlined' style={styles.exampleCard}>
              <Text style={styles.cardText}>Outlined Card</Text>
            </Card>

            <Card variant='filled' style={styles.exampleCard}>
              <Text style={styles.cardText}>Filled Card</Text>
            </Card>

            <Card
              variant='elevated'
              onPress={() => Alert.alert('Card Pressed')}
              style={styles.exampleCard}
            >
              <CardHeader>
                <Text style={styles.cardTitle}>Touchable Card</Text>
              </CardHeader>
              <CardContent>
                <Text style={styles.cardText}>
                  This card is touchable. Tap it to see the action.
                </Text>
              </CardContent>
              <CardFooter>
                <Text style={styles.cardFooterText}>Tap me!</Text>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        {/* Loading Examples */}
        <Card style={styles.section}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Loading States</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.loadingRow}>
              <Loading size='small' text='Small' />
              <Loading size='large' text='Large' />
            </View>

            <View style={styles.loadingExample}>
              <Text style={styles.loadingLabel}>Inline Loading:</Text>
              <Loading size='small' />
            </View>

            <Button
              title='Show Loading Overlay'
              onPress={handleLoadingDemo}
              style={styles.fullWidthButton}
            />
          </CardContent>
        </Card>

        {/* Responsive Design Info */}
        <Card style={styles.section}>
          <CardHeader>
            <Text style={styles.sectionTitle}>Responsive Design</Text>
          </CardHeader>
          <CardContent>
            <Text style={styles.infoText}>
              All components are built with responsive design in mind and
              automatically adapt to different screen sizes and orientations.
            </Text>
            <Text style={styles.infoText}>
              Components support theme switching and accessibility features out
              of the box.
            </Text>
          </CardContent>
        </Card>
      </Container>
    </Screen>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: theme.typography.fontSizes.xxxl,
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },

    subtitle: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },

    section: {
      marginBottom: theme.spacing.lg,
    },

    sectionTitle: {
      fontSize: theme.typography.fontSizes.xl,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text,
    },

    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },

    button: {
      flex: 1,
    },

    fullWidthButton: {
      marginTop: theme.spacing.sm,
    },

    exampleCard: {
      marginBottom: theme.spacing.md,
    },

    cardText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text,
    },

    cardTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text,
    },

    cardFooterText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },

    loadingRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.md,
    },

    loadingExample: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },

    loadingLabel: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.text,
    },

    infoText: {
      fontSize: theme.typography.fontSizes.md,
      color: theme.colors.textSecondary,
      lineHeight:
        theme.typography.lineHeights.relaxed * theme.typography.fontSizes.md,
      marginBottom: theme.spacing.sm,
    },
  });
