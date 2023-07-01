import chalk, { Chalk } from "chalk";

export default {
  log(message: string): void {
    logMessage(message, "Iris", "greenBright");
  },

  debug(message: string): void {
    logMessage(message, "Debug", "blueBright");
  },

  error(message: string): void {
    logMessage(message, "Error", "redBright");
  },

  warn(message: string): void {
    logMessage(message, "Warn", "yellowBright");
  },
};

function logMessage(message: string, type: string, color: keyof Chalk): void {
  const timestamp = new Date().toISOString();
  const chalkColor: any = chalk[color];
  return console.log(
    `${chalk.gray(timestamp)} [${chalkColor(type)}] ${message}`
  );
}
