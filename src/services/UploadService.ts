import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { HttpError } from "../utils/HttpError";
import { isRealImage } from "../utils/imageSignature";

// Credenciais do Cloudinary (OPCIONAIS no ambiente). Se faltarem, o upload
// responde 503 em vez de derrubar o servidor inteiro no startup.
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function UploadService() {

  const isConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

  // O if repete a checagem (em vez de usar isConfigured) para o TypeScript
  // estreitar as variáveis de string | undefined para string dentro do bloco.
  if (CLOUD_NAME && API_KEY && API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
      secure: true,
    });
  }

  // O SDK sobe via stream (upload_stream). Envolvemos numa Promise e "empurramos"
  // o buffer com stream.end(buffer) para poder usar async/await.
  function uploadBufferToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products", resource_type: "image" },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Falha no upload para o Cloudinary"));
            return;
          }
          resolve(result);
        }
      );
      stream.end(buffer);
    });
  }

  // Valida TODOS os arquivos antes de subir qualquer um (falha rápida: não sobe
  // metade se um for inválido). Depois sobe em paralelo, preservando a ordem.
  async function uploadImages(buffers: Buffer[]) {

    if (!isConfigured) {
      throw new HttpError(503, "Upload de imagens não configurado no servidor.");
    }

    for (const buffer of buffers) {
      if (!isRealImage(buffer)) {
        throw HttpError.badRequest("Um dos arquivos não é uma imagem válida (JPEG, PNG ou WebP).");
      }
    }

    const results = await Promise.all(buffers.map(buffer => uploadBufferToCloudinary(buffer)));

    return results.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    }));
  }

  return { uploadImages };
}

export default UploadService();
