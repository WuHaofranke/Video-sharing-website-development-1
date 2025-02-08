import { useRouter } from "next/router";

export default function VideoPage() {
  const router = useRouter();
  const { url } = router.query;

  if (!url || typeof url !== "string") {
    return <p>视频链接无效或尚未加载</p>;
  }

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>视频预览</h1>
      <video width="600" controls>
        <source src={url} type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
      <p>
        视频链接:{" "}
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </p>
    </div>
  );
}
