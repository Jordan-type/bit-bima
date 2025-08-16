import "./globals.css";

export const metadata = {
  title: "Your DApp",
  description: "Blockchain Health Insurance Dapp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

