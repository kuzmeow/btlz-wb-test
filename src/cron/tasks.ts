import env from "#config/env/env.js";
import { exportService } from "#modules/export/service.js";
import { cronManager } from "./manager.js";

export async function registerTasks() {
    cronManager.register({
        name: "updatedTariffs",
        cronExpression: env.CRON_UPDATE_TARIFFS,
        handler: async () => await exportService.fullUpdateForDate(),
    });
}
