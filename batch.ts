import { wait } from "./wait";

type PromiseItem = () => Promise<{
  "remaining-tokens": number;
  "remaining-requests": number;
  "reset-tokens": string;
  "reset-requests": string;
} | null>;

/**
 *
 * @param promises array of promises
 * @param batchSize should match request per minute limit
 * @param delay default limit, could be overwritten with limi api response
 * 
 * Sample promise response: 
 *  {
     "remaining-tokens":"59905",
     "remaining-requests":"197",
     "reset-tokens":"95ms",
     "reset-requests":"21m35.083s"
    }
 */
export async function batch(
  promises: PromiseItem[],
  batchSize: number,
  delay: number
) {
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);

    let limit: Awaited<ReturnType<PromiseItem>> = null;
    // Process each promise in the batch sequentially
    for (const promiseFn of batch) {
      limit = await promiseFn();
    }

    console.log(`Batch ${Math.floor(i / batchSize) + 1} processed.`);

    let apiDelay: null | number = null;

    if (limit != null) {
      if (limit["remaining-requests"] < batchSize) {
        throw Error(
          `Remaining requests limit exceeded, ${limit["remaining-requests"]} requests left`
        );
      }
      // TODO: Should interpret reset delays and set approperiate timout or throw an error
    }

    // If there are more promises to process, wait for the specified delay
    if (i + batchSize < promises.length) {
      await wait(apiDelay ?? delay);
    }
  }
}
