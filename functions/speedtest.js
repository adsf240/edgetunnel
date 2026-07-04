export function onRequest(context) {
  return new Response("speedtest page is working", {
    headers: { "Content-Type": "text/plain" }
  });
}
