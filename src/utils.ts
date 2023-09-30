import fs from "fs";
import util from "util";
import { OriginalFormat } from "./types";

export const findTargetRootNode = (targetId: string, item: OriginalFormat) => {
  let targetItem = null;

  const findItemRecursive = (item: OriginalFormat) => {
    if (item.id === targetId) {
      targetItem = item;

      return;
    }

    if (!item?.children?.length) {
      return;
    }

    item.children.forEach((child) => {
      if (child.id === targetId) {
        targetItem = child;

        return;
      }

      findItemRecursive(child);
    });
  };

  findItemRecursive(item);

  return targetItem;
};

export const saveDataToFile = async (data: any, filename: string) => {
  return fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
};

export const saveDataToFileSync = (filePath: string, dataToAppend: string) => {
  fs.appendFile(filePath, dataToAppend, "utf8", (error) => {
    if (error) {
      console.error("Ошибка записи в файл:", error);
    } else {
      console.log("Данные добавлены в файл без перезаписи.");
    }
  });
};

// Convert fs.readFile into Promise version of same
export const readFile = util.promisify(fs.readFile);
