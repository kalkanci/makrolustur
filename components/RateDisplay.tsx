import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { getLiveExchangeRate } from '../services/geminiService';

const RateDisplay: React.FC = () => {
  const [rate, setRate] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLiveExchangeRate();
      setRate(data.rate);
      setSource(data.source);
    } catch (err) {
      setError("Kur yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Canlı Piyasa Verisi
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
          Canlı
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-lg border border-slate-100 mb-4">
        <div className="text-sm text-slate-500 mb-1">USD / TRY</div>
        {loading ? (
          <div className="animate-pulse h-10 w-32 bg-slate-200 rounded"></div>
        ) : error ? (
          <div className="text-red-500 font-medium">{error}</div>
        ) : (
          <div className="text-4xl font-bold text-slate-900 flex items-center">
            <span className="text-2xl text-slate-400 mr-1">₺</span>
            {rate}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-400 truncate max-w-[200px]">
          Kaynak: {source || 'Yükleniyor...'}
        </div>
        <button 
          onClick={fetchRate}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>
    </div>
  );
};

export default RateDisplay;