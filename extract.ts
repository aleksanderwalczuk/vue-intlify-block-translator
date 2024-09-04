import { Headers } from "openai/_shims/index.mjs";

export const extractI18nContent = (content: string): string | null => {
  const i18nStart = '<i18n lang="yaml">';
  const i18nEnd = "</i18n>";

  const startIndex = content.indexOf(i18nStart);
  const endIndex = content.indexOf(i18nEnd, startIndex);

  if (startIndex !== -1 && endIndex !== -1) {
    return content.slice(startIndex + i18nStart.length, endIndex).trim();
  }

  return null;
};

export const extractI18nIndexes = (
  content: string
): { start: number; end: number } | null => {
  const i18nStart = '<i18n lang="yaml">';
  const i18nEnd = "</i18n>";

  const startIndex = content.indexOf(i18nStart);
  const endIndex = content.indexOf(i18nEnd, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  console.log("startIndex", startIndex);

  return {
    start: startIndex + '<i18n lang="yaml">'.length + 1,
    end: endIndex,
  };
};

/**
 * Sample headers:
 * {
 *  "remaining-tokens":"59905",
 *  "remaining-requests":"197",
 *  "reset-tokens":"95ms",
 *  "reset-requests":"21m35.083s"
 * }
 */
const parseRateLimitHeaders = (headers: Record<string, string> | null) => {
  const keyParser = {
    "remaining-tokens": parseInt,
    "remaining-requests": parseInt,
    "reset-tokens": String,
    "reset-requests": String,
  };
  let parsed = {};
  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      const element = headers[key];
      parsed = {
        ...parsed,
        [key]: keyParser[key as keyof typeof keyParser](element),
      };
    }
  }

  return parsed as {
    "remaining-tokens": number;
    "remaining-requests": number;
    "reset-tokens": string;
    "reset-requests": string;
  };
};

export const extractRateLimitHeaders = (headers: Headers) => {
  const rateLimitHeaders = [
    "x-ratelimit-remaining-tokens",
    "x-ratelimit-remaining-requests",
    "x-ratelimit-reset-tokens",
    "x-ratelimit-reset-requests",
  ];

  return parseRateLimitHeaders(
    Object.fromEntries(
      rateLimitHeaders.map((key) => [
        key.slice("x-ratelimit-".length),
        headers.get(key)!,
      ])
    )
  );
};
