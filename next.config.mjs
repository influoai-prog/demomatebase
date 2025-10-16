import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(
      process.cwd(),
      'src/lib/stubs/asyncStorage.ts'
    );
    config.resolve.alias['pino-pretty'] = path.resolve(process.cwd(), 'src/lib/stubs/pinoPretty.js');

    return config;
  }
};

export default nextConfig;
