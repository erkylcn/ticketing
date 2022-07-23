import { Publisher, OrderCreatedEvent, Subjects } from "@eytickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated; 
}