/* Comandos rápidos do K-AI: slash commands que executam ações sem passar pela IA. */

import { speak, stopSpeaking, playBip } from '@/lib/kaiVoice';
import { speechText, pickAddress, greeting } from '@/lib/kaiPersonality';
import { runDailyBackup } from '@/lib/kaiBackup';
import { triggerEvolutionCycle } from '@/lib/kaiEvolution';
import { retryFailed } from '@/lib/kaiQueue';
import { isCreator } from '@/lib/creatorMode';

export interface CommandResult {
  handled: boolean;
  reply: string;
  action?: () => void;
}

export function handleSlashCommand(
  input: string,
  callbacks: {
    clearChat: () => void;
    openTasks: () => void;
    openEvolution: () => void;
    openProgramacoes: () => void;
  }
): CommandResult | null {
  const cmd = input.trim().toLowerCase();
  const addr = pickAddress('auxilio');

  switch (cmd) {
    case '/status': {
      playBip();
      const screen = 'Central Korvil';
      const providers = 'Groq, Gemini e Pollinations';
      return {
        handled: true,
        reply: `Status K-AI v42: online. Tela atual: ${screen}. Provedores: ${providers}. Evolução autônoma: ativa a cada 5 min. ${isCreator() ? 'Modo: ADM (Acesso Total).' : 'Modo: usuário.'}`,
      };
    }

    case '/limpar':
    case '/clear':
    case '/reset': {
      callbacks.clearChat();
      return {
        handled: true,
        reply: `Conversa limpa, ${addr}. Comece do zero quando quiser.`,
        action: () => stopSpeaking(),
      };
    }

    case '/backup': {
      if (!isCreator()) {
        return { handled: true, reply: `Backup é exclusivo do ADM, ${addr}.` };
      }
      playBip();
      return {
        handled: true,
        reply: `Iniciando backup diário no GitHub, ${addr}...`,
        action: async () => {
          const ok = await runDailyBackup();
          const msg = ok
            ? `Backup concluído com sucesso, ${pickAddress('valorizacao')}.`
            : `Backup já foi feito hoje ou falhou — verifique a conexão, ${addr}.`;
          speak(speechText(msg));
        },
      };
    }

    case '/evoluir':
    case '/evolucao': {
      playBip();
      callbacks.openEvolution();
      return {
        handled: true,
        reply: `Abrindo o painel de Evolução, ${addr}. Posso gerar uma proposta agora se quiser.`,
        action: async () => {
          const result = await triggerEvolutionCycle();
          if (result.ok && result.title) {
            const msg = `Proposta gerada: ${result.title}. Confira no painel, ${addr}.`;
            speak(speechText(msg));
          }
        },
      };
    }

    case '/tarefas': {
      callbacks.openTasks();
      return { handled: true, reply: `Abrindo suas tarefas, ${addr}.` };
    }

    case '/programacoes': {
      callbacks.openProgramacoes();
      return { handled: true, reply: `Abrindo programações, ${addr}.` };
    }

    case '/fila':
    case '/retry': {
      retryFailed();
      return { handled: true, reply: `Reprocessando tarefas que falharam, ${addr}.` };
    }

    case '/voz':
    case '/falar': {
      const msg = `${greeting()}, ${addr}. Estou ouvindo — diga "KAI" em voz alta para ativar o microfone, ou use o botão de microfone no chat.`;
      speak(speechText(msg));
      return { handled: true, reply: msg };
    }

    case '/silencio':
    case '/parar':
    case '/stop': {
      stopSpeaking();
      return { handled: true, reply: `Silêncio, ${addr}. Pode falar quando quiser.` };
    }

    case '/ajuda':
    case '/help': {
      return {
        handled: true,
        reply: `Comandos disponíveis:\n/status — status do sistema\n/limpar — limpa a conversa\n/backup — backup no GitHub (ADM)\n/evoluir — gera proposta de evolução\n/tarefas — abre tarefas\n/programacoes — abre programações\n/fila — reprocessa tarefas falhadas\n/voz — ativa modo voz\n/silencio — para de falar\n/ajuda — mostra esta lista`,
      };
    }

    default:
      return null;
  }
}

export const SLASH_COMMANDS = [
  '/status', '/limpar', '/backup', '/evoluir', '/tarefas',
  '/programacoes', '/fila', '/voz', '/silencio', '/ajuda',
];
