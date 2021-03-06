import { response } from "express";
import request from "supertest";
import { app } from "../../app";
import { currentUser } from "@eytickets/common";
import { User } from  "../../models/user";

it('responds with details about the current user', async () => {
    
    const cookie = await signin();
    
    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send({
        })
        .expect(200);
    
    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not auhthenticated', async () => {
    
    const response = await request(app)
        .get('/api/users/currentuser')
        .send({
        }).expect(200);
    
    expect(response.body.currentUser).toEqual(null);
});