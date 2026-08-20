import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { totalItemsCount, totalAmount, setIsCartDrawerOpen } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <aside aria-label="Carrito de compras" className="fixed bottom-3 inset-x-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="w-full bg-warmgray-950/95 hover:bg-warmgray-900 text-white p-3.5 rounded-2xl shadow-xl shadow-warmgray-950/30 backdrop-blur-md border border-warmgray-800 flex items-center justify-between transition-all duration-300 active:scale-[0.98] group"
        >
          {/* Left: Badge + Count */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-warmgray-950 text-[11px] font-bold flex items-center justify-center shadow-xs">
                {totalItemsCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-warmgray-400 font-medium">Tu pedido actual</p>
              <p className="text-sm font-bold text-white font-display">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Right: Action */}
          <div className="flex items-center space-x-2 bg-brand-600/90 group-hover:bg-brand-600 px-4 py-2 rounded-xl text-xs font-bold text-white tracking-wide uppercase transition-colors">
            <span>Ver Pedido</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </aside>
  );
};
