import { Request, Response } from "express";
import UserService from "../services/UserService";
import { asyncHandler } from "../utils/asyncHandler";

function UserController() {

    const addUser = asyncHandler(async (req: Request, res: Response) => {

        const result = await UserService.createUser(req.body);

        const { password: _, ...userWithoutPassword } = result.newUser as any;

        return res
            .status(201)
            .json({
                user: userWithoutPassword,
                token: result.token
            });
    });


    const auth = asyncHandler(async (req: Request, res: Response) => {

        const { username, password } = req.body;

        const result = await UserService.auth({ username, password });

        const { password: _, ...userWithoutPassword } = result.user as any;

        return res
            .status(200)
            .json({
                token: result.token,
                user: userWithoutPassword,
            });
    });

    return {
        addUser,
        auth
    }
}

export default UserController();
