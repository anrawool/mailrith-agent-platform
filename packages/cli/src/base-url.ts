const defaultMailrithApiBaseUrl = "https://api.mailrith.com";

const removeTrailingSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
};

export class InvalidMailrithApiBaseUrlError extends Error {}

export const normalizeMailrithApiBaseUrl = (
  value: string | undefined,
) => {
  let url: URL;
  try {
    url = new URL(value ?? defaultMailrithApiBaseUrl);
  } catch {
    throw new InvalidMailrithApiBaseUrlError(
      "Mailrith API URLs must be valid HTTPS URLs or localhost HTTP URLs.",
    );
  }

  const isLocal =
    url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.username || url.password) {
    throw new InvalidMailrithApiBaseUrlError(
      "Mailrith API URLs must not contain a username or password.",
    );
  }
  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw new InvalidMailrithApiBaseUrlError(
      "Mailrith API URLs must use HTTPS or localhost HTTP.",
    );
  }

  url.pathname = removeTrailingSlashes(url.pathname);
  url.search = "";
  url.hash = "";
  return removeTrailingSlashes(url.toString());
};
