import jwt from "jsonwebtoken";
import { UserRole } from "../types/UserRole";

const SECRET = process.env.JWT_SECRET!;

export function generateToken(user: {
    id: number
    role: UserRole
}) {
    return jwt.sign(
        { 
            id: user.id,
            role: user.role
        },
        SECRET,
        { 
            expiresIn: "7d"
        }
    )
}

export function verifyToken(token: string) {
    return jwt.verify(token, SECRET)
}