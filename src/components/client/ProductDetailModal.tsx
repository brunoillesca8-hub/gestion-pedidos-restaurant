import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import { X, Plus, Minus, MessageSquare, ShoppingBag, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setItemNotes('');
      setAddedAnimation(false);
    }
  }, [product]);

  if (!product) return null;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const subtotal = product.price * quantity;

  const handleAdd = () => {
    addToCart(product, quantity, itemNotes);
    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-warmgray-700 hover:bg-white flex items-center justify-center shadow-md transition-all"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative aspect-[16/10] w-full bg-warmgray-100 flex-shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
            {product.tags?.map((tag, i) => (
              <span
                key={i}
                className="bg-warmgray-950/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
          
          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display font-bold text-xl text-warmgray-900 leading-snug">
                {product.name}
              </h3>
              <span className="font-display font-bold text-lg text-brand-700 flex-shrink-0">
                {formatCurrency(product.price)}
              </span>
            </div>
            <p className="text-sm text-warmgray-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Special Instructions */}
          <div className="bg-warmgray-50 border border-warmgray-200/80 rounded-2xl p-3.5 space-y-2">
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-warmgray-800 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
              <span>Instrucciones especiales para este producto</span>
            </label>
            <p className="text-[11px] text-warmgray-500">
              ¿Deseas personalizar tu plato? (ej: sin hielo, término medio, leche vegetal, sin sal)
            </p>
            <textarea
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="Escribe aquí tus preferencias para cocina o barra..."
              rows={2}
              className="w-full text-xs md:text-sm p-2.5 bg-white border border-warmgray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none placeholder:text-warmgray-400"
            />
          </div>

          {/* Quantity & Add Action */}
          <div className="pt-2 border-t border-warmgray-100 flex items-center gap-3">
            
            {/* Quantity Selector */}
            <div className="flex items-center bg-warmgray-100 rounded-2xl p-1 border border-warmgray-200">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-warmgray-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-display font-bold text-base text-warmgray-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-warmgray-700 hover:bg-white transition-all"
                aria-label="Aumentar cantidad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-300 shadow-md ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 active:scale-[0.98]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Agregado al pedido!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar • {formatCurrency(subtotal)}</span>
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
