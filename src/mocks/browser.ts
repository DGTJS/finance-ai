/**
 * MSW Browser Setup - Inicializa MSW no navegador
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);



