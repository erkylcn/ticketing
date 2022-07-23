
import { TicketUpdatedEvent } from "@eytickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    });

    await ticket.save();

    //create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //create fake data event

    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    //create fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, msg};
}

it('find, updates and saves the ticket', async () => {
    const {listener, data, msg} = await setup();

    //call the on message function with the data object + message object

    await listener.onMessage(data, msg);

    //write assertions to make sure a ticket was created

    const ticket = await Ticket.findById(data.id);
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
    expect(ticket!.version).toEqual(data.version);
});



it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    //call the on message function with the data object + message object

    await listener.onMessage(data, msg);

    // write assertion to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event is out of order', async () => {
    const {listener, data, msg} = await setup();
    
    data.version = 10;

    try{
        await listener.onMessage(data, msg);
    }catch(err){}

    expect(msg.ack).not.toHaveBeenCalled();
})