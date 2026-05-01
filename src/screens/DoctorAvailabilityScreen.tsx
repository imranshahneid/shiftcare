import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { SlotChip } from '@/components/SlotChip';
import { generateSlotsForDoctor, groupSlotsByDate } from '@/domain/slots';
import { Slot, bookingKey } from '@/domain/types';
import { RootStackParamList } from '@/navigation/types';
import { useBookingsStore } from '@/store/bookingsStore';
import { theme } from '@/theme';

type Route = RouteProp<RootStackParamList, 'DoctorAvailability'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DoctorAvailability'>;

const formatSectionHeader = (date: string, dayOfWeek: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return `${dayOfWeek}, ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`;
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const DoctorAvailabilityScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { doctor } = route.params;

  const rawBookings = useBookingsStore((s) => s.bookings);
  const bookedKeys = useMemo(() => {
    const set = new Set<string>();
    for (const b of rawBookings) set.add(bookingKey(b.doctorId, b.startISO));
    return set;
  }, [rawBookings]);

  const sections = useMemo(() => {
    const slots = generateSlotsForDoctor(doctor);
    const grouped = groupSlotsByDate(slots);
    return grouped.map((g) => ({
      title: formatSectionHeader(g.date, g.dayOfWeek),
      date: g.date,
      data: chunk(g.slots, 2),
    }));
  }, [doctor]);

  if (sections.length === 0) {
    return (
      <EmptyState
        title="No availability this week"
        message={`${doctor.name} has no slots available in the next 7 days.`}
      />
    );
  }

  const handleSlotPress = (slot: Slot) => {
    navigation.navigate('BookingConfirmation', { doctor, slot });
  };

  return (
    <View style={styles.container}>
      <View style={styles.tzNotice} testID="tz-notice">
        <Text style={styles.tzNoticeText}>Times shown in the doctor&apos;s timezone: {doctor.timezone}</Text>
      </View>
      <SectionList
        sections={sections}
        contentContainerStyle={styles.list}
        keyExtractor={(row, index) => `${row[0]?.startISO ?? ''}-${index}`}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader} testID={`section-${section.date}`}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((slot) => (
              <SlotChip
                key={slot.startISO}
                slot={slot}
                booked={bookedKeys.has(bookingKey(slot.doctorId, slot.startISO))}
                onPress={handleSlotPress}
              />
            ))}
          </View>
        )}
        stickySectionHeadersEnabled
        testID="availability-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
  tzNotice: {
    backgroundColor: theme.colors.primaryMuted,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  tzNoticeText: {
    fontSize: theme.font.small,
    color: theme.colors.primary,
  },
  sectionHeader: {
    fontSize: theme.font.sectionTitle,
    fontWeight: '700',
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
