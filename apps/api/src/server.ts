import { createApp } from "./app.js";
import { loadDotenvFile, loadEnv } from "./config/env.js";

loadDotenvFile();

let env;
try {
  env = loadEnv();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API đang chạy tại http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
