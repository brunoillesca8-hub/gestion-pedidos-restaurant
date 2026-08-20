import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { Utensils, Smartphone, ChefHat, Settings, RotateCcw, QrCode } from 'lucide-react';
import { ViewRole } from '../../types';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setCurrentRole, orders, tableNumber, resetToSeedData } = useOrders();
  const { totalItemsCount } = useCart();

  const pendingCookingCount = orders.filter(
    o => o.status === 'pendiente' || o.status === 'preparando'
  ).length;

  const roles: { id: ViewRole; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'client', label: 'Cliente (Móvil)', icon: Smartphone, badge: totalItemsCount > 0 ? totalItemsCount : undefined },
    { id: 'kds', label: 'Cocina (KDS)', icon: ChefHat, badge: pendingCookingCount > 0 ? pendingCookingCount : undefined },
    { id: 'admin', label: 'Admin / Menú', icon: Settings }
  ];

  return (
    <div className="sticky top-0 z-50 bg-warmgray-950/95 backdrop-blur-md border-b border-warmgray-800 text-white px-3 py-2">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-sm">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-semibold tracking-wide hidden sm:inline text-warmgray-200">
            Gourmet QR & KDS
          </span>
          <span className="bg-brand-900/60 text-brand-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-brand-700/50">
            DEMO
          </span>
        </div>

        {/* Role Tabs Switcher */}
        <div className="flex items-center bg-warmgray-900 p-1 rounded-xl border border-warmgray-800 space-x-1">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-warmgray-400 hover:text-warmgray-200 hover:bg-warmgray-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {r.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-brand-700' : 'bg-brand-500 text-white animate-pulse'
                    }`}
                  >
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center space-x-2">
          {currentRole === 'client' && (
            <div className="flex items-center space-x-1 text-warmgray-300 bg-warmgray-900 px-2.5 py-1 rounded-lg border border-warmgray-800 text-xs">
              <QrCode className="w-3.5 h-3.5 text-brand-400" />
              <span>Mesa <strong>#{tableNumber}</strong></span>
            </div>
          )}

          <button
            onClick={() => {
              if (window.confirm('¿Deseas reiniciar los datos de muestra a su estado inicial?')) {
                resetToSeedData();
              }
            }}
            title="Restablecer datos de prueba"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-warmgray-400 hover:text-white hover:bg-warmgray-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reiniciar Demo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
