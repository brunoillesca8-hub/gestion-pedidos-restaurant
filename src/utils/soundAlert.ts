/**
 * Genera un sonido armónico sutil de campana / chime usando la Web Audio API
 * para alertar la llegada de una nueva comanda en Cocina / KDS.
 */
export const playOrderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    
    // Tono principal y armónicos para un sonido de campana de restaurante refinada
    const notes = [
      { freq: 587.33, time: 0, duration: 0.8 },      // D5
      { freq: 880.00, time: 0.12, duration: 1.0 },   // A5
      { freq: 1174.66, time: 0.25, duration: 1.2 }   // D6
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Envelope: rápido ataque, decaimiento suave exponencial
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch {
    // Si el usuario no ha interactuado aún con el DOM, el audio puede estar silenciado
  }
};
