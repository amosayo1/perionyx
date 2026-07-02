import { logger } from "@/lib/logger";

type SlackInput = {
  webhookUrl: string;
  text: string;
  title?: string;
  color?: string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
};

export async function sendSlackMessage(input: SlackInput) {
  const blocks: Record<string, any>[] = [];

  if (input.title) {
    blocks.push({
      type: "header",
      text: { type: "plain_text", text: input.title },
    });
  }

  if (input.text) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: input.text },
    });
  }

  if (input.fields && input.fields.length > 0) {
    blocks.push({
      type: "section",
      fields: input.fields.map((f) => ({
        type: "mrkdwn",
        text: `*${f.title}:*\n${f.value}`,
      })),
    });
  }

  try {
    const res = await fetch(input.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.text,
        blocks,
        ...(input.color ? { attachments: [{ color: input.color, blocks }] } : {}),
      }),
    });

    if (!res.ok) {
      const slackErrText = await res.text();
      logger.error({ status: res.status, response: slackErrText }, "[SlackChannel] Failed");
    }
  } catch (err) {
    logger.error(err, "[SlackChannel] Error");
  }
}
