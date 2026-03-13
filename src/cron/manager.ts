import cron, { ScheduledTask } from "node-cron";

export type CronTask = {
    name: string;
    cronExpression: string;
    handler: () => Promise<void>;
};

export class CronManager {
    private tasks: Map<string, ScheduledTask> = new Map();
    private taskConfigs: Map<string, CronTask> = new Map();

    register(task: CronTask) {
        if (this.tasks.has(task.name)) {
            throw new Error(`Task ${task.name} already registered`);
        }

        this.taskConfigs.set(task.name, task);

        this.start(task.name);

        console.log(`Registered cron task: ${task.name} (${task.cronExpression})`);
    }

    start(name: string) {
        const task = this.taskConfigs.get(name);
        if (!task) {
            throw new Error(`Task "${name}" not found`);
        }

        const scheduledTask = cron.schedule(task.cronExpression, async () => {
            console.log(`Running task: ${name}`);
            const start = Date.now();

            try {
                await task.handler();
                console.log(`Task ${name} completed: (${Date.now() - start}ms)`);
            } catch (error) {
                console.error(`Task ${name} failed:`, error);
            }
        });

        this.tasks.set(name, scheduledTask);
        console.log(`Started task: ${name}`);
    }

    stop(name: string) {
        const task = this.tasks.get(name);
        if (task) {
            task.stop();
            console.log(`Stopped task: ${name}`);
        }
    }

    async stopAll() {
        for (const [name] of this.tasks) {
            this.stop(name);
        }
        console.log("All cron tasks stopped");
    }
}

export const cronManager = new CronManager();
