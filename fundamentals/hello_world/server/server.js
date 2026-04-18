// Apollo Server: GraphQL engine and schema/resolver wiring
import { ApolloServer } from "@apollo/server";
// Starts a plain HTTP server (no Express) that serves the GraphQL endpoint
import { startStandaloneServer } from "@apollo/server/standalone";
// Loads variables from a .env file into process.env
import dotenv from "dotenv";
dotenv.config();

// GraphQL schema: defines the API shape (here, a Query with a greeting field)
const typeDefs = `#graphql
 type Query {
    greeting : String
 }
`;

// Resolvers: functions that run when each field is requested
const resolvers = {
    
  Query: {
    greeting: () => {
      return "Hellow nice to know you !";
    },
  },
};

// Create the server with the schema and resolver map
const server = new ApolloServer({ typeDefs, resolvers });

// Bind to a port (from .env) and start listening; returns URL and other info
const serverInfo = await startStandaloneServer(server, {
  listen: { port: process.env.PORT },
});

// Log where the server is reachable and which port was used
console.log(
  serverInfo.url,
  `Server is up and running on port ${process.env.PORT} `
);
