"use server";

import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "randy.json");

async function readData() {
  const data = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(data);
}

async function writeData(data: { texts: string[] }) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function getTexts() {
  const data = await readData();
  return data.texts;
}

export async function addText(newText: string) {
  const data = await readData();
  data.texts.push(newText);
  await writeData(data);
}

export async function editText(index: number, updatedText: string) {
  const data = await readData();
  if (index >= 0 && index < data.texts.length) {
    data.texts[index] = updatedText;
    await writeData(data);
  }
}

export async function deleteText(index: number) {
  const data = await readData();
  if (index >= 0 && index < data.texts.length) {
    data.texts.splice(index, 1);
    await writeData(data);
  }
}

export async function uploadMedia(files: File[]) {
  for (const file of files) {
    const fileType = file.type.split("/")[0]; // 'image', 'audio', or 'video'
    const folderName = `${fileType}s`; // 'images', 'audios', or 'videos'
    const folderPath = path.join(process.cwd(), "public", folderName);

    // Ensure the folder exists
    await fs.mkdir(folderPath, { recursive: true });

    const filePath = path.join(folderPath, file.name);
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));
  }
}
