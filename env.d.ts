declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      CIPHER_SECRET: string;
      PORT: number;
      EMAIL_HOST: string;
      EMAIL_USER: string;
      EMAIL_PWD: string;
    }
  }
}

export {};
