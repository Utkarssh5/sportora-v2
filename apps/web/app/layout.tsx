import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata = {
  title: 'Sportora V2 | Arena Engine',
  description: 'AI-Powered Tournament Engine & Ground Crew Marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#00FF66] selection:text-black">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
