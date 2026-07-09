import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { HttpError } from "../utils/HttpError";

// Até 15 imagens por request (capa + galeria). Cada uma até 8 MB. Como o arquivo
// fica na MEMÓRIA (memoryStorage), esses limites evitam que um upload gigante
// estoure a RAM do servidor.
const MAX_FILES = 15;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

// Checagem rápida pelo mimetype declarado. A checagem CONFIÁVEL (magic bytes)
// acontece depois, no UploadService.
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp"];

// memoryStorage: o multer segura cada arquivo como Buffer em req.files[].buffer,
// sem gravar em disco. Perfeito aqui, pois só repassamos os bytes ao Cloudinary.
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    callback(null, true);
    return;
  }
  callback(HttpError.badRequest("Formato não suportado. Envie JPEG, PNG ou WebP."));
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES },
  fileFilter,
});

// Middleware pronto para a rota: espera de 1 a 15 arquivos no campo "files".
export const uploadImages = upload.array("files", MAX_FILES);
