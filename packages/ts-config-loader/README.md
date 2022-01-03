# ts-config-loader

JSON files loader & watcher

### Installation
```shell
npm i @ezweb/ts-config-loader
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
