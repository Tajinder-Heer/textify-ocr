Textify: Image to Text OCR App

Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.

Phase 1: MVP (Complete)





Features: Upload image, extract Punjabi text, display results.



Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing (Complete)





Features: Preprocessing (contrast +20%, Otsu’s, optional blur), Tesseract.js OCR (PSM 6, OEM 1), Levenshtein accuracy, debug image.



Accuracy: ~80% on printed Gurmukhi text.

Phase 2.1: UI and Performance Improvements





Features:





Modern UI with Bootstrap 5.3 (card layout, progress bar, alerts).



Performance: Single Tesseract worker, PSM 4 (single text line), low DPI (100), local pan.traineddata, fallback to remote traineddata.



Local worker.min.js and pan.traineddata to avoid latency.



Debug image preview deferred for next phase.



Tech: HTML, JS (Tesseract.js, Canvas API), Bootstrap, CSS.



Structure: index.html, styles.css, main.js, preprocess.js, ocr.js, metrics.js, worker.min.js, pan.traineddata.



Usage: Upload Gurmukhi image, toggle preprocessing/blur/debug, enter ground truth, click "Extract Text".



Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).



Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for small images).

Future Steps





Fix debug image preview.



Add PDF support (PDF.js).



Handle curved pages (basic deskew).



Add Hindi/English support.



Enhance formatting (HOCR for paragraphs).

Setup Instructions





Clone repo: https://github.com/Tajinder-Heer/textify-ocr.



Add worker.min.js (from https://unpkg.com/tesseract.js@v5.1.0/dist/worker.min.js).



Add pan.traineddata (from https://tessdata.projectnaptha.com/4.0.0/pan.traineddata).



Open index.html via GitHub Pages.



Test with Gurmukhi images (e.g., AnmolUni, Raavi fonts, <1MB).



Provide ground truth for accuracy.

Testing Notes





Test with 10-15 Gurmukhi images (printed, mix clear/noisy, <1MB, e.g., 60 KB).



Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for small images).



Check console (F12 > Console) for timing logs (Total Processing, Tesseract Initialization, Tesseract Language Loading, Tesseract Recognition).



Verify UI (responsive, modern).