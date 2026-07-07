// Shared SWR fetcher. Throws on non-2xx so SWR surfaces errors instead of
// caching an error body as if it were data.
export class FetchError extends Error {
  status: number;
  info: unknown;
  constructor(message: string, status: number, info: unknown) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    let info: unknown = null;
    try {
      info = await res.json();
    } catch {
      /* non-JSON error body */
    }
    throw new FetchError(`Request to ${url} failed`, res.status, info);
  }
  return res.json();
};
