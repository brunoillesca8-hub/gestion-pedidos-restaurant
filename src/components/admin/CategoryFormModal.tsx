import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { X, Save } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit: Category | null;
  onSave: (categoryData: any) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSave
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Coffee');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setIcon(categoryToEdit.icon || 'Coffee');
      setIsActive(categoryToEdit.is_active);
    } else {
      setName('');
      setIcon('Coffee');
      setIsActive(true);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(categoryToEdit ? { id: categoryToEdit.id, order_index: categoryToEdit.order_index } : {}),
      name: name.trim(),
      icon,
      is_active: isActive
    });
    onClose();
  };

  const iconsList = [
    { id: 'Coffee', label: 'Cafetería' },
    { id: 'UtensilsCrossed', label: 'Comidas / Platos' },
    { id: 'Cake', label: 'Pastelería' },
    { id: 'GlassWater', label: 'Bebidas' },
    { id: 'Salad', label: 'Bowls & Ensaladas' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warmgray-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-warmgray-100">
          <h3 className="font-display font-bold text-lg text-warmgray-900">
            {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Desayunos & Brunch"
              className="w-full px-3.5 py-2.5 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Tipo de Ícono
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {iconsList.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          {/* Switch Activa */}
          <div className="flex items-center justify-between bg-warmgray-50 p-3 rounded-2xl border border-warmgray-200">
            <span className="text-xs font-bold text-warmgray-900">Categoría Visible en Menú</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-warmgray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-warmgray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-warmgray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-warmgray-600 hover:bg-warmgray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
