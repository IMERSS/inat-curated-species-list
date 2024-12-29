import { FC } from 'react';
import type { Metadata } from 'next';
import { Standalone } from '@imerss/inat-curated-species-list-ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Standalone demo',
  description: '',
};

const RootLayout: FC = () => {
  console.log('???', Object.keys(Standalone));

  return (
    <html lang="en">
      <body>Hello...</body>
    </html>
  );
};

export default RootLayout;

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable}`}>
//         {children}
//       </body>
//     </html>
//   );
// }
