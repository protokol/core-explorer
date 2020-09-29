import { Container, Contracts, Providers } from "@arkecosystem/core-kernel";
import history from "connect-history-api-fallback";
import express, { Handler } from "express";
import { existsSync } from "fs";

import { defaults } from "./defaults";

export class ServiceProvider extends Providers.ServiceProvider {
    @Container.inject(Container.Identifiers.LogService)
    private readonly logger!: Contracts.Kernel.Logger;

    public async register(): Promise<void> {
        const distPath: string | undefined = defaults.path;

        if (distPath && !existsSync(distPath)) {
            this.logger.error(
                `The ${distPath} directory does not exist. Please build the explorer before using this plugin.`,
            );

            return undefined;
        }
        const staticFileMiddleware: Handler = express.static(distPath!);
        const app: express.Application = express();
        app.use(staticFileMiddleware);
        app.use(history());
        app.get("/", (req, res) => res.render(`${distPath}/index.html`));
        const server = app.listen(4200, "0.0.0.0", () => {
            // @ts-ignore
            this.logger.info(`Explorer is listening on http://${server.address().address}:${server.address().port}`);
        });
    }
}
