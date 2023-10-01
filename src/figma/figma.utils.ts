import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import {CssLayout, FigmaData, MappedFormat, OriginalFormat} from "../types";
import {findTargetRootNode, readFile} from "../utils";
import {mapDataRecursive} from "./mapData";

dotenv.config();

const FIGMA_FILE_ID = "F8NudXpRM99UbUWxD8A00t";
const FIGMA_ACCESS_TOKEN = "figd_DIfj4LLbq_HfGzkLnq8_IfQHdEcBdWwxXpogPtim";
const ID_TO_FIND = "0:0";

function extractObjects(parent) {
    const objects = [];
    if (parent.children) {
        parent.children.forEach((object) => {
            objects.push(object);

            if (object.children) {
                const childObjects = extractObjects(object);
                objects.push(...childObjects);
            }
        });
    }
    return objects;
}

export const getFigmaProjectDataAsJsonl = async () => {
    try {
        const response = await axios.get(`https://api.figma.com/v1/files/${FIGMA_FILE_ID}`, {
            headers: {
                "X-Figma-Token": FIGMA_ACCESS_TOKEN,
            },
        });
        const pageData = response.data;

        const topLevelObjects = extractObjects(pageData.document);

        topLevelObjects.forEach((object) => {
            console.log(object);
        });

        const jsonDataLines = topLevelObjects.map((object) => JSON.stringify(object));

        // Записываем JSONL-строки в файл
        fs.writeFileSync("figma_project.jsonl", jsonDataLines.join("\n"));
        console.log("Данные проекта сохранены в файл figma_project.jsonl");
    } catch (error) {
        console.error("Ошибка при получении данных из Figma:", error.message);
    }
};

export const fetchFigmaData = async (): Promise<FigmaData> => {
    if (!FIGMA_FILE_ID) {
        throw new Error("NO FIGMA FILE ID");
    }

    if (!FIGMA_ACCESS_TOKEN) {
        throw new Error("NO FIGMA ACCESS TOKEN");
    }

    const response = await axios.get(`https://api.figma.com/v1/files/${FIGMA_FILE_ID}`, {
        headers: {
            "X-Figma-Token": FIGMA_ACCESS_TOKEN,
        },
    });

    return response.data;
};

export const figmaToCss = (figmaObject: OriginalFormat): CssLayout => {
    const css: CssLayout = {
        display: "flex",
        flexDirection: figmaObject.layoutMode === "HORIZONTAL" ? "row" : "column",
    };

    if (figmaObject.primaryAxisAlignItems === "SPACE_BETWEEN") {
        css.justifyContent = "space-between";
    } else {
        if (figmaObject.layoutMode === "HORIZONTAL") {
            switch (figmaObject.primaryAxisAlignItems) {
                case "MIN":
                    css.justifyContent = "flex-start";
                    break;
                case "CENTER":
                    css.justifyContent = "center";
                    break;
                case "MAX":
                    css.justifyContent = "flex-end";
                    break;
            }
        } else {
            switch (figmaObject.primaryAxisAlignItems) {
                case "MIN":
                    css.justifyContent = "flex-start";
                    break;
                case "CENTER":
                    css.justifyContent = "center";
                    break;
                case "MAX":
                    css.justifyContent = "flex-end";
                    break;
            }
        }
    }

    switch (figmaObject.counterAxisAlignItems) {
        case "MIN":
            css.alignItems = "flex-start";
            break;
        case "CENTER":
            css.alignItems = "center";
            break;
        case "MAX":
            css.alignItems = "flex-end";
            break;
        case "BASELINE":
            css.alignItems = "baseline";
            break;
    }

    return css;
};

export const x = async () => {

}

export const readAndConvertData = async () => {
    try {
        // Чтение данных из figmaData.json
        const rawData = await readFile("figmaData.json", "utf-8");
        const jsonData: { document: OriginalFormat } = JSON.parse(rawData);
        const originalData: OriginalFormat = findTargetRootNode(ID_TO_FIND, jsonData.document);
        const mappedData: MappedFormat[] = mapDataRecursive(originalData);

        await fs.writeFileSync("figmaDataMapped.json", JSON.stringify(mappedData, null, 2));

        console.log("Преобразование завершено. Результат сохранен в figmaDataMapped.json");
    } catch (error) {
        console.error("Произошла ошибка:", error);
    }
};
