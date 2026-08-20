import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Store, Lock, KeyRound, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { restaurantSettings, updateRestaurantSettings } = useOrders();

  const [name, setName] = useState(restaurantSettings.name || 'Café & Bistró Bellavista');
  const [tagline, setTagline] = useState(restaurantSettings.tagline || 'Especialidad & Pastelería');
  const [adminPin, setAdminPin] = useState(restaurantSettings.admin_pin || '1234');
  const [kdsPin, setKdsPin] = useState(restaurantSettings.kds_pin || '12345');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminPin.trim() || !kdsPin.trim()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSaving(true);
    await updateRestaurantSettings({
      name: name.trim(),
      tagline: tagline.trim(),
      admin_pin: adminPin.trim(),
      kds_pin: kdsPin.trim()
    });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl border border-warmgray-200 shadow-xs">
        
        <div className="flex items-center space-x-3 pb-5 border-b border-warmgray-100">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-warmgray-900">
              Identidad del Local & Seguridad
            </h3>
            <p className="text-xs text-warmgray-500">
              Personaliza el nombre de tu cafetería/restaurante y gestiona las contraseñas de acceso
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="py-5 space-y-6">
          
          {/* SECCIÓN 1: IDENTIDAD */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-warmgray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-brand-600" />
              <span>Nombre y Marca del Local</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-warmgray-700 mb-1">
                Nombre del Restaurante / Cafetería *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Cafetería Los Ángeles, Bistró San Pedro..."
                className="w-full px-3.5 py-2.5 bg-warmgray-50 border border-warmgray-300 rounded-xl text-sm font-semibold text-warmgray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[11px] text-warmgray-400 mt-1">
                Se mostrará en la cabecera del menú digital de los clientes y en los tickets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-warmgray-700 mb-1">
                Eslogan o Subtítulo
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ej: Café de Grano & Pastelería Francesa"
                className="w-full px-3.5 py-2.5 bg-warmgray-50 border border-warmgray-300 rounded-xl text-sm text-warmgray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* SECCIÓN 2: CONTRASEÑAS & PIN DE SEGURIDAD */}
          <div className="space-y-4 pt-4 border-t border-warmgray-100">
            <h4 className="text-xs font-bold text-warmgray-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Contraseñas y PIN de Acceso</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PIN ADMIN */}
              <div className="bg-warmgray-50 p-4 rounded-2xl border border-warmgray-200">
                <label className="block text-xs font-bold text-warmgray-900 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brand-600" />
                  <span>PIN Administrador *</span>
                </label>
                <p className="text-[11px] text-warmgray-500 mb-2">Para ingresar a este panel y ver métricas</p>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Ej: 1234"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-warmgray-300 rounded-xl text-sm font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* PIN COCINA / KDS */}
              <div className="bg-warmgray-50 p-4 rounded-2xl border border-warmgray-200">
                <label className="block text-xs font-bold text-warmgray-900 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>PIN Cocina / KDS *</span>
                </label>
                <p className="text-[11px] text-warmgray-500 mb-2">Protege la pantalla para que no entren clientes</p>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-warmgray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={kdsPin}
                    onChange={(e) => setKdsPin(e.target.value)}
                    placeholder="Ej: 12345"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-warmgray-300 rounded-xl text-sm font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="pt-4 border-t border-warmgray-100 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Ajustes guardados y sincronizados con Turso!</span>
              </span>
            ) : (
              <span className="text-[11px] text-warmgray-400">
                Los cambios se aplican de inmediato en todos los dispositivos
              </span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
