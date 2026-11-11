import React from 'react';
import {
  Atom,
  Glasses,
  ArrowRight,
  CheckCircle,
  Building,
  GraduationCap,
  Sparkles,
  Layers,
  Cpu,
  FileText,
} from 'lucide-react';

interface LandingPageProps {
  onEnterLab: () => void;
  onRequestDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLab, onRequestDemo }) => {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Atom className="w-6 h-6 text-sky-400" />
          <div>
            <span className="font-bold tracking-tight text-white text-base">VOL</span>
            <span className="text-slate-400 text-xs ml-2 hidden sm:inline">Vickora Labs Optics</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#stations" className="hover:text-white transition">Experimental Stations</a>
          <a href="#scientific-engine" className="hover:text-white transition">Scientific Engine</a>
          <a href="#webxr" className="hover:text-white transition">Meta Quest 3S</a>
          <a href="#licensing" className="hover:text-white transition">Institutional Tiers</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onRequestDemo}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition"
          >
            Request Pilot
          </button>
          <button
            onClick={onEnterLab}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition shadow-lg shadow-sky-950/50"
          >
            Enter Lab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-20 md:py-28 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/40 text-sky-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Commercial MVP 1.0 • WebXR & Desktop Ready
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Explore Light. Understand Physics.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
            Experience Science.
          </span>
        </h1>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
          VOL (Virtual Optics Laboratory) is a commercial-grade university optical science learning and experimentation platform. Run physically rigorous experiments on desktop browsers or immersively inside Meta Quest 3S.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            onClick={onEnterLab}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-sky-950/60 text-sm"
          >
            Launch Interactive 3D Lab <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onRequestDemo}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition text-sm"
          >
            <Building className="w-4 h-4 text-sky-400" /> Institutional Demonstration
          </button>
        </div>

        {/* System Capabilities Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <Cpu className="w-5 h-5 text-sky-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Pure Optics Engine</h4>
            <p className="text-[11px] text-slate-400 mt-1">Snell, Fresnel, Gaussian lenses, wave superposition & Sellmeier dispersion.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <Glasses className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Meta Quest 3S</h4>
            <p className="text-[11px] text-slate-400 mt-1">WebXR immersive-vr at 72/90 Hz with 6DoF controller manipulation.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <Layers className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Curated Glass Database</h4>
            <p className="text-[11px] text-slate-400 mt-1">RefractiveIndex.INFO CC0 and SCHOTT optical catalog constants.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <FileText className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Academic Reporting</h4>
            <p className="text-[11px] text-slate-400 mt-1">Export CSV/JSON datasets and print university-standard PDF reports.</p>
          </div>
        </div>
      </section>

      {/* Six Experimental Stations Section */}
      <section id="stations" className="px-6 md:px-12 py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400">Curriculum Coverage</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Six University Experimental Stations</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              From foundational geometrical ray optics to wave interference, polarization, and fiber photonics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                station: 'Station A',
                title: 'Reflection & Refraction',
                status: 'Active in MVP 1.0',
                desc: 'Snell’s Law, critical angle, total internal reflection (TIR), Brewster’s angle, and Fresnel reflection coefficients with real SCHOTT glass.',
                active: true,
              },
              {
                station: 'Station B',
                title: 'Thin Lens Systems',
                status: 'Active in MVP 1.0',
                desc: 'Gaussian lens formula, real vs. virtual image construction, transverse magnification, and principal ray tracing on precision optical rails.',
                active: true,
              },
              {
                station: 'Station C',
                title: 'Wave Optics & Interference',
                status: 'Active in MVP 1.0',
                desc: 'Thomas Young double-slit experiment, spatial fringe spacing metrology, and Fraunhofer diffraction envelope calculations.',
                active: true,
              },
              {
                station: 'Station D',
                title: 'Polarization & Malus Cascade',
                status: 'Planned for v1.1',
                desc: 'Linear and circular polarization states, 3-polarizer paradox, Brewster angle reflection, and quarter/half wave plates.',
                active: false,
              },
              {
                station: 'Station E',
                title: 'Laser Experiments & Interferometry',
                status: 'Planned for v1.1',
                desc: 'Michelson interferometer, optical path difference, sub-micron fringe shifting, and spatial coherence.',
                active: false,
              },
              {
                station: 'Station F',
                title: 'Photonics & Guided Waves',
                status: 'Planned for v1.1',
                desc: 'Step-index optical fiber launch, core/cladding numerical aperture (NA), and optical waveguide modes.',
                active: false,
              },
            ].map((st, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition flex flex-col justify-between ${
                  st.active
                    ? 'bg-slate-900 border-slate-700/80 hover:border-sky-500/60'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-sky-400">{st.station}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        st.active
                          ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{st.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-6">
                  {st.active ? (
                    <button
                      onClick={onEnterLab}
                      className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                    >
                      Launch Experiment <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Curriculum Roadmap</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WebXR & Meta Quest 3S Highlight */}
      <section id="webxr" className="px-6 md:px-12 py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-[#0a0d14]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-400 text-xs font-mono">
              <Glasses className="w-3.5 h-3.5" /> Meta Quest 3S Ready
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Zero Installs. Zero Headaches. Just Open Meta Quest Browser.
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              VOL leverages the WebXR Device API and VXR Core to stream the full 3D optics laboratory straight into your headset at a stable 72/90 Hz. Manipulate optical mounts with 6DoF motion controllers and observe laser rays passing right in front of your eyes.
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                VXR Core adaptive frame rate negotiation (72/90 Hz)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Controller ray grabbing and millimeter optical rail snapping
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Preserved simulation state between VR and desktop transitions
              </li>
            </ul>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">University Deployment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equip an entire optics cohort with standard Quest 3S headsets without dedicated software installations or IT approvals.
            </p>
            <button
              onClick={onRequestDemo}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              Consult University Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Institutional Licensing Section */}
      <section id="licensing" className="px-6 md:px-12 py-20 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400">Commercial Licensing</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Designed for Higher Education & Research</h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              Transparent institutional licensing tiers tailored to physics departments and optics engineering labs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              {
                tier: 'VOL Demo',
                tag: 'Evaluation',
                target: 'Individual students & instructors',
                features: ['Access to 3 MVP experiments', 'Local CSV/JSON export', 'Desktop browser mode', 'Standard materials'],
                action: 'Launch Free Lab',
                cta: onEnterLab,
              },
              {
                tier: 'VOL Academic',
                tag: 'Department Pilot',
                target: 'University physics departments',
                features: ['All 6 experimental stations', 'Guided learning practices', 'Student report generation', 'LMS gradebook export'],
                action: 'Request Pilot',
                cta: onRequestDemo,
                highlight: true,
              },
              {
                tier: 'VOL Institutional',
                tag: 'Campus Wide',
                target: 'Colleges & engineering universities',
                features: ['SSO / LTI 1.3 Canvas & Moodle', 'Instructor custom rubric builder', 'Student telemetry dashboard', 'Dedicated SLA support'],
                action: 'Contact Sales',
                cta: onRequestDemo,
              },
              {
                tier: 'VOL XR',
                tag: 'Immersive VR',
                target: 'Dedicated VR & optics facilities',
                features: ['Meta Quest 3S fleet optimization', 'Multi-user collaborative benches', 'Advanced laser safety simulations', 'Custom optical CAD import'],
                action: 'Inquire XR Fleet',
                cta: onRequestDemo,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  plan.highlight
                    ? 'bg-slate-900 border-sky-500/80 shadow-xl shadow-sky-950/40 relative'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended
                  </span>
                )}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">{plan.tag}</span>
                    <h3 className="text-lg font-bold text-white">{plan.tier}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.target}</p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={plan.cta}
                  className={`mt-6 w-full py-2.5 text-xs font-semibold rounded-lg transition ${
                    plan.highlight
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {plan.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-6 md:px-12 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-sky-400" />
            <span className="text-white font-semibold">Vickora Labs</span>
            <span>• VOL — Virtual Optics Laboratory</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onRequestDemo} className="hover:text-white transition">Institutional Demo</button>
            <button onClick={onEnterLab} className="hover:text-white transition">Laboratory Workspace</button>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            © {new Date().getFullYear()} Vickora Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
