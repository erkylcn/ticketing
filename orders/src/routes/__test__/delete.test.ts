import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import {Order, OrderStatus} from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('deletes the order', async () => {

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Title',
        price: 20
    });

    await ticket.save();
    const user = global.signin();

    const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

    
    await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

    const fetchedOrder = await Order.findById(order.id);
    expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('deletes another users order', async () => {

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
    .delete(`/api/orders/${orderOne.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
