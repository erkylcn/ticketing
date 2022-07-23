import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';


const buildTicket = async () =>{

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Title',
        price: 20
    });

    await ticket.save();
    return ticket;
};

it('fetches order for a particular user', async () => {

    //create three tickets
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();
    
    
    const userOne = global.signin();
    const userTwo = global.signin();
    //create one order as User #1
  
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ticketId: ticketOne.id})
        .expect(201);

    //create two orders as User #2

    const {body: orderOne} = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ticketId: ticketTwo.id})
    .expect(201);

    const {body: orderTwo} = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ticketId: ticketThree.id})
    .expect(201);

    //make request to get orders for User #2

    const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send()
    .expect(200);

    //make sure we only got the orders forn #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0]).toEqual(orderOne);
    expect(response.body[1]).toEqual(orderTwo);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});