import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@as-integrations/express4';
import { authMiddleware, handleLogin } from './auth.js';
import { readFile } from 'node:fs/promises'
import resolvers from './resolvers.js';

const PORT = 9000;

const app = express();
// CORS + JSON bodies; auth runs on all routes below (JWT on protected paths per auth.js)
app.use(cors(), express.json(), authMiddleware,);

// Issue tokens for clients (REST); GraphQL uses the same auth middleware stack
app.post('/login', handleLogin);

// GraphQL schema as SDL file; resolvers live in ./resolvers.js
const typeDefs = await readFile('./schema.graphql', 'utf8')
const apolloServer = new ApolloServer({
  typeDefs, resolvers
})
function getContext({req}) {
  // Expose auth info to resolvers through GraphQL context.
  // Resolvers read this as `context.authorization`.
  return {
    authorization:{
      ...req.auth
    }
  }
}



// Required before expressMiddleware can handle requests
await apolloServer.start()

// Pass the server instance — expressMiddleware(apolloServer) returns the Express handler
app.use('/graphql', apolloMiddleware(apolloServer, {
  context: getContext
}))


app.listen({ port: PORT }, () => {
  // Server startup callback intentionally left silent.
});
