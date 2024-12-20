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
        <link
          rel='icon'
          sizes='32x32'
          href='/images/logo.svg'
        />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
      </head>

      <body>
        <AuthProvider>
          <Provider>{children}</Provider>
          <Colors />
        </AuthProvider>
      </body>
    </html>
  );
}
