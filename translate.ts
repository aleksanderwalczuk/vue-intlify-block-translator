import { type OpenAI } from "openai";
import { extractRateLimitHeaders } from "./extract";

export const translate = async (
  content: string,
  { client, lang }: { client: OpenAI; lang: string }
) => {
  const response = await client.chat.completions
    .create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Return only yaml content and match provided schema. Do not return provided input. Make sure that expected answer is in requested language which is " +
            lang +
            ". Do not translate schema keys, they are immutable. Only values should be translated to requested langauage. Otherwise return an error comment and provide a reason",
        },
        { content, role: "user" },
      ],
      response_format: {
        type: "text",
      },
    })
    .withResponse();

  const [choice] = response.data.choices;

  const rateLimits = extractRateLimitHeaders(response.response.headers);

  if (choice.finish_reason !== "stop") {
    throw new Error("Something went wrong," + choice.message.refusal);
  }

  return {
    message: choice.message.content,
    limits: rateLimits,
  };
};
