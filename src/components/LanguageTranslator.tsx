import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export function LanguageTranslator() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("pt");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Translate script
    const addScript = () => {
      if (document.getElementById("google-translate-script")) return;
      
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "pt",
            autoDisplay: false,
            includedLanguages: languages.map((l) => l.code).join(","),
          },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };
    addScript();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (code: string) => {
    setCurrent(code);
    setOpen(false);

    // Trigger Google Translate
    const select = document.querySelector<HTMLSelectElement>(
      ".goog-te-combo"
    );
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
  };

  const currentLang = languages.find((l) => l.code === current);

  return (
    <div ref={ref} className="relative">
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" className="hidden" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">{currentLang?.flag} {currentLang?.label}</span>
        <span className="text-sm sm:hidden">{currentLang?.flag}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border bg-card shadow-xl z-[100] py-2 animate-scale-in max-h-80 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-accent transition-colors ${
                current === lang.code ? "bg-accent text-accent-foreground font-medium" : "text-foreground"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
