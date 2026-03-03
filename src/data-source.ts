import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: process.env.DB_PATH ?? "database.sqlite",
    synchronize: process.env.NODE_ENV !== "production",
    logging: false,
    entities: [__dirname + "/entities/*.{ts,js}"],
});