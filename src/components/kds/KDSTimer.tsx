import React, { useState, useEffect } from 'react';
import { getTimeElapsedMinutes, formatElapsed } from '../../utils/formatters';
import { Clock, AlertTriangle } from 'lucide-react';

interface KDSTimerProps {
  createdAt: string;
  status: string;
}

export const KDSTimer: React.FC<KDSTimerProps> = ({ createdAt, status }) => {
  const [minutes, setMinutes] = useState(() => getTimeElapsedMinutes(createdAt));

  useEffect(() => {
    // Actualizar cada 20 segundos
    const interval = setInterval(() => {
      setMinutes(getTimeElapsedMinutes(createdAt));
    }, 20000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (status === 'entregado' || status === 'cerrado') {
    return (
      <div className="flex items-center space-x-1 text-xs text-warmgray-500 font-medium">
        <Clock className="w-3 h-3" />
        <span>{formatElapsed(minutes)}</span>
      </div>
    );
  }

  // Semáforo de tiempo en cocina
  let colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let isUrgent = false;

  if (minutes >= 20) {
    colorClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
    isUrgent = true;
  } else if (minutes >= 10) {
    colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {isUrgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      <span>{formatElapsed(minutes)}</span>
    </div>
  );
};
