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
# all with patch version
npm version patch -ws
npm run prepublish
npm publish -ws

# publish just one ?
npm prepublish;
npm publish -w @ezweb/eslint-config --access=public
npm publish -w @ezweb/eslint-config --access=public

# patch and publish
npm version patch -w @ezweb/ts-helpers;
npm version patch -w @ezweb/ts-config-loader;
npm version patch -w @ezweb/sequelize-dataloader
npm run prepublish;
npm publish -w @ezweb/sequelize-dataloader --access=public
npm publish -w @ezweb/ts-helpers --access=public;
npm publish -w @ezweb/ts-config-loader --access=public;
```

