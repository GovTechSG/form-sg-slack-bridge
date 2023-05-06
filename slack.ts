import { App, AwsLambdaReceiver } from "@slack/bolt";
import {
  FORM_WHITELISTED_FIELD_IDS,
  SLACK_BOT_CHANNEL_ID_MAPPING,
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
} from "./config";
import { DecryptedContentAndAttachments } from "@opengovsg/formsg-sdk/dist/types";
import { renderFormField } from "./render";

const FORMSG_PREFIX = `https://form.gov.sg`;

if (!SLACK_SIGNING_SECRET) {
  throw new Error("SLACK_SIGNING_SECRET is not set in the environment");
}

if (!SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN is not set in the environment");
}

const receiver = new AwsLambdaReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});

const app = new App({
  token: SLACK_BOT_TOKEN,
  receiver,
});

export async function postMessage(
  submission: DecryptedContentAndAttachments,
  requestBody
) {
  const formId = getFormId(requestBody);
  const submissionUrl = `${FORMSG_PREFIX}/admin/form/${formId}/results/${getSubmissionId(
    requestBody
  )}`;

  const formFields = submission.content.responses.filter((formField) => {
    const whitelistExists = Object.keys(FORM_WHITELISTED_FIELD_IDS).includes(
      formId
    );

    if (!whitelistExists) {
      return true;
    }

    return FORM_WHITELISTED_FIELD_IDS[formId] === formField._id;
  });

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "New Submission",
      },
    },
    {
      type: "section",
      text: {
        text: formFields.map(renderFormField),
        type: "mrkdwn",
      },
    },
  ];

  await app.client.chat.postMessage({
    channel: resolveChannelId(formId),
    text: `*New Submission*\n\n${submissionUrl}`,
    blocks,
  });
}

export async function uploadJsonFile(
  submission: DecryptedContentAndAttachments,
  requestBody
) {
  const simplifiedResponse = Object.assign(
    {},
    ...submission.content.responses.map((formField) => {
      return {
        [formField.question]: formField.answer || formField.answerArray,
      };
    })
  );

  const formattedJsonResponse = JSON.stringify(simplifiedResponse, null, 2);

  await app.client.files.upload({
    channels: resolveChannelId(getFormId(requestBody)),
    content: formattedJsonResponse,
    filename: `submission-${requestBody.data.formId}-${requestBody.data.submissionId}.json`,
    filetype: "json",
    title: `Submission #${requestBody.data.submissionId}`,
  });
}

function getFormId(requestBody) {
  return requestBody.data.formId;
}

function getSubmissionId(requestBody) {
  return requestBody.data.submissionId;
}

function resolveChannelId(formId: string): string {
  return (
    SLACK_BOT_CHANNEL_ID_MAPPING[formId] ||
    SLACK_BOT_CHANNEL_ID_MAPPING["default"]
  );
}
