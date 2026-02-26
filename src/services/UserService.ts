import { User } from "../entities/User";
import { Cart } from "../entities/Cart";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcrypt";
import { CreateUser, Auth } from "../types/userTypes";
import { generateToken } from "../utils/jwt"
import { UserRole } from "../types/UserRole";
import { HttpError } from "../utils/HttpError";
import PaymentService from "./PaymentService";

function UserService() {

    async function addAdmin(username: string, password: string) {
        const user = new User;

        user.username = username;
        user.password = await bcrypt.hash(password, 8);
        user.name = "ADEMIRO";
        user.cpf = "000.000.000-00";
        user.rg = "3636290";
        user.email = "admin@gmail.com";
        user.birthday = new Date(22, 9, 2000)
        user.tel1 = "00000000000";
        user.tel2 = null;
        user.seller_id =  null;
        user.role = UserRole.ADMIN;

        const usernameAlreadyExist = await AppDataSource
            .getRepository(User)
            .findOne({ where: {username: user.username}});

        if(usernameAlreadyExist) {
            return
        }

         await AppDataSource.manager.save(user);
    }

    async function createUser(data: CreateUser) {
        
        const { username, password, name, cpf, rg, email, 
            birthday, tel1, tel2, sellerId
        } = data

        const user = new User;
        user.username = username;
        user.password = await bcrypt.hash(password, 8);
        user.name = name;
        user.cpf = cpf;
        user.rg = rg;
        user.email = email;
        user.birthday = birthday;
        user.tel1 = tel1;
        user.tel2 = tel2 ?? null;

        if (sellerId !== undefined && sellerId !== null) {
            const seller = await AppDataSource.getRepository(User).findOne({
                where: { id: sellerId, role: UserRole.SELLER }
            });

            if (!seller) {
                throw HttpError.badRequest("Vendedor inválido");
            }

            user.seller_id = sellerId;
        } else {
            user.seller_id = null;
        }

        const emailAlreadyExist = await AppDataSource
            .getRepository(User)
            .findOne({ where: {email: user.email}})

        if(emailAlreadyExist) {
            throw HttpError.conflict("O Email já esta sendo Utilizado!");
        }

        const usernameAlreadyExist = await AppDataSource
            .getRepository(User)
            .findOne({ where: {username: user.username}});

        if(usernameAlreadyExist) {
            throw HttpError.conflict("O nome de usuário já esta sendo Utilizado!");
        }

        const cart = new Cart();
        user.cart = cart;

        // Valida CPF e email no Asaas (rejeita CPFs inexistentes na Receita)
        user.asaas_customer_id = await PaymentService.createAsaasCustomer({
            name: user.name,
            email: user.email,
            cpf: user.cpf,
        });

        const newUser = await AppDataSource.manager.save(user);

        const token = generateToken({id: newUser.id, role: newUser.role});

        return {token, newUser};
    }



    async function auth(data: Auth) {

        const user = await AppDataSource
        .getRepository(User)
        .findOne({ where: {username: data.username}});

        if(!user) {
            throw HttpError.unauthorized("Usuário ou senha incorretos!");
        }

        const verifyPass = await bcrypt.compare(data.password, user.password);

        if(!verifyPass) {
            throw HttpError.unauthorized("Usuário ou senha incorretos!");
        }

        const token = generateToken({id: user.id, role: user.role});

        return {token, user};
    }


    return {
        addAdmin,
        createUser,
        auth
    }
}

export default UserService();