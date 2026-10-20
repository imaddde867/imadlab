export let handler: (request: Request) => Promise<Response>;
export function serve(callback: typeof handler) {
  handler = callback;
}
