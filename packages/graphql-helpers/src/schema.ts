import { sync as globSync } from 'glob';
import { addResolversToSchema, makeExecutableSchema } from '@graphql-tools/schema';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import { deepmerge } from 'deepmerge-ts';
import { gql } from 'apollo-server-core';

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
        graphql: string; // `${__dirname}/@(modules|directives)/**/!(*.spec)*.graphql`
        resolvers: string; // `${__dirname}/modules/**/*.resolvers.ts`
        directives: string; // `${__dirname}/directives/**/*.directive.ts`
        enums: string; // `${__dirname}/**/*.enums.ts`
    };
}): Promise<X> {
    const files = {
        graphql: globSync(options.filesPattern.graphql),
        resolvers: globSync(options.filesPattern.resolvers),
        directives: globSync(options.filesPattern.directives),
        enums: globSync(options.filesPattern.enums),
    };
    console.table({ graphql: files.graphql.length, resolvers: files.resolvers.length, directives: files.directives.length, enums: files.enums.length });

    const [resolvers, typeDefs, directives, enums] = await Promise.all([
        Promise.all(
            files.resolvers.map((path) => {
                const x = setTimeout(() => {
                    console.warn(`⏳ Slow loading for resolver @ ${path}`);
                }, 4000);
                return import(path).then((imported: { resolvers: Record<string, any> }) => {
                    clearTimeout(x);
                    return imported.resolvers;
                });
            })
        ),
        Promise.all(files.graphql.map((path) => readFileSync(path, { encoding: 'utf-8' }))),
        Promise.all(files.directives.map((path) => import(path).then((imported: { default: (schema: X) => X }) => imported.default))),
        Promise.all(files.enums.map((path) => import(path).then((imported) => Object.entries(imported).map(([enumName, anEnum]) => ({ [enumName]: enumToObject(anEnum as any) })))).flat()),
    ]);
    resolvers.push(...enums.flat());
    const allres = deepmerge(...resolvers) as Record<string, any>;
    const federatedShema = buildSubgraphSchema(gql(typeDefs.join('\n')));
    let schema = addResolversToSchema({
        resolvers: allres,
        schema: federatedShema,
        inheritResolversFromInterfaces: true,
    });
    directives.forEach((imp) => {
        schema = imp(schema);
    });
    return schema;
}
