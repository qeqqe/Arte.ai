import { Toaster } from 'sonner';
import TanStackProvider from '../providers/tanstack-provider';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TanStackProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TanStackProvider>
      </body>
    </html>
  );
}
