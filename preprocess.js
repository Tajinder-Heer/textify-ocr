function preprocessImage(file, callback, applyBlur) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Cap image size (max 500px width)
            let scale = 1;
            if (img.width > 500) {
                scale = 500 / img.width;
            }
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Contrast boost (+20%)
            ctx.filter = 'contrast(1.2)';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';

            // Grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }

            // Apply blur only if enabled
            if (applyBlur) {
                ctx.filter = 'blur(0.3px)';
                ctx.putImageData(imageData, 0, 0);
                ctx.filter = 'none';
            }

            // Otsu's adaptive thresholding
            const threshold = otsuThreshold(imageData);
            for (let i = 0; i < data.length; i += 4) {
                const value = data[i] < threshold ? 0 : 255;
                data[i] = data[i + 1] = data[i + 2] = value;
            }
            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
                console.log('Blob created:', blob ? blob.size : 'null');
                if (blob) {
                    callback(blob);
                } else {
                    console.warn('Blob creation failed, using original file');
                    callback(file);
                }
            }, 'image/png');
        };
    };
    reader.onerror = () => {
        console.warn('Image load failed, using original file');
        callback(file);
    };
    reader.readAsDataURL(file);
}

function otsuThreshold(imageData) {
    const histogram = new Array(256).fill(0);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
    }
    const total = imageData.width * imageData.height;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * histogram[i];
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let varMax = 0;
    let threshold = 0;
    for (let t = 0; t < 256; t++) {
        wB += histogram[t];
        if (wB === 0) continue;
        wF = total - wB;
        if (wF === 0) break;
        sumB += t * histogram[t];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const varBetween = wB * wF * (mB - mF) * (mB - mF);
        if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
        }
    }
    return threshold;
}