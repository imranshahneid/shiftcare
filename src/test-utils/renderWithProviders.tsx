import { ReactElement, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react-native';

const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false },
    },
  });

type Options = Omit<RenderOptions, 'wrapper'> & {
  client?: QueryClient;
  withNavigationContainer?: boolean;
};

export const renderWithProviders = (ui: ReactElement, options: Options = {}) => {
  const client = options.client ?? makeQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      {options.withNavigationContainer ? <NavigationContainer>{children}</NavigationContainer> : children}
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
};
