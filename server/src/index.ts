// [Server App Import] Import configured Express application
import { app } from "./app.js";

// [Port Setup] Port configuration from environment variables or default 3000
const PORT = Number(process.env.PORT) || 3000;

// [Server Listener] Bind and start HTTP listener
app.listen(PORT, () => {
  console.log(`TokTickIT API listening on http://localhost:${PORT}`);
});

