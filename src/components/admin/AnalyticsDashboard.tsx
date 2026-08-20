import React, { useMemo } from 'react';
import { useOrders } from '../../context/OrderContext';
import { formatCurrency } from '../../utils/formatters';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#c27961', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AnalyticsDashboard: React.FC = () => {
  const { orders, categories, products } = useOrders();

  // 1. Métricas Principales
  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
  const completedOrders = orders.filter(o => o.status === 'entregado' || o.status === 'cerrado').length;
  const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'preparando').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

  // 2. Ventas agrupadas por Hora del Día para el Gráfico de Línea/Área
  const salesByHour = useMemo(() => {
    const hoursMap: Record<string, number> = {
      '09:00': 0,
      '11:00': 0,
      '13:00': 0,
      '15:00': 0,
      '17:00': 0,
      '19:00': 0,
      '21:00': 0
    };

    orders.forEach(order => {
      try {
        const d = new Date(order.created_at);
        const hour = d.getHours();
        if (hour < 10) hoursMap['09:00'] += order.total_amount;
        else if (hour < 12) hoursMap['11:00'] += order.total_amount;
        else if (hour < 14) hoursMap['13:00'] += order.total_amount;
        else if (hour < 16) hoursMap['15:00'] += order.total_amount;
        else if (hour < 18) hoursMap['17:00'] += order.total_amount;
        else if (hour < 20) hoursMap['19:00'] += order.total_amount;
        else hoursMap['21:00'] += order.total_amount;
      } catch {
        hoursMap['13:00'] += order.total_amount;
      }
    });

    return Object.entries(hoursMap).map(([hora, total]) => ({
      hora,
      ventas: total
    }));
  }, [orders]);

  // 3. Ventas por Categoría para Gráfico Circular (PieChart)
  const salesByCategory = useMemo(() => {
    const catMap: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        const cat = categories.find(c => c.id === prod?.category_id);
        const catName = cat?.name || 'General';
        catMap[catName] = (catMap[catName] || 0) + item.subtotal;
      });
    });

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value
    }));
  }, [orders, products, categories]);

  // 4. Top 5 Platos Más Vendidos (BarChart)
  const topProducts = useMemo(() => {
    const prodMap: Record<string, { name: string; unidades: number; total: number }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!prodMap[item.product_name]) {
          prodMap[item.product_name] = { name: item.product_name, unidades: 0, total: 0 };
        }
        prodMap[item.product_name].unidades += item.quantity;
        prodMap[item.product_name].total += item.subtotal;
      });
    });

    return Object.values(prodMap)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Ingresos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-xl md:text-2xl text-warmgray-900 mt-2">
            {formatCurrency(totalSales)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Facturación acumulada</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Comandas Totales</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-xl md:text-2xl text-warmgray-900 mt-2">
            {totalOrders}
          </p>
          <span className="text-[11px] text-warmgray-500 mt-1 block">
            {pendingOrders} en curso • {completedOrders} cerradas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-xl md:text-2xl text-warmgray-900 mt-2">
            {formatCurrency(averageTicket)}
          </p>
          <span className="text-[11px] text-warmgray-500 mt-1 block">
            Gasto medio por mesa
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-warmgray-500 uppercase tracking-wider">Eficacia Cocina</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-display font-bold text-xl md:text-2xl text-warmgray-900 mt-2">
            {completionRate}%
          </p>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Tasa de despacho y cierre
          </span>
        </div>

      </div>

      {/* Gráficas: Curva de Ventas por Hora & Distribución por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Ventas en el Día (AreaChart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-warmgray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>Curva de Ventas por Horario</span>
              </h3>
              <p className="text-xs text-warmgray-500">Comportamiento económico de la jornada</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
              Hoy
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByHour} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ventasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c27961" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c27961" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ece6" />
                <XAxis dataKey="hora" stroke="#968e87" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#968e87"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number | undefined) => [formatCurrency(val ?? 0), 'Ventas']}
                  labelFormatter={(l) => `Horario: ${l}`}
                  contentStyle={{
                    backgroundColor: '#262220',
                    color: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#c27961"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#ventasGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Ventas por Categoría (PieChart) */}
        <div className="bg-white p-5 rounded-3xl border border-warmgray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-base text-warmgray-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-brand-600" />
                <span>Por Categoría</span>
              </h3>
            </div>
            <p className="text-xs text-warmgray-500">Distribución de ingresos por tipo de producto</p>
          </div>

          <div className="h-56 w-full my-auto">
            {salesByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-warmgray-400">
                Sin datos suficientes
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number | undefined) => [formatCurrency(val ?? 0), 'Ventas']}
                    contentStyle={{
                      backgroundColor: '#262220',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-warmgray-100 text-[11px]">
            {salesByCategory.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center space-x-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                ></span>
                <span className="text-warmgray-600 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top 5 Platos Más Vendidos (BarChart) */}
      <div className="bg-white p-5 rounded-3xl border border-warmgray-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-warmgray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top 5 Platos & Bebidas Más Vendidos</span>
            </h3>
            <p className="text-xs text-warmgray-500">Ranking por unidades despachadas</p>
          </div>
        </div>

        <div className="h-60 w-full">
          {topProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-warmgray-400">
              Aún no hay comandas registradas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0ece6" />
                <XAxis type="number" stroke="#968e87" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#47413d"
                  fontSize={11}
                  width={140}
                  tickFormatter={(val) => (val.length > 20 ? `${val.substring(0, 18)}...` : val)}
                />
                <Tooltip
                  formatter={(val: number | undefined) => [`${val ?? 0} unidades vendidas`, 'Cantidad']}
                  contentStyle={{
                    backgroundColor: '#262220',
                    color: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="unidades" fill="#c27961" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
};
