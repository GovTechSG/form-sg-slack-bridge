/**
 * The URL visible to FormSG. If your application is behind a load-balancer, use
 * the external URL which FormSG is aware of.
 *
 * This is used for signature calculation.
 */
export const POST_URI = process.env.POST_URI;

/**
 * The secret keys used to decrypt the submission. I designed this to be an array
 * to run multiple instances of the same application with different secret keys.
 *
 * I could use a map tied to the formId, however this was done for rapid development.
 * So I need not add new formIds and redeploy. The keys should be comma separated.
 * Example: "secretKey1,secretKey2" (Don't include the quotes)
 */
export const FORM_SECRET_KEYS = process.env.FORM_SECRET_KEYS?.split(',') || [];

/**
 * Optionally, you can whitelist the fields you want to post to Slack, customizable to the formId
 * and fieldId. If you do not provide a whitelist against a formId, everything will be posted.
 *
 * This is useful if you want to post only certain fields to certain channels.
 * Example: {"formId": ["fieldId1", "fieldId2"]}
 */
export const FORM_WHITELISTED_FIELD_IDS: Record<string, string> = JSON.parse(
    process.env.FORM_WHITELISTED_FIELD_IDS || '{}'
);

/**
 * Which formId should be posted to which channel.
 *
 * You must at least provide {"default": "channelId"} as a value for posting everything in one
 * channel.
 */
export const SLACK_BOT_CHANNEL_ID_MAPPING: Record<string, string> = JSON.parse(
    process.env.SLACK_BOT_CHANNEL_ID || '{}'
);
export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;