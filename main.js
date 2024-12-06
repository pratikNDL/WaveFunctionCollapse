import Tile from './Tile.js';
import Cell from './Cell.js';
import MinHeap from './MinHeap.js';

const N = 5;

const tiles = [];

tiles.push(await Tile.init("./images/blank.png"));
tiles.push(await Tile.init("./images/up.png"));
tiles.push(await Tile.init("./images/right.png"));
tiles.push(await Tile.init("./images/down.png"));
tiles.push(await Tile.init("./images/left.png"));

for(const tile of tiles) tile.analyze(tiles)

const grid = Array.from({length: N*N}, () => new Cell(tiles.length))
const minHeap = new MinHeap(grid);

while(minHeap.heap.length) {
    const cell = minHeap.extract();
    if(!cell || cell.options.length==0) break;
    cell.collapsed = true;
    const tileIndex = Math.floor(Math.random()*cell.options.length);
    cell.options = [tileIndex]
    await sleep(200);
    printGrid(grid)
}




function intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.filter(item => set1.has(item));
}

function printGrid(grid) {
    console.clear(); 
    for(let i=0; i<N; i++) {
        for(let j=0; j<N; j++) {
            const cell = grid[i*N + j];
            const text = cell.collapsed ? cell.options[0]: "."
            process.stdout.write(text+" ")
        }
        console.log()
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
analyze all images


*/