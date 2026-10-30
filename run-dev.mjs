#!/usr/bin/env node

/**
 * ============================================================================
 * TRAVELEASY FULLSTACK UNIFIED DEV RUNNER
 * Chạy đồng thời cả Backend (Spring Boot Gradle) và Frontend (Vite React)
 * chỉ với 1 câu lệnh duy nhất: npm run dev
 * ============================================================================
 */

import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GRAY = '\x1b[90m';

console.log(`
${BOLD}${CYAN}================================================================================${RESET}
${BOLD}${GREEN}   🚀  TRAVELEASY PLATFORM — FULLSTACK DEV SERVER RUNNER${RESET}
${BOLD}${CYAN}================================================================================${RESET}
  🌐 ${BOLD}Frontend Web :${RESET} ${CYAN}http://localhost:5173/${RESET}
  ⚙️  ${BOLD}Backend API  :${RESET} ${GREEN}http://localhost:8080/api/v1${RESET}
  📚 ${BOLD}Swagger Docs :${RESET} ${YELLOW}http://localhost:8080/swagger-ui.html${RESET}
  🗄️  ${BOLD}Database     :${RESET} ${GREEN}Supabase Cloud PostgreSQL (Ready & Seeded 482 Trips)${RESET}
${BOLD}${CYAN}================================================================================${RESET}
  ${GRAY}💡 Nhấn ${BOLD}Ctrl + C${RESET}${GRAY} bất cứ lúc nào để dừng cả Frontend và Backend an toàn.${RESET}
${BOLD}${CYAN}================================================================================${RESET}
`);

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

// Hàm kill tiến trình và toàn bộ cây tiến trình con (Đặc biệt quan trọng trên Windows cho Java / Vite)
function killTree(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (isWindows) {
      spawnSync('taskkill', ['/pid', proc.pid.toString(), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-proc.pid, 'SIGKILL');
    }
  } catch (e) {
    try {
      proc.kill('SIGKILL');
    } catch (e2) {}
  }
}

function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${YELLOW}🛑 Đang dừng toàn bộ hệ thống (Frontend & Backend)...${RESET}`);

  if (backendProcess) {
    killTree(backendProcess);
    backendProcess = null;
  }

  if (frontendProcess) {
    killTree(frontendProcess);
    frontendProcess = null;
  }

  console.log(`${GREEN}✔ Đã giải phóng hoàn tất cổng 8080 và 5173. Tạm biệt!${RESET}\n`);
  process.exit(code);
}

// Bắt các tín hiệu tắt tiến trình
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => shutdown(0));

// Khởi chạy Backend (Spring Boot Gradle)
function startBackend() {
  const backendDir = path.join(__dirname, 'backend');
  const cmd = isWindows ? 'gradlew.bat' : './gradlew';
  const args = ['bootRun', '--args=--spring.profiles.active=supabase'];

  console.log(`${CYAN}[BACKEND]  Đang khởi động Spring Boot qua Gradle...${RESET}`);

  backendProcess = spawn(cmd, args, {
    cwd: backendDir,
    shell: isWindows,
    detached: !isWindows,
    env: { ...process.env, FORCE_COLOR: 'true' },
  });

  const rlOut = readline.createInterface({ input: backendProcess.stdout });
  rlOut.on('line', (line) => {
    // Thông báo nổi bật khi Spring Boot khởi động xong
    if (line.includes('Started TraveleasyApplication') || line.includes('Started TravelEasyApplication') || line.includes('Tomcat started on port')) {
      console.log(`${BOLD}${GREEN}✔ [BACKEND READY] Spring Boot đã sẵn sàng tại http://localhost:8080!${RESET}`);
    }
    console.log(`${CYAN}[BACKEND ]${RESET} ${line}`);
  });

  const rlErr = readline.createInterface({ input: backendProcess.stderr });
  rlErr.on('line', (line) => {
    console.error(`${RED}[BACKEND ]${RESET} ${line}`);
  });

  backendProcess.on('close', (code) => {
    if (!isShuttingDown) {
      console.log(`${YELLOW}[BACKEND ] Tiến trình Backend kết thúc với mã ${code}${RESET}`);
      shutdown(code || 0);
    }
  });

  backendProcess.on('error', (err) => {
    console.error(`${RED}[BACKEND ERROR] ${err.message}${RESET}`);
  });
}

// Khởi chạy Frontend (Vite React)
function startFrontend() {
  const frontendDir = path.join(__dirname, 'frontend');
  const cmd = isWindows ? 'npm.cmd' : 'npm';
  const args = ['run', 'dev'];

  console.log(`${MAGENTA}[FRONTEND] Đang khởi động Vite Dev Server...${RESET}`);

  frontendProcess = spawn(cmd, args, {
    cwd: frontendDir,
    shell: isWindows,
    detached: !isWindows,
    env: { ...process.env, FORCE_COLOR: 'true' },
  });

  const rlOut = readline.createInterface({ input: frontendProcess.stdout });
  rlOut.on('line', (line) => {
    if (line.includes('Local:') || line.includes('ready in')) {
      console.log(`${BOLD}${GREEN}✔ [FRONTEND READY] Giao diện đã sẵn sàng tại http://localhost:5173!${RESET}`);
    }
    console.log(`${MAGENTA}[FRONTEND]${RESET} ${line}`);
  });

  const rlErr = readline.createInterface({ input: frontendProcess.stderr });
  rlErr.on('line', (line) => {
    console.error(`${RED}[FRONTEND]${RESET} ${line}`);
  });

  frontendProcess.on('close', (code) => {
    if (!isShuttingDown) {
      console.log(`${YELLOW}[FRONTEND] Tiến trình Frontend kết thúc với mã ${code}${RESET}`);
      shutdown(code || 0);
    }
  });

  frontendProcess.on('error', (err) => {
    console.error(`${RED}[FRONTEND ERROR] ${err.message}${RESET}`);
  });
}

// Tự động dọn dẹp các cổng 8080 và 5173 trước khi khởi chạy nếu có tiến trình cũ bị treo
function preCleanPort(port) {
  try {
    if (isWindows) {
      const netstat = spawnSync('cmd.exe', ['/c', `netstat -ano | findstr :${port}`], { encoding: 'utf8' });
      if (netstat.stdout) {
        const lines = netstat.stdout.split('\n');
        for (const line of lines) {
          if (line.includes('LISTENING') || line.includes('ESTABLISHED')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid) && parseInt(pid, 10) !== process.pid && parseInt(pid, 10) > 4) {
              spawnSync('taskkill', ['/pid', pid, '/T', '/F'], { stdio: 'ignore' });
            }
          }
        }
      }
    }
  } catch (e) {}
}

preCleanPort(8080);
preCleanPort(5173);

// Chạy song song
startBackend();
startFrontend();

