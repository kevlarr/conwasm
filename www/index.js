import { Cell, Universe } from 'conwasm';
import { memory } from 'conwasm/conwasm_bg';

const CELL_SIZE = 10;
const GRID_COLOR = '#cccccc';
const DEAD_COLOR = '#ffffff';
const ALIVE_COLOR = '#000000';


(function main() {
    const universe = Universe.new();
    const height = universe.height();
    const width = universe.width();
    const getIndex = (row, col) => row * width + col;

    const canvas = document.getElementById('conwasm-canvas');
    canvas.height = (CELL_SIZE + 1) * universe.height() + 1;
    canvas.width = (CELL_SIZE + 1) * universe.width() + 1;

    const ctx = canvas.getContext('2d');

    const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        for (let i = 0; i <= width; i++) {
            const x = i * (CELL_SIZE + 1) + 1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, (CELL_SIZE + 1) * height + 1);
        }

        for (let j = 0; j <= height; j++) {
            const y = j * (CELL_SIZE + 1) + 1;
            ctx.moveTo(0, y);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, y);
        }

        ctx.stroke();
    }

    const drawCells = () => {
        const cellsPtr = universe.cells();
        const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

        ctx.beginPath();

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const i = getIndex(row, col);

                ctx.fillStyle = cells[i] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }

        ctx.stroke();
    };

    let animationId = null;

    const renderLoop = () => {
        universe.tick();

        drawGrid();
        drawCells();

        animationId = requestAnimationFrame(renderLoop);
    };

    const playPauseButton = document.getElementById('play-pause');
    const play = () => {
        playPauseButton.textContent = 'Pause';
        renderLoop();
    };
    const pause = () => {
        playPauseButton.textContent = 'Play';
        cancelAnimationFrame(animationId);
        animationId = null;
    };

    playPauseButton.addEventListener('click', (event) => {
        animationId ? pause() : play();
    });
})();
