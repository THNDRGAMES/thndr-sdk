export function assertNever(x: never, message: string): never {
  throw new Error(`${message}: ${JSON.stringify(x)}`);
}
