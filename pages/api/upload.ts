// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import formidable, { File } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';




// 配置 AWS S3 客户端，使用环境变量或直接在代码中硬编码（不推荐硬编码）
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '你的access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '你的secret-key',
  },
});

export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body 解析器
  },
};

const MAX_DURATION = 50; // 最大时长 1 秒
const MAX_SIZE = 20*500*1024; // 最大文件大小 10mb

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({
    multiples: false,
    uploadDir: os.tmpdir(),
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // **限制单个文件大小 20MB**
    maxTotalFileSize: 20 * 1024 * 1024, // **限制总上传大小 20MB** // 限制文件大小
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: '文件上传失败', details: err.message });
    }

    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ error: '未上传文件' });
    }
    const videoFile: File = Array.isArray(fileField) ? fileField[0] : fileField;
    const originalPath = videoFile.filepath;
    const fileName = videoFile.originalFilename || uuidv4() + '.mp4';

    // 获取视频时长
      // 如果视频超出限制，则裁剪视频
      
        uploadToS3(originalPath, fileName, res);
      
    })

};

async function uploadToS3(filePath: string, fileName: string, res: NextApiResponse) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME || 'videofrank',
    Key: `videos/${fileName}`,
    Body: fileStream,
    ACL: 'public-read' as const,
    ContentType: 'video/mp4',
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    console.log('S3 上传成功:', fileName);
    fs.unlinkSync(filePath); // 删除临时文件
    const videoUrl = `https://${process.env.AWS_S3_BUCKET_NAME || 'videofrank'}.s3.amazonaws.com/videos/${fileName}`;
    res.status(200).json({ message: '视频上传成功', url: videoUrl });
  } catch (uploadError: any) {
    console.error('S3 上传失败:', uploadError);
    res.status(500).json({ error: '上传到 S3 失败', details: uploadError.message });
  }
}

export default uploadHandler;
