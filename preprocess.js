async function preprocessImage(file, callback) {
    try {
        await cvReady(); // Wait for OpenCV.js
        const imgElement = await loadImage(file);
        let src = cv.imread(imgElement);

        // Conditional upscale (only if low-res, <600px)
        let scale = 1;
        if (src.cols < 600) {
            scale = Math.min(1.5, 900 / src.cols);
            let scaled = new cv.Mat();
            cv.resize(src, scaled, new cv.Size(0, 0), scale, scale, cv.INTER_LINEAR);
            src.delete();
            src = scaled;
        }

        // Grayscale
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Contrast boost (+20%)
        let contrast = new cv.Mat();
        gray.convertTo(contrast, -1, 1.2, 0);

        // Minimal Gaussian blur (0.3px)
        cv.GaussianBlur(contrast, contrast, new cv.Size(3, 3), 0.3, 0.3);

        // Otsu's thresholding
        let thresh = new cv.Mat();
        cv.threshold(contrast, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        // Deskew (correct tilt)
        let rotated = thresh;
        try {
            let angle = computeSkew(thresh);
            if (Math.abs(angle) > 0.1) { // Only rotate if significant tilt
                let center = new cv.Point(src.cols / 2, src.rows / 2);
                let M = cv.getRotationMatrix2D(center, angle, 1);
                let rotatedMat = new cv.Mat();
                cv.warpAffine(thresh, rotatedMat, M, new cv.Size(src.cols, src.rows));
                rotated = rotatedMat;
                M.delete();
            }
        } catch (e) {
            console.warn('Deskew failed:', e.message); // Fallback to thresh
        }

        // Dewarp (correct curved pages)
        let warped = rotated;
        try {
            warped = dewarp(rotated);
        } catch (e) {
            console.warn('Dewarping failed:', e.message); // Fallback to rotated
        }

        // Convert to blob
        let canvas = document.createElement('canvas');
        cv.imshow(canvas, warped);
        canvas.toBlob(blob => {
            callback(blob);
            // Cleanup
            src.delete();
            gray.delete();
            contrast.delete();
            thresh.delete();
            if (warped !== rotated) rotated.delete();
            if (warped !== thresh) warped.delete();
        }, 'image/png');
    } catch (error) {
        console.error('Preprocessing error:', error);
        callback(file); // Fallback to original file
    }
}

function cvReady() {
    return new Promise(resolve => {
        if (typeof cv !== 'undefined' && cv.getBuildInformation) {
            resolve();
        } else {
            cv['onRuntimeInitialized'] = resolve;
        }
    });
}

function loadImage(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function computeSkew(mat) {
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(mat, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    let maxArea = 0;
    let maxContour = null;
    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour);
        if (area > 1000) { // Filter small noise
            if (area > maxArea) {
                maxArea = area;
                maxContour = contour;
            } else {
                contour.delete();
            }
        } else {
            contour.delete();
        }
    }
    let angle = 0;
    if (maxContour) {
        try {
            let rect = cv.minAreaRect(maxContour);
            angle = rect.angle;
            if (angle < -45) angle += 90; // Normalize
            maxContour.delete();
        } catch (e) {
            console.warn('minAreaRect failed:', e.message);
        }
    }
    contours.delete();
    hierarchy.delete();
    return angle;
}

function dewarp(mat) {
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let maxContour = null;
    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour);
        if (area > 1000) { // Filter small noise
            if (area > maxArea) {
                maxArea = area;
                maxContour = contour;
            } else {
                contour.delete();
            }
        } else {
            contour.delete();
        }
    }

    let warped = mat;
    if (maxContour) {
        try {
            let rect = cv.minAreaRect(maxContour);
            let points = cv.RotatedRect.points(rect);
            let srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                points[0].x, points[0].y,
                points[1].x, points[1].y,
                points[2].x, points[2].y,
                points[3].x, points[3].y
            ]);
            let dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, 0,
                mat.cols, 0,
                mat.cols, mat.rows,
                0, mat.rows
            ]);
            let M = cv.getPerspectiveTransform(srcPoints, dstPoints);
            let warpedMat = new cv.Mat();
            cv.warpPerspective(mat, warpedMat, M, new cv.Size(mat.cols, mat.rows));
            warped = warpedMat;
            srcPoints.delete();
            dstPoints.delete();
            M.delete();
            maxContour.delete();
        } catch (e) {
            console.warn('Perspective transform failed:', e.message);
        }
    }
    contours.delete();
    hierarchy.delete();
    return warped;
}