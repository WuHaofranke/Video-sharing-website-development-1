import { NextRequest, NextResponse } from 'next/server';
import aws from 'aws-sdk';

// 配置 S3 客户端
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function POST(req: NextRequest) {
try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
        return new NextResponse('没有文件上传', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    try {
        const uploadResult = await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `uploads/${Date.now()}-${file.name}`,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read',
        }).promise();

        return new NextResponse(JSON.stringify({ imageUrl: uploadResult.Location }), { status: 200 });
    } catch (error) {
        return new NextResponse('上传失败', { status: 500 });
    }
} catch (error) {
    return new NextResponse('处理请求失败', { status: 500 });
}
}
