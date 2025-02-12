'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

const Home = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert('请先选择图片');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImageUrl(data.imageUrl); // 显示上传后生成的图片链接
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      alert('上传过程中发生错误');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">上传图片到 S3 并生成分享链接</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
        >
          上传
        </button>
      </form>

      {imageUrl && (
        <div className="mt-4">
          <h2 className="text-xl">上传成功！</h2>
          <p>
            分享链接:{" "}
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              {imageUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
