import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Slot } from '@/domain/types';
import { theme } from '@/theme';

type Props = {
  slot: Slot;
  booked: boolean;
  onPress: (slot: Slot) => void;
};

export const SlotChip = ({ slot, booked, onPress }: Props) => (
  <TouchableOpacity
    style={[styles.chip, booked && styles.chipDisabled]}
    accessibilityRole="button"
    accessibilityState={{ disabled: booked }}
    accessibilityLabel={`${slot.label}${booked ? ', booked' : ', available'}`}
    disabled={booked}
    onPress={() => onPress(slot)}
    testID={`slot-${slot.startISO}`}
  >
    <Text style={[styles.label, booked && styles.labelDisabled]}>{slot.label}</Text>
    {booked ? <Text style={styles.bookedTag}>Booked</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 140,
  },
  chipDisabled: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.disabled,
  },
  label: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: theme.font.body,
  },
  labelDisabled: {
    color: theme.colors.disabledText,
    textDecorationLine: 'line-through',
  },
  bookedTag: {
    fontSize: theme.font.small,
    color: theme.colors.disabledText,
    marginTop: theme.spacing.xs,
  },
});
