import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/ProductDTO";
import { Image } from "../entities/Image";
import { HttpError } from "../utils/HttpError";

function ProductService() {
    const repo = AppDataSource.getRepository(Product)

    async function list(skip: number, take: number, categoryName?: string) {

        const qb = repo.createQueryBuilder("product");

        if (categoryName) {
            const category = await AppDataSource.getRepository(Category)
                .createQueryBuilder("category")
                .where("LOWER(category.name) = LOWER(:name)", { name: categoryName })
                .getOne();

            if (!category) throw HttpError.notFound("Categoria não encontrada");

            qb.where("product.category_id = :id OR product.sub_category_id = :id", { id: category.id });
        }

        const [data, total] = await qb
            .orderBy("product.relevance", "DESC")
            .skip(skip)
            .take(take)
            .getManyAndCount();

        return { data, total };
    }

    async function home() {

        const categoryRepo = AppDataSource.getRepository(Category);

        const categories = await categoryRepo.find({
            order: { relevance: "DESC" }
        });

        const result: Record<string, Product[]> = {};

        // Produtos em promoção
        result.promo = await repo
            .createQueryBuilder("product")
            .where("product.promo IS NOT NULL")
            .orderBy("product.relevance", "DESC")
            .limit(20)
            .getMany();

        // Produtos por categoria
        for (const category of categories) {
            result[category.name] = await repo.find({
                where: { category_id: category.id },
                order: { relevance: "DESC" },
                take: 20
            });
        }

        return result;
    }

    async function create(data: CreateProductDTO) {

        const category = await AppDataSource.getRepository(Category).findOne({
            where: { id: data.category_id}
        });

        if(!category) {
            throw HttpError.notFound("Categoria não encontrada");
        }

        const product = new Product;

        product.name = data.name;
        product.desc = data.desc;
        product.details = data.details ?? "";
        product.price = data.price;
        product.promo = data.promo ?? null;
        product.category_id = data.category_id;
        product.sub_category_id = data.subcategory_id ?? null;
        product.img_url = data.img_url;
        if(data.relevance) product.relevance = data.relevance;

        if(data.images  &&  data.images.length > 0) {
            product.images = data.images.map(url => {
                const image = new Image()

                image.url = url;

                return image

            })
        }

        return await AppDataSource.manager.save(product);
    }

    async function update(id: number, data: UpdateProductDTO) {

        const product = await repo.findOne({
            where: { id }
        });

        if(!product) throw HttpError.notFound("Produto não encontrado");

        if(data.name) product.name = data.name;
        if(data.desc) product.desc = data.desc;
        if(data.details) product.details = data.details;
        if(data.price) product.price = data.price;
        if(data.promo) product.promo = data.promo;
        if(data.category_id) product.category_id = data.category_id;
        if(data.subcategory_id) product.sub_category_id = data.subcategory_id;
        if(data.img_url) product.img_url = data.img_url;
        if(data.relevance) product.relevance = data.relevance;

        if(data.images  &&  data.images.length > 0) {
            await AppDataSource.getRepository(Image).delete({
                product: { id: product.id }
            });

            product.images = data.images.map(url => {
                const image = new Image()

                image.product_id = product.id;
                image.url = url;

                return image

            })
        }

        return await repo.save(product);
    }

    async function remove(id: number) {
        const product = await repo.findOne({
            where: { id }
        });

        if(!product) throw HttpError.notFound("Produto não encontrado");

        await repo.remove(product);
    }


    async function updateRelevance(id: number, action: "increment" | "decrement") {

        const product = await repo.findOne({ where: { id } });

        if (!product) throw HttpError.notFound("Produto não encontrado");

        if (action === "increment") {
            product.relevance += 1;
        } else {
            product.relevance = Math.max(1, product.relevance - 1);
        }

        return await repo.save(product);
    }

    async function getById(id: number) {

        const product = await repo.createQueryBuilder("product")
            .leftJoinAndSelect("product.images", "images")
            .addSelect("product.details")
            .where("product.id = :id", { id })
            .getOne()
        

        if (!product) throw HttpError.notFound("Produto não encontrado");

        return product;
    }

    return {
        list,
        home,
        getById,
        create,
        update,
        remove,
        updateRelevance
    }
}

export default ProductService();