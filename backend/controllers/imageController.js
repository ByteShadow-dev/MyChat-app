import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// context: 'profile' | 'message'
export const saveImageLocally = (base64Image, userId, context = 'message') => {
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid image format");

    const ext = matches[1];
    const base64Data = matches[2];

    const userFolder = path.join('public', userId.toString(), context);
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }

    const filename = context === 'profile' 
        ? `profile.${ext}` 
        : `img_${Date.now()}.${ext}`;

    const filePath = path.join(userFolder, filename);
    fs.writeFileSync(filePath, base64Data, 'base64');

    return `/${userId}/${context}/${filename}`;  // URL path to serve
};