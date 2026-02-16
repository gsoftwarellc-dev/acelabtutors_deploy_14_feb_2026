/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    generateBuildId: async () => {
        return 'build-' + Date.now();
    },
    output: 'standalone',
    cacheMaxMemorySize: 0,
    experimental: {
        isrFlushToDisk: false,
    }
};

export default nextConfig;
