export const resolvers = {
  Query: {
    user: async (_: null, args: {id: string}) => {
      return {
        id: args.id,
        name: 'John',
      }
    }
  }
}
