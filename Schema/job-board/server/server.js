import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@as-integrations/express4';
import { authMiddleware, handleLogin } from './auth.js';

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware,);

app.post('/login', handleLogin);

const apolloServer = new ApolloServer({
  // typeDefs, resolvers
})

await apolloServer.start()

app.use('/graphql', apolloMiddleware)


app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
});
