import { type OpenAI } from "openai";
export const translate = async (
  content: string,
  { client, lang }: { client: OpenAI; lang: string }
) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Return only yaml content and match provided schema. Do not return provided input. Make sure that expected answer is in requested language which is " +
          lang +
          ". Otherwise return an error",
      },
      { content, role: "user" },
    ],
    response_format: {
      type: "text",
    },
  });

  const [choice] = response.choices;

  if (choice.finish_reason !== "stop") {
    throw new Error("Something went wrong," + choice.message.refusal);
  }

  return choice.message.content;
};
