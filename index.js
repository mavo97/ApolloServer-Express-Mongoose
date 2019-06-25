const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
require('./config');

const { User } = require('./models');

const typeDefs = gql`
    type User {
        id: ID!
        userName: String
        email: String
    }
    type Query {
        getUsers: [User],
        find_user(userName: String!): User
    }
    input UserInput {
        userName: String,
        email: String
    }
    type Mutation {
        addUser(userName: String!, email: String!): User,
        delete_user(userName: String!): String,
        updateUser(_id: ID!, input: UserInput): User
    }
`;

const resolvers = {
    Query: {
        getUsers: async () => await User.find({}).exec(),
        find_user: (_, args) => User.findOne({userName:args.userName})
    },
    Mutation: {
        addUser: async (_, args) => {
            try {
                let response = await User.create(args);
                return response;
            } catch(e) {
                return e.message;
            }
        },
        delete_user: async (_, args) => {
            try{
                let response = await User.deleteOne({userName:args.userName});
                return "Objecto eliminado correctamente: "+response;

            }catch(e){
                return e.message;
            }
        },
        
        async updateUser(_, {
            _id,
            input
        }) {
            return await User.findOneAndUpdate({
                _id
            }, input, {
                new: true
            })
        }
        
    }
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);