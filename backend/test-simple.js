import Fastify from "fastify";

const fastify = Fastify({ logger: true });

fastify.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  message: "Working\!"
}));

fastify.listen({ port: 3002, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("✅ Server running on port 3002");
});
