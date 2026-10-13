// Uso: npm run concluir-exclusoes
// Retoma exclusões de conta que começaram (link confirmado) mas pararam no meio por alguma falha
// (ex.: o Supabase ou o banco caiu). Pode rodar quantas vezes quiser: o que já terminou não é refeito.
import "dotenv/config";
import { concluirExclusoesPendentes } from "../src/modules/conta/conta.service.js";

const { concluidas, falhas } = await concluirExclusoesPendentes();
console.log(`Exclusões retomadas: ${concluidas} concluída(s), ${falhas} com falha.`);
process.exit(falhas > 0 ? 1 : 0);
