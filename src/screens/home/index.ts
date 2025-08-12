import { createLazyScreen } from '../../utils/lazyLoading';

// Home screens - lazy loaded for better performance
export const HomeScreen = createLazyScreen(() =>
  import('./HomeScreen').then(m => ({ default: m.HomeScreen }))
);
export const DetailsScreen = createLazyScreen(() =>
  import('./DetailsScreen').then(m => ({ default: m.DetailsScreen }))
);
export const SearchScreen = createLazyScreen(() =>
  import('./SearchScreen').then(m => ({ default: m.SearchScreen }))
);
