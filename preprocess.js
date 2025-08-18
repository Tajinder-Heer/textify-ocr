// Otsu's method implementation for adaptive thresholding
function otsuThreshold(histogram) {
    const total = histogram.reduce((sum, val) => sum + val, 0);
    let sumB = 0;
    let wB = 0;
    let maxVariance = 0;
    let threshold = 0;

    let sum1 = 0;
    for (let i = 0; i < 256; i++) {
        sum1 += i * histogram[i];
    }

    for (let t = 0; t < 256; t++) {
        wB += histogram[t];
        if (wB === 0) continue;
        const wF = total - wB;
        if (wF === 0) break;
        sumB += t * histogram[t];
        const mB = sumB / wB;
        const mF = (sum1 - sumB) / wF;
        const variance = wB * wF * (mB - mF) ** 2;
        if (variance > maxVariance) {
            maxVariance = variance;
            threshold = t;
        }
    }
    return threshold;
}

// Gaussian blur approximation (3x3 kernel, low radius 0.5px equivalent)
function applyGaussianBlur(data, width, height) {
    const kernel = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];
    const tempData = new Uint8ClampedArray(data.length);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            let k = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const idx = ((y + dy) * width + (x + dx)) * 4;
                    sum += data[idx] * kernel[k++];
                }
            }
            const idx = (y * width + x) * 4;
            tempData[idx] = tempData[idx + 1] = tempData[idx + 2] = sum;
            tempData[idx + 3] = 255;
        }
    }
    data.set(tempData);
}

function preprocessImage(file, applyBlur, callback) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Conditional resize (upscale if low-res, e.g., width < 600px ~ low DPI)
            let scale = 1;
            if (img.width < 600) {
                scale = Math.min(2, 1200 / img.width); // Upscale to ~300 DPI equivalent
            }
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const histogram = new Array(256).fill(0);
            for (let i = 0; i < data.length; i += 4) {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = gray;
                histogram[Math.floor(gray)]++;
            }

            // Optional low-radius blur
            if (applyBlur) {
                applyGaussianBlur(data, canvas.width, canvas.height);
            }

            // Otsu's adaptive thresholding
            const threshold = otsuThreshold(histogram);
            for (let i = 0; i < data.length; i += 4) {
                const value = data[i] < threshold ? 0 : 255;
                data[i] = data[i + 1] = data[i + 2] = value;
            }
            ctx.putImageData(imageData, 0, 0);

            // Convert to blob
            canvas.toBlob(callback, 'image/png');
        };
    };
    reader.readAsDataURL(file);
}