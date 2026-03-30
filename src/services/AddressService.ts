import { AppDataSource } from "../data-source";
import { Address } from "../entities/Address";
import { CreateAddressDTO, UpdateAddressDTO } from "../dtos/AddressDTO";
import { HttpError } from "../utils/HttpError";

function AddressService() {

    const repo = AppDataSource.getRepository(Address);

    async function list(userId: number, skip: number, take: number) {

        const [data, total] = await repo.findAndCount({
            where: { user_id: userId },
            skip,
            take,
            order: { id: "ASC" }
        });

        return { data, total };
    }

    async function create(userId: number, data: CreateAddressDTO) {

        const addr = repo.create({
            user_id: userId,
            postal_code: data.postal_code,
            city: data.city,
            state: data.state,
            address: data.address,
            number: data.number,
            complement: data.complement ?? "",
        });

        return await repo.save(addr);
    }

    async function update(userId: number, id: number, data: UpdateAddressDTO) {

        const addr = await repo.findOne({
            where: { id, user_id: userId }
        });

        if (!addr) throw HttpError.notFound("Endereço não encontrado");

        if (data.postal_code) addr.postal_code = data.postal_code;
        if (data.city) addr.city = data.city;
        if (data.state) addr.state = data.state;
        if (data.address) addr.address = data.address;
        if (data.number) addr.number = data.number;
        if (data.complement !== undefined) addr.complement = data.complement;

        return await repo.save(addr);
    }

    async function remove(userId: number, id: number) {

        const addr = await repo.findOne({
            where: { id, user_id: userId }
        });

        if (!addr) throw HttpError.notFound("Endereço não encontrado");

        await repo.remove(addr);
    }

    return {
        list,
        create,
        update,
        remove,
    };
}

export default AddressService();
