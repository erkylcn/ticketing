import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@eytickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    queueGroupName: string = queueGroupName;
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const { orderId } = data;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}