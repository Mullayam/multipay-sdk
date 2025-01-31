/// <reference path="./gateways/paytm/index.ts" />
/// <reference path="./gateways/phonepe/index.ts" />
/// <reference path="./gateways/razorpay/index.ts" />
/// <reference path="./gateways/bill-desk/index.ts" />
import { Logging } from "./logger";
import { Config, InitiateTransactionProps } from "./types";
import { BillDesk } from "./gateways/bill-desk";
import { Razorpay } from "./gateways/razorpay";
import { PhonePe } from "./gateways/phonepe";
import { PaytmSDK } from "./gateways/paytm/index2";
import { AbstractFactory } from "./gateways/abstract-factory";
import { AbstractGateways } from "./gateways/abstract-gateway";
import { Utils } from "./utils";


export namespace PaymentProvider {

    export class Factory extends AbstractFactory {
        constructor(private config: Config) {
            super();
            Logging.dev("Initializing MultiPay SDK")
            Logging.dev("v" + this.VERSION)
        }
        /**
                * Initializes the transaction as per the configuration passed in the constructor
         * @description
         * This function will initialize the transaction and set up the necessary
         * configurations to use the gateway for payment processing
         * @example
         * const paymentInstance = new PaymentProvider.Config({
         *      mode: "PRODUCTION",
         *      gateway: "PAYTM",
         *      redirectUrl: "http://localhost:8080/callback",
         *      callbackUrl: "http://localhost:8080/callback",
         *      credentials: {
         *                  merchantId: "LwKutv58548207890301",
         *                  merchantKey: "rBHSFqbQmGZJ1mu7",
         *                  }
         *  })
         * paymentInstance.InitiateTransaction({
         *      amount: "100",
         *      info: {
         *          name: "John Doe",
         *          email: "email@example.com",
         *          mobile: "1234567890",
         *          address: "123 Street, City, State, Pincode",
         *      }
         * })
        */
        public InitiateTransaction({
            amount, info, oid = Utils.generateOrderId(),
        }: InitiateTransactionProps) {
            const orderId = oid

            switch (this.config.gateway) {
                case "PAYTM":
                    PaytmSDK.setInitialParameters({
                        env: this.config.mode === "PRODUCTION" ? "PRODUCTION_ENVIRONMENT" : "STAGING_ENVIRONMENT",
                        mid: this.config.credentials.merchantId,
                        key: this.config.credentials.merchantKey,
                        website: "DEFAULT",

                    })
                    // Example using only mandatory fields
                    return PaytmSDK.createTxnTokenwithRequiredParams({
                        orderId: oid,
                        amount,
                        channelId: "WEB",
                        info
                    })

                case "BILLDESK":
                    const billDesk = new BillDesk({
                        mode: this.config.mode,
                        clientid: this.config.credentials.clientId,
                        secret_key: this.config.credentials.merchantSecret,
                        ru: this.config.callbackUrl,
                        mercid: this.config.credentials.merchantId
                    })
                    return billDesk.initiateTransaction({
                        amount,
                        orderid: orderId,
                        info,
                    }).then((response) => response)

                case "PHONEPE":
                    const phonepe = new PhonePe({
                        mid: this.config.credentials.mid,
                        redirectUrl: this.config.redirectUrl || this.config.callbackUrl,
                        callbackUrl: this.config.callbackUrl,
                        salt_key: this.config.credentials.salt_key,
                        salt_index: this.config.credentials.salt_index
                    })
                    return phonepe.initiateTransaction({
                        amount,
                        info,
                        orderid: orderId
                    })

                case "RAZORPAY":
                    const razorpay = new Razorpay({
                        key_id: this.config.credentials.merchantId,
                        key_secret: this.config.credentials.merchantKey,
                    })
                    return razorpay.initiateTransaction({
                        amount: amount,
                        currency: "INR",
                        notes: info
                    })

                default:
                    Logging.dev("Gateway not found")
                    break;
            }
        }
        public Callback() { }
    }  
    export class AutoConfig {
        private adaptor!: AbstractGateways;
        constructor(private readonly mode: "offline" | "online", private readonly apiKey: string, private readonly apiSecret: string) {
            if (mode === "offline") {
                this.handleModeOffline()
            }
            if (mode === "online") {
                this.handleModeOnline()
            }
        }
        private validateKeys() {

        }
        private async handleModeOffline() {
            this.validateKeys()
            //decode the api key and seret
        }
        private async handleModeOnline() {
            this.validateKeys()
            //request to backend
        }
        // public InitiateTransaction() {
        //     return this.adaptor.initiateTransaction();
        // }

        // public Callback() {
        //     return this.adaptor.Callback();
        // }
    }

}