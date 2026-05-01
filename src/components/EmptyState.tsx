import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/theme';

type Props = { title: string; message?: string };

export const EmptyState = ({ title, message }: Props) => (
  <View style={styles.container} testID="empty-state">
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
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
  },
});
