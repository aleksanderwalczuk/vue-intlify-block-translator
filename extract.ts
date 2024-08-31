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
