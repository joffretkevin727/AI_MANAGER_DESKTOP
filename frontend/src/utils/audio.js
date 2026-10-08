export const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    console.error('Erreur Audio:', e);
  }
};