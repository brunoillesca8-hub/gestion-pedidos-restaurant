import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Sparkles, QrCode, Search, X, Coffee, ChevronDown } from 'lucide-react';
import { TableSelectorModal } from './TableSelectorModal';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { tableNumber, isTableLockedByQR, restaurantSettings } = useOrders();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-warmgray-200 sticky top-[45px] z-30 shadow-xs">
        <div className="max-w-md md:max-w-4xl mx-auto px-4 py-3">
          
          {/* Top Bar: Dynamic Restaurant info & Table Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-display font-bold text-base md:text-lg text-warmgray-900 leading-tight">
                    {restaurantSettings.name || 'Café & Bistró'}
                  </h1>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-xs text-warmgray-500 flex items-center gap-1">
                  <span>{restaurantSettings.tagline || 'Especialidad & Pastelería'}</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-600 font-medium">Abierto</span>
                </p>
              </div>
            </div>

            {/* Table Badge */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsTableModalOpen(true)}
                className="group flex items-center space-x-1.5 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 text-brand-900 px-3 py-1.5 rounded-full transition-all duration-200 shadow-xs"
              >
                <QrCode className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-xs tracking-tight">
                  Mesa #{tableNumber}
                </span>
                {!isTableLockedByQR && (
                  <ChevronDown className="w-3 h-3 text-brand-500 group-hover:translate-y-0.5 transition-transform" />
                )}
              </button>

              {/* Search Toggle */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) onSearchChange('');
                }}
                className={`p-2 rounded-full border transition-colors ${
                  isSearchOpen
                    ? 'bg-warmgray-900 text-white border-warmgray-900'
                    : 'bg-warmgray-50 text-warmgray-600 border-warmgray-200 hover:bg-warmgray-100'
                }`}
                aria-label="Buscar en el menú"
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Search Input Accordion */}
          {isSearchOpen && (
            <div className="mt-3 pt-2 border-t border-warmgray-100 transition-all duration-300">
              <div className="relative">
                <Search className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar café, sándwich, postre..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-warmgray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </header>

      {/* Modal para cambiar o ingresar mesa */}
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
    </>
  );
};
