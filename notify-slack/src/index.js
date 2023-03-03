const core = require("@actions/core");
const fs = require("fs");
const Handlebars = require("handlebars");
const { WebClient } = require("@slack/web-api");

(async () => {
  try {
    const slack_token = core.getInput("token");
    const channel = core.getInput("channel");
    const message_template = core.getInput("message");
    const parametersString = core.getInput("params");
    const messageId = core.getInput("message-id");

    if (!message_template) throw new Error("No 'message' input provided.");
    if (!slack_token) throw new Error("Slack Token required.");
    if (!fs.existsSync(message_template)) throw new Error(`File ${message_template} does not exist.`);

    const slack = new WebClient(slack_token);
    
    const channelId = await lookUpChannelId({ slack, channel });

    const params = {
        ts: Math.floor(Date.now() / 1000),
    };
    if (parametersString) {
        const arr = parametersString.split(/\r?\n/);
        arr.forEach(o => {
            const kv = o.split('=')
            if (kv.length !== 2) throw new Error(`Incorrect syntax for 'params': ${o}`);

            params[kv[0]] = kv[1];
        })
    }

    fs.readFile(message_template, { encoding: "utf-8" }, async (err, data) => {
        if (err) throw err;

        const templatefn = Handlebars.compile(data);
        const message = JSON.parse(templatefn(params));
        message.channel = channelId;
        message.ts = new Boolean(messageId) ? messageId : params.ts;
        const apiMethod = messageId ? "update" : "postMessage"

        const response = await slack.chat[apiMethod](message)

        core.setOutput('message-id', response.ts)
    })

  } catch (error) {

    core.setFailed(error.message);
  }
})();

async function lookUpChannelId({ slack, channel }) {
    let result;
    const formattedChannel = formatChannelName(channel);
  
    // Async iteration is similar to a simple for loop.
    // Use only the first two parameters to get an async iterator.
    for await (const page of slack.paginate("conversations.list", {
      types: "public_channel, private_channel",
    })) {
      // You can inspect each page, find your result, and stop the loop with a `break` statement
      const match = page.channels.find((c) => c.name === formattedChannel);
      if (match) {
        result = match.id;
        break;
      }
    }
  
    return result;
  }