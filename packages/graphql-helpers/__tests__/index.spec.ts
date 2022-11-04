import { configuredSchemaFromFiles } from "@ezweb/graphql-helpers";
import { expect } from "chai";

describe("Test build schema", function() {
  it('load schema', async () => {

    const baseDir = __dirname + '/folders'

   const schema = await configuredSchemaFromFiles({
      filesPattern: {
        graphql: `${baseDir}/@(modules|directives)/**/!(*.spec)*.graphql`,
        resolvers: `${baseDir}/modules/**/*.resolvers.ts`,
        directives: `${baseDir}/directives/**/*.directive.ts`,
        enums: `${baseDir}/**/*.enums.ts`
      }
    });

    expect(schema.getDirectives().some(d => d.name === 'auth')).to.be.true;
    const userFields = schema.getType('User')?.toConfig() as {fields: Record<string, any>};
    expect(Object.keys(userFields.fields)).to.have.members(['id','gender','name']);
  })
});
