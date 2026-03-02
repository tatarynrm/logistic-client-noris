import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ReactQueryProvider } from '@/lib/react-query';

export const metadata: Metadata = {
  title: 'Менеджер Рейсів',
  description: 'Управління рейсами та заробітком',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
      </head>
      <body>
        <ReactQueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
