import { requireAuth, BadRequestError, NotAuthorizedError, OrderStatus } from '@eytickets/common';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/orders/:id',
requireAuth, 
async (req: Request, res: Response) => {

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        throw new BadRequestError('Id is in wrong format'); 
    }

    const order = await Order.findById(req.params.id).populate('ticket');

    if(!order || order.userId !== req.currentUser!.id ){
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })

    res.status(204).send({order});
});

export { router as deleteOrderRouter };