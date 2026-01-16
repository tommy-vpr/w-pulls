type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  [key: string]: any;
}

export function log(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    service: "pack-reveal-worker",
    ...payload,
  };

  console[level === "error" ? "error" : "log"](JSON.stringify(entry));
}
