import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure necessary upload subdirectories exist
const uploadDirs = ['public/uploads/avatars', 'public/uploads/thumbnails', 'public/uploads/assignments', 'public/uploads/certificates'];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/uploads';
    if (file.fieldname === 'avatar') {
      folder = 'public/uploads/avatars';
    } else if (file.fieldname === 'thumbnail') {
      folder = 'public/uploads/thumbnails';
    } else if (file.fieldname === 'assignment') {
      folder = 'public/uploads/assignments';
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar' || file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars and thumbnails!'), false);
    }
  } else if (file.fieldname === 'assignment') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for assignments!'), false);
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});
export default upload;
