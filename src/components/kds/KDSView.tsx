import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { OrderCard } from './OrderCard';
import { playOrderChime } from '../../utils/soundAlert';
import { ChefHat, Volume2, Search, Filter, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { OrderStatus } from '../../types';

export const KDSView: React.FC = () => {
  const { orders, updateOrderStatus, newOrderAlertId, clearNewOrderAlert } = useOrders();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'activas' | 'todas'>('activas');
  const [searchTable, setSearchTable] = useState('');

  const filterTabs: { id: OrderStatus | 'activas' | 'todas'; label: string; count: number }[] = [
    {
      id: 'activas',
      label: 'En Curso',
      count: orders.filter(o => o.status === 'pendiente' || o.status === 'preparando').length
    },
    {
      id: 'pendiente',
      label: 'Pendientes',
      count: orders.filter(o => o.status === 'pendiente').length
    },
    {
      id: 'preparando',
      label: 'En Preparación',
      count: orders.filter(o => o.status === 'preparando').length
    },
    {
      id: 'entregado',
      label: 'Entregados',
      count: orders.filter(o => o.status === 'entregado').length
    },
    {
      id: 'cerrado',
      label: 'Cerrados',
      count: orders.filter(o => o.status === 'cerrado').length
    },
    {
      id: 'todas',
      label: 'Historial Completo',
      count: orders.length
    }
  ];

  const filteredOrders = orders.filter(order => {
    // Filtro por tab
    let matchesTab = true;
    if (filterStatus === 'activas') {
      matchesTab = order.status === 'pendiente' || order.status === 'preparando';
    } else if (filterStatus !== 'todas') {
      matchesTab = order.status === filterStatus;
    }

    // Filtro por mesa o comanda
    const query = searchTable.trim().toLowerCase();
    const matchesSearch =
      !query ||
      String(order.table_number).toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-warmgray-900 text-warmgray-100 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* KDS Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-warmgray-950/80 p-5 rounded-3xl border border-warmgray-800 backdrop-blur-md">
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-bold text-xl text-white">
                  KDS • Monitor de Cocina & Barra
                </h2>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-xs text-warmgray-400">
                Recepción y despacho de comandas en tiempo real
              </p>
            </div>
          </div>

          {/* Quick Tools: Test Sound & Search */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-warmgray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="Buscar Mesa o #CMD..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-warmgray-900 border border-warmgray-700 rounded-xl text-white focus:outline-none focus:border-brand-500 placeholder:text-warmgray-500"
              />
            </div>

            {/* Test Sound Button */}
            <button
              onClick={() => playOrderChime()}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-warmgray-800 hover:bg-warmgray-700 text-warmgray-200 border border-warmgray-700 text-xs font-semibold transition-colors"
              title="Probar sonido de notificación"
            >
              <Volume2 className="w-4 h-4 text-brand-400" />
              <span>Probar Timbre</span>
            </button>

          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-warmgray-950 text-warmgray-400 border border-warmgray-800 hover:bg-warmgray-800 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-warmgray-800 text-warmgray-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Orders Grid / Kanban */}
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-warmgray-950/40 rounded-3xl border border-warmgray-800/80">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-warmgray-600 opacity-60" />
            <h3 className="font-display font-bold text-lg text-warmgray-300">
              No hay comandas en este estado
            </h3>
            <p className="text-xs text-warmgray-500 max-w-sm mx-auto mt-1">
              Las nuevas órdenes enviadas por los comensales aparecerán aquí de forma instantánea con alerta sonora.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isNewAlert={newOrderAlertId === order.id}
                onStatusChange={(id, status) => {
                  if (newOrderAlertId === id) clearNewOrderAlert();
                  updateOrderStatus(id, status);
                }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
