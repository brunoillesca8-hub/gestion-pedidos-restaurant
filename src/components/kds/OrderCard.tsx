import React from 'react';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { KDSTimer } from './KDSTimer';
import { MessageSquare, Check, ChefHat, Clock, CheckCheck, Archive, Sparkles } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  isNewAlert?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, isNewAlert }) => {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock
        };
      case 'preparando':
        return {
          label: 'En Preparación',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ChefHat
        };
      case 'entregado':
        return {
          label: 'Entregado',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCheck
        };
      case 'cerrado':
        return {
          label: 'Cerrado / Pagado',
          color: 'bg-warmgray-100 text-warmgray-700 border-warmgray-300',
          icon: Archive
        };
    }
  };

  const currentBadge = getStatusBadge(order.status);
  const StatusIcon = currentBadge.icon;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm flex flex-col justify-between overflow-hidden relative ${
        isNewAlert
          ? 'border-brand-500 ring-4 ring-brand-500/20 animate-bounce-short shadow-xl'
          : order.status === 'pendiente'
          ? 'border-amber-300'
          : order.status === 'preparando'
          ? 'border-blue-300'
          : order.status === 'entregado'
          ? 'border-emerald-300'
          : 'border-warmgray-200 opacity-75'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-warmgray-50/70 border-b border-warmgray-200/80">
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-xl text-warmgray-900 bg-white px-2.5 py-1 rounded-xl border border-warmgray-200 shadow-xs">
              Mesa #{order.table_number}
            </span>
            <span className="font-mono text-xs font-semibold text-warmgray-600">
              {order.id}
            </span>
            {isNewAlert && (
              <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                ¡NUEVA!
              </span>
            )}
          </div>

          <KDSTimer createdAt={order.created_at} status={order.status} />
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-warmgray-200/50 text-xs">
          <div className="flex items-center space-x-1.5 text-warmgray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Ingreso: <strong>{formatTime(order.created_at)}</strong></span>
          </div>

          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold border ${currentBadge.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{currentBadge.label}</span>
          </span>
        </div>
      </div>

      {/* Item Breakdown (Platos y notas específicas) */}
      <div className="p-4 flex-1 space-y-3">
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="border-b border-warmgray-100 pb-2.5 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2">
                  <span className="w-6 h-6 rounded-md bg-warmgray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.quantity}
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-warmgray-900 leading-snug">
                      {item.product_name}
                    </h5>
                  </div>
                </div>
                <span className="text-xs font-semibold text-warmgray-500 font-display">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>

              {/* NOTA ESPECÍFICA RESALTADA */}
              {item.item_notes && (
                <div className="mt-1.5 ml-8 bg-amber-50 border-l-3 border-amber-500 text-amber-900 p-2 rounded-r-lg text-xs flex items-start space-x-1.5 shadow-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{item.item_notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* NOTAS GENERALES DEL PEDIDO */}
        {order.general_notes && (
          <div className="mt-3 bg-brand-50 border border-brand-200/80 p-2.5 rounded-xl text-xs text-brand-950">
            <span className="font-bold block text-brand-800 uppercase tracking-wider text-[10px] mb-0.5">
              Nota general de mesa:
            </span>
            <p className="italic">{order.general_notes}</p>
          </div>
        )}
      </div>

      {/* Footer & State Transition Actions */}
      <div className="p-4 bg-warmgray-50/90 border-t border-warmgray-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-warmgray-500 font-medium">Total comanda:</span>
          <span className="font-display font-bold text-sm text-warmgray-900">
            {formatCurrency(order.total_amount)}
          </span>
        </div>

        {/* Botones de acción según el flujo */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {order.status === 'pendiente' && (
            <>
              <button
                onClick={() => onStatusChange(order.id, 'preparando')}
                className="col-span-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <ChefHat className="w-4 h-4" />
                <span>Iniciar Preparación</span>
              </button>
            </>
          )}

          {order.status === 'preparando' && (
            <>
              <button
                onClick={() => onStatusChange(order.id, 'pendiente')}
                className="py-2 px-2 bg-warmgray-200 hover:bg-warmgray-300 text-warmgray-700 rounded-xl text-xs font-semibold transition-all"
              >
                Volver a Pendiente
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'entregado')}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Marcar Entregado</span>
              </button>
            </>
          )}

          {order.status === 'entregado' && (
            <>
              <button
                onClick={() => onStatusChange(order.id, 'preparando')}
                className="py-2 px-2 bg-warmgray-200 hover:bg-warmgray-300 text-warmgray-700 rounded-xl text-xs font-semibold transition-all"
              >
                En Cocina
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'cerrado')}
                className="py-2 px-3 bg-warmgray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Archive className="w-4 h-4" />
                <span>Cobrar y Cerrar</span>
              </button>
            </>
          )}

          {order.status === 'cerrado' && (
            <button
              onClick={() => onStatusChange(order.id, 'entregado')}
              className="col-span-2 py-2 px-3 bg-warmgray-200 hover:bg-warmgray-300 text-warmgray-800 rounded-xl text-xs font-semibold transition-all"
            >
              Reabrir Comanda
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
