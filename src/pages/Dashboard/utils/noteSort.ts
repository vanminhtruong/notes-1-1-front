export type NoteSortKey =
  | 'createdNewest' | 'createdOldest'
  | 'updatedNewest' | 'updatedOldest'
  | 'titleAZ' | 'titleZA'
  | 'priorityHigh' | 'priorityLow';

export const DEFAULT_NOTE_SORT: NoteSortKey = 'createdNewest';

export const NOTE_SORT_OPTIONS: readonly NoteSortKey[] = [
  'createdNewest', 'createdOldest', 'updatedNewest', 'updatedOldest',
  'titleAZ', 'titleZA', 'priorityHigh', 'priorityLow',
];

type SortField = 'createdAt' | 'updatedAt' | 'title' | 'priority';
type SortDirection = 'ASC' | 'DESC';

export const NOTE_SORT_QUERIES: Record<NoteSortKey, { sortBy: SortField; sortOrder: SortDirection }> = {
  createdNewest: { sortBy: 'createdAt', sortOrder: 'DESC' },
  createdOldest: { sortBy: 'createdAt', sortOrder: 'ASC' },
  updatedNewest: { sortBy: 'updatedAt', sortOrder: 'DESC' },
  updatedOldest: { sortBy: 'updatedAt', sortOrder: 'ASC' },
  titleAZ: { sortBy: 'title', sortOrder: 'ASC' },
  titleZA: { sortBy: 'title', sortOrder: 'DESC' },
  priorityHigh: { sortBy: 'priority', sortOrder: 'DESC' },
  priorityLow: { sortBy: 'priority', sortOrder: 'ASC' },
};
