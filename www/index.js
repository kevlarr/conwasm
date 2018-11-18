import { Universe } from 'conwasm';

(() => {
    const pre = document.getElementById('conwasm-canvas');
    const universe = Universe.new();

    const renderloop = () => {
        pre.textContent = universe.render();
        universe.tick();

        requestAnimationFrame(renderloop);
    };

    requestAnimationFrame(renderloop);
})();
