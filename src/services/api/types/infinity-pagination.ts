export type InfinityPaginationType<T> = {
  results: T[];
  hasNextPage: boolean;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults?: number;
  data?: T[];
};
