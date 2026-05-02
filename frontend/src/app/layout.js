import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// unburdened/frontend/src/app/layout.js
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unburdened",
  description: "anonymous confessions",
  icons: {
    icon: "/unburdened2.png",
    shortcut: "/unburdened2.png",
    apple: "/unburdened2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1E1E1E",
                color: "#fff",
                border: "1px solid #2A2A2A",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
