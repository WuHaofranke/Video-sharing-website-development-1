import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

// 配置 AWS S3
const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: 'AKIATQPD64TVL26XW5GU',
    secretAccessKey: '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',
  },
});

// 设置 multer 存储引擎为 S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'videofrank',  // 设置 S3 桶名称
    acl: 'public-read',  // 设置文件为公共可读
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, file.originalname);  // 文件名
    },
  }),
});

const uploadHandler = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Something went wrong during the file upload.' });
    }
    // 上传成功
    res.status(200).json({ message: 'File uploaded successfully!' });
  });
};

export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body 解析器，使用 multer 处理
  },
};

export default uploadHandler;
