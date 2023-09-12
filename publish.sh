# call like ./publish.sh patch ts-helpers
set -e
version=$1
package=$2
if [ -z "$version" ] || [ -z "$package" ]
then
  echo "Usage: ./publish.sh <version> <package>"
  exit 1
fi

echo "🥸 Publishing $package@$version"
npm version $version -w @daryl-software/$package;
npm run prepublish;
npm publish -w @daryl-software/$package --access=public;
