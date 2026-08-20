import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { AdminLoginModal } from './AdminLoginModal';
import { ProductFormModal } from './ProductFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MetricsOverview } from './MetricsOverview';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ShoppingBag,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    categories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    addCategory,
    updateCategory,
    deleteCategory,
    setCurrentRole
  } = useOrders();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  if (!isAuthenticated) {
    return (
      <AdminLoginModal
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => setCurrentRole('client')}
      />
    );
  }

  // Filtrado de productos
  const filteredProducts = products.filter(p => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    const query = searchFilter.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Panel Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-warmgray-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-warmgray-900 text-white flex items-center justify-center shadow-md">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-warmgray-900">
                Panel de Administración & Menú
              </h2>
              <p className="text-xs text-warmgray-500">
                Control de productos, categorías, precios y disponibilidad en tiempo real
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              className="py-2.5 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-brand-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="py-2.5 px-3.5 rounded-xl bg-warmgray-900 hover:bg-black text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <MetricsOverview />

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-warmgray-200 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-warmgray-900 text-white shadow-sm'
                : 'text-warmgray-600 hover:bg-warmgray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-warmgray-900 text-white shadow-sm'
                : 'text-warmgray-600 hover:bg-warmgray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías ({categories.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTOS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-warmgray-200">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar por nombre o descripción..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 text-xs bg-warmgray-50 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-3xl border border-warmgray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-warmgray-700">
                  <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3 text-center">Disponibilidad en Vivo</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warmgray-100">
                    {filteredProducts.map(product => {
                      const catName = categories.find(c => c.id === product.category_id)?.name || 'Sin Categoría';
                      return (
                        <tr key={product.id} className="hover:bg-warmgray-50/70 transition-colors">
                          
                          {/* Producto e Imagen */}
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 rounded-xl object-cover border border-warmgray-200 flex-shrink-0"
                              />
                              <div>
                                <span className="font-semibold text-warmgray-900 text-sm block">
                                  {product.name}
                                </span>
                                <span className="text-[11px] text-warmgray-400 line-clamp-1 max-w-xs">
                                  {product.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Categoría */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="bg-warmgray-100 text-warmgray-700 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                              {catName}
                            </span>
                          </td>

                          {/* Precio */}
                          <td className="px-4 py-3 whitespace-nowrap font-display font-bold text-warmgray-900">
                            {formatCurrency(product.price)}
                          </td>

                          {/* Switch Disponibilidad Inmediata */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => toggleProductAvailability(product.id)}
                              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                product.is_available
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                              }`}
                              title="Click para alternar Disponibilidad"
                            >
                              {product.is_available ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Disponible</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Agotado</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Acciones */}
                          <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-warmgray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Editar producto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-warmgray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORÍAS */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-warmgray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-warmgray-700">
                <thead className="bg-warmgray-50 border-b border-warmgray-200 text-warmgray-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Productos Asociados</th>
                    <th className="px-4 py-3 text-center">Visibilidad</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warmgray-100">
                  {categories.map(category => {
                    const count = products.filter(p => p.category_id === category.id).length;
                    return (
                      <tr key={category.id} className="hover:bg-warmgray-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-warmgray-900 text-sm">
                          {category.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-warmgray-500">{count} {count === 1 ? 'producto' : 'productos'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => updateCategory({ ...category, is_active: !category.is_active })}
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              category.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-warmgray-100 text-warmgray-500 border border-warmgray-200'
                            }`}
                          >
                            {category.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{category.is_active ? 'Visible' : 'Oculta'}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setCategoryToEdit(category);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-warmgray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar categoría "${category.name}"?`)) {
                                deleteCategory(category.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-warmgray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modales de formulario */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          productToEdit={productToEdit}
          categories={categories}
          onSave={(data) => {
            if (productToEdit) {
              updateProduct(data);
            } else {
              addProduct(data);
            }
          }}
        />

        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categoryToEdit={categoryToEdit}
          onSave={(data) => {
            if (categoryToEdit) {
              updateCategory(data);
            } else {
              addCategory(data);
            }
          }}
        />

      </div>
    </div>
  );
};
