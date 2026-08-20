import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN de demo: 1234 o admin
    if (pin === '1234' || pin.toLowerCase() === 'admin') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warmgray-100 relative">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-warmgray-900">
            Acceso Administrativo
          </h3>
          <p className="text-xs text-warmgray-500 mt-1">
            Ingresa tu PIN de seguridad para gestionar el menú y precios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa PIN (Demo: 1234)"
                className="w-full pl-9 pr-4 py-2.5 bg-warmgray-50 border border-warmgray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono tracking-widest text-center"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center justify-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>PIN incorrecto. Usa <strong>1234</strong> para la demo.</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-warmgray-600 hover:bg-warmgray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition-all"
            >
              Ingresar
            </button>
          </div>

          <p className="text-[11px] text-center text-warmgray-400 pt-1">
            PIN de prueba por defecto: <strong>1234</strong>
          </p>
        </form>
      </div>
    </div>
  );
};
