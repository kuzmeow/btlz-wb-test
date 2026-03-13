import { sheetService } from "#modules/sheet/service.js";
import { Command } from "commander";
const program = new Command();

program
    .command("register")
    .argument("<spreadsheetId>")
    .option("-d, --tariff-date <date>")
    .action(async (spreadsheetId, options) => {
        console.log(`Registering spreadsheet: ${spreadsheetId}`);
        console.log(`   Tariff date: ${options.tariffDate}`);

        const tariffDate = options.tariffDate ? new Date(options.tariffDate) : undefined;
        await sheetService.registerSpredsheet(spreadsheetId, tariffDate);

        console.log("Spreadsheet registered successfully");

        process.exit(0);
    });

program
    .command("unregister")
    .argument("<spreadsheetId>")
    .action(async (spreadsheetId) => {
        console.log(`Unregistering spreadsheet: ${spreadsheetId}`);

        await sheetService.unregisterSpreadsheet(spreadsheetId);

        console.log("Spreadsheet unregistered successfully");

        process.exit(0);
    });

program.parse();
