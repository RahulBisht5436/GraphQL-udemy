import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@as-integrations/express4';
import { authMiddleware, handleLogin } from './auth.js';
import { readFile } from 'node:fs/promises'
import resolvers from './resolvers.js';
import { getUser } from './db/users.js';

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
/**
 * Per-request context for resolvers. With `express-jwt` and `credentialsRequired: false`,
 * `req.auth` is undefined when the client sends no/invalid token — never read `sub` blindly.
 */
async function getContext({ req }) {
  if (!req.auth?.sub) {
    return { userDetails: null };
  }
  const userDetails = await getUser(req.auth.sub);
  return { userDetails: userDetails ? { ...userDetails } : null };
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
