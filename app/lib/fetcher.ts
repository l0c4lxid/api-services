export type FetchResult = {
  status: number;
  ok: boolean;
  text: string;
  durationMs: number;
};

export async function fetchWithTiming(
  url: string,
  init: RequestInit,
): Promise<FetchResult> {
  const start = performance.now();
  const response = await fetch(url, init);
  const text = await response.text();
  const durationMs = Math.round(performance.now() - start);

  return {
    status: response.status,
    ok: response.ok,
    text,
    durationMs,
  };
}
