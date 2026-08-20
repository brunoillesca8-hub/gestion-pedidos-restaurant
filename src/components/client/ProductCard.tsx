import React from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Ban } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isAvailable = product.is_available;

  return (
    <div
      onClick={() => isAvailable && onSelect(product)}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-warmgray-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
        isAvailable ? 'cursor-pointer hover:border-brand-200' : 'opacity-65 cursor-not-allowed bg-warmgray-50'
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-warmgray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isAvailable ? 'group-hover:scale-105' : 'grayscale'
          }`}
          loading="lazy"
        />

        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.tags?.map((tag, i) => (
            <span
              key={i}
              className="bg-warmgray-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Agotado Overlay Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-warmgray-950/50 backdrop-blur-xs flex items-center justify-center">
            <span className="flex items-center space-x-1 bg-red-500/90 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Ban className="w-3.5 h-3.5" />
              <span>Agotado</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-semibold text-warmgray-900 text-sm md:text-base leading-snug line-clamp-1 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-warmgray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add Button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-warmgray-100">
          <span className="font-display font-bold text-sm md:text-base text-warmgray-900">
            {formatCurrency(product.price)}
          </span>

          {isAvailable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs active:scale-90"
              aria-label={`Agregar ${product.name}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <span className="text-[11px] font-medium text-red-500">No disponible</span>
          )}
        </div>
      </div>
    </div>
  );
};
