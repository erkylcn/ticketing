import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';  
import request from "supertest";
import { app } from '../app';
import jwt from 'jsonwebtoken';
import { isJsxExpression } from 'typescript';

declare global {
    var signin: () => string[];
}


jest.mock('../nats-wrapper');

let mongo : any ;
beforeAll ( async () => {
    
    mongo = await MongoMemoryServer.create();
    const mongoURI = mongo.getUri();

    await mongoose.connect(mongoURI);
    process.env.JWT_KEY = 'sdfs';

});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for( let collection of collections){
        await collection.deleteMany({});
    }
});


afterAll (async ()=>{
     if(mongo !== undefined )
        await mongo.stop();
    await mongoose.connection.close();
    
});

global.signin = () =>{
    //build a jwt payload
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    //create the jwt
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    //build session objecy {jwt : MY_JVT}
    const session = {jwt: token};

    //turn that session into json
    const sessionJSON = JSON.stringify(session);

    //take json and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return cookie;
    return [`express:sess=${base64}`];
};