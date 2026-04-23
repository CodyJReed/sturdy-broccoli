import { loadEnv } from "./env";
import { selectHello } from "./provider";

async function main() {
  loadEnv();

  try {
    const result = await selectHello();

    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

main()
