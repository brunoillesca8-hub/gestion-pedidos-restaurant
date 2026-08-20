import React from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Ban, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isAvailable = product.is_available;

  return (
    <div
      onClick={() => isAvailable && onSelect(product)}
      className={`group relative bg-white rounded-xl overflow-hidden border border-warmgray-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between ${
        isAvailable ? 'cursor-pointer hover:border-brand-300' : 'opacity-60 cursor-not-allowed bg-warmgray-50'
      }`}
    >
      {/* Product Image & Micro-Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-warmgray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isAvailable ? 'group-hover:scale-105' : 'grayscale'
          }`}
          loading="lazy"
        />

        {/* Micro Tags (Ultra Compact) */}
        <div className="absolute top-1 left-1 flex flex-wrap gap-0.5 pointer-events-none">
          {product.tags?.slice(0, 1).map((tag, i) => (
            <span
              key={i}
              className="bg-warmgray-950/80 backdrop-blur-2xs text-white text-[8px] font-semibold px-1.5 py-0.2 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Agotado Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-warmgray-950/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="flex items-center space-x-0.5 bg-red-600/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              <Ban className="w-2.5 h-2.5" />
              <span>Agotado</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content (Compact Title & Price) */}
      <div className="p-2 flex-1 flex flex-col justify-between">
        <h4 className="font-display font-semibold text-warmgray-900 text-[11px] sm:text-xs leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h4>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-warmgray-100/70">
          <span className="font-display font-bold text-[11px] sm:text-xs text-warmgray-900">
            {formatCurrency(product.price)}
          </span>
          {isAvailable && (
            <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
              <Plus className="w-3 h-3 stroke-[2.5]" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
