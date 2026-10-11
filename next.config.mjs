const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/website" : "",
  assetPrefix: isGitHubPages ? "/website/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/website" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;