/**
 * RAÍZ — Subtle interaction sounds
 */

(() => {
  let audioContext;

  function playTone(startFrequency, endFrequency, duration, volume) {
    const AudioContext = window.AudioContext;
    if (!AudioContext) return;

    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function getButton(target) {
    return target instanceof Element
      ? target.closest('button, .btn, [role="button"]')
      : null;
  }

  document.addEventListener('pointerover', (event) => {
    const button = getButton(event.target);
    if (!button || button.contains(event.relatedTarget)) return;
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      playTone(740, 620, 0.045, 0.012);
    }
  });

  document.addEventListener('click', (event) => {
    if (getButton(event.target)) {
      playTone(520, 390, 0.065, 0.018);
    }
  });
})();
