import { BadRequestError, currentUser, NotAuthorizedError, NotFoundError, requireAuth } from '@eytickets/common';
import express, { request, Request, Response } from 'express';
import { Order } from '../models/order';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/orders/:id',
requireAuth,
async (req: Request, res: Response) => {

    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        throw new BadRequestError('Id is in wrong format'); 
    }

    const order = await Order.findById(req.params.id).populate('ticket');

    if(!order || order.userId !== req.currentUser!.id ){
        throw new NotAuthorizedError();
    }

    res.send(order);
});

export { router as showOrderRouter };



