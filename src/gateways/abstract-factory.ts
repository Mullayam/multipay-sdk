import { InitiateTransactionProps } from "../types"

export abstract class AbstractFactory {
    protected VERSION = "1.0.0"
    public InitiateTransaction({ amount, info, oid }:InitiateTransactionProps) { }
    public Callback() {}
    public VerifyPayment() { }
}
