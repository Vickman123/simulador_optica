import { ExperimentRecord } from '@vickora/shared';

const STORAGE_KEY = 'vickora_vol_experiments_v1';

export function loadSavedExperiments(): ExperimentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load experiments from localStorage', err);
    return [];
  }
}

export function saveExperimentRecord(record: ExperimentRecord): void {
  try {
    const current = loadSavedExperiments();
    const updated = [record, ...current.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save experiment to localStorage', err);
  }
}

export function exportExperimentAsJSON(record: ExperimentRecord): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${record.experimentId}_${record.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportExperimentAsCSV(record: ExperimentRecord): void {
  let csv = 'Measurement,Symbol,Value,Unit,TheoreticalValue,ErrorPercentage,Notes\n';
  record.measurements.forEach((m) => {
    csv += `"${m.name}","${m.symbol}",${m.value},"${m.unit}",${m.theoreticalValue ?? ''},${m.errorPercentage ?? ''},"${m.notes ?? ''}"\n`;
  });

  const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${record.experimentId}_${record.id}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
