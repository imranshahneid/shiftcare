import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Props = { message?: string };

export const LoadingState = ({ message = 'Loading…' }: Props) => (
  <View style={styles.container} testID="loading-state">
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={styles.message}>{message}</Text>
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
  message: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
  },
});
