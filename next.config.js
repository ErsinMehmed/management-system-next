/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    МODE: "prod",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
