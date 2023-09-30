import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { CreateChatCompletionRequestMessage } from "openai/src/resources/chat/completions";
import dotenv from "dotenv";
import { FileObject } from "openai/resources";
import { MappedFormat, OriginalFormat, UserPrompt } from "../types";
import { readFile } from "../utils";

dotenv.config();

const OPENAI_API_KEY = "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";
const OPEN_AI_ORG_ID = "org-VSziXTSLGvGh041rbrtuqSsp";
const OPENAI_FINE_TUNNING_JOB_ID = process.env.OPENAI_FINE_TUNNING_JOB_ID;
const INTRO_MESSAGE =
  "You are a helpful assistant that converts Figma JSON with styles to TSX. " +
  "I will send you json object, please convert it to a react typescript component which I can copy and paste into .tsx file and it will work properly without any bugs.";
const SYSTEM_ENTIRE_MESSAGE = "You are a helpful assistant that converts Figma JSON with styles to TSX.";
const USER_MESSAGE =
  "I will send you json object, please convert it to a react typescript component which I can copy and paste into .tsx file and it will work properly without any bugs. \n  ## constraints\n  - do not omit any details in TSX\n  - write only tsx\n  - don not use comments\n  - use styled components for styling";
const PROMPT_MESSAGE = `${SYSTEM_ENTIRE_MESSAGE} ${USER_MESSAGE}`;

const fineTuneTemplate = {
  messages: [
    {
      role: "system",
      content: SYSTEM_ENTIRE_MESSAGE,
    },
    {
      role: "user",
      content: USER_MESSAGE,
    },
    {
      role: "user",
      content: "",
    },
    {
      role: "assistant",
      content: "",
    },
  ],
};

const openai = new OpenAI({
  organization: OPEN_AI_ORG_ID,
  apiKey: OPENAI_API_KEY,
});

/* response example:
uploadedFile {
  object: 'file',
  id: 'file-T0NbTwWlyq4Wfus0ZQ5t9pLG',
  purpose: 'fine-tune',
  filename: 'fineTune.json',
  bytes: 785,
  created_at: 1693916826,
  status: 'uploaded',
  status_details: null
}
 */
export const createFineTuningFile = (file: string) => {
  return openai.files.create({
    file: fs.createReadStream(file),
    purpose: "fine-tune",
  });
};

export const createFineTuningJob = (fileName: string) => {
  return openai.fineTuning.jobs.create({
    model: "gpt-3.5-turbo",
    training_file: fileName,
  });
};

export const retrieveFineTuningJob = (jobId: string) => {
  return openai.fineTuning.jobs.retrieve(jobId);
};

export const convertFigmaJsonToTsx = async (model, jsonItem: string) => {
  if (!OPENAI_API_KEY) {
    throw new Error("NO OPENAI ACCESS TOKEN");
  }

  const userPrompt: UserPrompt = {
    role: "user",
    content: JSON.stringify(jsonItem),
  };

  const messages: CreateChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: SYSTEM_ENTIRE_MESSAGE,
    },
    {
      role: "user",
      content: USER_MESSAGE,
    },
    { ...userPrompt },
  ];

  return openai.chat.completions.create({
    messages,
    model,
  });
};

export const convertJsonToTsx = async (model: string) => {
  const directoryPath = "./src/figma/json-components/";

  fs.readdir(directoryPath, async (err, files) => {
    try {
      for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const jsonItemString: string = await readFile(filePath, "utf-8");

        const itemResult = await convertFigmaJsonToTsx(model, jsonItemString);

        console.log("itemResult", itemResult);

        await fs.writeFileSync(`./result/${file.replace(".json", ".tsx")}`, itemResult?.choices?.[0]?.message?.content);
      }
    } catch (error) {
      console.error("Произошла ошибка convertFigmaJsonToTsx:", error);
    }
  });
};

export const getModels = async () => {
  return openai.models.list();
};

export const convertFigmaJsonToReactComponent = async (componentName: string) => {
  try {
    const jsonItemString: string = await readFile(`./src/figma/json-components/${componentName}.json`, "utf-8");
    const jsonItem: OriginalFormat = JSON.parse(jsonItemString);

    const userPrompt: UserPrompt = {
      role: "user",
      content: JSON.stringify(jsonItem),
    };

    const messages: CreateChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: PROMPT_MESSAGE,
      },
      { ...userPrompt },
    ];

    return openai.chat.completions.create({
      messages,
      model: "gpt-4",
      temperature: 0,
    });
  } catch (e) {
    throw new Error(`convertFigmaJsonToReactComponent error ${e}`);
  }
};

export const appendFineTuneStr = (jsonItemString: string, tsxItemString: string) => {
  const newStr = { ...fineTuneTemplate };

  newStr.messages[2].content = jsonItemString;
  newStr.messages[3].content = tsxItemString;

  fs.appendFile("./src/figma/fine-tuning-prompts/fine-tune.jsonl", JSON.stringify(newStr) + "\n", (err) => {
    if (err) {
      console.error(`Error appending to file fine-tune.jsonl:`, err);
    }
  });
};

export const fillFineTuneJson = async () => {
  const directoryPath = "./src/figma/json-components/";

  fs.readdir(directoryPath, async (err, files) => {
    if (err) {
      return console.error("Error reading the directory:", err);
    }

    for (const file of files) {
      const filePath = path.join(directoryPath, file);

      console.log("file", file);

      try {
        const jsonItemString: string = await readFile(filePath, "utf-8");
        const tsxItemString: string = await readFile(
          `${directoryPath.replace("json-components/", "tsx-components/")}${file.replace(".json", ".tsx")}`,
          "utf-8",
        );

        appendFineTuneStr(jsonItemString, tsxItemString);
      } catch (e) {
        console.log("fillFineTuneJson error", e);
      }
    }
  });
};

export const useFineTuning = async () => {

  const fineTuneFile = "./src/figma/fine-tuning-prompts/fine-tune.jsonl";
  const uploadedFile: FileObject = await createFineTuningFile(fineTuneFile);

  console.log("uploadedFile", uploadedFile);

  if (!uploadedFile?.id) {
    throw new Error(`Failed to create openAi file = ${fineTuneFile}`);
  }

  const openAiFileId = uploadedFile.id;

  const fineTuningJob = await createFineTuningJob(openAiFileId);

  console.log("fineTuningJob", fineTuningJob);

  if (!fineTuningJob?.id) {
    throw new Error(`Failed to fetch fine tuning job from file id = ${openAiFileId}`);
  }



  const job = await retrieveFineTuningJob("ftjob-KjyD3NeJF775qBPGenmL9zMI");

  console.log("job", job);

  // Before using the job make sure it's status became "succeeded" and fine_tuned_model !== null

  if (job.fine_tuned_model && job.status === "succeeded") {
    await convertJsonToTsx(job.fine_tuned_model);
  }
};
