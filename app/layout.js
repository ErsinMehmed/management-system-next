import { Inter } from "next/font/google";
import Provider from "@/providers/MainProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Management System",
  description: "Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" sizes="32x32" href="/images/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className={inter.className}>
        <AuthProvider>
          <Provider>{children}</Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
