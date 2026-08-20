import React, { useEffect } from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, ChefHat, CheckCheck, X, Sparkles } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { orders } = useOrders();

  // Obtener estado fresco en tiempo real
  const currentOrder = order ? (orders.find(o => o.id === order.id) || order) : null;

  useEffect(() => {
    if (order) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#c27961', '#b0604a', '#e1bdab', '#f59e0b', '#10b981']
        });
      } catch {}
    }
  }, [order]);

  if (!currentOrder) return null;

  const statusSteps = [
    { key: 'pendiente', label: 'Recibido', desc: 'En cola de cocina', icon: Clock },
    { key: 'preparando', label: 'En Preparación', desc: 'El chef está cocinando', icon: ChefHat },
    { key: 'entregado', label: 'Entregado', desc: '¡Disfruta en tu mesa!', icon: CheckCheck }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'pendiente') return 0;
    if (status === 'preparando') return 1;
    if (status === 'entregado' || status === 'cerrado') return 2;
    return 0;
  };

  const currentStep = getStepIndex(currentOrder.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warmgray-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Badge */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          
          <div className="inline-flex items-center space-x-1.5 bg-brand-100 text-brand-900 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider mb-2 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>COMANDA {currentOrder.id}</span>
          </div>

          <h3 className="font-display font-bold text-2xl text-warmgray-900">
            ¡Pedido Enviado a Cocina!
          </h3>
          <p className="text-xs text-warmgray-500 mt-1">
            Mesa #{currentOrder.table_number} • {new Date(currentOrder.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Live Status Tracker */}
        <div className="my-6 bg-warmgray-50 p-4 rounded-2xl border border-warmgray-200/80">
          <h4 className="text-[11px] font-bold text-warmgray-500 uppercase tracking-wider mb-3">
            Estado de tu pedido en tiempo real
          </h4>
          <div className="space-y-3">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-warmgray-200 text-warmgray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isCompleted ? 'text-warmgray-900' : 'text-warmgray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-warmgray-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items Summary */}
        <div className="border-t border-b border-warmgray-100 py-3 space-y-2">
          <p className="text-xs font-bold text-warmgray-700 uppercase tracking-wider">Detalle del Pedido</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {currentOrder.items.map((it, i) => (
              <div key={i} className="flex justify-between text-xs text-warmgray-700">
                <span>
                  <strong className="text-warmgray-900">{it.quantity}x</strong> {it.product_name}
                  {it.item_notes && (
                    <span className="block text-[11px] text-amber-700 italic">└ {it.item_notes}</span>
                  )}
                </span>
                <span className="font-semibold text-warmgray-900">{formatCurrency(it.subtotal)}</span>
              </div>
            ))}
          </div>
          {currentOrder.general_notes && (
            <p className="text-[11px] bg-warmgray-100 p-2 rounded-lg text-warmgray-700 italic mt-2">
              <strong>Nota:</strong> {currentOrder.general_notes}
            </p>
          )}
        </div>

        {/* Payment notice banner required by prompt */}
        <div className="my-4 bg-brand-50 border border-brand-200 p-3.5 rounded-2xl text-center">
          <p className="text-xs text-brand-950 font-medium leading-relaxed">
            📢 <em>Tu pedido fue enviado a cocina. El pago se realiza en caja al finalizar tu consumo.</em>
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-warmgray-900 hover:bg-warmgray-800 text-white font-semibold text-sm transition-all"
          >
            Seguir viendo el menú
          </button>
        </div>

      </div>
    </div>
  );
};
