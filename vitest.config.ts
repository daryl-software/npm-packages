/* eslint-disable node/no-unpublished-import */
import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

const r = (p: string) => resolve(__dirname, p);

export const alias: Record<string, string> = {
    '@daryl-software/db': r('./packages/db/src'),
    '@daryl-software/error': r('./packages/error/src'),
    '@daryl-software/redis-dataloader': r('./packages/redis-dataloader/src'),
    '@daryl-software/sequelize-dataloader': r('./packages/sequelize-dataloader/src'),
    '@daryl-software/sequelize-redis-cache': r('./packages/sequelize-redis-cache/src'),
    '@daryl-software/ts-config-loader': r('./packages/ts-config-loader/src'),
    '@daryl-software/ts-helpers': r('./packages/ts-helpers/src'),
};

export default defineConfig({
    optimizeDeps: {
        entries: [],
    },
    resolve: {
        alias,
    },
    test: {
        deps: {},
        globals: true,
    },
});
