import { useState, useRef, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface DiseaseSelectorProps {
  selected: string;
  onChange: (disease: string) => void;
  diseases: string[];
}

export default function DiseaseSelector({ selected, onChange, diseases }: DiseaseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [previousDiseases, setPreviousDiseases] = useState<string[]>([]);

  // Track new diseases since last load
  const newDiseases = useMemo(() => {
    if (previousDiseases.length === 0) {
      // First load — nothing is "new"
      setPreviousDiseases(diseases);
      return new Set<string>();
    }
    const newSet = new Set(diseases.filter(d => !previousDiseases.includes(d)));
    if (newSet.size > 0) {
      // Update baseline after showing NEW badge
      setTimeout(() => setPreviousDiseases(diseases), 30000);
    }
    return newSet;
  }, [diseases]);

  const allOptions = ['All Diseases', ...diseases];
  const filtered = allOptions.filter(d =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#111827] border border-[#1E2D40] rounded-xl px-4 py-2.5 hover:border-[#3B82F6]/50 transition-colors min-w-[240px]"
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span className="text-[13px] font-medium text-[#F0F4F8]">{selected}</span>
        </div>
        <ChevronDown size={14} className={`text-[#8A9BB0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#111827] border border-[#1E2D40] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#1E2D40]">
            <div className="flex items-center gap-2 bg-[#0C1220] rounded-lg px-3 py-2">
              <Search size={14} className="text-[#8A9BB0]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diseases..."
                className="bg-transparent text-[13px] text-[#F0F4F8] placeholder-[#4A5568] outline-none w-full"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
            {filtered.map((disease) => (
              <button
                key={disease}
                onClick={() => {
                  onChange(disease);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center justify-between transition-colors ${
                  selected === disease
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                    : 'text-[#F0F4F8] hover:bg-[#1A2332]'
                }`}
              >
                <span>{disease}</span>
                <div className="flex items-center gap-2">
                  {newDiseases.has(disease) && (
                    <span className="px-1.5 py-0.5 bg-[#3B82F6] text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                      NEW
                    </span>
                  )}
                  {selected === disease && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-[12px] text-[#4A5568]">
                No diseases found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setIsOpen(false); setSearch(''); }}
        />
      )}
    </div>
  );
}
