import axios from "axios";
import { Utils } from '../../utils';
import { PhonePeConfigurationValidator, PhonePeInitiateTransaction } from '../../types/phonepe';
import { Logging } from "../../logger";
import { AbstractGateways } from "../abstract-gateway";

export class PhonePe extends AbstractGateways {
    private config: PhonePeConfigurationValidator;

    constructor(config: PhonePeConfigurationValidator) {
        super();
        if (!config) {
            throw new Error("PhonePe configuration is required");
        }
        this.config = config;
    }

    async initiateTransaction<T extends {}, U>(props: T & PhonePeInitiateTransaction): Promise<U> {
        try {
            const { orderid, amount, info: { mobile } } = props;
            const requestData = {
                merchantId: this.config.mid,
                merchantTransactionId: orderid,
                merchantUserId: "random",
                amount,
                redirectUrl: this.config.redirectUrl,
                redirectMode: 'REDIRECT',
                callbackUrl: this.config.callbackUrl,
                mobileNumber: mobile,
                paymentInstrument: {
                    type: 'PAY_PAGE',
                },
            };

            const payload = JSON.stringify(requestData);
            const payloadMain = Buffer.from(payload).toString("base64"); // Using `Buffer` for better compatibility.

            const stringToHash = payloadMain + '/pg/v1/pay' + this.config.salt_key;
            const hash = await Utils.sha256(stringToHash);
            const checksum = `${hash}###${this.config.salt_index || 1}`;

            const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"; // UAT HOST URL
            const options = {
                method: 'POST',
                url: URL,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                },
                data: {
                    request: payloadMain,
                },
            };

            const response = await axios.request(options);
            return response.data.data as U;
        } catch (error: any) {
            Logging.dev("Error details: " + (error.response?.data || error.message), "error");
            throw new Error(error.response?.data || error.message);
        }
    }

    async callback<T, U>(body?: T): Promise<U> {
        try {
            if (!body) {
                throw new Error("Callback body is required");
            }

            const decodedData = this.decodeBase64ToObject(JSON.stringify(body));
            if (!decodedData) {
                throw new Error("Invalid callback data");
            }

            return decodedData as U;
        } catch (error: any) {
            Logging.dev("Error in callback: " + error.message, "error");
            throw error;
        }
    }

    async verify<T, U>(body?: T): Promise<U> {
        try {
            const merchantTransactionId = (body as any)?.merchantTransactionId;
            if (!merchantTransactionId) {
                throw new Error("merchantTransactionId is required for verification");
            }

            const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${this.config.mid}/${merchantTransactionId}`;
            const stringToHash = `/pg/v1/status/${this.config.mid}/${merchantTransactionId}${this.config.salt_key}`;
            const hash = await Utils.sha256(stringToHash);
            const checksum = `${hash}###${this.config.salt_index || 1}`;

            const options = {
                method: 'GET',
                url: URL,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': checksum,
                    'X-MERCHANT-ID': this.config.mid,
                },
            };

            const response = await axios.request(options);
            return response.data as U;
        } catch (error: any) {
            Logging.dev("Error in verify: " + (error.response?.data || error.message), "error");
            throw error;
        }
    }

    private decodeBase64ToObject(base64String: string) {
        try {
            const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
            return JSON.parse(decodedString);
        } catch (error: any) {
            Logging.dev("Error decoding base64 string: " + error.message, "error");
            return null;
        }
    }
}
