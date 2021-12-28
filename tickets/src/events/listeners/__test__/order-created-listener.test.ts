import { OrderCreatedEvent, OrderStatus } from "@eytickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose, { version } from 'mongoose';
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";


const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert', 
        price: 20, 
        userId: new mongoose.Types.ObjectId().toHexString()});

    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'sdfsdf',
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    };

    //create fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, msg}
};

it('updates ticket with order id',async () => {
    
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updateTicket = await Ticket.findById(data.ticket.id);

    expect(updateTicket?.orderId).toEqual(data.id);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});


it('acks the message',async () => {
    
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event',async () => {
    
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  
    expect(ticketUpdatedData.orderId).toEqual(data.id);
});