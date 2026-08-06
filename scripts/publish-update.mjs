const token = process.env.UPDATE_PUBLISH_TOKEN;
if (!token) throw new Error("UPDATE_PUBLISH_TOKEN is not configured.");

let input = "";
for await (const chunk of process.stdin) input += chunk;
if (!input.trim()) {
  throw new Error("Provide one publication JSON object on standard input.");
}

JSON.parse(input);
const response = await fetch("http://127.0.0.1:3000/api/internal/updates/publish", {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  body: input,
});
const body = await response.text();
if (!response.ok) throw new Error(`Publication failed (${response.status}): ${body}`);
console.log(body);
