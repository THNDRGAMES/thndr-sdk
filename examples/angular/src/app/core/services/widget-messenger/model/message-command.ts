export enum MessageCommandType {
  PostMessage = 'postMessage',
  ShowError = 'showError',
  CloseWidget = 'closeWidget',
  Noop = 'noop',
}

export type MessageCommand =
  | { type: MessageCommandType.PostMessage; payload: string; origin: string }
  | { type: MessageCommandType.CloseWidget }
  | { type: MessageCommandType.Noop };
