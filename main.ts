import dotenv from "dotenv";
import {convertFigmaJsonToReactComponent, fillFineTuneJson, getModels, useFineTuning} from "./src/gpt/openai.utils";

dotenv.config();

(async () => {
  // 1. Fetch data from figma
  // const figmaData = await fetchFigmaData();
  // console.log("figmaData", JSON.stringify(figmaData));
  // 2. Save data from figma into a file
  // await saveDataToFile(figmaData, "figmaData.json");
  // 3. Split data to a separate objects without children key
  // 4. Convert each object to a separate tsx component in a separate file
  // const result = await convertFigmaJsonToReactComponent("header");

  // Fill fine tune jsonl file for the gpt3 fine tuning purpose
  // await fillFineTuneJson();
  // Tune model
  await useFineTuning();

  // 5. Build the app to render everything in a one file
})();
