import { response } from "express";
import request from "supertest";
import { app } from "../../app";
import { User } from  "../../models/user";

it('fails when a email that does not exist is supplied', async () => {
    
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400);
});

it('incorrect password is supplied', async () => {
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
        
        await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'p@ssword'
        })
        .expect(400);
});

it('correct email, password is supplied', async () => {
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
        
      const response =  await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});
