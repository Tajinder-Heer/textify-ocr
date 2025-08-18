function preprocessImage(file, callback) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Dynamic resizing (preserve aspect ratio, target ~300 DPI)
            const maxDimension = 1200;
            let scale = 1;
            if (img.width > maxDimension || img.height > maxDimension) {
                scale = Math.min(maxDimension / img.width, maxDimension / img.height);
            }
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }

            // Adaptive thresholding
            const brightness = data.reduce((sum, val, i) => i % 4 === 0 ? sum + val : sum, 0) / (data.length / 4);
            const threshold = brightness * 0.7; // Adjust based on image brightness
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