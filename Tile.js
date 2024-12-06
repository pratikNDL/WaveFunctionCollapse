import sharp from "sharp"; 
import crypto from 'crypto';

export default class Tile {

    constructor(imagePath) {
        this.imagePath = imagePath;
        this.sockets = [];
        this.possibleNeighbor = [[], [], [], []] // all potential neighbors in all 4 direction
    }

    static async init(imagePath) {
        const tile = new Tile(imagePath);
        await tile.calculateSockets();
        return tile;
    }

    async calculateSockets() {
        const top = [], right = [], bottom = [], left = [];
        try {
            const image = sharp(this.imagePath).raw();
            const { data, info } = await image.toBuffer({ resolveWithObject: true });
            const w = info.width, h = info.height;
            for (let i = 0; i < w; i++) {
                const topPixel = i;
                const bottomPixel = w * (h - 1) + i;
                top[i] = averagePixel(data, topPixel, info.channels);
                bottom[i] = averagePixel(data, bottomPixel, info.channels);
            }
            for (let i = 0; i < h; i++) {
                const rightPixel = (i + 1) * w - 1;
                const leftPixel = i * w;
                right[i] = averagePixel(data, rightPixel, info.channels);
                left[i] = averagePixel(data, leftPixel, info.channels);
            }
            this.sockets = [
                generateConnectionHash(top),
                generateConnectionHash(right),
                generateConnectionHash(bottom),
                generateConnectionHash(left)
            ];

        } catch (err) {
            console.error('Error processing image:', err);
        }
    }

    analyze(tiles) {
        for(let i=0; i<tiles.length; i++) {
            if(this.sockets[0] == tiles[i].sockets[2]) this.possibleNeighbor[0].push(i);
            if(this.sockets[1] == tiles[i].sockets[3]) this.possibleNeighbor[1].push(i);
            if(this.sockets[2] == tiles[i].sockets[0]) this.possibleNeighbor[2].push(i);
            if(this.sockets[3] == tiles[i].sockets[1]) this.possibleNeighbor[3].push(i);
        }
    }
}


function generateConnectionHash(arr) {
    const str = JSON.stringify(arr);
    const hash = crypto.createHash('sha256').update(str).digest('hex');
    return hash
}

function averagePixel(data, index, channels) {
    const r = roundToNearest10(data[index * channels]);
    const g = roundToNearest10(data[index * channels + 1]);
    const b = roundToNearest10(data[index * channels + 2]);
    return (r + g + b) / 3;
  }
  
function roundToNearest10(value) {
return Math.round(value / 10) * 10;
}
