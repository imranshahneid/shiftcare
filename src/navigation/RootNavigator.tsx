import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { DoctorsListScreen } from '@/screens/DoctorsListScreen';
import { DoctorAvailabilityScreen } from '@/screens/DoctorAvailabilityScreen';
import { BookingConfirmationScreen } from '@/screens/BookingConfirmationScreen';
import { MyBookingsScreen } from '@/screens/MyBookingsScreen';
import { RootStackParamList } from './types';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="DoctorsList"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen
        name="DoctorsList"
        component={DoctorsListScreen}
        options={({ navigation }) => ({
          title: 'Doctors',
          headerRight: () => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="My bookings"
              onPress={() => navigation.navigate('MyBookings')}
              testID="header-my-bookings"
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>My bookings</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="DoctorAvailability"
        component={DoctorAvailabilityScreen}
        options={({ route }) => ({ title: route.params.doctor.name })}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Confirm booking', presentation: 'modal' }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My bookings' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
