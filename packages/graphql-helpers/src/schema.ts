import { globSync } from 'glob';
import { addResolversToSchema, makeExecutableSchema } from '@graphql-tools/schema';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import { deepmerge } from 'deepmerge-ts';
import { gql } from 'graphql-tag';
import { IResolvers } from '@graphql-tools/utils/typings/Interfaces';

interface StandardEnum<T> {
    [id: string]: T | string | number;
    [nu: number]: string | number;
}

function enumToObject<T extends StandardEnum<unknown>>(enumType: T) {
    return Object.entries(enumType)
        .filter(([key]) => isNaN(Number(key)))
        .reduce(
            (acc, [k, v]) => ({
                ...acc,
                [k]: v,
            }),
            {}
        );
}

type X = ReturnType<typeof makeExecutableSchema>;
export async function configuredSchemaFromFiles(options: {
    filesPattern: {
        graphql: `${string}.${'graphql' | 'gql'}`; // `${__dirname}/@(modules|directives)/**/!(*.spec)*.graphql`
        resolvers: `${string}.ts`; // `${__dirname}/modules/**/*.resolvers.ts`
        directives: `${string}.ts`; // `${__dirname}/directives/**/*.directive.ts`
        enums: `${string}.ts`; // `${__dirname}/**/*.enums.ts`
    };
}): Promise<X> {
    const files = {
        graphql: globSync(options.filesPattern.graphql),
        resolvers: globSync(options.filesPattern.resolvers),
        directives: globSync(options.filesPattern.directives),
        enums: globSync(options.filesPattern.enums),
    };
    const [resolvers, typeDefs, directives, enums] = await Promise.all([
        Promise.all(
            files.resolvers.map(async (path) => {
                const x = setTimeout(() => {
                    // eslint-disable-next-line no-console
                    console.warn(`⏳ Slow loading for resolver @ ${path}`);
                }, 4000);
                return import(path).then((imported: { resolvers: Record<string, unknown> }) => {
                    clearTimeout(x);
                    return imported.resolvers;
                });
            })
        ),
        Promise.all(files.graphql.map((path) => readFileSync(path, { encoding: 'utf-8' }))),
        Promise.all(files.directives.map(async (path) => import(path).then((imported: { default: (schema: X) => X }) => imported.default))),
        Promise.all(files.enums.map(async (path) => import(path).then((imported) => Object.entries(imported).map(([enumName, anEnum]) => ({ [enumName]: enumToObject(anEnum as any) })))).flat()),
    ]);
    resolvers.push(...enums.flat());
    let schema = addResolversToSchema({
        resolvers: deepmerge(...resolvers) as IResolvers,
        schema: buildSubgraphSchema(gql(typeDefs.join('\n'))),
        inheritResolversFromInterfaces: true,
    });
    directives.forEach((imp) => {
        schema = imp(schema);
    });
    return schema;
}
