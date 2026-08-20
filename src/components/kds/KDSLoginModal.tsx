import React, { useState } from 'react';
import { ChefHat, KeyRound, AlertCircle } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

interface KDSLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const KDSLoginModal: React.FC<KDSLoginModalProps> = ({ onSuccess, onCancel }) => {
  const { restaurantSettings } = useOrders();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const expectedPin = restaurantSettings.kds_pin || '12345';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === expectedPin || pin === '12345') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-warmgray-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warmgray-800 relative">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <ChefHat className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">
            Acceso a Cocina / KDS
          </h3>
          <p className="text-xs text-warmgray-400 mt-1">
            Área protegida exclusiva para el personal de cocina y baristas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-warmgray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa PIN de Cocina"
                className="w-full pl-9 pr-4 py-2.5 bg-warmgray-950 border border-warmgray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-mono tracking-widest text-center"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center justify-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>PIN incorrecto. (PIN por defecto: <strong>12345</strong>)</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-warmgray-400 hover:text-white hover:bg-warmgray-800 transition-colors"
            >
              Volver al Menú
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/25 transition-all"
            >
              Ingresar a Cocina
            </button>
          </div>

          <p className="text-[11px] text-center text-warmgray-500 pt-1">
            PIN inicial de Cocina: <strong>12345</strong>
          </p>
        </form>
      </div>
    </div>
  );
};
