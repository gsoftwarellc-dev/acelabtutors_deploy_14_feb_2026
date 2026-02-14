import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Acelab Tutors - Ace Your Studies",
  description: "Premium tutoring services for academic excellence.",
};

import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { CartSheet } from "@/components/shared/cart-sheet";

import { Footer } from "@/components/layout/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Footer />
            <CartSheet />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
