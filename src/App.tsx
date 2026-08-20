import React from 'react';
import { OrderProvider, useOrders } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { ClientView } from './components/client/ClientView';
import { KDSView } from './components/kds/KDSView';
import { AdminView } from './components/admin/AdminView';

const AppContent: React.FC = () => {
  const { currentRole } = useOrders();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-warmgray-900 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      {/* Main View Router - En la vista de cliente no se muestra NINGUNA barra de cocina ni admin */}
      <main className="flex-1">
        {currentRole === 'client' && <ClientView />}
        {currentRole === 'kds' && <KDSView />}
        {currentRole === 'admin' && <AdminView />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <OrderProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </OrderProvider>
  );
};

export default App;
