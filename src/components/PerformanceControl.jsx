import { getPerformancePreference, selectPerformance } from './performance-profile.js';

import { usePerformance } from './use-performance.js';

export default function PerformanceControl() {
  const profile=usePerformance();
  return (
    <label className="performance-control" title={'Current mode: ' + profile.name}>
      <span>Performance</span>
      <select aria-label="Performance profile" value={getPerformancePreference()} onChange={event => selectPerformance(event.target.value)}>
        <option value="auto">Auto</option>
        <option value="cinematic">Cinematic</option>
        <option value="balanced">Balanced</option>
        <option value="lightweight">Lightweight</option>
      </select>
    </label>
  );
}
