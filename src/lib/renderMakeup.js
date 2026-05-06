import { createSkinMask, detectFaceLandmarks, loadImage } from "./faceEngine";

const FACE_OVAL = [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109];
const OUTER_LIPS = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];
const LEFT_EYE_AREA = [33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7];
const RIGHT_EYE_AREA = [263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249];
const LEFT_CHEEK = [117,123,147,187,207,205,50,101];
const RIGHT_CHEEK = [346,352,376,411,427,425,280,330];
const LEFT_UNDER_EYE = [226,113,225,224,223,222,221,189,244,245,233,232];
const RIGHT_UNDER_EYE = [446,342,445,444,443,442,441,413,464,465,453,452];
const FOREHEAD_CENTER = [10,109,67,103,54,151,284,332,297,338];
const NOSE_BRIDGE = [168,6,197,195,5,4,1,2];
const CHIN_CENTER = [18,200,199,175,152,377,400,378];

function points(landmarks, ids, width, height) {
  return ids
    .map((id) => landmarks[id])
    .filter(Boolean)
    .map((p) => ({ x: p.x * width, y: p.y * height }));
}

function polygon(ctx, pts, options = {}) {
  if (!pts.length) return;

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  if (options.blend) ctx.globalCompositeOperation = options.blend;
  if (options.blur) ctx.filter = `blur(${options.blur}px)`;
  if (options.dotted) ctx.setLineDash([6, 6]);

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  if (options.close !== false) ctx.closePath();

  if (options.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  if (options.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.lineWidth || 2;
    ctx.stroke();
  }

  ctx.restore();
}

function softRegion(ctx, landmarks, ids, width, height, color, options = {}) {
  polygon(ctx, points(landmarks, ids, width, height), {
    fill: color,
    alpha: options.alpha ?? 0.3,
    blur: options.blur ?? 14,
    blend: options.blend || "soft-light",
  });
}

function maskedMakeup(ctx, drawFn, maskCanvas, facePts, width, height) {
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const lctx = layer.getContext("2d");

  drawFn(lctx);
  lctx.globalCompositeOperation = "destination-in";
  if (maskCanvas) lctx.drawImage(maskCanvas, 0, 0, width, height);
  else polygon(lctx, facePts, { fill: "#fff" });

  ctx.drawImage(layer, 0, 0);
}

function label(ctx, text, x, y, color) {
  ctx.save();
  ctx.font = "700 18px Palatino, serif";
  ctx.textBaseline = "middle";
  const pad = 8;
  const width = ctx.measureText(text).width + pad * 2;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.fillRect(x, y - 15, width, 30);
  ctx.strokeRect(x, y - 15, width, 30);
  ctx.setLineDash([]);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x + pad, y);
  ctx.restore();
}

