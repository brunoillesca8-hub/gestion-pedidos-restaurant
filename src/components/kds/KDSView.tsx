import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { OrderCard } from './OrderCard';
import { KDSLoginModal } from './KDSLoginModal';
import { playOrderChime } from '../../utils/soundAlert';
import { ChefHat, Volume2, Search, CheckCircle2, Lock, RefreshCw, Radio } from 'lucide-react';
import { OrderStatus } from '../../types';

export const KDSView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    newOrderAlertId,
    clearNewOrderAlert,
    isKDSAuthenticated,
    setIsKDSAuthenticated,
    setCurrentRole,
    restaurantSettings,
    manualRefreshOrders,
    isLoading
  } = useOrders();

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'activas' | 'todas'>('activas');
  const [searchTable, setSearchTable] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Proteger acceso: si no está autenticado, mostrar modal de contraseña
  if (!isKDSAuthenticated) {
    return (
      <KDSLoginModal
        onSuccess={() => setIsKDSAuthenticated(true)}
        onCancel={() => setCurrentRole('client')}
      />
    );
  }

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await manualRefreshOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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
    let matchesTab = true;
    if (filterStatus === 'activas') {
      matchesTab = order.status === 'pendiente' || order.status === 'preparando';
    } else if (filterStatus !== 'todas') {
      matchesTab = order.status === filterStatus;
    }

    const query = searchTable.trim().toLowerCase();
    const matchesSearch =
      !query ||
      String(order.table_number).toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-warmgray-900 text-warmgray-100 p-3 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* KDS Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-warmgray-950/80 p-4 rounded-2xl border border-warmgray-800 backdrop-blur-md">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-bold text-base md:text-lg text-white">
                  {restaurantSettings.name || 'Cocina & Barra'} • KDS en Vivo
                </h2>
                <span className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>En Vivo</span>
                </span>
              </div>
              <p className="text-[11px] text-warmgray-400">
                Sincronizado con Turso Cloud • Recepción instantánea de mesas
              </p>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-warmgray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                placeholder="Buscar Mesa o #CMD..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-warmgray-900 border border-warmgray-700 rounded-xl text-white focus:outline-none focus:border-brand-500 placeholder:text-warmgray-500"
              />
            </div>

            {/* Test / Enable Sound Button */}
            <button
              onClick={() => playOrderChime()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-warmgray-800 hover:bg-warmgray-700 text-warmgray-200 border border-warmgray-700 text-xs font-semibold transition-colors"
              title="Activar o probar sonido de campana"
            >
              <Volume2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Probar Timbre</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-warmgray-800 hover:bg-warmgray-700 text-warmgray-300 border border-warmgray-700 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refrescar comandas manualmente"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
              <span>{isRefreshing ? 'Actualizando...' : 'Refrescar'}</span>
            </button>

            {/* Lock / Exit KDS Button */}
            <button
              onClick={() => {
                setIsKDSAuthenticated(false);
                setCurrentRole('client');
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs font-semibold transition-colors"
              title="Bloquear y salir de cocina"
            >
              <Lock className="w-3 h-3" />
              <span>Bloquear</span>
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
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-warmgray-950 text-warmgray-400 border border-warmgray-800 hover:bg-warmgray-800 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
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
          <div className="py-16 text-center bg-warmgray-950/40 rounded-3xl border border-warmgray-800/80">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-warmgray-600 opacity-60" />
            <h3 className="font-display font-bold text-base text-warmgray-300">
              No hay comandas en este estado
            </h3>
            <p className="text-xs text-warmgray-500 max-w-sm mx-auto mt-1">
              Las nuevas órdenes enviadas desde cualquier celular aparecerán aquí automáticamente cada 2 segundos con alerta sonora.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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
