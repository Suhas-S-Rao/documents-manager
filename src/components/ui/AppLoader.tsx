import { CircleDashed, Sparkles } from 'lucide-react';

interface AppLoaderProps {
  show: boolean;
  message?: string;
  progress?: number;
}

const AppLoader = ({ show, message = 'Loading...', progress }: AppLoaderProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-white/95 to-slate-100 p-8 shadow-2xl text-center transform transition-all duration-300 ease-out scale-100">
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 shadow-inner">
          <CircleDashed size={72} className="text-indigo-500 animate-spin drop-shadow-md" />
          <Sparkles size={22} className="absolute bottom-3 right-3 text-yellow-400 animate-ping" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 tracking-wide animate-pulse">{message}</h3>
        {progress !== undefined && (
          <div className="mt-6">
            <div className="h-4 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div className="h-full bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500 transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-600 tracking-wide font-medium">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppLoader;
