import { useState, ChangeEvent } from "react";
import { useRouter } from "next/router";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择一个视频文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        router.push(`/video?url=${encodeURIComponent(data.url)}`);
      } else {
        setError(data.error || "上传失败");
      }
    } catch (err: any) {
      setError("上传失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>视频上传</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "上传中..." : "上传视频"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
