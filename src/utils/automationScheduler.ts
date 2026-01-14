// Sistema de agendamento para automação de posts

let automationInterval: NodeJS.Timeout | null = null;
let isRunning = false;
let quotaExceededUntil: Date | null = null; // Timestamp até quando a quota está excedida

// Intervalo em teste: 5 minutos (300000ms)
// Intervalo em produção: 1 hora (3600000ms)
const AUTOMATION_INTERVAL = process.env.NODE_ENV === "production" 
  ? 60 * 60 * 1000 // 1 hora
  : 5 * 60 * 1000; // 5 minutos (teste)

export const startAutomation = async () => {
  if (isRunning) {
    console.log("Automação já está rodando");
    return;
  }

  // Verificar se está em cooldown ANTES de iniciar
  if (quotaExceededUntil && new Date() <= quotaExceededUntil) {
    const remainingSeconds = Math.ceil((quotaExceededUntil.getTime() - Date.now()) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    console.log(`⏸️ Automação em cooldown. Aguarde ${remainingMinutes} minutos (${remainingSeconds} segundos).`);
    throw new Error(`Automação em cooldown. Aguarde ${remainingMinutes} minutos antes de tentar novamente.`);
  }

  isRunning = true;
  console.log("Iniciando automação de posts...");

  // Executar imediatamente (se não estiver em cooldown)
  if (!quotaExceededUntil || new Date() > quotaExceededUntil) {
    try {
      const { runAutomationCycle } = await import("../services/autoPoster");
      await runAutomationCycle((log) => {
        console.log(`[${log.type.toUpperCase()}] ${log.message}`, log.data || "");
        
        // Se detectar quota excedida, marcar cooldown
        if (log.type === "error" && log.message.includes("Quota")) {
          const waitTime = extractWaitTime(log.message) || 60;
          quotaExceededUntil = new Date(Date.now() + waitTime * 1000);
          console.log(`⏸️ Automação pausada por ${waitTime} segundos devido à quota excedida`);
        }
      });
    } catch (error: any) {
      // Se for erro de quota, marcar cooldown
      if (error?.message?.includes("QUOTA_EXCEEDED")) {
        const waitTime = extractWaitTime(error.message) || 60;
        quotaExceededUntil = new Date(Date.now() + waitTime * 1000);
        console.log(`⏸️ Automação pausada por ${waitTime} segundos devido à quota excedida`);
        throw error; // Relançar para que a UI mostre o erro
      }
      throw error;
    }
  } else {
    const remainingSeconds = Math.ceil((quotaExceededUntil.getTime() - Date.now()) / 1000);
    console.log(`⏸️ Automação em cooldown. Aguarde ${remainingSeconds} segundos.`);
  }

  // Agendar execuções periódicas
  automationInterval = setInterval(async () => {
    // Verificar se ainda está em cooldown
    if (quotaExceededUntil && new Date() <= quotaExceededUntil) {
      const remainingSeconds = Math.ceil((quotaExceededUntil.getTime() - Date.now()) / 1000);
      console.log(`⏸️ Automação em cooldown. Aguarde ${remainingSeconds} segundos.`);
      return;
    }

    // Se passou o cooldown, limpar
    if (quotaExceededUntil && new Date() > quotaExceededUntil) {
      quotaExceededUntil = null;
      console.log("✅ Cooldown finalizado. Retomando automação...");
    }

    try {
      const { runAutomationCycle } = await import("../services/autoPoster");
      await runAutomationCycle((log) => {
        console.log(`[${log.type.toUpperCase()}] ${log.message}`, log.data || "");
        
        // Se detectar quota excedida, marcar cooldown
        if (log.type === "error" && log.message.includes("Quota")) {
          const waitTime = extractWaitTime(log.message) || 60;
          quotaExceededUntil = new Date(Date.now() + waitTime * 1000);
          console.log(`⏸️ Automação pausada por ${waitTime} segundos devido à quota excedida`);
        }
      });
    } catch (error: any) {
      console.error("Erro na execução agendada:", error);
      
      // Se for erro de quota, marcar cooldown
      if (error?.message?.includes("QUOTA_EXCEEDED")) {
        const waitTime = extractWaitTime(error.message) || 60;
        quotaExceededUntil = new Date(Date.now() + waitTime * 1000);
        console.log(`⏸️ Automação pausada por ${waitTime} segundos devido à quota excedida`);
      }
    }
  }, AUTOMATION_INTERVAL);

  console.log(`Automação agendada para executar a cada ${AUTOMATION_INTERVAL / 1000 / 60} minutos`);
};

// Extrair tempo de espera da mensagem de erro
const extractWaitTime = (message: string): number | null => {
  const match = message.match(/(\d+)\s*segundos?/i) || message.match(/QUOTA_EXCEEDED:(\d+)/);
  return match ? parseInt(match[1]) : null;
};

export const stopAutomation = () => {
  if (automationInterval) {
    clearInterval(automationInterval);
    automationInterval = null;
    isRunning = false;
    console.log("Automação parada");
  }
};

export const getAutomationStatus = () => {
  const isInCooldown = quotaExceededUntil && new Date() <= quotaExceededUntil;
  const remainingCooldown = isInCooldown 
    ? Math.ceil((quotaExceededUntil!.getTime() - Date.now()) / 1000)
    : 0;

  return {
    isRunning,
    interval: AUTOMATION_INTERVAL,
    intervalMinutes: AUTOMATION_INTERVAL / 1000 / 60,
    isInCooldown,
    remainingCooldown,
    quotaExceededUntil: quotaExceededUntil?.toISOString() || null,
  };
};

// Função para definir cooldown manualmente
export const setQuotaCooldown = (waitTimeSeconds: number) => {
  quotaExceededUntil = new Date(Date.now() + waitTimeSeconds * 1000);
  console.log(`⏸️ Cooldown de quota definido por ${waitTimeSeconds} segundos`);
};

// Função para limpar cooldown manualmente (útil para testes)
export const clearQuotaCooldown = () => {
  quotaExceededUntil = null;
  console.log("Cooldown de quota limpo manualmente");
};
