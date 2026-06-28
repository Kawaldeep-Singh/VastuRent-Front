import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Search as SearchIcon,
  Send,
  Sofa,
  Sparkles,
} from 'lucide-react';

const EXAMPLES = [
  '2 BHK GLS Avenue Sector 81 under 20k semi furnished',
  'Need 3 BHK semi furnished in Sector 89 under 30k family ke liye',
  'Bachelor allowed 1 RK near Sector 45 cheap option',
  'Park facing 3 BHK in M3M Soulitude budget 35k',
  'सस्ते 2 bhk flat sector 81 family ke liye',
  '1 BHK fully furnished under 18k near Sector 46',
  '3 bedroom apartment in Smart World Gems below 32k',
  '2 room set chahiye Sector 57 me budget 15000',
  'Raw flat GLS Avenue Sector 81 rent 15k tak',
  'Semi furnished 2 BHK for family in Sector 82',
  'Fully furnished 1 RK for bachelor near Cyber City',
  'Company lease 3 BHK in DLF Primus budget 45k',
  'Girls bachelor allowed 2 BHK near Sector 52',
  'Pet friendly flat Sector 89 under 30k',
  'Ground floor independent floor Sector 84 around 40k',
  'Villa chahiye Sector 85 me 4 BHK budget 60k',
  '2 BHK pool facing near Smart World One Rx',
  'Newly painted 3 BHK family flat Sector 90',
  'Low maintenance affordable apartment Sector 81',
  'High rise society flat near Dwarka Expressway 30k',
  '2 BHK unfurnished flat under 16k Sector 81',
  'Semi furnished apartment near school Sector 83',
  '3 BHK with modular kitchen Sector 89 35k',
  '1 room kitchen for single boy under 10k',
  'Budget friendly 2 BHK near Vatika City Homes',
  'Corner flat park facing Sector 92 2 BHK',
  '2 BHK in Signature Global Synera under 18k',
  'Family friendly 3 BHK Sector 84 near club',
  'Ready to move 2 BHK Sector 107 Woodshire',
  'Luxury furnished 3 BHK Emaar Imperial Gardens',
  'Sushant Lok 1 builder floor 3 BHK 50k',
  'Palam Vihar independent floor 2 BHK 25k',
  'Golf Extension 3 BHK premium apartment 70k',
  'Near metro 1 BHK furnished Gurgaon under 25k',
  '2 BHK for married couple Sector 86 semi',
  'No owner interference bachelor flat Sector 45',
  'Top floor with terrace Sector 57 3 BHK',
  'Basement not required 2 BHK Sector 82',
  'Lift parking must 3 BHK Sector 89',
  'Servant room chahiye 4 BHK villa Gurgaon',
  '2 BHK close to office Sector 74 under 28k',
  '3 BHK close to NH8 family budget 38k',
  'Small family 2 BHK Sector 81 18k tak',
  'Bachelor boys ke liye 1 RK near Huda City',
  'Couple friendly 1 BHK Gurgaon 20k',
  'Furnished studio apartment under 22k',
  'Studio near Golf Course Road company lease',
  '2 BHK in gated society Sector 89 semi furnished',
  'Cheapest flat available in GLS Avenue',
  'GLS Avanue 81 2bhk rent 16500',
  'Gls avenue sector 81 semi furnished 2 bhk',
  'GLS Avenue raw flat 15000',
  'M3M Soulitude 3bhk family under 30k',
  'M3M Solitude typo search 3 bhk',
  'Smart world gem 2 bhk furnished',
  'SmartWorld Gems Sector 89 under 28k',
  'SS Almeria independent floor 3 BHK',
  'Almeria villa fully furnished around 35k',
  'Pivotal Devaan Sector 84 budget option',
  'Orris Carnation 2 BHK Sector 85',
  'Pyramid Elite Sector 86 affordable flat',
  'Bestech Park View 3 BHK family',
  'DLF Primus Sector 82 premium semi furnished',
  'Vatika City Homes 2 BHK backyard',
  'Signature Synera cheap 2 bhk sector 81',
  'Woodshire Sector 107 peaceful balcony',
  'Emaar Imperial fully furnished 3 bhk',
  '3 BHK below 40 thousand in Sector 102',
  '2 BHK 22 hazaar tak semi furnished',
  'तीन bhk sector 89 me 30000 ke andar',
  'दो bhk सस्ता flat sector 81',
  'family ke liye park facing flat chahiye',
  'bachelors allowed furnished flat near sector 45',
  'किफायती apartment Gurgaon me chahiye',
  'सेमी furnished 2 bhk sector 81',
  'fully furnished family flat 35k Gurgaon',
  'unfurnished 2 bedroom under 17000',
  '2 bhk with balcony and parking sector 81',
  '3 BHK close to clubhouse Sector 89',
  'Pool view 2 BHK Sector 84',
  'Sun facing apartment Sector 90',
  'North east facing 3 bhk floor Gurgaon',
  'First floor independent house Sector 46',
  'Second floor builder floor Sushant Lok',
  'No brokerage client wants 2 BHK',
  'Immediate shifting 2 bhk sector 81',
  'Available today 3 bhk sector 89',
  'Short term rental furnished studio',
  'Long term lease family apartment',
  'Owner free property bachelor allowed',
  'New construction flat Sector 92',
  'Old society low rent sector 81',
  'High security society for family',
  'Near market 2 BHK Sector 83',
  'Near hospital family flat Gurgaon',
  'Near school 3 BHK family sector 89',
  'Budget 20000 max 2 bhk semi furnished',
  'Below 15k one room set Gurgaon',
  'Around 25k 2 bedroom apartment',
  'Under 50k 4 BHK villa with parking',
];

