import { Listener, OrderCreatedEvent, Subjects } from "@eytickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        //find the ticket that the order reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // if no ticket, throw error
        if(!ticket){
            throw new Error('Ticket not found');
        }

        //Mark the ticket as being reserved by setting its orderId property
        ticket.set({orderId: data.id});

        // save the ticket
        await ticket.save();

        //emit an event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
         });

        //ack the message
        msg.ack();
    }
};