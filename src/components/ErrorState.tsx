import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@/theme';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }: Props) => (
  <View style={styles.container} testID="error-state">
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? (
      <TouchableOpacity
        style={styles.button}
        accessibilityRole="button"
        onPress={onRetry}
        testID="error-retry"
      >
        <Text style={styles.buttonLabel}>Try again</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.font.title,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.font.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: theme.font.body,
    fontWeight: '600',
  },
});
