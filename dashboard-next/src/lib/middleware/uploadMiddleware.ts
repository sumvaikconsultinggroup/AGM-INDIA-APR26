import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextApiRequest } from 'next';

// Constants for file size and allowed mime types
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'events');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `event-${uniqueSuffix}${ext}`);
    }
});

// File validation: Check mime type and file size
const fileFilter = (req:unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')); // Reject file
    }
};

// Multer setup with single file upload
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Allow only one file per request
    }
}).single('eventImage');

// TypeScript interface for Next.js request object with file property
export interface MulterNextApiRequest extends NextApiRequest {
    file?: Express.Multer.File;
}

// Centralized error handler for file upload errors
export const handleUploadError = (
    err: Error | multer.MulterError,
    _req: MulterNextApiRequest,
    res: import('next').NextApiResponse,
    next: (error?: Error) => void
) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
        }
    }

    // If it's a different kind of error, pass it to the next middleware
    next(err);
};
