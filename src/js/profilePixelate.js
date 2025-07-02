window.addEventListener('DOMContentLoaded', () => {
  const PIXI = window.PIXI;
  const container = document.querySelector('.main-section');
  if (!container || !PIXI) return;

  // Remove the static img
  const img = container.querySelector('.profile-photo');
  if (img) img.style.display = 'none';

  // Create PixiJS app
  const app = new PIXI.Application({
    width: 11,
    height: 290,
    backgroundAlpha: 0,
    antialias: true,
  });
  app.view.style.borderRadius = '35%';
  app.view.style.overflow = 'hidden';
  app.view.style.display = 'block';
  app.view.style.margin = '0 auto';

  container.appendChild(app.view);

  // Load the profile image
  PIXI.Assets.load('/images/Betselot.png').then((texture) => {
    const sprite = new PIXI.Sprite(texture);
    sprite.width = 290;
    sprite.height = 290;
    app.stage.addChild(sprite);

    // Start pixelated
    let pixelSize = 40;
    const minPixel = 1;
    const duration = 900; // ms
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      pixelSize = 40 - (39 * progress);
      sprite.filters = [
        new PIXI.Filter(undefined, `
          vec2 pixel = vec2(${pixelSize.toFixed(2)});
          vec2 uv = floor(gl_FragCoord.xy / pixel) * pixel;
          gl_FragColor = texture2D(uSampler, uv / uTextureSize);
        `)
      ];
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        sprite.filters = [];
      }
    }
    requestAnimationFrame(animate);
  });
});
