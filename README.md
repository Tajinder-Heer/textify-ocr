Textify: Image to Text OCR App
Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
Phase 1: MVP (Complete)

Features: Upload image, extract Punjabi text, display results.
Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing (Complete)

Features: Preprocessing (contrast +20%, Otsu’s, optional blur), Tesseract.js OCR (PSM 6, OEM 1), Levenshtein accuracy, debug image.
Accuracy: ~80% on printed Gurmukhi text.

Phase 2.1: Modern UI and Optimized OCR

Features:
Modern UI with Bootstrap 5.3 (drag-and-drop, image/text previews, progress bar, notifications, copy/download/clear buttons, optimization tips).
Performance: Tesseract.js v4.0.3, single worker, local pan.traineddata with remote fallback, optional preprocessing (~87 ms).
Optional preprocessing (contrast, Otsu’s, blur toggle), debug image preview, Levenshtein accuracy.


Tech: HTML, JS (Tesseract.js, Canvas API), Bootstrap, CSS.
Structure: index.html, styles.css, main.js, preprocess.js, ocr.js, metrics.js, pan.traineddata.
Usage:
Drag-and-drop or browse a Gurmukhi image (<1MB).
Toggle preprocessing (on by default), blur (off), debug (off).
Enter ground truth text (optional) for accuracy.
Click "Process Image & Extract Text".
View extracted text, copy, download, or clear.


Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).
Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for <100 KB images).

Future Steps

Add PDF support (PDF.js).
Handle curved pages (basic deskew).
Add Hindi/English support (pan+hin+eng).
Enhance formatting (HOCR for paragraphs).

Setup Instructions

Clone repo: https://github.com/Tajinder-Heer/textify-ocr.
Add pan.traineddata (from https://tessdata.projectnaptha.com/4.0.0/pan.traineddata, ~8-10 MB, uncompressed).
Open index.html via GitHub Pages.
Test with Gurmukhi images (e.g., AnmolUni, Raavi fonts, <1MB, e.g., 68 KB).

Testing Notes

Test with 10-15 Gurmukhi images (printed, mix clear/noisy, <1MB, e.g., 68 KB).
Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for <100 KB).
Check console (F12 > Console) for timing logs (Total Processing, Preprocessing, Tesseract Initialization, Tesseract Recognition).
Verify pan.traineddata loads (no 404 errors).
Test with preprocessing on/off (off for max speed).
Check UI: drag-and-drop, previews, progress, notifications, buttons.
