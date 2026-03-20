import Provider from "@/providers/MainProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Colors from "@/components/Colors";
import "./globals.css";

export const metadata = {
  title: "Management System",
  description: "Management System",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang='bg'
      className='light'>
      <head>
        <link rel="icon" sizes="32x32" href="/images/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Management" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0071f5" />
      </head>

      <body suppressHydrationWarning>
        <AuthProvider>
          <Provider>{children}</Provider>
          <Colors />
        </AuthProvider>
      </body>
    </html>
  );
}
