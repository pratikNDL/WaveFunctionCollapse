import Tile from './Tile.js';
import Cell from './Cell.js';
import MinHeap from './MinHeap.js';


export default class WFC {
    constructor(socket, N) {
        this.socket = socket;
        this.tiles = [];
        this.grid = [];
        this.minHeap = new MinHeap(this.grid);
        this.N = N;
    }

    static async init(socket, N) {
        const wfc = new WFC(socket, N);
        await wfc.initTiles();
        return wfc;
    }

    async initTiles() {
        this.tiles.push(await Tile.init("./images/left.png"));
        this.tiles.push(await Tile.init("./images/up.png"));
        this.tiles.push(await Tile.init("./images/right.png"));
        this.tiles.push(await Tile.init("./images/down.png"));
        this.tiles.push(await Tile.init("./images/blank.png"));
        for(const tile of this.tiles) {
            tile.analyze(this.tiles)
        }
    }

    start() {
        this.grid = Array.from({length: this.N*this.N}, () => new Cell(this.tiles.length))
        this.minHeap = new MinHeap(this.grid);
        this.execute();
    }

    async execute() {

        while(this.minHeap.heap.length) {
            const cell = this.minHeap.extract();
            if(cell.options.length==0) {
                this.start();
                break;
            }
            cell.collapsed = true;
            const tileIndex = Math.floor(Math.random()*cell.options.length);
            cell.options = [tileIndex]
            this.propagate();
            this.minHeap._buildHeap();
            await sleep(200)
            this.sendGrid()
        }
    }

    propagate() {
        for(let i=0; i<this.N; i++) {
            for(let j=0; j<this.N; j++) {
                const cell = this.grid[i*this.N + j];
                if(!cell.collapsed) {
                    let options = new Set(Array.from({length: this.N}, (_, i) => i));
    
                    if(i>0) {
                        let updatedOptions = new Set()
                        for(const tile of this.grid[(i-1)*this.N + j].options) {
                            for(let neighbor of this.tiles[tile].possibleNeighbor[2]) {
                                if(options.has(neighbor)) updatedOptions.add(neighbor)
                            }
                        }
                        options = updatedOptions;
    
                    }
                    if(j>0) {
                        let updatedOptions = new Set()
                        for(const tile of this.grid[(i)*this.N + j-1].options)  {
                            for(let neighbor of this.tiles[tile].possibleNeighbor[3]) {
                                if(options.has(neighbor)) updatedOptions.add(neighbor)
                            }
                        }
                        options = updatedOptions;
                    }
                    if(i<this.N-1) {
                        let updatedOptions = new Set()
                        for(const tile of this.grid[(i+1)*this.N + j].options)  {
                            for(let neighbor of this.tiles[tile].possibleNeighbor[0]) {
                                if(options.has(neighbor)) updatedOptions.add(neighbor)
                            }
                        }
                        options = updatedOptions;
                    }
                    if(j<this.N-1) {
                        let updatedOptions = new Set()
                        for(const tile of this.grid[(i)*this.N + j+1].options)  {
                            for(let neighbor of this.tiles[tile].possibleNeighbor[1]) {
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

    sendGrid() {
        const gridData = [];
        for(let i=0; i<this.grid.length; i++) {
            gridData[i] = this.grid[i].collapsed ? this.tiles[this.grid[i].options[0]].imagePath : ""; 
        }
        this.socket.emit('gridData', gridData);
    }
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




