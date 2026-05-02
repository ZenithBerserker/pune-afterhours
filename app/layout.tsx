import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pune Afterhours",
  description: "Discover private flat gigs, terrace parties & BYOJ events happening tonight in Pune.",
  themeColor: "#0a0a0f",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
