import { axios } from "@pipedream/platform";

/* global defineComponent */

export default defineComponent({
  name: "Read Mailrith Agent Capabilities",
  description: "Reads the compact capability contract for one Mailrith workspace.",
  props: {
    mailrithAccessToken: {
      type: "string",
      label: "Mailrith API Key Or OAuth Access Token",
      secret: true,
    },
  },
  async run({ $ }) {
    return axios($, {
      method: "GET",
      url: "https://api.mailrith.com/v1/capabilities",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.mailrithAccessToken}`,
        "X-Mailrith-Client": "pipedream/phase-6-template",
      },
      timeout: 10_000,
    });
  },
});
