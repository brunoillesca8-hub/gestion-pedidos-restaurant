import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';
import { OrderItem, Order } from '../../types';
import { X, Trash2, Plus, Minus, Send, MessageSquare, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess }) => {
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount
  } = useCart();

  const { tableNumber, createOrder } = useOrders();
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleSendToKitchen = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cartItems.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        quantity: item.quantity,
        unit_price: item.product.price,
        item_notes: item.item_notes,
        subtotal: item.product.price * item.quantity
      }));

      const created = await createOrder(tableNumber, orderItems, generalNotes);
      clearCart();
      setGeneralNotes('');
      setIsCartDrawerOpen(false);
      onOrderSuccess(created);
    } catch {
      alert('Error al enviar la comanda. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-warmgray-200 flex items-center justify-between bg-warmgray-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-lg text-warmgray-900">
                Resumen de Comanda
              </h3>
              <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-brand-200">
                Mesa #{tableNumber}
              </span>
            </div>
            <p className="text-xs text-warmgray-500">Revisa tus platos antes de enviar a cocina</p>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-2 rounded-full text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-warmgray-100 space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-warmgray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No hay productos en tu pedido</p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="pt-3 first:pt-0 flex gap-3">
                {/* Image */}
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-warmgray-200 flex-shrink-0"
                />

                {/* Info & notes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-warmgray-900 leading-tight">
                      {item.product.name}
                    </h4>
                    <span className="text-sm font-bold text-warmgray-900 font-display flex-shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Specific item notes highlighted */}
                  {item.item_notes ? (
                    <div className="mt-1 bg-amber-50/90 border border-amber-200/70 text-amber-900 text-[11px] px-2 py-1 rounded-lg flex items-start space-x-1">
                      <MessageSquare className="w-3 h-3 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span className="italic font-medium">{item.item_notes}</span>
                    </div>
                  ) : null}

                  {/* Quantity and delete controls */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center bg-warmgray-100 rounded-lg p-0.5 border border-warmgray-200">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-warmgray-600 hover:bg-white text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-warmgray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-warmgray-600 hover:bg-white text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-xs text-warmgray-400 hover:text-red-600 flex items-center space-x-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* General Notes Input */}
          {cartItems.length > 0 && (
            <div className="pt-4 mt-2">
              <label className="block text-xs font-semibold text-warmgray-700 uppercase tracking-wider mb-1.5">
                Notas generales para la cocina / garzón (Opcional)
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Ej: Traer todo junto, servilletas adicionales, agua con hielo..."
                rows={2}
                className="w-full text-xs p-3 bg-warmgray-50 border border-warmgray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none placeholder:text-warmgray-400"
              />
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-warmgray-200 bg-warmgray-50/70 space-y-3">
            <div className="flex items-center justify-between text-sm text-warmgray-600">
              <span>Subtotal productos</span>
              <span className="font-semibold text-warmgray-900">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-warmgray-200/60">
              <span className="font-display font-bold text-base text-warmgray-900">Total a Pagar en Caja</span>
              <span className="font-display font-bold text-xl text-brand-700">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              onClick={handleSendToKitchen}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido a Cocina</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-warmgray-500">
              El pago se realiza directamente en caja o con el mesero al terminar.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
