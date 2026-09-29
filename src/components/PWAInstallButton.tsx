import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone app, hide install button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop install button
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        title="Install Federal Poly Ukana CBT App on your desktop or mobile home screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Install App on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-slate-900 text-base">Install Ukana CBT on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                To install the Federal Polytechnic Ukana CBT App on your iPhone or iPad:
              </p>

              <ol className="space-y-2.5 text-xs text-slate-700 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800 bg-emerald-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button in your Safari browser toolbar (at bottom or top).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800 bg-emerald-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Scroll down the menu options and tap <strong>"Add to Home Screen"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800 bg-emerald-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback direct install button for desktop/Android
  return (
    <button
      onClick={() => {
        alert('To install this app on your device:\n\n1. In Chrome/Edge: Click the install icon in the URL bar or menu -> Install App.\n2. On Android/iOS: Tap browser menu -> Add to Home Screen.');
      }}
      className="px-2.5 py-1.5 bg-amber-600/90 hover:bg-amber-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
      title="Install Federal Poly Ukana CBT App"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
};
