import * as fs from "fs/promises";
import * as path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { extractI18nContent } from "./extract";
import { translate } from "./translate";
import { inject } from "./inject";

const srcDir: string = path.resolve(process.argv[2]);
const lang: string = process.argv[3];
dotenv.config();

// Function to recursively get all .vue files
const getVueFiles = async (dir: string): Promise<string[]> => {
  const files = await fs.readdir(dir);
  const filePromises = files.map(async (file) => {
    const fullPath = path.join(dir, file);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      // Recursively get .vue files from subdirectory
      return getVueFiles(fullPath);
    } else if (path.extname(file) === ".vue") {
      // Return file path if it's a .vue file
      return [fullPath];
    } else {
      return [];
    }
  });

  return (await Promise.all(filePromises)).flat();
};

// Function to filter .vue files containing <i18n lang="yaml">
const filterVueFiles = async (): Promise<string[]> => {
  const vueFiles = await getVueFiles(srcDir);

  const filterPromises = vueFiles.map(async (file) => {
    const content = await fs.readFile(file, "utf8");
    if (content.includes('<i18n lang="yaml">')) {
      return file;
    }
    return null;
  });

  const filteredFiles = await Promise.all(filterPromises);
  return filteredFiles.filter((file) => file !== null) as string[];
};

// Execute the filtering function
filterVueFiles()
  .then(async (filteredFiles) => {
    console.log("Awaiting translation completion for: ", filteredFiles);

    if (filteredFiles.length === 0) {
      console.log("No vue files provided");
    }

    const filesContents = await Promise.all(
      filteredFiles.map((file) => fs.readFile(file, "utf8"))
    );

    const aiClient = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
      project: process.env.OPENAI_PROJECT_ID,
      maxRetries: 3,
    });

    /**
     * Should handle extra timeouts to satisfy OpenAI rate limiting
     * https://platform.openai.com/docs/guides/rate-limits/free-tier-rate-limits
     */
    await Promise.all(
      filesContents.map(async (content, index) => {
        const filePath = filteredFiles[index];

        console.log("file to process");
        console.log(filePath);

        const i18nContent = extractI18nContent(content)!;

        const { message } = await translate(i18nContent, {
          client: aiClient,
          lang,
        });

        if (message == null) {
          console.log("Skipping: " + filePath);
          return;
        }

        await inject(message, { filePath, content }, lang);
      })
    );
  })
  .catch((error) => {
    console.error("Error during file filtering:", error);
  });
