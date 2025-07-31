import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: "Inquizzit - Real-time Quiz App",
  description:
    "Inquizzit is a real-time quiz app where users generate instant questions, join rooms, and compete live. Built with Node.js, Socket.IO, and Groq API.",
  keywords: [
    "quiz app",
    "real-time quiz",
    "Socket.IO",
    "Groq API",
    "Next.js",
    "Node.js",
    "Inquizzit",
    "live quiz",
  ],
  authors: [{ name: "Aayush Khadka", url: "https://aayush-khadka.tech" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
