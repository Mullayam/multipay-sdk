This code is supporing , billdesk ,paytm,razorpay and phonepay  
Method 1

```ts
// CommonJS
import { PaymentProvider } from "@enjoys/multipay-sdk";

//ES6
const { PaymentProvider } = require("PaymentProvider");
```

```ts
// RECOMMENDED
const methods = new PaymentProvider.AutoConfig(
   "offline", // mode offline user api key is salted with some secret having payload, decrypt on server  and use it, online mode will use directly call to panel server and create configuration and init transaction
   "your_api_key",// get your api key from panel
   "your_api_secret",// get your api secret from panel
);
```

### With User Control

Method 2

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
