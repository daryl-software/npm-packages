import { configuredSchemaFromFiles } from "@daryl-software/graphql-helpers";
import { expect } from "vitest";

describe('Schema', async () => {
    it('Build', async () => {
        const schema  = await configuredSchemaFromFiles({
            filesPattern: {
                graphql:`${__dirname}/files/**/!(*.spec)*.graphql`,
                resolvers:`${__dirname}/files/**/*.resolvers.ts`,
                directives:`${__dirname}/files/**/*.directive.ts`,
                enums:`${__dirname}/files/**/*.enums.ts`,
            }
        });
        expect(schema).toBeDefined();
    });
});
