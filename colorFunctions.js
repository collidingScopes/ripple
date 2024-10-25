function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function tweakHexColor(hexColor, range){
  var rgbArray = hexToRgb(hexColor);

  var newRGBArray = [];

  newRGBArray.push(Math.floor(rgbArray[0]+range*Math.random()-range/2));
  newRGBArray.push(Math.floor(rgbArray[1]+range*Math.random()-range/2));
  newRGBArray.push(Math.floor(rgbArray[2]+range*Math.random()-range/2));

  var newHexColor = rgbToHex(newRGBArray[0],newRGBArray[1],newRGBArray[2]);
  return newHexColor;
}

function getHueFromHex(hex) {
  const rgb = hexToRgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;

  if (delta === 0) {
      hue = 0;
  } else if (max === r) {
      hue = (g - b) / delta;
  } else if (max === g) {
      hue = 2 + (b - r) / delta;
  } else {
      hue = 4 + (r - g) / delta;
  }

  hue *= 60;
  if (hue < 0) {
      hue += 360;
  }

  return hue;
}

function rgbToHue(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const hue = Math.atan2(Math.sqrt(3) * (gNorm - bNorm), 2 * rNorm - gNorm - bNorm);
  return hue * 180 / Math.PI;
  }

function rgbToSaturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / max;
}

function rgbToLightness(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max + min) / 2 / 255;
}

function interpolateHex(hex1,hex2,factor){
  hex1RGB = hexToRgb(hex1);
  hex2RGB = hexToRgb(hex2);

  var newR = Math.round(hex1RGB.r + (hex2RGB.r - hex1RGB.r)*factor);
  var newG = Math.round(hex1RGB.g + (hex2RGB.g - hex1RGB.g)*factor);
  var newB = Math.round(hex1RGB.b + (hex2RGB.b - hex1RGB.b)*factor);

  var rgbResult = "rgb("+newR+","+newG+","+newB+")";
  return rgbResult;
}

function rgbToHex(r, g, b) {
  return "#" + (
      (r.toString(16).padStart(2, "0")) +
      (g.toString(16).padStart(2, "0")) +
      (b.toString(16).padStart(2, "0"))
  );
}

function getAverageColor(chosenPixels) {
  var r = 0;
  var g = 0;
  var b = 0;
  var count = chosenPixels.length / 4;
  for (let i = 0; i < count; i++) {
      r += chosenPixels[i * 4];
      g += chosenPixels[i * 4 + 1];
      b += chosenPixels[i * 4 + 2];
  }
  return [r / count, g / count, b / count];
}

function randomWithinRange(value,range){
  return value-range+Math.random()*range*2;
}

function calcWeightedAverage(data,weights){
  var weightedAverage = 0;
  for(var i=0; i<data.length; i++){
      weightedAverage += data[i]*weights[i];
  }
  return weightedAverage;
}