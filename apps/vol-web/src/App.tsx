import { useState } from 'react';
import { LandingPage } from './components/LandingPage.js';
import { LaboratoryView } from './components/LaboratoryView.js';
import { DemoRequestModal } from './components/DemoRequestModal.js';
import { Language } from './i18n.js';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'lab'>('landing');
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('es');

  const toggleLang = () => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#0a0d14] text-slate-100">
      {currentView === 'landing' ? (
        <LandingPage
          onEnterLab={() => setCurrentView('lab')}
          onRequestDemo={() => setShowDemoModal(true)}
          lang={lang}
          onToggleLang={toggleLang}
        />
      ) : (
        <LaboratoryView
          onBackToLanding={() => setCurrentView('landing')}
          onRequestDemo={() => setShowDemoModal(true)}
          lang={lang}
          onToggleLang={toggleLang}
        />
      )}

      {showDemoModal && (
        <DemoRequestModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}
