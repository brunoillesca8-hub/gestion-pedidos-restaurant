import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, ShoppingBag, TrendingUp, Award } from 'lucide-react';

export const MetricsOverview: React.FC = () => {
  const { orders } = useOrders();

  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  // Calcular producto más vendido
  const productCountMap: Record<string, { name: string; count: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productCountMap[item.product_id]) {
        productCountMap[item.product_id] = { name: item.product_name, count: 0 };
      }
      productCountMap[item.product_id].count += item.quantity;
    });
  });

  const topProduct = Object.values(productCountMap).sort((a, b) => b.count - a.count)[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      
      {/* Total Ventas */}
      <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Ventas Totales</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="font-display font-bold text-lg md:text-2xl text-warmgray-900 mt-2">
          {formatCurrency(totalSales)}
        </p>
        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" />
          <span>Comandas de la jornada</span>
        </span>
      </div>

      {/* Total Comandas */}
      <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Comandas</span>
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <p className="font-display font-bold text-lg md:text-2xl text-warmgray-900 mt-2">
          {totalOrdersCount}
        </p>
        <span className="text-[11px] text-warmgray-500 mt-1 block">
          Mesas atendidas
        </span>
      </div>

      {/* Ticket Promedio */}
      <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Ticket Promedio</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="font-display font-bold text-lg md:text-2xl text-warmgray-900 mt-2">
          {formatCurrency(averageTicket)}
        </p>
        <span className="text-[11px] text-warmgray-500 mt-1 block">
          Gasto medio por mesa
        </span>
      </div>

      {/* Plato Estrella */}
      <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Plato Estrella</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <p className="font-display font-bold text-sm md:text-base text-warmgray-900 mt-2 line-clamp-1">
          {topProduct ? topProduct.name : 'Sin pedidos aún'}
        </p>
        <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
          {topProduct ? `${topProduct.count} unidades servidas` : '-'}
        </span>
      </div>

    </div>
  );
};
