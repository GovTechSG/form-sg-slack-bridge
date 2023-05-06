# FormSG-Slack Bridge 🌉Serverless

This is a serverless application that bridges FormSG and Slack.

It hooks into FormSG Webhooks and sends the responses to a Slack channel, neatly formatted.
It is generic enough to cater to most use-cases.

## Usage

### Configuration and Deployment

1. Obtain your Slack App Credentials.
2. Obtain your FormSG Credentials.
3. Refer to `config.ts` to set the environment variables for your AWS Lambda function.
4. Deploy the application.

It uses FormSG SDK.
