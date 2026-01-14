import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Info, Power } from "lucide-react";
import { toast } from "sonner";
import { getAutomationStatus, startAutomation, stopAutomation } from "@/utils/automationScheduler";
import { runAutomationCycle, type AutomationLog } from "@/services/autoPoster";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminAutomation = () => {
  const [status, setStatus] = useState(getAutomationStatus());
  const [isAutoEnabled, setIsAutoEnabled] = useState(status.isRunning);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = getAutomationStatus();
      setStatus(currentStatus);
      setIsAutoEnabled(currentStatus.isRunning);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAuto = async (enabled: boolean) => {
    try {
      if (enabled) {
        // Verificar cooldown antes de tentar iniciar
        const currentStatus = getAutomationStatus();
        if (currentStatus.isInCooldown && currentStatus.remainingCooldown > 0) {
          const remainingMinutes = Math.ceil(currentStatus.remainingCooldown / 60);
          toast.warning(`Automação em cooldown. Aguarde ${remainingMinutes} minutos antes de ativar.`);
          setIsAutoEnabled(false);
          setStatus(currentStatus);
          return;
        }
        
        await startAutomation();
        setIsAutoEnabled(true);
        toast.success("Automação automática ativada! Posts serão criados a cada 1 hora.");
      } else {
        stopAutomation();
        setIsAutoEnabled(false);
        toast.success("Automação automática desativada!");
      }
      setStatus(getAutomationStatus());
    } catch (error: any) {
      // Se for erro de cooldown ou quota, mostrar mensagem específica
      if (error.message?.includes("cooldown") || error.message?.includes("Cooldown")) {
        toast.warning(error.message);
      } else if (error.message?.includes("QUOTA_EXCEEDED")) {
        const waitTime = error.message.match(/QUOTA_EXCEEDED:(\d+)/)?.[1] || "60";
        toast.error(`Quota da API excedida. Aguarde ${waitTime} segundos antes de tentar novamente.`);
      } else {
        toast.error(error.message || "Erro ao alterar automação");
      }
      setIsAutoEnabled(false);
      setStatus(getAutomationStatus());
    }
  };

  const handleRunNow = async () => {
    // Verificar se está em cooldown
    const currentStatus = getAutomationStatus();
    if (currentStatus.isInCooldown && currentStatus.remainingCooldown > 0) {
      toast.warning(`Automação em cooldown. Aguarde ${Math.ceil(currentStatus.remainingCooldown / 60)} minutos.`);
      return;
    }

    setIsProcessing(true);
    setLogs([]); // Limpar logs anteriores
    
    try {
      const executionLogs = await runAutomationCycle((log) => {
        setLogs((prev) => [...prev, log]);
        // Scroll automático para o último log
        setTimeout(() => {
          logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
      
      setLogs(executionLogs);
      
      const successCount = executionLogs.filter((log) => log.type === "success" && log.message.includes("Post criado")).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} post(s) criado(s) com sucesso!`);
      } else {
        toast.info("Ciclo executado, mas nenhum post foi criado.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao executar ciclo");
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: error.message || "Erro ao executar ciclo",
          timestamp: new Date(),
        },
      ]);
      
      // Se for erro de quota, atualizar status
      if (error?.message?.includes("QUOTA_EXCEEDED")) {
        setStatus(getAutomationStatus());
      }
    } finally {
      setIsProcessing(false);
      setStatus(getAutomationStatus()); // Atualizar status após execução
    }
  };

  const getLogIcon = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLogColor = (type: AutomationLog["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900";
      case "error":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
      case "warning":
        return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900";
      default:
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";
    }
  };

  return (
    <AdminLayout title="Automação de Posts com IA">
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {/* Status Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Automação de Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {/* Switch para Automação Automática */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 border rounded-lg">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Power className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <Label htmlFor="auto-mode" className="text-xs sm:text-sm md:text-base font-medium cursor-pointer">
                      Automação Automática
                    </Label>
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    {isAutoEnabled 
                      ? "Posts serão criados automaticamente a cada 1 hora"
                      : "Automação automática desativada"}
                  </p>
                  {status.isInCooldown && status.remainingCooldown > 0 && (
                    <p className="text-[10px] sm:text-xs md:text-sm text-orange-600 font-medium">
                      ⏸️ Em cooldown: {Math.ceil(status.remainingCooldown / 60)} minutos restantes
                    </p>
                  )}
                </div>
                <Switch
                  id="auto-mode"
                  checked={isAutoEnabled}
                  onCheckedChange={handleToggleAuto}
                  disabled={status.isInCooldown && status.remainingCooldown > 0}
                  className="flex-shrink-0"
                />
              </div>

              {/* Botão Executar Agora */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 border rounded-lg">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <Label className="text-xs sm:text-sm md:text-base font-medium">Executar Agora</Label>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    Executa um ciclo de automação imediatamente (independente do modo automático)
                  </p>
                </div>
                <Button
                  onClick={handleRunNow}
                  variant="outline"
                  disabled={isProcessing || (status.isInCooldown && status.remainingCooldown > 0)}
                  className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                  {isProcessing ? "Processando..." : "Executar Agora"}
                </Button>
              </div>

              {/* Informações */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Intervalo automático: {status.intervalMinutes} minutos
                  {process.env.NODE_ENV !== "production" && (
                    <span className="ml-2 text-orange-600">(Modo Teste: 5 min)</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 space-y-2 sm:space-y-3 md:space-y-4">
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <p className="text-muted-foreground">
                O sistema de automação com IA (Gemini) funciona da seguinte forma:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Analisa a internet procurando notícias relevantes e urgentes</li>
                <li>Verifica notícias por categoria (Economia, Política, Esportes, etc.)</li>
                <li>Processa o conteúdo com IA, reescrevendo e adaptando para o portal</li>
                <li>Busca imagens relacionadas</li>
                <li>Cria resumo e identifica categoria automaticamente</li>
                <li>Publica posts automaticamente</li>
              </ul>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">Intervalos:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>
                    <strong>Modo Teste:</strong> Executa a cada 5 minutos
                  </li>
                  <li>
                    <strong>Modo Produção:</strong> Executa a cada 1 hora
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Logs de Execução</span>
              {logs.length > 0 && (
                <Badge variant="secondary">{logs.length} eventos</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma execução ainda. Clique em "Executar Agora" para começar.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getLogColor(log.type)} animate-fade-in`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getLogIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{log.message}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(log.timestamp, "HH:mm:ss", { locale: ptBR })}
                          </span>
                        </div>
                        {log.data && (
                          <div className="text-xs text-muted-foreground mt-1 pl-7">
                            {typeof log.data === "object" ? (
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            ) : (
                              String(log.data)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAutomation;
