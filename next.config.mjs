/** @type {import('next').NextConfig} */

const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/socket",
                destination: "http://localhost:3001"
            }
        ]
    },
}

export default nextConfig;
