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
pnpm version patch -r
pnpm version prerelease -r
```

### Publish
```shell
# all with patch version
pnpm version patch -r
pnpm run prepublish
pnpm publish -r --access=public

# publish just one ?
./publish.sh patch redis-dataloader
```

