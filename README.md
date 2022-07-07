# npm-packages
Open sourced node packages

## Packages
* [ts-config-loader](packages/ts-config-loader/README.md)
* [db](packages/db/README.md)
* [redis-dataloader](packages/redis-dataloader/README.md)
* [sequelize-dataloader](packages/sequelize-dataloader/README.md)
* [sequelize-redis-cache](packages/sequelize-redis-cache/README.md)
* [ts-helpers](packages/ts-helpers/README.md)


### Install
```shell
nvm install
nvm use
npm i
```

### Tests
```shell
npm run compile # Must compile before testing
npm run test
```

## Bump version
```shell
npm version patch -ws
npm version prerelease -ws
```

### Publish
```shell
# all
npm run prepublish
npm publish -ws

# publish just one ?
npm publish -w @ezweb/ts-helpers
```

