export type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
};

export type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first: <T = unknown>() => Promise<T | null>;
  run: () => Promise<D1Result>;
  all: <T = unknown>() => Promise<D1Result<T>>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1Statement;
  batch: (statements: D1Statement[]) => Promise<D1Result[]>;
};

export type GripSkyRuntimeEnvironment = {
  DB?: D1DatabaseLike;
  AWS_SES_REGION?: string;
  AWS_SES_ACCESS_KEY_ID?: string;
  AWS_SES_SECRET_ACCESS_KEY?: string;
  SES_FROM_EMAIL?: string;
  SERVICE_INBOX_EMAIL?: string;
  SUBSCRIPTION_CODE_PEPPER?: string;
  LOCAL_EMAIL_PREVIEW?: string;
};

declare global {
  var __GRIPSKY_ENV__: GripSkyRuntimeEnvironment | undefined;
}

export function setRuntimeEnv(values: GripSkyRuntimeEnvironment): void {
  globalThis.__GRIPSKY_ENV__ = values;
}

export function getRuntimeEnv(): GripSkyRuntimeEnvironment {
  if (!globalThis.__GRIPSKY_ENV__) {
    throw new Error("GripSky runtime environment is not initialized.");
  }
  return globalThis.__GRIPSKY_ENV__;
}
