import ImageKit from '@imagekit/nodejs';

// Lazily create the client so dotenv has time to load before this runs.
// The client is only instantiated on the first actual upload/delete call.
let _imagekit = null;
const getImageKit = () => {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return _imagekit;
};

/**
 * Upload a file to ImageKit CDN.
 * Expects multipart/form-data with a single field named "image".
 * Returns { url, fileId, name } on success.
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided.' });
    }

    const folder = req.body.folder || '/duodude';
    const imagekit = getImageKit();

    const result = await imagekit.upload({
      file: req.file.buffer,           // Buffer from multer memoryStorage
      fileName: req.file.originalname,
      folder,
      useUniqueFileName: true,
    });

    res.status(200).json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
};

/**
 * Delete a file from ImageKit by fileId.
 * Expects JSON body: { fileId }
 */
export const deleteImage = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ message: 'fileId is required.' });
    }

    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);
    res.status(200).json({ message: 'Image deleted successfully.' });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    res.status(500).json({ message: 'Image deletion failed.', error: error.message });
  }
};
