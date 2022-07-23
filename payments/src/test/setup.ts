import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from "supertest";
import { app } from '../app';
import jwt from 'jsonwebtoken';
import { isJsxExpression } from 'typescript';

declare global {
    var signin: (id?: string) => string[];
}


jest.mock('../nats-wrapper');

let mongo: any;
process.env.STRIPE_KEY = 'sk_test_51KA8FGCP076U2PjHpi2O7YW2VM5uWR3UoK5cib2l898nMINE6TxtndkA7AEU4uXvtTJGULDeANTuUjG69byr6m0700sC9w4QgE';
beforeAll(async () => {

    mongo = await MongoMemoryServer.create();
    const mongoURI = mongo.getUri();

    await mongoose.connect(mongoURI);
    process.env.JWT_KEY = 'sdfs';
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});


afterAll(async () => {
    if (mongo !== undefined)
        await mongo.stop();
    await mongoose.connection.close();

});

global.signin = (id?: string) => {
    //build a jwt payload
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    //create the jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    //build session objecy {jwt : MY_JVT}
    const session = { jwt: token };

    //turn that session into json
    const sessionJSON = JSON.stringify(session);

    //take json and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return cookie;
    return [`express:sess=${base64}`];
};