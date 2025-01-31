import { useRouter } from 'next/router';

export default function VideoPage() {
  const router = useRouter();
  const { url } = router.query;

  if (!url) {
    return <p>未提供视频链接</p>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>视频播放</h1>
      <video src={url} controls width="600" />
      <p>视频链接: <a href={url} target="_blank">{url}</a></p>
    </div>
  );
}
