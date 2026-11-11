import React, { useState } from 'react';
import { ExperimentRecord } from '@vickora/shared';
import { exportExperimentAsCSV, exportExperimentAsJSON, saveExperimentRecord } from '../services/persistence.js';
import { Download, Printer, X, CheckCircle, FileText } from 'lucide-react';

interface ReportModalProps {
  record: ExperimentRecord;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ record: initialRecord, onClose }) => {
  const [record, setRecord] = useState<ExperimentRecord>(initialRecord);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleNotesChange = (text: string) => {
    const updated = { ...record, studentNotes: text };
    setRecord(updated);
    saveExperimentRecord(updated);
  };

  const handleSave = () => {
    saveExperimentRecord(record);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header (No-print for clean PDF) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Official Laboratory Experiment Report</h2>
              <p className="text-xs text-slate-400">Vickora Labs — Virtual Optics Laboratory (VOL)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedNotification && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={() => exportExperimentAsCSV(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => exportExperimentAsJSON(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition shadow-sm"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Content (Print-optimized) */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-200 bg-slate-900 print:bg-white print:text-black">
          {/* Institutional Title Block */}
          <div className="border-b border-slate-700 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono tracking-widest text-sky-400 uppercase font-semibold">
                  Vickora Labs • Academic Science Systems
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-white mt-1 print:text-black">
                  {record.title}
                </h1>
                <p className="text-sm text-slate-400 print:text-gray-600 mt-0.5">
                  Virtual Optics Laboratory (VOL) — Experimental Station: {record.stationId.toUpperCase()}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 print:text-gray-600 font-mono">
                <div>Session ID: {record.id.slice(0, 10)}</div>
                <div>Date: {new Date(record.timestamp).toLocaleDateString()}</div>
                <div>Duration: {Math.round(record.durationSeconds)} s</div>
              </div>
            </div>
          </div>

          {/* Section 1: Initial Conditions */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 print:text-black">
              1. Experimental Apparatus & Configuration Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 print:bg-gray-100 print:border-gray-300">
              {Object.entries(record.parameters).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="text-slate-400 print:text-gray-600 font-mono block">{key}</span>
                  <span className="text-slate-200 print:text-black font-semibold font-mono">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Measurements Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 print:text-black">
              2. Quantitative Experimental Measurements & Validation
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 print:bg-gray-200 print:text-black">
                  <tr>
                    <th className="p-2.5">Physical Quantity</th>
                    <th className="p-2.5">Symbol</th>
                    <th className="p-2.5">Experimental Value</th>
                    <th className="p-2.5">Unit</th>
                    <th className="p-2.5">Theoretical Reference</th>
                    <th className="p-2.5">Relative Error (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {record.measurements.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-medium text-slate-200 print:text-black">{m.name}</td>
                      <td className="p-2.5 font-mono text-sky-400 print:text-black">{m.symbol}</td>
                      <td className="p-2.5 font-mono text-emerald-400 print:text-black font-semibold">
                        {typeof m.value === 'number' ? m.value.toFixed(4) : m.value}
                      </td>
                      <td className="p-2.5 text-slate-400 print:text-gray-600">{m.unit}</td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-gray-700">
                        {m.theoreticalValue !== undefined ? m.theoreticalValue.toFixed(4) : 'N/A'}
                      </td>
                      <td className="p-2.5 font-mono font-semibold">
                        {m.errorPercentage !== undefined ? (
                          <span className={m.errorPercentage < 1.0 ? 'text-emerald-400 print:text-black' : 'text-amber-400'}>
                            {m.errorPercentage.toFixed(2)} %
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Theoretical Summary */}
          {record.theoreticalSummary && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 print:text-black">
                3. Mathematical & Physical Principles
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800 print:bg-white print:border-gray-200 print:text-black">
                {record.theoreticalSummary}
              </p>
            </div>
          )}

          {/* Section 4: Student Analysis & Notes */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 print:text-black">
              4. Experimental Discussion & Scientific Conclusions
            </h3>
            <textarea
              value={record.studentNotes ?? ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Enter student observations, experimental source of errors, analysis of Fresnel/Snell equations, and concluding remarks..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 no-print"
            />
            {/* Print view of notes */}
            <div className="hidden print:block text-xs border border-gray-300 p-3 rounded min-h-[80px]">
              {record.studentNotes || 'No additional student notes entered.'}
            </div>
          </div>

          {/* Institutional Sign-off Block */}
          <div className="pt-6 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-gray-700">
            <div>
              <div className="border-b border-slate-700 print:border-black mb-1 w-48 h-8"></div>
              <span>Student / Researcher Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-700 print:border-black mb-1 w-48 h-8"></div>
              <span>Instructor / Academic Evaluator Verification</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 no-print">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Save Record Locally
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
