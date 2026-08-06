const token = process.env.UPDATE_PUBLISH_TOKEN;
if (!token) throw new Error("UPDATE_PUBLISH_TOKEN is not configured.");

const response = await fetch("http://127.0.0.1:3000/api/internal/updates/process", {
  method: "POST",
  headers: { authorization: `Bearer ${token}` },
});
const body = await response.text();
if (!response.ok) throw new Error(`Update worker failed (${response.status}): ${body}`);
console.log(body);
