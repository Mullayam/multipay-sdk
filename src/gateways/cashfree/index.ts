import crypto from "crypto"
import { Cashfree } from "cashfree-pg"
export class CashfreeSDK {
    private cashfree: Cashfree;
    constructor(private config: CashfreeConfigurationValidator) {
        this.cashfree = new Cashfree(config);
    }
    async initiateTransaction<T extends {}, U>(props: T & CashfreeInitiateTransaction): Promise<U> {
        const { orderid, amount, info: { mobile } } = props;
        const request = {
            order_amount: 122,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_name: existingUser.name ?? undefined,
                customer_email: existingUser.email ?? undefined,
                // needs to be at least 10 digits (with optional country code)
                customer_phone: existingUser.phoneNumber
                    ? String(existingUser.phoneNumber)
                    : "+919090407368",
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?order_id=${tempOrderId}`,
                notify_url: `${process.env.NEXT_PUBLIC_CASHFREE_WEBHOOK_ENDPOINT}/api/payments/webhook`,
            },
            order_note: "Purchase of upgrade",
        }
        const response = await Cashfree.PGCreateOrder("2023-08-01", request)
        if (
            !response.data ||
            !response.data.payment_session_id ||
            !response.data.order_id
        ) {
            console.error("Failed to create Cashfree order:", response.data)
            return null
        }
        return {
            payment_session_id: response.data.payment_session_id,
            order_id: response.data.order_id,
            pricing: 122,
        },
    }
    async callback() {
        try {
            const rawBody = await req.text()
            const parsedBody = JSON.parse(rawBody)
            const signature = req.headers.get("x-webhook-signature") || ""
            const timestamp = req.headers.get("x-webhook-timestamp") || ""
            if (!signature || !timestamp) {
                console.error("Missing required headers")
                return (
                    { success: false, error: "Missing required headers" },
                    { status: 400 }
                )
            }
            const isValidSignature = verifyWebhookSignature(
                timestamp,
                rawBody,
                signature
            )

            if (!isValidSignature) {
                console.error("Invalid webhook signature")
                return (
                    { success: false, error: "Invalid signature" },
                    { status: 400 }
                )
            }
        } catch (error) {

        }
    }

    async verify() {
        try {
            const cashfreeResponse = await Cashfree.PGOrderFetchPayments(
                "2023-08-01",
                orderId
            )
            if (!cashfreeResponse.data || cashfreeResponse.data.length === 0) {
                console.log("No payment information found")
                return ({
                    success: false,
                    status: PENDING,
                    message: "Payment information not available",
                })
            }
            const latestPayment =
                cashfreeResponse.data[cashfreeResponse.data.length - 1]
            if (latestPayment.payment_status === "SUCCESS") {

            }
        } catch (error) {

        }
    }
    private verifyWebhookSignature(
        timestamp: string,
        rawBody: string,
        receivedSignature: string
    ): boolean {
        const secretKey = process.env.CASHFREE_SECRET_KEY!
        const data = timestamp + rawBody
        const computedSignature = crypto
            .createHmac("sha256", secretKey)
            .update(data)
            .digest("base64")
        return computedSignature === receivedSignature
    }
}