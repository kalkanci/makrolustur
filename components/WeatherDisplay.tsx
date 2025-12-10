import React, { useState, useEffect } from 'react';
import { RefreshCw, CloudSun, CloudRain, Sun, Cloud, Snowflake, MapPin } from 'lucide-react';
import { getLocalWeather } from '../services/geminiService';

const WeatherDisplay: React.FC = () => {
  const [data, setData] = useState<{ temp: string; condition: string; location: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLocalWeather();
      setData(result);
    } catch (err) {
      setError("Hava durumu alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to choose icon based on condition text (simple mapping)
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear') || c.includes('açık') || c.includes('güneş')) return <Sun className="w-8 h-8 text-amber-500" />;
    if (c.includes('rain') || c.includes('yağmur')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (c.includes('snow') || c.includes('kar')) return <Snowflake className="w-8 h-8 text-sky-300" />;
    if (c.includes('cloud') || c.includes('bulut')) return <Cloud className="w-8 h-8 text-slate-400" />;
    return <CloudSun className="w-8 h-8 text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-emerald-600" />
          Hava Durumu
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
          İnternet Konumu
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-lg border border-slate-100 mb-4 transition-all">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
             <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
             <div className="text-xs text-slate-400">Veriler çekiliyor...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 font-medium text-sm">{error}</div>
        ) : (
          <>
             <div className="mb-2 animate-in zoom-in duration-300">
                {data ? getWeatherIcon(data.condition) : <CloudSun className="w-8 h-8 text-slate-300" />}
             </div>
             <div className="text-4xl font-bold text-slate-900 tracking-tight">
                {data?.temp || "--"}
             </div>
             <div className="text-sm font-medium text-slate-500 mt-1">
                {data?.condition || "Durum"}
             </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {data?.location || 'Konum aranıyor...'}
        </div>
        <button 
          onClick={fetchWeather}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </button>
      </div>
    </div>
  );
};

export default WeatherDisplay;