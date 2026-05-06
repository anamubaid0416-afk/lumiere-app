import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import * as bodySegmentation from "@tensorflow-models/body-segmentation";

let faceLandmarkerPromise;
let segmenterPromise;

export async function loadFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
      );

      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
  }

  return faceLandmarkerPromise;
}

export async function loadSkinSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      return bodySegmentation.createSegmenter(
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
        {
          runtime: "tfjs",
          modelType: "general",
        }
      );
    })();
  }

  return segmenterPromise;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function detectFaceLandmarks(image) {
  const landmarker = await loadFaceLandmarker();
  const detection = landmarker.detect(image);
  return detection?.faceLandmarks?.[0] || null;
}

export async function createSkinMask(image) {
  const segmenter = await loadSkinSegmenter();
  const people = await segmenter.segmentPeople(image);
  if (!people?.length) return null;

  const mask = await bodySegmentation.toBinaryMask(
    people,
    { r: 0, g: 0, b: 0, a: 0 },
    { r: 255, g: 255, b: 255, a: 255 }
  );

  const canvas = document.createElement("canvas");
  canvas.width = mask.width;
  canvas.height = mask.height;
  canvas.getContext("2d").putImageData(mask, 0, 0);
  return canvas;
}
