import { registerDocumentIPC } from './document.ipc';
import { registerScannerIPC } from './scanner.ips';
import { registerTagIpc } from './tag.ipc';

export function registerIpc() {
  registerDocumentIPC();
  registerTagIpc();
  registerScannerIPC();
}
