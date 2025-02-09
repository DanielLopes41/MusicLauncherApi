import multer from 'multer';

const storage = multer.memoryStorage()
const allowedMimes = [
    'audio/mpeg',  // MP3
    'audio/webm',  // WebM (áudio)
    'audio/ogg',   // OGG
    'audio/wav',   // WAV
    'audio/flac',  // FLAC
    'video/webm',
  ];
  export default {
    storage,
    fileFilter: (req, file, cb) => {
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Only audio files are allowed!'));
      }
      cb(null, true);
    },
  };