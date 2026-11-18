import { getPerformance, getPerformancePreference, selectPerformance } from './performance-profile.js';

export default function PerformanceControl() {
  return (
    <label className="performance-control" title={'Current mode: ' + getPerformance().name}>
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
