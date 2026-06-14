/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
            },
        ],
    },
    experimental: {
        // @napi-rs/canvas is a native module — keep it external so Next doesn't
        // try to bundle the .node binary.
        serverComponentsExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
        // pdfjs reads standard_fonts via a runtime filesystem path, so they
        // aren't detected by static analysis — force them into the upload
        // route's serverless bundle.
        outputFileTracingIncludes: {
            "/api/upload": ["./node_modules/pdfjs-dist/standard_fonts/**"],
        },
    },
};

module.exports = nextConfig


// Injected content via the Sentry wizard below

const {withSentryConfig} = require("@sentry/nextjs");

module.exports = withSentryConfig(
    module.exports,
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        org: "chrendon",
        project: "studysynk",
    },
    {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
    }
);
