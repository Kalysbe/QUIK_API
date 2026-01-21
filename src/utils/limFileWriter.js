import fs from "fs/promises";
import path from "path";

const LIM_DIR_NAME = "lims";

function pad2(value) {
  return String(value).padStart(2, "0");
}

function buildTimestamp(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeLimFile(lines, prefix) {
  const limDir = path.join(process.cwd(), LIM_DIR_NAME);
  await fs.mkdir(limDir, { recursive: true });

  const timestamp = buildTimestamp(new Date());
  let fileName = `${prefix}-${timestamp}.lim`;
  let limPath = path.join(limDir, fileName);
  let counter = 1;

  while (await fileExists(limPath)) {
    fileName = `${prefix}-${timestamp}-${counter}.lim`;
    limPath = path.join(limDir, fileName);
    counter += 1;
  }

  const payload = `${lines.join("\n")}\n`;
  await fs.writeFile(limPath, payload, "utf8");

  return { filePath: limPath, fileName };
}
