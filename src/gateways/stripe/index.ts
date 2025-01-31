import { AbstractGateways } from "../abstract-gateway";

export class StripePayment   {
    public callback<T extends {}, U>(body?: T): Promise<U> {
        throw new Error("Method not implemented.");
    }
    public verify<T extends {}, U>(body?: T): Promise<U> {
        throw new Error("Method not implemented.");
    }
    public initiateTransaction(): void {

    }
}