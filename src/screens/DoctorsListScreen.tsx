import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDoctorsQuery } from '@/api/doctors';
import { DoctorCard } from '@/components/DoctorCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Doctor } from '@/domain/types';
import { RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DoctorsList'>;

export const DoctorsListScreen = () => {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isError, error, refetch, isRefetching } = useDoctorsQuery();

  const handlePress = useCallback(
    (doctor: Doctor) => navigation.navigate('DoctorAvailability', { doctor }),
    [navigation],
  );

  if (isLoading) return <LoadingState message="Fetching doctors…" />;
  if (isError)
    return (
      <ErrorState
        title="Couldn't load doctors"
        message={error?.message ?? 'Please try again.'}
        onRetry={() => {
          void refetch();
        }}
      />
    );

  if (!data || data.length === 0) {
    return <EmptyState title="No doctors available" message="Check back later." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={(doctor) => doctor.id}
        renderItem={({ item }) => <DoctorCard doctor={item} onPress={handlePress} />}
        refreshing={isRefetching}
        onRefresh={() => {
          void refetch();
        }}
        testID="doctors-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.lg },
});
