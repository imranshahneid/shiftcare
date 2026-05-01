import { useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { Booking } from '@/domain/types';
import { useBookingsStore } from '@/store/bookingsStore';
import { theme } from '@/theme';

const formatDate = (date: string, dayOfWeek: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return `${dayOfWeek}, ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
};

const BookingRow = ({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) => (
  <View style={styles.row} testID={`booking-${booking.id}`}>
    <View style={styles.rowMain}>
      <Text style={styles.doctor}>{booking.doctorName}</Text>
      <Text style={styles.detail}>{formatDate(booking.date, booking.dayOfWeek)}</Text>
      <Text style={styles.detail}>{booking.label}</Text>
      <Text style={styles.tz}>{booking.timezone}</Text>
    </View>
    <TouchableOpacity
      style={styles.cancel}
      accessibilityRole="button"
      accessibilityLabel={`Cancel booking with ${booking.doctorName} on ${booking.date} at ${booking.label}`}
      testID={`cancel-${booking.id}`}
      onPress={() => onCancel(booking.id)}
    >
      <Text style={styles.cancelLabel}>Cancel</Text>
    </TouchableOpacity>
  </View>
);

export const MyBookingsScreen = () => {
  const rawBookings = useBookingsStore((s) => s.bookings);
  const cancelBooking = useBookingsStore((s) => s.cancelBooking);
  const bookings = useMemo(
    () => [...rawBookings].sort((a, b) => a.startISO.localeCompare(b.startISO)),
    [rawBookings],
  );

  const confirmCancel = (id: string) => {
    Alert.alert('Cancel booking?', 'This will free up the time slot.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => cancelBooking(id) },
    ]);
  };

  if (bookings.length === 0) {
    return (
      <EmptyState title="No bookings yet" message="Book a doctor from the home screen to see them here." />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={bookings}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => <BookingRow booking={item} onCancel={confirmCancel} />}
        testID="bookings-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  rowMain: { flex: 1 },
  doctor: {
    fontSize: theme.font.title,
    fontWeight: '600',
    color: theme.colors.text,
  },
  detail: {
    fontSize: theme.font.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  tz: {
    fontSize: theme.font.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  cancel: {
    backgroundColor: theme.colors.dangerMuted,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginLeft: theme.spacing.md,
  },
  cancelLabel: {
    color: theme.colors.danger,
    fontSize: theme.font.body,
    fontWeight: '600',
  },
});
