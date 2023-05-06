import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as formsg from "@opengovsg/formsg-sdk";
import { FORM_SECRET_KEYS, POST_URI } from "./config";
import { postMessage, uploadJsonFile } from "./slack";

const formsgSdk = formsg();

async function handleSubmissions(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const signature =
    event.headers["x-formsg-signature"] || event.headers["X-FormSG-Signature"];

  if (!signature || !formsgSdk.webhooks.authenticate(signature, POST_URI!!)) {
    console.error(
      "X-FormSG-Signature Mismatch. Please check the POST_URI environment variable."
    );

    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const requestBody = JSON.parse(event.body || "{}");

  for (const formSecretKey of FORM_SECRET_KEYS) {
    const submission = await formsgSdk.crypto.decryptWithAttachments(
      formSecretKey,
      requestBody.data
    );

    if (submission) {
      await postMessage(submission, requestBody);
      await uploadJsonFile(submission, requestBody);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "OK" }),
      };
    }
  }

  console.error("No matching form secret key could decrypt the payload.");

  return {
    statusCode: 422,
    body: JSON.stringify({ message: "Unprocessable Entity" }),
  };
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
  return await handleSubmissions(event);
};
