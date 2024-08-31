import * as fs from "fs/promises";
import { extractI18nContent, extractI18nIndexes } from "./extract";

export const inject = async (
  message: string,
  {
    filePath,
    content,
  }: {
    filePath: string;
    content: string;
  },
  lang: string
) => {
  const adapt = (message: string): string => {
    if (message.startsWith("```yaml\n")) {
      message = message.replace(
        "```yaml\n",
        `# Automated ${lang} translation\n`
      );
    }

    if (message.endsWith("```")) {
      message = message.replace("```", "");
    }

    return message.trim();
  };

  const i18nContent = extractI18nContent(content);
  const { start, end } = extractI18nIndexes(content)!;
  const [fileStart, _, fileEnd] = [
    content.slice(0, start),
    content.slice(start, end),
    content.slice(end),
  ];

  await fs.writeFile(
    filePath,
    fileStart + i18nContent + "\n" + adapt(message) + "\n" + fileEnd
  );
};
