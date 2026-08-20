import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../../types';
import { X, Camera, Link, Upload, Trash2, Save, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: Category[];
  onSave: (productData: any) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(3500);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [imageMode, setImageMode] = useState<'camera' | 'url'>('camera');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price);
      setCategoryId(productToEdit.category_id);
      setImageUrl(productToEdit.image_url);
      setIsAvailable(productToEdit.is_available);
      setTagsInput(productToEdit.tags?.join(', ') || '');
      setImageMode(productToEdit.image_url.startsWith('data:') ? 'camera' : 'url');
    } else {
      setName('');
      setDescription('');
      setPrice(3500);
      setCategoryId(categories[0]?.id || '');
      setImageUrl('https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80');
      setIsAvailable(true);
      setTagsInput('Recomendado');
      setImageMode('camera');
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  // Manejador para captura de cámara o selección de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Comprimir imagen usando Canvas si es necesario
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800; // Máximo 800px para óptimo rendimiento
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(compressedDataUrl);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      alert('Por favor completa el nombre y la categoría.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const data = {
      ...(productToEdit ? { id: productToEdit.id } : {}),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category_id: categoryId,
      image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
      is_available: isAvailable,
      tags
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warmgray-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-warmgray-100">
          <h3 className="font-display font-bold text-lg text-warmgray-900">
            {productToEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
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
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Nombre del Plato / Bebida *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Flat White con Leche de Avena"
              className="w-full px-3.5 py-2 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Categoría & Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
                Precio (CLP) *
              </label>
              <input
                type="number"
                required
                min={0}
                step={100}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-display font-semibold"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Descripción Apetitosa
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla los ingredientes clave y método de preparación..."
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
            />
          </div>

          {/* FOTO DEL PRODUCTO: CÁMARA / ARCHIVO / URL */}
          <div className="bg-warmgray-50 border border-warmgray-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-warmgray-800 uppercase tracking-wider">
                Foto del Producto
              </label>
              
              {/* Selector de Modo */}
              <div className="flex bg-warmgray-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageMode('camera')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                    imageMode === 'camera' ? 'bg-white text-warmgray-900 shadow-xs' : 'text-warmgray-600'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Tomar / Subir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                    imageMode === 'url' ? 'bg-white text-warmgray-900 shadow-xs' : 'text-warmgray-600'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>URL Web</span>
                </button>
              </div>
            </div>

            {/* Vista Previa de la Foto */}
            {imageUrl ? (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-warmgray-300 group">
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors"
                  title="Quitar foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Modo Cámara / Archivo */}
            {imageMode === 'camera' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-warmgray-300 hover:border-brand-500 rounded-xl bg-white hover:bg-brand-50/50 flex items-center justify-center space-x-2 text-xs font-bold text-warmgray-700 hover:text-brand-700 transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-brand-600" />
                  <span>{imageUrl ? 'Cambiar Foto (Tomar con Cámara o Galería)' : 'Tomar Foto con la Cámara / Elegir Imagen'}</span>
                </button>
              </div>
            ) : (
              /* Modo URL */
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-warmgray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-warmgray-700 uppercase tracking-wider mb-1">
              Etiquetas / Badges (Separadas por coma)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Vegano, Sin Gluten, Especial del Chef"
              className="w-full px-3.5 py-2 text-xs bg-warmgray-50 border border-warmgray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Switch de Disponibilidad */}
          <div className="pt-2 flex items-center justify-between bg-warmgray-50 p-3 rounded-2xl border border-warmgray-200">
            <div>
              <span className="text-xs font-bold text-warmgray-900">Disponibilidad Inmediata</span>
              <p className="text-[11px] text-warmgray-500">Si lo desactivas, aparecerá como "Agotado" en el menú de clientes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
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
              <span>Guardar Producto</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