const HINTS = [
  { icon: Building2, label: 'BHK / Type', value: '2 BHK, 3 BHK, villa, floor' },
  { icon: MapPin, label: 'Location', value: 'Sector 81, GLS Avenue, M3M' },
  { icon: IndianRupee, label: 'Budget', value: 'under 20k, below 35000' },
  { icon: Sofa, label: 'Preference', value: 'semi furnished, family, park facing' },
];

export default function Search() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleExampleCount, setVisibleExampleCount] = useState(16);

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const canSearch = text.trim().length > 1 && !loading;

  const submitSearch = (value = text) => {
    const rawRequirement = value.trim();
    if (!rawRequirement) return;
    setLoading(true);
    navigate('/results', { state: { rawRequirement } });
  };

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 space-y-8 animate-fade-in">
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                <Sparkles size={13} />
                AI Rental Search
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display">
                Find properties in seconds.
              </h1>
              <p className="text-slate-400 text-sm">
                Hindi, English, Hinglish, typo, short form sab chalega. Search bar mein BHK, sector/project, budget aur preference likho.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 h-14 bg-[#0b1020] border border-white/[0.08] rounded-xl flex items-center gap-3 px-4 focus-within:border-cyan-400/50 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.08)] transition-all">
                <SearchIcon size={20} className="text-cyan-300 flex-shrink-0" />
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="e.g. 2 BHK GLS Avenue Sector 81 under 20k"
                  className="w-full bg-transparent text-base text-slate-100 placeholder:text-slate-600 outline-none"
                />
                <span className="hidden md:inline-flex text-[11px] text-slate-500 font-semibold bg-white/[0.04] px-2 py-1 rounded-md">
                  {wordCount} words
                </span>
              </div>
              <button
                type="submit"
                disabled={!canSearch}
                className="h-14 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-slate-950/20 border-t-slate-950 animate-spin" />
                ) : (
                  <Send size={17} />
                )}
                Search
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {EXAMPLES.slice(0, visibleExampleCount).map((example) => (
                <button
                  key={example}
                  onClick={() => submitSearch(example)}
                  className="group min-h-16 rounded-xl border border-white/[0.06] bg-[#0a0f1d]/80 hover:border-cyan-400/30 hover:bg-[#0d1426] px-4 py-3 text-left flex items-center justify-between gap-4 transition-all"
                >
                  <span className="text-sm text-slate-300 leading-relaxed">{example}</span>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-cyan-300 flex-shrink-0" />
                </button>
              ))}
            </div>
            {visibleExampleCount < EXAMPLES.length && (
              <button
                onClick={() => setVisibleExampleCount((count) => Math.min(count + 16, EXAMPLES.length))}
                className="h-11 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-sm font-bold transition-colors"
              >
                Show more examples ({EXAMPLES.length - visibleExampleCount} left)
              </button>
            )}
          </div>

          <aside className="rounded-xl border border-white/[0.06] bg-[#0a0f1d]/80 p-5 space-y-4">
            <div>
              <p className="text-sm font-extrabold text-slate-100 font-display">Search Format</p>
              <p className="text-xs text-slate-500 mt-1">Best result ke liye in fields ko ek line mein likh do.</p>
            </div>
            <div className="space-y-2">
              {HINTS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg bg-white/[0.03] border border-white/[0.04] p-3">
                  <Icon size={15} className="text-cyan-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-300">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.06] pt-4 flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
              <CheckCircle2 size={15} className="text-emerald-300 mt-0.5 flex-shrink-0" />
              Owner contact WhatsApp message mein hidden rahega, internal cards mein visible rahega.
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
