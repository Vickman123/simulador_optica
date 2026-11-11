import React from 'react';
import {
  Atom,
  Glasses,
  ArrowRight,
  Sparkles,
  MousePointer,
  Eye,
} from 'lucide-react';

interface LandingPageProps {
  onEnterLab: () => void;
  onRequestDemo?: () => void;
  lang?: string;
  onToggleLang?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLab }) => {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Barra Superior */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-950/50">
            <Atom className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-base">VOL</span>
            <span className="text-sky-400 text-xs ml-2 font-mono bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-full">
              Simulador Óptico 3D
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#estaciones"
            className="text-xs text-slate-300 hover:text-white transition hidden sm:inline"
          >
            Ver Experimentos
          </a>
          <button
            onClick={onEnterLab}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition shadow-lg shadow-sky-950/60 hover:scale-105 transform duration-150"
          >
            Entrar al Laboratorio 3D <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sección Principal (Hero) */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-950/60 text-sky-300 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-sky-400" />
          Prototipo de Prueba Activo • Diseñado para ser Fácil e Intuitivo
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Explora la Luz y la Óptica en un{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
            Laboratorio 3D Real
          </span>
        </h1>

        <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
          Manipula rayos láser, lentes y prismas de cristal con tus manos o con el ratón. Aprende física óptica experimentando de forma visual y sencilla, sin complicaciones ni fórmulas difíciles.
        </p>

        {/* Botón de Entrada Principal */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnterLab}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition shadow-2xl shadow-sky-950/80 text-base hover:scale-105 transform duration-150"
          >
            🚀 Iniciar Simulación en el Laboratorio <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjetas de Facilidad de Uso */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 w-full text-left">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <MousePointer className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Fácil de Usar</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mueve los controles deslizantes o usa los botones rápidos para ver cómo la luz cambia al instante.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Visual y Comprensible</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Observa con colores brillantes el camino real de los fotones: reflexión, refracción e interferencia de ondas.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Glasses className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Meta Quest 3S o PC</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Úsalo en tu pantalla o colócate tus gafas de Realidad Virtual para tocar los instrumentos en 3D.
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Experimentos Disponibles */}
      <section id="estaciones" className="px-6 md:px-12 py-16 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
              Experimentos Listos para Probar
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              ¿Qué puedes experimentar en el laboratorio?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
              Cada mesa está equipada con su propio banco óptico, láser y piezas de vidrio de alta precisión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Experimento 1 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-sky-500/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 inline-block">
                  Mesa A • Activo
                </span>
                <h3 className="text-base font-bold text-white">1. Rebote y Desviación de la Luz (Snell)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apunta el láser contra un bloque de vidrio. Mira cómo parte de la luz rebota como en un espejo y otra entra al vidrio doblándose. Descubre el punto secreto donde el reflejo desaparece por completo (Ángulo de Brewster).
                </p>
              </div>
              <button
                onClick={onEnterLab}
                className="w-full py-2 bg-slate-800 hover:bg-sky-600 text-sky-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Probar Mesa A <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Experimento 2 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-sky-500/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 inline-block">
                  Mesa B • Activo
                </span>
                <h3 className="text-base font-bold text-white">2. Lentes: Lupas y Proyectores</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coloca un objeto frente a una lente curva. Aprende por qué las imágenes a veces se ven al revés (como en las cámaras o en nuestros ojos) y cómo usar la lente como lupa para agrandar lo que estás viendo.
                </p>
              </div>
              <button
                onClick={onEnterLab}
                className="w-full py-2 bg-slate-800 hover:bg-sky-600 text-sky-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Probar Mesa B <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Experimento 3 */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-sky-500/60 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 inline-block">
                  Mesa C • Activo
                </span>
                <h3 className="text-base font-bold text-white">3. La Luz como Onda (Doble Rendija)</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dispara un láser verde a través de dos ranuras diminutas. Comprueba cómo la luz se comporta como olas en el agua, chocando entre sí para formar franjas luminosas separadas por líneas de oscuridad absoluta.
                </p>
              </div>
              <button
                onClick={onEnterLab}
                className="w-full py-2 bg-slate-800 hover:bg-sky-600 text-sky-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Probar Mesa C <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Llamado Final a la Acción */}
      <section className="px-6 md:px-12 py-16 text-center bg-gradient-to-b from-slate-950 to-[#0a0d14] border-t border-slate-800">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold text-white">¿Listo para comenzar a experimentar?</h3>
          <p className="text-xs text-slate-400">
            No necesitas crear cuentas ni configurar nada. Ingresa directamente al simulador interactivo en 3D.
          </p>
          <button
            onClick={onEnterLab}
            className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-xl shadow-sky-950/50 text-sm inline-flex items-center gap-2"
          >
            Entrar al Laboratorio 3D <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Pie de Página */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center bg-slate-950 text-slate-500 text-xs">
        <p>Vickora Labs • VOL — Virtual Optics Laboratory (Versión de Prueba y Prototipo)</p>
      </footer>
    </div>
  );
};
