# npm-packages
Open sourced node packages

## Packages
* [ts-config-loader](packages/ts-config-loader/README.md)
* [db](packages/db/README.md)
* [redis-dataloader](packages/redis-dataloader/README.md)
* [sequelize-dataloader](packages/sequelize-dataloader/README.md)
* [sequelize-redis-cache](packages/sequelize-redis-cache/README.md)
* [ts-helpers](packages/ts-helpers/README.md)
* [eslint-config](packages/eslint-config/README.md)


### Install
```shell
nvm install
nvm use
pnpm i
```

### Tests
```shell
pnpm run compile # Must compile before testing
pnpm run test
```

## Bump version
```shell
npm version patch -w @daryl-software/eslint-config
npm version patch -ws
pnpm version prerelease -ws
```

### Publish
```shell
# all with patch version
npm version minor -ws
pnpm run -ws prepublish
pnpm publish -r --access=public

# publish just one ?
./publish.sh patch redis-dataloader
```

