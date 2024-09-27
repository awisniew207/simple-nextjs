import FetchDataComponent from './FetchDataComponent';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FetchDataComponent />
        {children}
      </body>
    </html>
  );
}
