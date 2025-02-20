import { Inter } from "next/font/google";
import "./globals.css";

// unburdened/frontend/src/app/layout.js
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Unburdened",
  description: "anonymous confessions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
