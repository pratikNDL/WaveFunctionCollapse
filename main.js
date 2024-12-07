import Tile from './Tile.js';
import Cell from './Cell.js';
import MinHeap from './MinHeap.js';

const N = 4;

const tiles = [];

tiles.push(await Tile.init("./images/blank.png"));
tiles.push(await Tile.init("./images/up.png"));
tiles.push(await Tile.init("./images/right.png"));
tiles.push(await Tile.init("./images/down.png"));
tiles.push(await Tile.init("./images/left.png"));

for(const tile of tiles) tile.analyze(tiles)

let grid, minHeap;
function init() {
    grid = Array.from({length: N*N}, () => new Cell(tiles.length))
    minHeap = new MinHeap(grid);
    execute();
}

async function execute() {
    while(minHeap.heap.length) {
        const cell = minHeap.extract();
        if(cell.options.length==0) {
            // init();
            break;
        }
        cell.collapsed = true;
        const tileIndex = Math.floor(Math.random()*cell.options.length);
        cell.options = [tileIndex]
        propagate();
        minHeap._buildHeap();
        await sleep(50);
        console.log(); 

        printGrid(grid)
        console.log(); 

        printSize(grid)
        console.log()
    }
}


init();




function propagate() {
    for(let i=0; i<N; i++) {
        for(let j=0; j<N; j++) {
            const cell = grid[i*N + j];
            if(!cell.collapsed) {
                let options = new Set(Array.from({length: N}, (_, i) => i));

                if(i>0) {
                    let updatedOptions = new Set()
                    for(const tile of grid[(i-1)*N + j].options) {
                        for(let neighbor of tiles[tile].possibleNeighbor[2]) {
                            if(options.has(neighbor)) updatedOptions.add(neighbor)
                        }
                    }
                    options = updatedOptions;

                }
                if(j>0) {
                    let updatedOptions = new Set()
                    for(const tile of grid[(i)*N + j-1].options)  {
                        for(let neighbor of tiles[tile].possibleNeighbor[3]) {
                            if(options.has(neighbor)) updatedOptions.add(neighbor)
                        }
                    }
                    options = updatedOptions;
                }
                if(i<N-1) {
                    let updatedOptions = new Set()
                    for(const tile of grid[(i+1)*N + j].options)  {
                        for(let neighbor of tiles[tile].possibleNeighbor[0]) {
                            if(options.has(neighbor)) updatedOptions.add(neighbor)
                        }
                    }
                    options = updatedOptions;
                }
                if(j<N-1) {
                    let updatedOptions = new Set()
                    for(const tile of grid[(i)*N + j+1].options)  {
                        for(let neighbor of tiles[tile].possibleNeighbor[1]) {
                            if(options.has(neighbor)) updatedOptions.add(neighbor)
                        }
                    }
                    options = updatedOptions;
                }
                cell.options = Array.from(options);
            }
        }
    }
}

function intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.filter(item => set1.has(item));
}

function printGrid(grid) {
    for(let i=0; i<N; i++) {
        for(let j=0; j<N; j++) {
            const cell = grid[i*N + j];
            const text = cell.collapsed ? cell.options[0]: "."
            process.stdout.write(text+" ")
        }
        console.log()
    }
    console.log()

}

function printSize(grid) {
    // console.clear(); 
    for(let i=0; i<N; i++) {
        for(let j=0; j<N; j++) {
            const cell = grid[i*N + j];
            if(cell.collapsed) process.stdout.write('X'+" ");
            else process.stdout.write(cell.options.length+" ")

        }
        console.log()
    }
    console.log()

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
analyze all images


*/