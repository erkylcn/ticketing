import { Listener, TicketUpdatedEvent, Subjects } from '@eytickets/common';
import { version } from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;


    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        
        const {title, price} = data;

        const ticket = await Ticket.findByEvent(data);

        if(!ticket){
            throw new Error('Ticket not found');
        }

       // ticket.title = title;
      //  ticket.price = price;

        ticket.set({title, price});
        
        await ticket.save();
        msg.ack();
    }
}