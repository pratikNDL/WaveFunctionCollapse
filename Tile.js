import sharp from "sharp"; 
import crypto from 'crypto';

export default class Tile {

    constructor(imagePath) {
        this.imagePath = imagePath;
        this.edges = [];
        this.possibleNeighbor = [[], [], [], []] // all potential neighbors in all 4 direction
    }

    static async init(imagePath) {
        const tile = new Tile(imagePath);
        await tile.extractEdges();
        return tile;
    }

    async extractEdges(data, info) {
        const image = sharp(this.imagePath).raw();
        const {data, info} = await image.toBuffer({ resolveWithObject: true });

        const top = [], right = [], bottom = [], left = [];
        const w = info.width, h = info.height, c = info.channels;
        for (let i = 0; i < w; i++) {
            const topPixel = i*c;
            const bottomPixel = (w * (h - 1) + i)*c;
            top[i] = [data[topPixel], data[topPixel+1], data[topPixel+2]];
            bottom[i] = [data[bottomPixel], data[bottomPixel+1], data[bottomPixel+2]];
        }
        for (let i = 0; i < h; i++) {
            const rightPixel = ((i + 1) * w - 1)*c;
            const leftPixel = i * w * c;
            right[i] = [data[rightPixel], data[rightPixel+1], data[rightPixel+2]];
            left[i] = [data[leftPixel], data[leftPixel+1], data[leftPixel+2]];
        }
    
        this.edges =  [
            gaussianBlur1D(top).flat(),
            gaussianBlur1D(right).flat(),
            gaussianBlur1D(bottom).flat(),
            gaussianBlur1D(left).flat()
        ]
    }

    analyze(tiles) {
        for(let i=0; i<tiles.length; i++) {
            if(compareEdges(this.edges[0], tiles[i].edges[2])) this.possibleNeighbor[0].push(i);
            if(compareEdges(this.edges[1], tiles[i].edges[3])) this.possibleNeighbor[1].push(i);
            if(compareEdges(this.edges[2], tiles[i].edges[0])) this.possibleNeighbor[2].push(i);
            if(compareEdges(this.edges[3], tiles[i].edges[1])) this.possibleNeighbor[3].push(i);
        }
    }

    summarize() {
        console.log(this.imagePath)
        console.log(this.sockets)
        process.stdout.write('0-> ');
        for(const neighbor of this.possibleNeighbor[0]) process.stdout.write(neighbor+' ');
        console.log()

        process.stdout.write('1-> ');
        for(const neighbor of this.possibleNeighbor[1]) process.stdout.write(neighbor+' ');
        console.log()

        process.stdout.write('2-> ');
        for(const neighbor of this.possibleNeighbor[2]) process.stdout.write(neighbor+' ');
        console.log()

        process.stdout.write('3-> ');
        for(const neighbor of this.possibleNeighbor[3]) process.stdout.write(neighbor+' ');
        console.log()
    }
}


function gaussianBlur1D(pixels, sigma = 1.0, kernelSize = 5) {
    const kernel = [];
    const center = Math.floor(kernelSize / 2);
    let sum = 0;

    for (let i = 0; i < kernelSize; i++) {
      const x = i - center;
      const g = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel.push(g);
      sum += g;
    }

    kernel.forEach((v, i) => kernel[i] = v / sum);

    const blurred = [];

    for (let i = 0; i < pixels.length; i++) {
      const r = [0, 0, 0];
      for (let j = 0; j < kernelSize; j++) {
        const k = Math.min(pixels.length - 1, Math.max(0, i + j - center));
        const [pr, pg, pb] = pixels[k];
        const weight = kernel[j];
        r[0] += pr * weight;
        r[1] += pg * weight;
        r[2] += pb * weight;
      }
      blurred.push([
        Math.round(r[0]),
        Math.round(r[1]),
        Math.round(r[2])
      ]);
    }

    return blurred;
}



function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function mse(a, b) {
    let error = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        error += diff * diff;
    }
    return error / a.length;
}

async function compareEdges(a, b) {
    const sim = cosineSimilarity(a, b);
    const err = mse(a, b);

    // console.log("Cosine Similarity:", sim.toFixed(4));
    // console.log("MSE:", err.toFixed(2));

    if (sim > 0.98 || err < 20) return true;
    return false;
}


