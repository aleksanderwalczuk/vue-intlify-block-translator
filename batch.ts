import { wait } from "./wait";

export async function batch(
  promises: (() => Promise<any>)[],
  batchSize: number,
  delayMs: number
) {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);

    // Process each promise in the batch sequentially
    for (const promiseFn of batch) {
      await promiseFn();
    }

    console.log(`Batch ${Math.floor(i / batchSize) + 1} processed.`);

    // If there are more promises to process, wait for the specified delay
    if (i + batchSize < promises.length) {
      await wait(delayMs);
    }
  }
}
