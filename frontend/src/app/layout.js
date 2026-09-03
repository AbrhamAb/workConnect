import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/AuthProvider";

export const metadata = {
  title: "WorkConnect",
  description: "Job platform",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
