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
    <div className="sticky top-0 z-50 bg-warmgray-950/95 backdrop-blur-md border-b border-warmgray-800 text-white px-2 py-1">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 text-xs">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded-md bg-brand-500 flex items-center justify-center text-white shadow-xs">
            <Utensils className="w-3 h-3" />
          </div>
          <span className="bg-brand-900/80 text-brand-300 px-1 py-0.2 rounded text-[9px] font-mono border border-brand-700/50">
            DEMO
          </span>
        </div>

        {/* Role Tabs Switcher (Ultra Compact) */}
        <div className="flex items-center bg-warmgray-900 p-0.5 rounded-lg border border-warmgray-800 space-x-0.5">
          {roles.map(r => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`relative flex items-center space-x-1 px-2 py-1 rounded-md font-medium text-[11px] transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs font-semibold'
                    : 'text-warmgray-400 hover:text-warmgray-200 hover:bg-warmgray-800/60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{r.label}</span>
                <span className="sm:hidden">{r.id === 'client' ? 'Móvil' : r.id === 'kds' ? 'Cocina' : 'Admin'}</span>
                {r.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1 py-0.1 rounded-full text-[9px] font-bold ${
                      isActive ? 'bg-white text-brand-700' : 'bg-brand-500 text-white'
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
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar datos de prueba?')) {
                resetToSeedData();
              }
            }}
            title="Restablecer datos"
            className="p-1 rounded-md text-warmgray-400 hover:text-white hover:bg-warmgray-800 text-[10px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
