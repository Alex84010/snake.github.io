// === FIX resize / orientation / debug ===
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const rotateOverlay = document.getElementById('rotate-overlay');

function resizeCanvasForLandscape(){
  // On veut que le jeu soit large (paysage). Ajuste canvas en fonction de l'orientation.
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Si l'écran est en portrait (height > width) on demande de tourner l'appareil
  if (vh > vw) {
    rotateOverlay.classList.remove('hidden');
  } else {
    rotateOverlay.classList.add('hidden');
  }

  // Calcule une taille carrée raisonnable qui tient en paysage
  const size = Math.min(vw * 0.92, vh * 0.85);
  canvas.width = size;
  canvas.height = size;
  // box : nombre de cases = 20 (comme avant)
  box = canvas.width / 20;
}

// Valeur par défaut (sera redéfinie)
let box = 20;
resizeCanvasForLandscape();
window.addEventListener('resize', () => {
  try {
    resizeCanvasForLandscape();
  } catch (err) {
    console.error('Erreur resize:', err);
  }
});

// DEBUG : log d'erreurs JS non capturées
window.addEventListener('error', function(e){
  console.error('JS ERROR', e.message, 'at', e.filename + ':' + e.lineno);
  alert('Erreur JS détectée — ouvre la console (F12) pour voir le détail.');
});
