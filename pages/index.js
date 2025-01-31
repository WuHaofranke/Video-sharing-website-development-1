import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleUpload = async () => {
    if (!selectedFile) return alert('请选择一个视频文件');

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setUploading(false);

    if (response.ok) {
      setVideoUrl(data.url);
    } else {
      alert('上传失败: ' + data.error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>上传视频</h1>
      <input type="file" accept="video/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? '上传中...' : '上传'}
      </button>

      {videoUrl && (
        <div>
          <h2>视频已上传</h2>
          <video src={videoUrl} controls width="500" />
          <p>视频链接: <a href={videoUrl} target="_blank">{videoUrl}</a></p>
        </div>
      )}
    </div>
  );
}
