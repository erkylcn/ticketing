import Router from 'next/router';
import useRequest from '../../hooks/use-request.js';
import { useState } from 'react';

const TicketShow = ({ ticket }) => {

    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        post: 'post',
        body: { ticketId: ticket.id },
        onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`)
    });

    return (<div>
        <h1>{ticket.title}</h1>
        <h4>Price: {ticket.price}$</h4>
        {errors}
        <button className="btn btn-primary" onClick={() => doRequest()}>Puchase</button>

    </div>);
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data };
}

export default TicketShow;