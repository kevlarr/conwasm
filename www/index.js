import { Cell, Universe } from 'conwasm';
import { memory } from 'conwasm/conwasm_bg';

const CELL_SIZE = 2;
const GRID_COLOR = '#cccccc';
const DEAD_COLOR = '#ffffff';
const ALIVE_COLOR = '#000000';

class GameOfLife {
    constructor() {
        this.universe = Universe.new();

        this.canvas = document.getElementById('conwasm-canvas');
        this.canvas.height = (CELL_SIZE + 1) * this.universe.height() + 1;
        this.canvas.width = (CELL_SIZE + 1) * this.universe.width() + 1;
        this.canvas.addEventListener('click', this.click.bind(this));

        this.ctx = this.canvas.getContext('2d');
    }

    get height() {
        return this.universe.height();
    }

    get width() {
        return this.universe.width();
    }

    click(event) {
        const bounding = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / bounding.width;
        const scaleY = this.canvas.height / bounding.height;

        const canvasLeft = (event.clientX - bounding.left) * scaleX;
        const canvasTop = (event.clientY - bounding.top) * scaleY;

        const row = Math.min(
            Math.floor(canvasTop / (CELL_SIZE + 1)),
            this.universe.height() - 1
        );
        const col = Math.min(
            Math.floor(canvasLeft / (CELL_SIZE + 1)),
            this.universe.width() - 1
        );

        this.universe.toggle_cell(row, col);
        this.render();
    }

    getIndex(row, col) {
        return row * this.width + col;
    }

    next() {
        this.universe.tick();
    }

    render() {
        this.drawGrid();
        this.drawCells();
    }

    drawGrid() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = GRID_COLOR;

        for (let i = 0; i <= this.width; i++) {
            const x = i * (CELL_SIZE + 1) + 1;

            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, (CELL_SIZE + 1) * this.height + 1);
        }

        for (let j = 0; j <= this.height; j++) {
            const y = j * (CELL_SIZE + 1) + 1;

            this.ctx.moveTo(0, y);
            this.ctx.lineTo((CELL_SIZE + 1) * this.width + 1, y);
        }

        this.ctx.stroke();
    }

    drawCells() {
        const cellsPtr = this.universe.cells();
        const cells = new Uint8Array(memory.buffer, cellsPtr, this.width * this.height);

        this.ctx.beginPath();

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const i = this.getIndex(row, col);

                this.ctx.fillStyle = cells[i] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;
                this.ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }

        this.ctx.stroke();
    }
}

(function main() {
    const gameOfLife = new GameOfLife();
    let animationId = null;

    const renderLoop = () => {
        gameOfLife.next();
        gameOfLife.render();

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
