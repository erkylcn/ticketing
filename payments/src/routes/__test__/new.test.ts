import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose';
import { Order } from "../../models/order";
import { OrderStatus } from "@eytickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";
// jest.mock('../../stripe');


it('returns a 404 when purchasing an order does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'sdfsdf',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
});

it('returns a 401 when purchasing an order that doesnt belongs to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        userId: 'sdfsdfsdf',
        version: 0,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'sdfsdf',
            orderId: order.id
        })
        .expect(401)
});


it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Cancelled,
        userId,
        version: 0,
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'sdfsdf',
            orderId: order.id
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price,
        status: OrderStatus.Created,
        userId,
        version: 0,
    })

    await order.save();
    const token = 'tok_visa';
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token,
            orderId: order.id
        }).expect(201);

    const charges = await stripe.charges.list({ limit: 50 });
    // expect(stripe.charges.create).toHaveBeenCalled();
    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions).toEqual({
    //     currency: 'usd', 
    //     amount: price, 
    //     source: token })

    const stripeCharge = charges.data.find(charge => {
        return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();

    const payment = await Payment.findOne({ 
        orderId: order.id, 
        stripeId: stripeCharge!.id 
    });

    expect(payment).not.toBeNull();
    
})