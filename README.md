# ticketing

Built on react, jess, express, typescript, npm, nats-streaming-server, docker, kubernetes, skaffold, mongodb. 
Stripe API(stripe.com) is used for actual charges.
Microservices arhitecture principles are implemented.

Ticketing repository is the main repository. Each of the microservices also has own repository. 
orders, tickets, auths and client are microservices.

# orders
Order related functionalities are implemented in this microservice.
- create order
- update order
- list all orders
- show a order's details

# auth
User specific funtions are implemented.

- signup
- signin

# tickets
Ticket related functionalities are implemented in this microservice. 

- create ticket
- update ticket
- list all tickets
- show a ticket's details

# client
React frontend.

# common
Shared library.

Database per microservices pattern is used so each of microservices has own mongo instance.
Common is a shared library that implements shared functions and classes used by all microservices.

**Readme will be updated as soon.**
