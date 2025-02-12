import './globals.css';

export const metadata = {
  title: '上传图片到 S3',
  description: '上传图片并生成分享链接',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
