import { Request, Response } from "express";
import {
  PaytmConfigurationValidator,
  PaytmParamsBody,
  PaytmParamsBodyServerLess,
  ResponseBody,
  VerifyPaymentStatusParamsType,
} from "../../types/paytm"
import PaytmChecksum from "./checksum";
import * as https from "https";
export class PaytmMiddleware {

  private static PaytmConfig: PaytmConfigurationValidator = {
    PAYTM_ENVIRONMENT: "TEST",
    PAYTM_MERCHANT_ID: "",
    PAYTM_MERCHANT_KEY: "",
    PAYTM_MERCHANT_WEBSITE: "DEFAULT",
    CALLBACK_URL: "",
  };

  constructor(config: PaytmConfigurationValidator) {
    PaytmMiddleware.PaytmConfig = config;
  }

  async initiateTransaction(req: Request, res: Response) {
    if (!req.body.amount || !req.body.credential) {
      return res.status(400).json({
        message: "credential, amount is required, pass  object to for user details",
      });
    }
    const paytmParams: PaytmParamsBodyServerLess = {}
    paytmParams.body = {
      requestType: "Payment",
      mid: PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_ID,
      websiteName: PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_WEBSITE,
      orderId: req.body.orderId || `OID${Math.floor(Math.random() * 100000)}${new Date().getTime()}`,
      callbackUrl: PaytmMiddleware.PaytmConfig.CALLBACK_URL,
      txnAmount: {
        value: `${req.body.amount}.00`,
        currency: "INR",
      },
      userInfo: {
        custId: req.body.credential,
        email: `${req.body.credential}`,
      },
    }
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_KEY
    )
    paytmParams.head = {
      signature: checksum,
    }

    const post_data = JSON.stringify(paytmParams)
    const queryParams = `mid=${PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_ID}&orderId=${paytmParams.body.orderId}`
    const options = {
      hostname:
        PaytmMiddleware.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
          ? "securegw.paytm.in"
          : "securegw-stage.paytm.in",
      port: 443,
      path: `/theia/api/v1/initiateTransaction?${queryParams}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    }
    type responseChunk = {
      body?: any
      head?: any
    }
    let response: responseChunk = {}

    var post_req = https.request(options, function (post_res) {
      post_res.on("data", function (chunk) {
        response = JSON.parse(chunk)

      })
      post_res.on("end", function () {

        const html = `
              <html>
             <head>
                <title>ENJOYS - Payment Page</title>
             </head>
             <body>
                <center>
                   <h1>Please do not refresh this page...</h1>
                </center>
                <form method="post" action="https://${options.hostname}/theia/api/v1/showPaymentPage?${queryParams}" name="paytm">
                   <table border="1">
                      <tbody>
                         <input type="hidden" name="mid" value="${PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_ID}">
                         <input type="hidden" name="orderId" value="${paytmParams.body?.orderId}">
                         <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                      </tbody>
                   </table>
                   </form>                    
                   
                   <script type="text/javascript"> document.PaytmMiddleware.submit(); </script>
             </body>
          </html>`
        res.send(html)
        res.end()
      })
    })
    post_req.write(post_data)
    post_req.end()


  }
  async callback<T extends {}, U>(body?: T): Promise<U> {
    throw new Error("Method not implemented.");
  }
  async verify(req: Request, res: Response) {
    const Body: PaytmParamsBody = req.body;

    let VerifyPaymentStatusParams: VerifyPaymentStatusParamsType = {
      head: {},
      body: {},
    };
    VerifyPaymentStatusParams.body = {
      mid: PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_ID,
      orderId: Body.orderId,
    };

    const CreatedNewChecksum = await PaytmChecksum.generateSignature(
      JSON.stringify(VerifyPaymentStatusParams.body),
      PaytmMiddleware.PaytmConfig.PAYTM_MERCHANT_KEY
    );
    VerifyPaymentStatusParams.head = {
      signature: CreatedNewChecksum,
    };
    const post_data = JSON.stringify(VerifyPaymentStatusParams);
    var options = {
      hostname:
        PaytmMiddleware.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
          ? "securegw.paytm.in"
          : "securegw-stage.paytm.in",

      port: 443,
      path: "/v3/order/status",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    };
    let response: ResponseBody;
    let status: string = "";
    let post_req = https.request(options, function (post_res) {
      post_res.on("data", function (chunk) {
        response = JSON.parse(chunk);
        console.log(response)
      });
      post_res.on("end", async function () {
        req.body.response = response
        if (response.body.resultInfo.resultCode === "01") {
          status = "SUCCESS";
        } else {
          status = response.body.resultInfo.resultStatus.split("_")[1];
        }
        res.status(200).json({
          message: response.body.resultInfo.resultStatus,
          body: response.body,
        });
        res.end();
      });
    });
    post_req.write(post_data);
    post_req.end();
  }
}