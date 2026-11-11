import { useState } from 'react';
import { LandingPage } from './components/LandingPage.js';
import { LaboratoryView } from './components/LaboratoryView.js';
import { DemoRequestModal } from './components/DemoRequestModal.js';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'lab'>('landing');
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  return (
    <div className="w-full h-full min-h-screen bg-[#0a0d14] text-slate-100">
      {currentView === 'landing' ? (
        <LandingPage
          onEnterLab={() => setCurrentView('lab')}
          onRequestDemo={() => setShowDemoModal(true)}
        />
      ) : (
        <LaboratoryView
          onBackToLanding={() => setCurrentView('landing')}
          onRequestDemo={() => setShowDemoModal(true)}
        />
      )}

      {showDemoModal && (
        <DemoRequestModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}
