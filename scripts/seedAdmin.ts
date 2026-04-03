import "dotenv/config";
import { AppDataSource } from "../src/data-source";
import UserService from "../src/services/UserService";

async function main() {

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
        console.error("ADMIN_USERNAME e ADMIN_PASSWORD precisam estar definidos no .env");
        process.exit(1);
    }

    await AppDataSource.initialize();

    await UserService.addAdmin(adminUsername, adminPassword);

    console.log(`Admin '${adminUsername}' criado (ou já existente).`);

    await AppDataSource.destroy();
}

main().catch(err => {
    console.error("Falha ao criar admin:", err);
    process.exit(1);
});
