function calculateLevenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}

function calculateLevenshteinAccuracy(groundTruth, ocrText) {
    const distance = calculateLevenshteinDistance(groundTruth, ocrText);
    const maxLength = Math.max(groundTruth.length, ocrText.length);
    return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;
}