import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export default function (schema: GraphQLSchema) {
    const typeDirectiveArgumentMaps: Record<string, any> = {};
    schema = mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
            const authDirective = getDirective(schema, type, 'auth')?.[0];
            if (authDirective) {
                typeDirectiveArgumentMaps[type.name] = authDirective;
            }
            return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            {
                // @auth
                const directive = getDirective(schema, fieldConfig, 'auth')?.[0] ?? typeDirectiveArgumentMaps['auth'];
                if (directive) {
                    const { resolve = defaultFieldResolver } = fieldConfig;
                    fieldConfig.resolve = async (parent: any, args: any, context: any, info: any) => {
                        // throw new Error('Directive not implemented');
                        return resolve(parent, args, context, info);
                    };
                    return fieldConfig;
                }
            }
            return undefined;
        },
    });

    return schema;
}
