import { OrderCancelledEvent, OrderStatus } from "@eytickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose, { version } from 'mongoose';
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert', 
        price: 20, 
        userId: new mongoose.Types.ObjectId().toHexString()});

    ticket.set({orderId});

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    //create fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, msg, orderId, ticket}
};

it('updates ticket with order id',async () => {
    
    const {listener, data, msg, orderId, ticket} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(data.ticket.id);

    expect(updatedTicket?.orderId).not.toBeDefined();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(msg.ack).toHaveBeenCalled();
});