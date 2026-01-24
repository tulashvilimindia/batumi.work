// Search Components barrel export
// Search-related components are now part of job components
// Re-export from job for convenience

export {
  SearchBar,
  CategoryFilter,
  RegionFilter,
  SalaryToggle,
  FilterBar,
} from '@/components/job';

export type {
  SearchBarProps,
  CategoryFilterProps,
  RegionFilterProps,
  SalaryToggleProps,
  FilterBarProps,
} from '@/components/job';
