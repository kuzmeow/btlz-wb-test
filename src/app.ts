import knex, { migrate } from "#postgres/knex.js";
import { cronManager } from "#cron/manager.js";
import { registerTasks } from "#cron/tasks.js";

await migrate.latest();
// await seed.run();

console.log("All migrations and seeds have been run");

await registerTasks();

const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    const forceExitTimeout = setTimeout(() => {
        console.error("Graceful shutdown timed out. Forcing exit...");
        process.exit(1);
    }, 10000);

    try {
        await cronManager.stopAll();
        await knex.destroy();
        console.log("Database connections closed");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error instanceof Error ? error.message : error);
        clearTimeout(forceExitTimeout);
        process.exit(1);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
