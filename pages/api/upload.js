import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // 限制上传文件大小
    },
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { file, fileName } = req.body;

      // 解析保存路径
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 保存文件
      const filePath = path.join(uploadDir, fileName);
      const base64Data = file.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));

      res.status(200).json({ message: "File uploaded successfully", filePath: `/uploads/${fileName}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "File upload failed" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
