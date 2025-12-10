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
      setError("Hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sun') || c.includes('clear') || c.includes('açık') || c.includes('güneş')) return <Sun className="w-5 h-5 text-amber-500" />;
    if (c.includes('rain') || c.includes('yağmur')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (c.includes('snow') || c.includes('kar')) return <Snowflake className="w-5 h-5 text-sky-300" />;
    if (c.includes('cloud') || c.includes('bulut')) return <Cloud className="w-5 h-5 text-slate-400" />;
    return <CloudSun className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-2 flex items-center gap-4 h-full min-h-[50px]">
      {loading ? (
        <div className="flex items-center gap-2">
           <div className="animate-spin h-4 w-4 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
           <span className="text-xs text-slate-400">Yükleniyor...</span>
        </div>
      ) : error ? (
        <span className="text-xs text-red-500 font-medium">Hava durumu alınamadı</span>
      ) : (
        <>
           <div className="flex items-center gap-2">
              {data ? getWeatherIcon(data.condition) : <CloudSun className="w-5 h-5 text-slate-300" />}
              <div className="flex flex-col leading-tight">
                 <span className="font-bold text-slate-800 text-sm">{data?.temp || "--"}</span>
                 <span className="text-[10px] text-slate-500">{data?.condition}</span>
              </div>
           </div>
           
           <div className="w-px h-6 bg-slate-100 mx-1"></div>

           <div className="flex flex-col items-end leading-tight">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <MapPin className="w-3 h-3" />
                <span className="max-w-[80px] truncate">{data?.location || 'Konum'}</span>
              </div>
              <button 
                onClick={fetchWeather}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-0.5"
              >
                <RefreshCw className="w-3 h-3" /> Güncelle
              </button>
           </div>
        </>
      )}
    </div>
  );
};

export default WeatherDisplay;