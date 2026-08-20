import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { X, QrCode, Check } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSelectorModal: React.FC<TableSelectorModalProps> = ({ isOpen, onClose }) => {
  const { tableNumber, setTableNumber, isTableLockedByQR } = useOrders();
  const [selectedTable, setSelectedTable] = useState(tableNumber);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const quickTables = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Terraza 1', 'Terraza 2', 'Barra'];

  const handleSave = () => {
    const finalTable = customInput.trim() ? customInput.trim() : selectedTable;
    setTableNumber(finalTable);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-warmgray-100 relative animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-warmgray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-warmgray-900 text-base">
                Selección de Mesa
              </h3>
              <p className="text-xs text-warmgray-500">
                {isTableLockedByQR ? 'Asignada automáticamente por código QR' : 'Indica en qué mesa te encuentras'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-warmgray-400 hover:text-warmgray-600 hover:bg-warmgray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-warmgray-700 uppercase tracking-wider mb-2">
              Mesas Frecuentes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickTables.map((t) => {
                const isSelected = selectedTable === t && !customInput;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTable(t);
                      setCustomInput('');
                    }}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-warmgray-50 text-warmgray-700 border-warmgray-200 hover:border-brand-300'
                    }`}
                  >
                    {t.startsWith('Terraza') || t.startsWith('Barra') ? t : `#${t}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-warmgray-700 uppercase tracking-wider mb-1.5">
              O ingresa otra ubicación
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
              }}
              placeholder="Ej: Mesa VIP, Terraza 3..."
              className="w-full px-3.5 py-2.5 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-warmgray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-warmgray-600 hover:bg-warmgray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
