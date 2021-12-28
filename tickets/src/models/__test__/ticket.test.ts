import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
    //create an instance of a ticket

    const ticket = Ticket.build({
        title: 'Title',
        price: 5,
        userId: '123'
    });

    //save th ticket to the database

    await ticket.save();

    //fetch the ticket twice

    const ticketone = await Ticket.findById(ticket.id);
    const tickettwo = await Ticket.findById(ticket.id);

    //make two seperate changes to the tickets we fetched

    ticketone!.set({ title: 'new title' });
    tickettwo!.set({ title: 'new title2' });

    //save the first fetched ticket

    await ticketone!.save();

    // save the second fetched ticket get an error
    try {
        await tickettwo!.save();
    } catch (err) {
        return;
    }

    throw new Error('Error, optimistic concurrency control doesnt work!')

});

it('increments version number on multiple saves', async () => {
  

    const ticket = Ticket.build({
        title: 'Title',
        price: 5,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});