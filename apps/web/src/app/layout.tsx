import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Celestial Seal | An Authentiction App",
    description: "Purified and Created by Pratyoosh",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
