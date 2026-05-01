import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Doctor } from '@/domain/types';
import { theme } from '@/theme';

type Props = {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
};

const uniqueDays = (doctor: Doctor): number => {
  const set = new Set(doctor.windows.map((w) => w.dayOfWeek));
  return set.size;
};

export const DoctorCard = ({ doctor, onPress }: Props) => {
  const days = uniqueDays(doctor);
  return (
    <TouchableOpacity
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`View availability for ${doctor.name}`}
      onPress={() => onPress(doctor)}
      testID={`doctor-card-${doctor.id}`}
    >
      <View style={styles.row}>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
      <Text style={styles.timezone}>{doctor.timezone}</Text>
      <Text style={styles.subtle}>
        {days === 1 ? '1 day available this week' : `${days} days available this week`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.font.title,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  chevron: {
    fontSize: theme.font.title,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  timezone: {
    fontSize: theme.font.small,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  subtle: {
    fontSize: theme.font.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
