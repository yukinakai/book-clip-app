export const useQuery = jest.fn();
export const useMutation = jest.fn(() => ({
  mutate: jest.fn(),
  isLoading: false,
  isError: false,
  error: null,
}));
export const useQueryClient = jest.fn(() => ({
  invalidateQueries: jest.fn(),
}));
export const QueryClient = jest.fn();
export const QueryClientProvider = jest.fn();
