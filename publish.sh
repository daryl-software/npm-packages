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
pnpm version $version -w @daryl-software/$package;
pnpm run prepublish;
pnpm publish -w @daryl-software/$package --access=public;
