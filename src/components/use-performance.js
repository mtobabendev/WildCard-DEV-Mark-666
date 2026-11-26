import { useSyncExternalStore } from 'react';
import { getPerformance, subscribePerformance } from './performance-profile.js';
export const usePerformance = () => useSyncExternalStore(subscribePerformance, getPerformance, getPerformance);
