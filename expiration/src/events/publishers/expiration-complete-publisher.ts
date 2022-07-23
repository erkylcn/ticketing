import { Publisher, Subjects, ExpirationCompleteEvent } from "@eytickets/common";


export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
};