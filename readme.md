This code is supporing , billdesk ,paytm,razorpay and phonepay  
Method 1

```ts
// RECOMMENDED

```

Method 2

```ts
const methods = new PaymentProvider.AttachInstance(
  new Paytm({
    PAYTM_MERCHANT_ID: "your_mid",
    PAYTM_MERCHANT_KEY: "your_mkey",
    PAYTM_ENVIRONMENT: "TEST",
    CALLBACK_URL: "http://localhost:8080/callback",
    PAYTM_MERCHANT_WEBSITE: "DEFAULT",
  })
);
```

Method 3

```ts
const paymentInstance = new PaymentProvider.Factory({
  mode: "PRODUCTION",
  gateway: "PAYTM",
  callbackUrl: "http://localhost:8080/callback",
  redirectUrl: "http://localhost:8080/callback",
  credentials: {
    merchantId: "LwKutv58548207890301",
    merchantKey: "rBHSFqbQmGZJ1mu7",
  },
});

const methods = paymentInstance.InitiateTransaction({
  amount: "45454",
  info: {
    email: "dfd",
    mobile: "string",
    pincode: "string",
    firstName: "string",
    lastName: "string",
    address: "string",
  },
});
```
