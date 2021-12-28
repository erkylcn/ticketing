import { Publisher, OrderCancelledEvent, Subjects } from "@eytickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled; 
}