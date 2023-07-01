import chalk, { Chalk } from "chalk";
import environment from "../../environment";

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

  const portPattern = /(\d+)/g;
  const Port = `${environment.PORT}`;
  const matches = message.match(portPattern);
  const formattedMessage = matches
    ? matches.reduce((acc, match) => {
        const port = parseInt(match, 10);
        const highlightColor =
          port === parseInt(Port, 10) ? chalk.greenBright : chalkColor;
        return acc.replace(match, highlightColor(match));
      }, message)
    : null;
  const finalMessage = matches
    ? `${chalk.gray(timestamp)} [${chalkColor(type)}] ${formattedMessage}`
    : `${chalk.gray(timestamp)} [${chalkColor(type)}] ${message}`;
  console.log(finalMessage);
}
