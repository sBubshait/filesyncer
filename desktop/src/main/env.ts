export interface EnvFile {
  ACCESS_TOKEN?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_BUCKET_NAME?: string;
  AWS_REGION?: string;
}

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

export const awsConfigToEnv = (config: AWSConfig): Partial<EnvFile> => ({
  AWS_ACCESS_KEY_ID: config.accessKeyId,
  AWS_SECRET_ACCESS_KEY: config.secretAccessKey,
  AWS_BUCKET_NAME: config.bucketName,
  AWS_REGION: config.region,
});

export const envToAwsConfig = (env: EnvFile): AWSConfig | null => {
  if (!env.AWS_ACCESS_KEY_ID) return null;

  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    bucketName: env.AWS_BUCKET_NAME!,
    region: env.AWS_REGION!,
  };
};
