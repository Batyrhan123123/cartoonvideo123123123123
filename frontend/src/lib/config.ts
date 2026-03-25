let runtimeConfig: {
  API_BASE_URL: string;
} | null = null;

let configLoading = true;

const getSafeOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

const defaultConfig = {
  API_BASE_URL: getSafeOrigin(),
};

function isValidApiBaseUrl(value: string | undefined | null): boolean {
  if (!value || typeof value !== "string") return false;
  if (value.includes("$$BACKEND_DOMAIN$$")) return false;
  if (value.includes("lambda-url.") || value.includes(".on.aws")) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function loadRuntimeConfig(): Promise<void> {
  try {
    console.log("🔧 DEBUG: Starting to load runtime config...");

    const response = await fetch("/api/config", { cache: "no-store" });

    console.log("🔧 DEBUG: /api/config status =", response.status);
    console.log(
      "🔧 DEBUG: /api/config content-type =",
      response.headers.get("content-type")
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const configData = await response.json();
        const apiBaseUrl = configData?.API_BASE_URL;

        if (isValidApiBaseUrl(apiBaseUrl)) {
          runtimeConfig = {
            API_BASE_URL: apiBaseUrl,
          };
          console.log("🔧 DEBUG: Runtime config loaded:", runtimeConfig);
        } else {
          console.warn(
            "🔧 DEBUG: Runtime config contains invalid API_BASE_URL, using fallback:",
            apiBaseUrl
          );
        }
      } else {
        console.warn("🔧 DEBUG: /api/config returned non-JSON");
      }
    } else {
      console.warn("🔧 DEBUG: Config fetch failed with status:", response.status);
    }
  } catch (error) {
    console.warn("🔧 DEBUG: Failed to load runtime config:", error);
  } finally {
    configLoading = false;
    console.log("🔧 DEBUG: Config loading finished");
    console.log("🔧 DEBUG: Final API_BASE_URL =", getConfig().API_BASE_URL);
  }
}

export function getConfig() {
  if (runtimeConfig?.API_BASE_URL) {
    return runtimeConfig;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    const viteApiBase = import.meta.env.VITE_API_BASE_URL as string;
    if (isValidApiBaseUrl(viteApiBase)) {
      return {
        API_BASE_URL: viteApiBase,
      };
    }
  }

  return defaultConfig;
}

export function getAPIBaseURL(): string {
  return getConfig().API_BASE_URL;
}

export function isConfigLoading(): boolean {
  return configLoading;
}

export const config = {
  get API_BASE_URL() {
    return getAPIBaseURL();
  },
};