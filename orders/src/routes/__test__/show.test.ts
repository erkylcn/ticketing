import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';


it('fetches the order', async () => {

    const ticketOne = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Title',
        price: 20
    });

    await ticketOne.save();
    const userOne = global.signin();

    const {body: orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ticketId: ticketOne.id})
    .expect(201);

    
    const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', userOne)
    .send()
    .expect(200);

    expect(fetchedOrder.id).toEqual(orderOne.id);
});

it('fetches another users order', async () => {

    const ticketOne = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Title',
        price: 20
    });

    await ticketOne.save();
    const userOne = global.signin();

    const {body: orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ticketId: ticketOne.id})
    .expect(201);

 
    await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});