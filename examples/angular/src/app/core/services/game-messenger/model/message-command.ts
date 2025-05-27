export enum MessageCommandType {
  PostMessage = 'postMessage',
  ShowError = 'showError',
  CloseGame = 'closeGame',
  Noop = 'noop',
}

export type MessageCommand =
  | { type: MessageCommandType.PostMessage; payload: string; origin: string }
  | { type: MessageCommandType.CloseGame }
  | { type: MessageCommandType.Noop };
