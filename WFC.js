import Tile from './Tile.js';
import Cell from './Cell.js';
import MinHeap from './MinHeap.js';
import fs from 'fs/promises'
import path from 'path'


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
        await wfc.initTiles('./images/pipes');
        return wfc;
    }

    async initTiles(folderPath) {
        try {
            const files = await fs.readdir(folderPath);
            for (const file of files) {
              const fullPath = path.join(folderPath, file);
              this.tiles.push(await Tile.init(fullPath));
            }
            for(const tile of this.tiles) tile.analyze(this.tiles)
          } 
          catch (error) {
            console.error('Error:', error);
          }
    
        
    }

    start() {
        this.grid = Array.from({length: this.N*this.N}, () => new Cell(this.tiles.length))
        this.minHeap = new MinHeap(this.grid);
        this.printSize();
        this.tileSummary()
        // this.execute();
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
            cell.options = [cell.options[tileIndex]]
            this.printGrid();
            this.propagate();
            this.minHeap._buildHeap();
            // console.clear()
            // this.printSize();
            await sleep(500/this.N) 
            this.sendGrid();           
        }
    }

    propagate() {
        const updateOptionsFromNeighbor = (i, j, dir, neighborI, neighborJ, options) => {
            if (neighborI < 0 || neighborJ < 0 || neighborI >= this.N || neighborJ >= this.N) return options;
    
            const neighborCell = this.grid[neighborI * this.N + neighborJ];
            let updatedOptions = new Set();
    
            for (const tile of neighborCell.options) {
                for (const neighbor of this.tiles[tile].possibleNeighbor[dir]) {
                    if (options.has(neighbor)) {
                        updatedOptions.add(neighbor);
                    }
                }
            }
            return updatedOptions;
        };
    
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const cell = this.grid[i * this.N + j];
                if (!cell.collapsed) {
                    console.log(i, j, "started");
                    let options = new Set(Array.from({ length: this.tiles.length }, (_, i) => i));
    
                    // Top neighbor 
                    options = updateOptionsFromNeighbor(i, j, 2, i - 1, j, options);
                    // console.log(options);
    
                    // Right neighbor
                    options = updateOptionsFromNeighbor(i, j, 3, i, j + 1, options);
                    // console.log(options);
    
                    // Bottom neighbor 
                    options = updateOptionsFromNeighbor(i, j, 0, i + 1, j, options);
                    // console.log(options);
    
                    // Left neighbor 
                    options = updateOptionsFromNeighbor(i, j, 1, i, j - 1, options);
                    // console.log(options);
    
                    cell.options = Array.from(options);
                    console.log("finished");
                }
            }
        }
    }

    sendGrid() {
        const gridData = [];
        for(let i=0; i<this.grid.length; i++) {
            gridData[i] = this.grid[i].collapsed ? this.tiles[this.grid[i].options[0]].imagePath : ""; 
        }
        console.log(gridData)
        this.socket.emit('gridData', gridData);
    }


    printGrid() {
        for(let i=0; i<this.N; i++) {
            for(let j=0; j<this.N; j++) {
                const cell = this.grid[i*this.N + j];
                const text = cell.collapsed ? cell.options[0]: "."
                process.stdout.write(text+" ")
            }
            console.log()
        }
        console.log()
    
    }
    
    printSize() { 
        for(let i=0; i<this.N; i++) {
            for(let j=0; j<this.N; j++) {
                const cell = this.grid[i*this.N + j];
                if(cell.collapsed) process.stdout.write('X'+" ");
                else process.stdout.write(cell.options.length+" ")
    
            }
            console.log()
        }
        console.log()
    
    }


    tileSummary() {
        for(const tile of this.tiles) {
            console.log(tile.imagePath)
            console.log(tile.sockets)
            process.stdout.write('0-> ');
            for(const neighbor of tile.possibleNeighbor[0]) process.stdout.write(neighbor+' ');
            console.log()

            process.stdout.write('1-> ');
            for(const neighbor of tile.possibleNeighbor[1]) process.stdout.write(neighbor+' ');
            console.log()

            process.stdout.write('2-> ');
            for(const neighbor of tile.possibleNeighbor[2]) process.stdout.write(neighbor+' ');
            console.log()

            process.stdout.write('3-> ');
            for(const neighbor of tile.possibleNeighbor[3]) process.stdout.write(neighbor+' ');
            console.log()
        }
    }
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




// const wfc = await WFC.init({}, 5);
// wfc.start();