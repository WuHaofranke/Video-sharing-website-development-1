import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const execPromise = promisify(exec);  // 让 exec 支持 async/await
const upload = multer({ dest: os.tmpdir() });

const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: '文件上传失败', details: err.message });
    }

    const tempDir = os.tmpdir();
    const originalPath = path.join(tempDir, req.file.filename);
    const compressedPath = path.join(tempDir, `compressed-${Date.now()}.mp4`);

    console.log('原始视频路径:', originalPath);

    try {
      // 读取视频元数据（时长）
      const { stdout } = await execPromise(
        `chcp 65001 & ffprobe -i "${originalPath}" -show_entries format=duration -v quiet -of csv="p=0"`
      );

      const duration = parseFloat(stdout.trim());
      console.log(`视频时长: ${duration} 秒`);

      if (duration > 5 || req.file.size > 1000 * 1024) {
        console.log('视频超出限制，进行裁剪和压缩...');
        const compressCommand = `chcp 65001 & ffmpeg -i "${originalPath}" -t 5 -vf "scale=640:360" -b:v 1000k -preset fast "${compressedPath}"`;
        await execPromise(compressCommand);
        console.log('压缩完成:', compressedPath);
        await uploadToS3(compressedPath, res);
      } else {
        console.log('视频符合要求，直接上传');
        await uploadToS3(originalPath, res);
      }
    } catch (error) {
      console.error('视频处理失败:', error);
      return res.status(500).json({ error: '视频处理失败', details: error.message });
    }
  });
}

async function uploadToS3(filePath, res) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: 'videofrank',
    Key: `videos/${path.basename(filePath)}`,
    Body: fileStream,
    ACL: 'public-read',
    ContentType: 'video/mp4',
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    console.log('视频已成功上传到 S3:', uploadParams.Key);
    fs.unlinkSync(filePath);
    return res.status(200).json({ message: '视频上传成功', url: `https://videofrank.s3.amazonaws.com/${uploadParams.Key}` });
  } catch (error) {
    console.error('上传到 S3 失败:', error);
    return res.status(500).json({ error: '上传到 S3 失败', details: error.message });
  }
}
