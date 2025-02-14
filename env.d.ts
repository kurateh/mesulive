declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      LOKI_HOST: string;
      LOKI_TOKEN: string;
      LOKI_USER: string;
      LOKI_ENVIRONMENT: string;
      GA4_ID: string;
      NEXT_PUBLIC_LOG_VERSION: string;
      NEXT_PUBLIC_POTENTIAL_DATA_VERSION: string;
      NEXON_OPEN_API_KEY: string;
      GOOGLE_ADS_TXT_CONTENT: string;
      NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT: string;
    }
  }
}

export {};
