import { OrderStatus } from "@eytickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener} from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@eytickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        price: 10,
        userId: 'sdfsdf',
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: 'sdfsdfs',
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };

};

it('updates the status of the order', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(order!.status).toEqual(OrderStatus.Cancelled);
});


it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

