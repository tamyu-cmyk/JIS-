import React, { useState, useMemo } from 'react';
import { Calculator, Info, AlertCircle, Ruler } from 'lucide-react';

type ToleranceClass = 'f' | 'm' | 'c' | 'v';

interface ToleranceRange {
  min: number;
  max: number;
  tolerances: {
    f: number | null;
    m: number | null;
    c: number | null;
    v: number | null;
  };
}

const toleranceTable: ToleranceRange[] = [
  { min: 0.5, max: 3, tolerances: { f: 0.05, m: 0.1, c: 0.2, v: null } },
  { min: 3, max: 6, tolerances: { f: 0.05, m: 0.1, c: 0.3, v: 0.5 } },
  { min: 6, max: 30, tolerances: { f: 0.1, m: 0.2, c: 0.5, v: 1 } },
  { min: 30, max: 120, tolerances: { f: 0.15, m: 0.3, c: 0.8, v: 1.5 } },
  { min: 120, max: 400, tolerances: { f: 0.2, m: 0.5, c: 1.2, v: 2.5 } },
  { min: 400, max: 1000, tolerances: { f: 0.3, m: 0.8, c: 2, v: 4 } },
  { min: 1000, max: 2000, tolerances: { f: 0.5, m: 1.2, c: 3, v: 6 } },
  { min: 2000, max: 4000, tolerances: { f: null, m: 2, c: 4, v: 8 } },
];

const classLabels: Record<ToleranceClass, string> = {
  f: '精級 (f)',
  m: '中級 (m)',
  c: '粗級 (c)',
  v: '極粗級 (v)',
};

export default function App() {
  const [dimensionStr, setDimensionStr] = useState<string>('3');
  const [tolClass, setTolClass] = useState<ToleranceClass>('m');

  const dimension = parseFloat(dimensionStr);
  const isValidDimension = !isNaN(dimension) && dimension >= 0.5 && dimension <= 4000;

  const tolerance = useMemo(() => {
    if (!isValidDimension) return null;
    const range = toleranceTable.find(r => {
      if (r.min === 0.5) {
        return dimension >= 0.5 && dimension <= 3;
      }
      return dimension > r.min && dimension <= r.max;
    });
    if (!range) return null;
    return range.tolerances[tolClass];
  }, [dimension, tolClass, isValidDimension]);

  const upperLimit = tolerance !== null ? dimension + tolerance : null;
  const lowerLimit = tolerance !== null ? dimension - tolerance : null;

  // Formatting helper to avoid floating point issues like 2.9000000000000004
  const formatNumber = (num: number | null) => {
    if (num === null) return '-';
    return Number(num.toFixed(3)).toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center space-x-3 pb-4 border-b border-slate-200">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
            <Ruler size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">普通公差計算ツール</h1>
            <p className="text-sm text-slate-500">JIS B 0405-1991 長さ寸法に対する普通公差</p>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-8">
            
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label htmlFor="dimension" className="block text-sm font-medium text-slate-700 mb-2">
                  基準寸法 (mm)
                </label>
                <div className="flex items-stretch rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <input
                    type="number"
                    id="dimension"
                    value={dimensionStr}
                    onChange={(e) => setDimensionStr(e.target.value)}
                    step="0.1"
                    min="0.5"
                    max="4000"
                    className="block w-full bg-transparent px-4 py-3 text-lg focus:outline-none rounded-l-xl"
                    placeholder="例: 3"
                  />
                  <div className="flex items-center px-4 text-slate-500 text-lg border-l border-slate-300 bg-slate-50 rounded-r-xl">
                    mm
                  </div>
                </div>
                {dimensionStr && !isValidDimension && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    0.5mm以上、4000mm以下の数値を入力してください。
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  公差等級
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.entries(classLabels) as [ToleranceClass, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className={`
                        relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all
                        ${tolClass === key 
                          ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                      `}
                    >
                      <input
                        type="radio"
                        name="toleranceClass"
                        value={key}
                        checked={tolClass === key}
                        onChange={(e) => setTolClass(e.target.value as ToleranceClass)}
                        className="sr-only"
                      />
                      <span className={`text-sm font-medium ${tolClass === key ? 'text-blue-900' : 'text-slate-900'}`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-inner">
              <h2 className="text-sm font-medium text-slate-400 mb-4 flex items-center uppercase tracking-wider">
                <Calculator size={16} className="mr-2" />
                計算結果
              </h2>
              
              {tolerance === null ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  {isValidDimension ? 'この条件の公差は規定されていません' : '有効な寸法を入力してください'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">許容差</div>
                    <div className="text-3xl font-mono text-blue-400">
                      ±{formatNumber(tolerance)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">上限寸法</div>
                    <div className="text-3xl font-mono text-white">
                      {formatNumber(upperLimit)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-400 text-sm">下限寸法</div>
                    <div className="text-3xl font-mono text-white">
                      {formatNumber(lowerLimit)}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start space-x-2 text-sm text-slate-500 bg-slate-100 p-4 rounded-xl">
          <Info size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            このツールは JIS B 0405-1991（長さ寸法及び角度寸法に対する普通公差）の「長さ寸法」の表に基づいています。
            面取り部分の長さ寸法や角度寸法には別の公差が適用されます。
          </p>
        </div>
      </div>
    </div>
  );
}
