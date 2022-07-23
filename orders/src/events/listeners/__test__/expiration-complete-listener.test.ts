import { ExpirationCompletedListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import mongoose from 'mongoose';
import { OrderStatus } from "@eytickets/common";
import { ExpirationCompleteEvent } from "@eytickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new ExpirationCompletedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'sdfsdf',
        price: 20,
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        ticket,
        userId: 'dfdf',
        expiresAt: new Date(),
    });

    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, msg, order, ticket, data };
};

it('updates order status to cancelled', async () => {
    const { listener, msg, order, ticket, data } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
    const { listener, msg, order, ticket, data } = await setup();

    await listener.onMessage(data, msg);
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);

});

it('ack the message', async () => {
    const { listener, msg, order, ticket, data } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})