export async function renderMakeupToCanvas({ imageSrc, canvas, palette, guide = false, maxWidth = 900 }) {
  if (!imageSrc || !canvas) return { ok: false, reason: "Missing image or canvas" };

  const image = await loadImage(imageSrc);
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const landmarks = await detectFaceLandmarks(image);
  if (!landmarks) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(16, 16, 275, 34);
    ctx.fillStyle = "#fff";
    ctx.font = "16px Palatino, serif";
    ctx.fillText("Face landmarks not found", 28, 39);
    return { ok: false, reason: "No face landmarks" };
  }

  let skinMask = null;
  try {
    skinMask = await createSkinMask(image);
  } catch (error) {
    console.warn("Skin segmentation unavailable. Falling back to face oval.", error);
  }

  const facePts = points(landmarks, FACE_OVAL, width, height);
  maskedMakeup(
    ctx,
    (layer) => {
      softRegion(layer, landmarks, FOREHEAD_CENTER, width, height, palette.foundation, { alpha: 0.08, blur: 24, blend: "soft-light" });
      softRegion(layer, landmarks, LEFT_UNDER_EYE, width, height, palette.concealer, { alpha: 0.22, blur: 13, blend: "screen" });
      softRegion(layer, landmarks, RIGHT_UNDER_EYE, width, height, palette.concealer, { alpha: 0.22, blur: 13, blend: "screen" });
      softRegion(layer, landmarks, FOREHEAD_CENTER, width, height, palette.concealer, { alpha: 0.14, blur: 18, blend: "screen" });
      softRegion(layer, landmarks, NOSE_BRIDGE, width, height, palette.concealer, { alpha: 0.16, blur: 12, blend: "screen" });
      softRegion(layer, landmarks, CHIN_CENTER, width, height, palette.concealer, { alpha: 0.12, blur: 16, blend: "screen" });
      softRegion(layer, landmarks, [127,234,93,132,58,172,136,150,149], width, height, palette.contour, { alpha: 0.28, blur: 18, blend: "multiply" });
      softRegion(layer, landmarks, [356,454,323,361,288,397,365,379,378], width, height, palette.contour, { alpha: 0.28, blur: 18, blend: "multiply" });
      softRegion(layer, landmarks, [198,209,49,48,102], width, height, palette.contour, { alpha: 0.18, blur: 10, blend: "multiply" });
      softRegion(layer, landmarks, [420,429,279,278,331], width, height, palette.contour, { alpha: 0.18, blur: 10, blend: "multiply" });
      softRegion(layer, landmarks, [70,63,105,66,107,9,336,296,334,293,300], width, height, palette.bronzer, { alpha: 0.2, blur: 20, blend: "multiply" });
      softRegion(layer, landmarks, [111,117,118,119,120,100,47], width, height, palette.bronzer, { alpha: 0.18, blur: 16, blend: "multiply" });
      softRegion(layer, landmarks, [340,346,347,348,349,329,277], width, height, palette.bronzer, { alpha: 0.18, blur: 16, blend: "multiply" });
      softRegion(layer, landmarks, LEFT_CHEEK, width, height, palette.blush, { alpha: 0.34, blur: 15, blend: "soft-light" });
      softRegion(layer, landmarks, RIGHT_CHEEK, width, height, palette.blush, { alpha: 0.34, blur: 15, blend: "soft-light" });
      softRegion(layer, landmarks, LEFT_EYE_AREA, width, height, palette.eyeshadow, { alpha: 0.28, blur: 8, blend: "multiply" });
      softRegion(layer, landmarks, RIGHT_EYE_AREA, width, height, palette.eyeshadow, { alpha: 0.28, blur: 8, blend: "multiply" });
      softRegion(layer, landmarks, [50,101,118,117], width, height, palette.highlighter, { alpha: 0.17, blur: 12, blend: "screen" });
      softRegion(layer, landmarks, [280,330,347,346], width, height, palette.highlighter, { alpha: 0.17, blur: 12, blend: "screen" });
    },
    skinMask,
    facePts,
    width,
    height
  );

  polygon(ctx, points(landmarks, OUTER_LIPS, width, height), {
    fill: palette.lipstick,
    alpha: 0.55,
    blend: "multiply",
  });

  if (guide) {
    const guides = [
      ["Concealer", [...points(landmarks, LEFT_UNDER_EYE, width, height), ...points(landmarks, RIGHT_UNDER_EYE, width, height)], palette.concealer, width * 0.13, height * 0.28],
      ["Contour", points(landmarks, [127,234,93,132,58,172,136,150,149], width, height), palette.contour, width * 0.08, height * 0.58],
      ["Bronzer", points(landmarks, [70,63,105,66,107,9,336,296,334,293,300], width, height), palette.bronzer, width * 0.55, height * 0.16],
      ["Blush", points(landmarks, LEFT_CHEEK, width, height), palette.blush, width * 0.14, height * 0.45],
    ];

    guides.forEach(([text, pts, color, x, y]) => {
      polygon(ctx, pts, { stroke: color, lineWidth: 3, dotted: true, alpha: 0.95 });
      label(ctx, text, x, y, color);
    });
  }

  return { ok: true };
}
