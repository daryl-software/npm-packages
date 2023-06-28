# `@daryl-software/ts-config-loader`
[![npm version](https://badge.fury.io/js/@daryl-software%2Fts-config-loader.svg)](https://badge.fury.io/js/@daryl-software%2Fts-config-loader)


JSON files loader & watcher

### Installation
```shell
pnpm i @daryl-software/ts-config-loader
```

### Usage
```typescript
type DbConfig = { db: { host: string; port: number, password?: string }[] };
const config = new ConfigLoader([`directory/base.json`, `directory/env-override.json`], { verbose: true });
const dbConfig = config.get<DbConfig>('db');
config.addObserver<DbConfig>('db', (all) => {
    // changed
});
```
