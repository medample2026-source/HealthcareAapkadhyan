const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseBooleanField = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;

  return Boolean(value);
};

const parseNumberField = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const cleanImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const url = value.trim();

  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const isHttpUrl = ["http:", "https:"].includes(parsedUrl.protocol);

    return isHttpUrl ? url : "";
  } catch {
    return "";
  }
};

module.exports = {
  cleanImageUrl,
  parseBooleanField,
  parseJsonField,
  parseNumberField,
};
