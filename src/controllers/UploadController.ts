import { Request, Response } from "express";
import Service from "../services/UploadService";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";

function UploadController() {

  const upload = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw HttpError.badRequest("Nenhum arquivo enviado (use o campo 'files').");
    }
    const result = await Service.uploadImages(files.map(file => file.buffer));
    return res.status(201).json({ files: result });
  });

  return { upload };
}

export default UploadController();
