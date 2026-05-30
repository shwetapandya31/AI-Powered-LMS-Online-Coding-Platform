'use client';
import { useEffect, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(LANGUAGES[0]);

  useEffect(() => {
    // Load Google Translate script invisibly
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: LANGUAGES.filter(l => l.code !== 'en').map(l => l.code).join(','),
            autoDisplay: false,
          },
          'google_translate_element_hidden'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Restore saved language
    const saved = localStorage.getItem('selected-language');
    if (saved) {
      const lang = LANGUAGES.find(l => l.code === saved);
      if (lang) setSelected(lang);
    }
  }, []);

  const resetToEnglish = () => {
    // Remove Google Translate cookies to revert to original
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith('googtrans')) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      }
    });
    // Try the combo select too
    const selectEl = document.querySelector('.goog-te-combo');
    if (selectEl) {
      selectEl.value = '';
      selectEl.dispatchEvent(new Event('change'));
    }
    // Reload to fully reset — most reliable method
    window.location.reload();
  };

  const triggerTranslate = (langCode) => {
    const trySelect = () => {
      const selectEl = document.querySelector('.goog-te-combo');
      if (selectEl) {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
        return true;
      }
      return false;
    };
    if (!trySelect()) {
      setTimeout(trySelect, 800);
    }
  };

  const handleSelect = (lang) => {
    setSelected(lang);
    setOpen(false);
    localStorage.setItem('selected-language', lang.code);
    if (lang.code === 'en') {
      resetToEnglish();
    } else {
      triggerTranslate(lang.code);
    }
  };

  return (
    <>
      {/* Hidden Google Translate widget */}
      <div id="google_translate_element_hidden" style={{ display: 'none', visibility: 'hidden', height: 0, overflow: 'hidden' }} />

      {/* Custom Styled Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition-all text-sm font-medium text-gray-200"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">{selected.flag} {selected.label}</span>
          <span className="sm:hidden">{selected.flag}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-1.5">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${selected.code === lang.code
                        ? 'bg-indigo-600/20 text-indigo-300'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {selected.code === lang.code && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
