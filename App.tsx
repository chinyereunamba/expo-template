import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ReduxProvider } from '@/components/common/ReduxProvider';
import { AppNavigator } from '@/navigation/AppNavigator';


export default function App() {
  return (
    <ReduxProvider>
      <AppNavigator />
      <StatusBar style='auto' />
    </ReduxProvider>
  );
}
