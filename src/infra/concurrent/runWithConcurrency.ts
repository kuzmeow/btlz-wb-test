export type TaskResult<T> = { status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown };

export async function runWithConcurrency<T>(
    tasks: (() => Promise<T>)[],
    concurrency: number = 5,
): Promise<TaskResult<T>[]> {
    const results: TaskResult<T>[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
        const promise = task()
            .then((value) => {
                results.push({ status: "fulfilled", value });
            })
            .catch((reason) => {
                results.push({ status: "rejected", reason });
            })
            .finally(() => {
                const index = executing.indexOf(promise);
                if (index > -1) {
                    executing.splice(index, 1);
                }
            });

        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);

    return results;
}
