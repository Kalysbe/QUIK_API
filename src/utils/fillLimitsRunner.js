import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import iconv from "iconv-lite";

const FILL_DIR_NAME = "fillLimits";
const FILL_EXE_NAME = "FillLimits.exe";
const FILL_INI_NAME = "info.ini";
const OUTPUT_LOG_NAME = "output.log";
const OUTPUT_LOG_ENCODING = "win1251";

async function readOutputLog(cwd) {
  const logPath = path.join(cwd, OUTPUT_LOG_NAME);
  try {
    const buffer = await fs.readFile(logPath);
    const content = iconv.decode(buffer, OUTPUT_LOG_ENCODING);
    return { outputLog: content, outputLogError: null };
  } catch (error) {
    return {
      outputLog: "",
      outputLogError: {
        message: error.message,
        code: error.code ?? null,
      },
    };
  }
}

export async function runFillLimits(limFileName) {
  const cwd = path.join(process.cwd(), FILL_DIR_NAME);
  const exePath = path.join(cwd, FILL_EXE_NAME);
  const limArg = path.join("..", "lims", limFileName);

  console.log(`[FillLimits] запуск: "${exePath}" ${limArg} ${FILL_INI_NAME}`);

  return new Promise((resolve) => {
    execFile(
      exePath,
      [limArg, FILL_INI_NAME],
      { cwd, windowsHide: true },
      async (error, stdout, stderr) => {
        const exitCode =
          typeof error?.code === "number" ? error.code : error ? null : 0;

        if (stdout) {
          console.log(`[FillLimits] stdout:\n${stdout}`);
        }
        if (stderr) {
          console.log(`[FillLimits] stderr:\n${stderr}`);
        }
        if (error) {
          console.log(
            `[FillLimits] ошибка: ${error.message} (code: ${error.code ?? "unknown"})`
          );
        } else {
          console.log(`[FillLimits] завершено с кодом: ${exitCode}`);
        }

        const { outputLog, outputLogError } = await readOutputLog(cwd);

        const exitCodeDescriptionMap = {
          0: "Ошибок нет. Позиции сохранены в файл или загружены из файла",
          1: "Не удалось установить соединение с Сервером QUIK",
          2: "Ошибка доступа к файлу импорта/экспорта",
          3: "Недоступна транзакция для работы с ограничениями по клиентским счетам",
          4: "Ошибка синтаксиса в файле импорта",
          5: "Прочие ошибки",
        };

        resolve({
          exitCode,
          exitCodeDescription:
            exitCode !== null && exitCodeDescriptionMap[exitCode]
              ? exitCodeDescriptionMap[exitCode]
              : "Неизвестный код завершения",
          stderr: stderr ?? "",
          error: error
            ? { message: error.message, code: error.code ?? null }
            : null,
          outputLog,
          outputLogError,
        });
      }
    );
  });
}
