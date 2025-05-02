export const splitTextIntoBatches = (
  text: string,
  maxBatchSize: number,
): string[] => {
  const batches: string[] = [];
  let currentBatch = '';
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines) {
    if (currentBatch.length + line.length + 1 > maxBatchSize) {
      if (currentBatch) {
        batches.push(currentBatch);
        currentBatch = '';
      }

      currentBatch = line;
    } else {
      if (currentBatch) {
        currentBatch += '\n';
      }
      currentBatch += line;
    }
  }

  if (currentBatch) {
    batches.push(currentBatch);
  }

  return batches;
};
