async function preprocessImage(file, callback) {
    try {
        await cvReady();
        const imgElement = await loadImage(file);
        let src = cv.imread(imgElement);

        // Cap image size to avoid memory issues
        let scale = 1;
        if (src.cols > 1200) {
            scale = 1200 / src.cols;
            let resized = new cv.Mat();
            cv.resize(src, resized, new cv.Size(0, 0), scale, scale, cv.INTER_AREA);
            src.delete();
            src = resized;
        } else if (src.cols < 600) {
            scale = Math.min(1.5, 900 / src.cols);
            let resized = new cv.Mat();
            cv.resize(src, resized, new cv.Size(0, 0), scale, scale, cv.INTER_LINEAR);
            src.delete();
            src = resized;
        }

        // Grayscale
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Contrast boost (+20%)
        let contrast = new cv.Mat();
        gray.convertTo(contrast, -1, 1.2, 0);

        // Minimal Gaussian blur (0.3px)
        let blurred = new cv.Mat();
        cv.GaussianBlur(contrast, blurred, new cv.Size(3, 3), 0.3, 0.3);

        // Otsu's thresholding
        let thresh = new cv.Mat();
        cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        // Deskew (correct tilt)
        let rotated = thresh;
        let rotatedCreated = false;
        try {
            let angle = computeSkew(thresh);
            if (Math.abs(angle) > 0.1) {
                let center = new cv.Point(src.cols / 2, src.rows / 2);
                let M = cv.getRotationMatrix2D(center, angle, 1);
                rotated = new cv.Mat();
                rotatedCreated = true;
                cv.warpAffine(thresh, rotated, M, new cv.Size(src.cols, src.rows));
                M.delete();
            }
        } catch (e) {
            console.warn('Deskew failed:', e.message);
        }

        // Dewarp (correct curved pages)
        let warped = rotated;
        let warpedCreated = false;
        try {
            warped = dewarp(rotated);
            if (warped !== rotated) warpedCreated = true;
        } catch (e) {
            console.warn('Dewarping failed:', e.message);
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
            blurred.delete();
            thresh.delete();
            if (rotatedCreated) rotated.delete();
            if (warpedCreated) warped.delete();
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
    try {
        cv.findContours(mat, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
        let maxArea = 0;
        let maxContour = null;
        for (let i = 0; i < contours.size(); i++) {
            let contour = contours.get(i);
            let area = cv.contourArea(contour);
            if (area > 1000) {
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
            let rect = cv.minAreaRect(maxContour);
            angle = rect.angle;
            if (angle < -45) angle += 90;
            maxContour.delete();
        }
        contours.delete();
        hierarchy.delete();
        return angle;
    } catch (e) {
        contours.delete();
        hierarchy.delete();
        console.warn('computeSkew error:', e.message);
        return 0;
    }
}

function dewarp(mat) {
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    try {
        cv.findContours(mat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        let maxArea = 0;
        let maxContour = null;
        for (let i = 0; i < contours.size(); i++) {
            let contour = contours.get(i);
            let area = cv.contourArea(contour);
            if (area > 1000) {
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
            let warped = new cv.Mat();
            cv.warpPerspective(mat, warped, M, new cv.Size(mat.cols, mat.rows));
            srcPoints.delete();
            dstPoints.delete();
            M.delete();
            maxContour.delete();
            contours.delete();
            hierarchy.delete();
            return warped;
        }
        contours.delete();
        hierarchy.delete();
        return mat; // Fallback
    } catch (e) {
        contours.delete();
        hierarchy.delete();
        console.warn('dewarp error:', e.message);
        return mat;
    }
}