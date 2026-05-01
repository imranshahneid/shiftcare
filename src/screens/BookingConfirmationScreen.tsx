import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useBookingsStore } from '@/store/bookingsStore';
import { theme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Route = RouteProp<RootStackParamList, 'BookingConfirmation'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'BookingConfirmation'>;

const formatDate = (date: string, dayOfWeek: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return `${dayOfWeek}, ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
};

export const BookingConfirmationScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { doctor, slot } = route.params;
  const addBooking = useBookingsStore((s) => s.addBooking);
  const isSlotBooked = useBookingsStore((s) => s.isSlotBooked);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets()

  const alreadyBooked = isSlotBooked(slot.doctorId, slot.startISO);

  const handleConfirm = () => {
    if (alreadyBooked) {
      Alert.alert('Slot unavailable', 'This slot has just been booked.');
      return;
    }
    setSubmitting(true);
    const result = addBooking(slot);
    setSubmitting(false);
    if (!result) {
      Alert.alert('Already booked', 'You already have a booking for this slot.');
      return;
    }
    navigation.reset({
      index: 1,
      routes: [{ name: 'DoctorsList' }, { name: 'MyBookings' }],
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + theme.spacing.lg }]} >
      <View style={styles.card} testID="confirmation-card">
        <Text style={styles.label}>Doctor</Text>
        <Text style={styles.value}>{doctor.name}</Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{formatDate(slot.date, slot.dayOfWeek)}</Text>

        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{slot.label}</Text>

        <Text style={styles.label}>Timezone</Text>
        <Text style={styles.value}>{slot.timezone}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancel]}
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          testID="cancel-button"
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirm, (submitting || alreadyBooked) && styles.confirmDisabled]}
          accessibilityRole="button"
          onPress={handleConfirm}
          disabled={submitting || alreadyBooked}
          testID="confirm-button"
        >
          <Text style={styles.confirmLabel}>{alreadyBooked ? 'Already booked' : 'Confirm booking'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: theme.font.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  value: {
    fontSize: theme.font.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  cancel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelLabel: {
    fontSize: theme.font.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  confirm: {
    backgroundColor: theme.colors.primary,
  },
  confirmDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  confirmLabel: {
    fontSize: theme.font.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
