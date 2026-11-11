import React, { useState } from 'react';
import { X, Send, Building, CheckCircle2 } from 'lucide-react';

interface DemoRequestModalProps {
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    department: 'Physics & Astronomy',
    cohortSize: '50 - 200 students',
    hardware: 'Meta Quest 3S + Web Desktop',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Pilot Demonstration Requested</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{formData.name}</strong>. The Vickora Labs Academic Partnerships team will contact you at <strong className="text-white">{formData.email}</strong> with institutional trial credentials and the Meta Quest 3S deployment package.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Return to Laboratory
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Request Institutional Pilot</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Experience VOL for your university physics department, optical engineering curriculum, or research group.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="Prof. Elena Vance, Dept. Chair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Academic / Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.vance@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">University / Institute</label>
                  <input
                    type="text"
                    required
                    placeholder="Technical University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Annual Student Cohort</label>
                  <select
                    value={formData.cohortSize}
                    onChange={(e) => setFormData({ ...formData, cohortSize: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option>&lt; 50 students</option>
                    <option>50 - 200 students</option>
                    <option>200 - 1000 students</option>
                    <option>Campus-wide license</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Platforms</label>
                  <select
                    value={formData.hardware}
                    onChange={(e) => setFormData({ ...formData, hardware: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option>Meta Quest 3S + Web Desktop</option>
                    <option>Web Desktop & Tablets only</option>
                    <option>Dedicated VR Lab Facility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Curriculum or Research Goals (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="E.g. Enhancing wave optics laboratory hours, remote hybrid physics courses..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-sky-950/50 mt-2"
              >
                <Send className="w-4 h-4" /> Submit Pilot Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
