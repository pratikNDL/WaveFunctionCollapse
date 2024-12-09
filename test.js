import sharp from "sharp"; 
import crypto from 'crypto';

const sun = sharp('./images/mountains/0.png').raw();
const cloud = sharp('./images/mountains/1.png').raw();
const sunResolve = await sun.toBuffer({ resolveWithObject: true });
const cloudResolve  = await cloud.toBuffer({ resolveWithObject: true });

const sunEdges = extractEdges(sunResolve.data, sunResolve.info); 
const cloudEdges = extractEdges(cloudResolve.data, cloudResolve.info); 

await compareEdges(sunEdges[0], cloudEdges[0])









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

    console.log("Cosine Similarity:", sim.toFixed(4));
    console.log("MSE:", err.toFixed(2));

    if (sim > 0.98 || err < 20) {
      console.log("Edges are similar.");
    } else {
      console.log("Edges are not similar.");
    }
  }


