import { Category } from "../entities/Category";
import { AppDataSource } from "../data-source";
import { HttpError } from "../utils/HttpError";

function CategoryService() {

    const repo = AppDataSource.getRepository(Category)

    async function list() {

        const categories = await repo.find({
            order: { relevance: "DESC" }
        });

        return categories;
    }

    async function create(name: string) {

        const existing = await repo.findOne({
            where: { name },
            withDeleted: true
        });

        if(existing) {
            if(existing.deleted_at === null) {
                throw HttpError.conflict("Categoria já existe.");
            }

            existing.deleted_at = null;
            return await repo.save(existing);
        }

        const category = repo.create({ name });

        return await repo.save(category);
    }


    async function update(id: number, name?: string) {

        const category = await repo.findOne({
            where: { id }
        });

        if(!category) {
            throw HttpError.notFound("Categoria não encontrada!");
        }

        if(name) category.name = name;

        return await repo.save(category);
    }

    async function remove(id: number) {

        const category = await repo.findOne({
            where: { id }
        });

        if(!category) {
            throw HttpError.notFound("Categoria não encontrada!");
        }

        await repo.softRemove(category);
    }

    async function updateRelevance(id: number, action: "increment" | "decrement") {

        const category = await repo.findOne({ where: { id } });

        if (!category) throw HttpError.notFound("Categoria não encontrada!");

        if (action === "increment") {
            category.relevance += 1;
        } else {
            category.relevance = Math.max(1, category.relevance - 1);
        }

        return await repo.save(category);
    }

    return {
        list,
        create,
        update,
        remove,
        updateRelevance
    }
}

export default CategoryService();

