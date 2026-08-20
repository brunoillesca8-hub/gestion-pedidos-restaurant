import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { QrCode, Search, X, Coffee, ChevronDown, ShoppingBag } from 'lucide-react';
import { TableSelectorModal } from './TableSelectorModal';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { tableNumber, isTableLockedByQR, restaurantSettings } = useOrders();
  const { totalItemsCount, setIsCartDrawerOpen } = useCart();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-warmgray-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 py-2">
          
          {/* Ultra Compact Single Line Header */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Left: Logo & Name */}
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-display font-bold text-xs sm:text-sm text-warmgray-900 leading-none truncate">
                    {restaurantSettings.name || 'Café & Bistró Bellavista'}
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" title="Abierto"></span>
                </div>
                <p className="text-[10px] text-warmgray-400 truncate leading-tight mt-0.5">
                  {restaurantSettings.tagline || 'Especialidad & Pastelería'}
                </p>
              </div>
            </div>

            {/* Right: Table Badge, Cart Icon & Search */}
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              
              {/* Mesa Badge */}
              <button
                onClick={() => setIsTableModalOpen(true)}
                className="flex items-center space-x-1 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 text-brand-900 px-2.5 py-1 rounded-full transition-all shadow-2xs"
              >
                <QrCode className="w-3 h-3 text-brand-600" />
                <span className="font-bold text-[11px]">
                  Mesa #{tableNumber}
                </span>
                {!isTableLockedByQR && (
                  <ChevronDown className="w-2.5 h-2.5 text-brand-500" />
                )}
              </button>

              {/* Quick Cart Button */}
              {totalItemsCount > 0 && (
                <button
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative p-1.5 rounded-full bg-brand-600 text-white shadow-xs"
                  aria-label="Ver Pedido"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-warmgray-950 text-[9px] font-black flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                </button>
              )}

              {/* Search Toggle */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) onSearchChange('');
                }}
                className={`p-1.5 rounded-full border transition-colors ${
                  isSearchOpen
                    ? 'bg-warmgray-900 text-white border-warmgray-900'
                    : 'bg-warmgray-50 text-warmgray-600 border-warmgray-200 hover:bg-warmgray-100'
                }`}
                aria-label="Buscar"
              >
                {isSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Search Input */}
          {isSearchOpen && (
            <div className="mt-2 pt-1.5 border-t border-warmgray-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-warmgray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar en el menú..."
                  className="w-full pl-8 pr-7 py-1 text-xs bg-warmgray-50 border border-warmgray-300 rounded-lg focus:bg-white focus:outline-none focus:border-brand-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Modal mesa */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </>
  );
};
