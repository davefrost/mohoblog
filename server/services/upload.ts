import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);

export async function handleFileUpload(file: Express.Multer.File): Promise<string> {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // In a production environment, you might want to upload to a cloud service
    // like AWS S3, Cloudinary, etc. For now, we'll use local storage
    
    const fileName = file.filename;
    const filePath = `/uploads/${fileName}`;
    
    // Return the public URL path
    return filePath;
  } catch (error) {
    console.error('Error handling file upload:', error);
    throw error;
  }
}
