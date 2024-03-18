/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    МODE: "prod",
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
