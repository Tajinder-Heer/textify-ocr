async function preprocessImage(file, callback) {
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
    let angle = computeSkew(thresh);
    let rotated = new cv.Mat();
    let center = new cv.Point(src.cols / 2, src.rows / 2);
    let M = cv.getRotationMatrix2D(center, angle, 1);
    cv.warpAffine(thresh, rotated, M, new cv.Size(src.cols, src.rows));

    // Dewarp (correct curved pages)
    let warped = dewarp(rotated);

    // Convert to blob
    let canvas = document.createElement('canvas');
    cv.imshow(canvas, warped);
    canvas.toBlob(callback, 'image/png');

    // Cleanup
    src.delete(); gray.delete(); contrast.delete(); thresh.delete(); rotated.delete(); warped.delete(); M.delete();
}

function cvReady() {
    return new Promise(resolve => {
        if (cv.getBuildInformation) resolve();
        else cv['onRuntimeInitialized'] = resolve;
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
        if (area > maxArea) {
            maxArea = area;
            maxContour = contour;
        }
        contour.delete();
    }
    let angle = 0;
    if (maxContour) {
        let rect = cv.minAreaRect(maxContour);
        angle = rect.angle;
        if (angle < -45) angle += 90; // Normalize
    }
    contours.delete();
    hierarchy.delete();
    return angle;
}

function dewarp(mat) {
    // Basic perspective transform for curved pages
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let maxContour = null;
    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour);
        if (area > maxArea) {
            maxArea = area;
            maxContour = contour;
        }
    }

    let warped = mat;
    if (maxContour) {
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
        cv.warpPerspective(mat, warped, M, new cv.Size(mat.cols, mat.rows));
        srcPoints.delete(); dstPoints.delete(); M.delete();
    }

    contours.delete();
    hierarchy.delete();
    return warped;
}