import { criarApp } from "./app.js";
import { env } from "./env.js";

const app = criarApp({ corsOrigin: env.CORS_ORIGIN });

app.listen(env.PORT, () => {
  console.log(`API One-Take ouvindo em http://localhost:${env.PORT}`);
});
