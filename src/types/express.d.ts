import { Request } from "express"
import { UserRole } from "./UserRole"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        role: UserRole
      }
    }
  }
}


export {}