import { LogColors, Logs } from "./LogColors";

export function Server(message: string) {
  return console.log(
    `${LogColors.White}${LogColors.Bright}${LogColors.Blue}${Logs.Server}${LogColors.White}: ${LogColors.White}${message}`
  );
}

export function Error(message: string) {
  return console.log(
    `${LogColors.White}${LogColors.Bright}${LogColors.Yellow}${Logs.Error}${LogColors.White}: ${LogColors.White}${message}`
  );
}

export function Warn(message: string) {
  return console.log(
    `${LogColors.White}${LogColors.Bright}${LogColors.Yellow}${Logs.Warn}${LogColors.White}: ${LogColors.White}${message}`
  );
}

export function Gateway(message: string) {
  return console.log(
    `${LogColors.White}${LogColors.Bright}${LogColors.Green}${Logs.Gateway}${LogColors.White}: ${LogColors.White}${message}`
  );
}

export function Database(message: string) {
  return console.log(
    `${LogColors.White}${LogColors.Bright}${LogColors.Cyan}${Logs.Database}${LogColors.White}: ${LogColors.White}${message}`
  );
}
