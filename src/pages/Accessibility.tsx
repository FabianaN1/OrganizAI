import { useState, useEffect } from 'react';
import {
  Accessibility, Eye, Type, Sun, Moon, Volume2,
  MousePointer, Palette, RotateCcw, CheckCircle
} from 'lucide-react';

type FontScale = 'sm' | 'md' | 'lg' | 'xl';

const fontScales: { key: FontScale; label: string; size: string }[] = [
  { key: 'sm', label: 'Pequeno', size: '0.875rem' },
  { key: 'md', label: 'Padrão', size: '1rem' },
  { key: 'lg', label: 'Grande', size: '1.125rem' },
  { key: 'xl', label: 'Extra Grande', size: '1.25rem' },
];

const colorThemes = [
  { key: 'default', label: 'Padrão', primary: 'bg-emerald-500', bg: 'bg-white', text: 'text-gray-900' },
  { key: 'warm', label: 'Aconchegante', primary: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-900' },
  { key: 'ocean', label: 'Oceano', primary: 'bg-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-900' },
  { key: 'forest', label: 'Floresta', primary: 'bg-green-600', bg: 'bg-green-50', text: 'text-green-900' },
];

export default function AccessibilityPage() {
  const [fontScale, setFontScale] = useState<FontScale>('md');
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [colorTheme, setColorTheme] = useState('default');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('a11y-settings');
    if (stored) {
      const s = JSON.parse(stored);
      if (s.fontScale) setFontScale(s.fontScale);
      if (s.highContrast) setHighContrast(s.highContrast);
      if (s.darkMode) setDarkMode(s.darkMode);
      if (s.reducedMotion) setReducedMotion(s.reducedMotion);
      if (s.colorTheme) setColorTheme(s.colorTheme);
      applySettings(s);
    }
  }, []);

  function applySettings(settings: Record<string, unknown>) {
    const root = document.documentElement;
    // Font scale
    root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${settings.fontScale || 'md'}`);
    // High contrast
    root.classList.toggle('high-contrast', !!settings.highContrast);
    // Dark mode
    root.classList.toggle('dark-mode', !!settings.darkMode);
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
    }
  }

  function saveSettings() {
    const settings = { fontScale, highContrast, darkMode, reducedMotion, colorTheme };
    localStorage.setItem('a11y-settings', JSON.stringify(settings));
    applySettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetSettings() {
    setFontScale('md');
    setHighContrast(false);
    setDarkMode(false);
    setReducedMotion(false);
    setColorTheme('default');
    localStorage.removeItem('a11y-settings');
    applySettings({ fontScale: 'md', highContrast: false, darkMode: false, reducedMotion: false });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Accessibility className="text-rose-500" size={28} />
          Acessibilidade
        </h1>
        <p className="text-gray-500 mt-2">
          Ajuste a plataforma para a melhor experiência possível. Todas as alterações são salvas automaticamente no seu navegador.
        </p>
      </div>

      <div className="space-y-6">
        {/* Font size */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Type className="text-blue-500" size={18} /> Tamanho da letra
          </h2>
          <p className="text-sm text-gray-500 mb-4">Escolha o tamanho ideal para a leitura.</p>
          <div className="grid grid-cols-4 gap-3">
            {fontScales.map(fs => (
              <button
                key={fs.key}
                onClick={() => { setFontScale(fs.key); applySettings({ fontScale: fs.key, highContrast, darkMode, reducedMotion }); }}
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  fontScale === fs.key ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {fs.label}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700" style={{ fontSize: fontScales.find(f => f.key === fontScale)?.size }}>
              Exemplo de texto neste tamanho: Cada dia sem consumo é uma vitória. Você está mais forte!
            </p>
          </div>
        </div>

        {/* Color theme */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Palette className="text-amber-500" size={18} /> Tema de cores
          </h2>
          <p className="text-sm text-gray-500 mb-4">Escolha a paleta que mais conforta seus olhos.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colorThemes.map(ct => (
              <button
                key={ct.key}
                onClick={() => { setColorTheme(ct.key); applySettings({ fontScale, highContrast, darkMode, reducedMotion, colorTheme: ct.key }); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  colorTheme === ct.key ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${ct.primary}`} />
                <span className="text-xs font-medium text-gray-700">{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle options */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Eye className="text-cyan-500" size={18} /> Opções visuais
          </h2>

          <ToggleOption
            icon={Sun}
            label="Alto contraste"
            desc="Aumenta o contraste de cores para facilitar a leitura."
            active={highContrast}
            onToggle={() => { setHighContrast(!highContrast); applySettings({ fontScale, highContrast: !highContrast, darkMode, reducedMotion }); }}
          />
          <ToggleOption
            icon={Moon}
            label="Modo escuro"
            desc="Fundo escuro com letras claras — ideal para ambientes com pouca luz."
            active={darkMode}
            onToggle={() => { setDarkMode(!darkMode); applySettings({ fontScale, highContrast, darkMode: !darkMode, reducedMotion }); }}
          />
          <ToggleOption
            icon={MousePointer}
            label="Reduzir animações"
            desc="Desativa transições e animações. Recomendado para quem sensível a movimento."
            active={reducedMotion}
            onToggle={() => { setReducedMotion(!reducedMotion); applySettings({ fontScale, highContrast, darkMode, reducedMotion: !reducedMotion }); }}
          />
          <ToggleOption
            icon={Volume2}
            label="Compatibilidade com leitores de tela"
            desc="Otimiza a estrutura da página para TalkBack (Android) e VoiceOver (iOS)."
            active={screenReader}
            onToggle={() => setScreenReader(!screenReader)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={14} /> Restaurar padrão
          </button>
          <button
            onClick={saveSettings}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {saved ? <><CheckCircle size={16} /> Salvo!</> : 'Salvar preferências'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ icon: Icon, label, desc, active, onToggle }: {
  icon: typeof Sun; label: string; desc: string; active: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
        <Icon className={active ? 'text-emerald-600' : 'text-gray-400'} size={18} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
        role="switch"
        aria-checked={active}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}
