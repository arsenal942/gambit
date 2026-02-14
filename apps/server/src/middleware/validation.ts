const NANOID_REGEX = /^[A-Za-z0-9_-]+$/;

export function isValidGameId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === 12 &&
    NANOID_REGEX.test(value)
  );
}

export function isValidPlayerToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === 21 &&
    NANOID_REGEX.test(value)
  );
}

export function isValidColor(value: unknown): value is "white" | "black" {
  return value === "white" || value === "black";
}
