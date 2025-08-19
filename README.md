<<<<<<< HEAD
Textify: Image & PDF to Text OCR App
Textify is a client-side web app for extracting text from images and PDFs using Tesseract.js and PDF.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
=======
Textify: Image to Text OCR App
Textify is a client-side web app for extracting text from images using Tesseract.js. Focus: High-accuracy OCR for Punjabi (Gurmukhi), Hindi (Devanagari), and English (Latin). Built for a small internal user base with zero budget.
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1
Phase 1: MVP (Complete)

Features: Upload image, extract Punjabi text, display results.
Accuracy: ~60% on printed Punjabi text.

Phase 2: Fixed Preprocessing (Complete)

Features: Preprocessing (contrast +20%, Otsu’s, optional blur), Tesseract.js OCR (PSM 6, OEM 1), Levenshtein accuracy, debug image.
Accuracy: ~80% on printed Gurmukhi text.

<<<<<<< HEAD
Phase 2.1: Modern UI and Optimized OCR (Complete)
=======
Phase 2.1: Modern UI and Optimized OCR
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1

<<<<<<< HEAD
Features:
Modern UI with Bootstrap 5.3 (drag-and-drop, image/text previews, progress bar, notifications, copy/download/clear buttons, optimization tips).
Performance: Tesseract.js v4.0.3, single worker, local pan.traineddata with remote fallback, optional preprocessing (~87 ms).
Optional preprocessing (contrast, Otsu’s, blur toggle), debug image preview, Levenshtein accuracy.


Accuracy: ~80% on printed Gurmukhi text.
Performance: <5 sec/image (ideally <2 sec for <100 KB images).

Phase 2.2: PDF Text Extraction

=======
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1
Features:
<<<<<<< HEAD
Upload and process single-page PDFs (native or scanned).
Native PDFs: Extract text using PDF.js.
Scanned PDFs: Render to image, apply optional preprocessing, and use Tesseract.js OCR.
UI: Updated to accept PDFs, preview first page, show extracted text.
Maintains Phase 2.1 features (drag-and-drop, previews, progress, notifications, buttons).
=======
Modern UI with Bootstrap 5.3 (drag-and-drop, image/text previews, progress bar, notifications, copy/download/clear buttons, optimization tips).
Performance: Tesseract.js v4.0.3, single worker, local pan.traineddata with remote fallback, optional preprocessing (~87 ms).
Optional preprocessing (contrast, Otsu’s, blur toggle), debug image preview, Levenshtein accuracy.
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1


<<<<<<< HEAD
Tech: HTML, JS (Tesseract.js v4.0.3, PDF.js v2.14.305, Canvas API), Bootstrap 5.3, CSS.
Structure: index.html, styles.css, main.js, preprocess.js, ocr.js, metrics.js, pan.traineddata.
Usage:
Drag-and-drop or browse a Gurmukhi image/PDF (<1MB).
Toggle preprocessing (on by default), blur (off), debug (off).
Enter ground truth text (optional) for accuracy.
Click "Process File & Extract Text".
View extracted text, copy, download, or clear.


=======
Tech: HTML, JS (Tesseract.js, Canvas API), Bootstrap, CSS.
Structure: index.html, styles.css, main.js, preprocess.js, ocr.js, metrics.js, pan.traineddata.
Usage:
Drag-and-drop or browse a Gurmukhi image (<1MB).
Toggle preprocessing (on by default), blur (off), debug (off).
Enter ground truth text (optional) for accuracy.
Click "Process Image & Extract Text".
View extracted text, copy, download, or clear.


>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1
Hosting: GitHub Pages (https://tajinder-heer.github.io/textify-ocr).
<<<<<<< HEAD
Target: 80%+ accuracy, <5 sec/image or page (ideally <2 sec for <100 KB files).
=======
Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for <100 KB images).
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1

Future Steps

<<<<<<< HEAD
Support multi-page PDFs (batch processing).
Add basic deskew for curved pages (Canvas API).
Add Hindi/English support (pan+hin+eng).
=======
Add PDF support (PDF.js).
Handle curved pages (basic deskew).
Add Hindi/English support (pan+hin+eng).
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1
Enhance formatting (HOCR for paragraphs).

Setup Instructions

Clone repo: https://github.com/Tajinder-Heer/textify-ocr.
Add pan.traineddata (from https://tessdata.projectnaptha.com/4.0.0/pan.traineddata, ~8-10 MB, uncompressed).
Open index.html via GitHub Pages.
<<<<<<< HEAD
Test with Gurmukhi images or single-page PDFs (e.g., AnmolUni, Raavi fonts, <1MB, e.g., 68 KB).
=======
Test with Gurmukhi images (e.g., AnmolUni, Raavi fonts, <1MB, e.g., 68 KB).
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1

Testing Notes

<<<<<<< HEAD
Test with 10-15 Gurmukhi images/PDFs (printed, mix clear/noisy, <1MB, e.g., 68 KB, single-page).
Target: 80%+ accuracy, <5 sec/image or page (ideally <2 sec for <100 KB).
Check console (F12 > Console) for timing logs (Total Processing, Preprocessing, PDF Processing, Tesseract Initialization, Tesseract Recognition).
Verify pan.traineddata loads (no 404 errors).
Test with preprocessing on/off (off for max speed).
Check UI: drag-and-drop, previews (image/PDF page), progress, notifications, buttons.
For PDFs: Test native (text-based) and scanned (image-based) PDFs.
=======
Test with 10-15 Gurmukhi images (printed, mix clear/noisy, <1MB, e.g., 68 KB).
Target: 80%+ accuracy, <5 sec/image (ideally <2 sec for <100 KB).
Check console (F12 > Console) for timing logs (Total Processing, Preprocessing, Tesseract Initialization, Tesseract Recognition).
Verify pan.traineddata loads (no 404 errors).
Test with preprocessing on/off (off for max speed).
Check UI: drag-and-drop, previews, progress, notifications, buttons.
>>>>>>> fd2235a51a82d11f8282c107d9eb2cde32d6f8e1
