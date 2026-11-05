/* Tela de Planos Bolt dentro do Korvil: mostra a comparação Free/Lite/Pro
   com a tabela oficial do Help Center do Bolt. */

import { ArrowLeft, Check, X, Sparkles } from 'lucide-react';

interface PlanRow {
  feature: string;
  free: string | boolean;
  lite: string | boolean;
  pro: string | boolean;
}

const ROWS: PlanRow[] = [
  { feature: 'Agentes de IA', free: 'Standard apenas', lite: 'Forge apenas', pro: 'Standard, Max e Forge' },
  { feature: 'Uso mensal', free: 'Allowance do Free', lite: 'Allowance do Forge', pro: 'Scales com o tier + Forge' },
  { feature: 'Comprar uso extra', free: false, lite: false, pro: true },
  { feature: 'Geração de imagens por IA', free: false, lite: false, pro: true },
  { feature: 'Security scan', free: false, lite: false, pro: true },
  { feature: 'Banco de dados', free: 'Bolt database', lite: 'Bolt database', pro: 'Bolt ou Supabase' },
  { feature: 'Domínios personalizados', free: false, lite: false, pro: true },
  { feature: 'Anexos por mensagem', free: '5 arquivos, até 10 MB', lite: '20 arquivos, até 100 MB', pro: '20 arquivos, até 100 MB' },
  { feature: 'Tamanho máximo do prompt', free: 'Limite base', lite: 'Dobro do base', pro: 'Dobro do base' },
  { feature: 'Recompensas de indicação', free: false, lite: true, pro: true },
  { feature: 'Badge "Made in Bolt"', free: true, lite: true, pro: false },
];

function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={16} className={highlight ? 'text-emerald-400' : 'text-emerald-400'} />
    ) : (
      <X size={16} className="text-zinc-600" />
    );
  }
  return <span className={highlight ? 'text-cyan-200 font-semibold' : 'text-zinc-300'}>{value}</span>;
}

export default function BoltPlansPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4 transition"
      >
        <ArrowLeft size={16} /> Voltar à Central
      </button>

      <div className="relative rounded-3xl overflow-hidden mb-6 h-36 sm:h-44 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 70% 50%, #3b82f6 0%, transparent 50%)',
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles size={26} className="text-cyan-400 mb-1" />
          <h1 className="text-white font-black text-2xl sm:text-3xl tracking-tight">Planos Bolt</h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Compare os recursos do Free, Lite e Pro
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/60 border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-400 font-semibold">Recurso</th>
              <th className="px-4 py-3 text-zinc-200 font-bold">
                Free
                <span className="block text-[10px] text-cyan-400 font-normal">Grátis</span>
              </th>
              <th className="px-4 py-3 text-zinc-200 font-bold">
                Lite
                <span className="block text-[10px] text-zinc-500 font-normal">$9/mês</span>
              </th>
              <th className="px-4 py-3 text-zinc-200 font-bold">
                Pro
                <span className="block text-[10px] text-violet-400 font-normal">Premium</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={r.feature}
                className={i % 2 === 0 ? 'bg-zinc-900/30' : 'bg-transparent'}
              >
                <td className="px-4 py-3 text-zinc-300 font-medium">{r.feature}</td>
                <td className="px-4 py-3 text-center">
                  <Cell value={r.free} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell value={r.lite} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell value={r.pro} highlight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <PlanCard
          name="Free"
          price="R$ 0"
          tag="Seu plano atual"
          features={['Agente Standard', 'Bolt database', '5 anexos por mensagem', 'Badge Made in Bolt']}
          current
        />
        <PlanCard
          name="Lite"
          price="$9/mês"
          tag="Mais uso com Forge"
          features={['Agente Forge (open-source)', '20 anexos até 100 MB', 'Prompt em dobro', 'Recompensas de indicação']}
        />
        <PlanCard
          name="Pro"
          price="Premium"
          tag="Tudo liberado"
          features={['Standard, Max e Forge', 'Geração de imagens por IA', 'Security scan', 'Domínio personalizado', 'Compra de uso extra']}
          highlight
        />
      </div>

      <p className="text-center text-zinc-500 text-xs mt-6">
        Para fazer upgrade, visite{' '}
        <a
          href="https://bolt.new/pricing"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline"
        >
          bolt.new/pricing
        </a>
      </p>
    </div>
  );
}

function PlanCard({
  name,
  price,
  tag,
  features,
  current,
  highlight,
}: {
  name: string;
  price: string;
  tag: string;
  features: string[];
  current?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30'
          : current
            ? 'border-cyan-500/50 bg-cyan-500/5'
            : 'border-zinc-800 bg-zinc-900/40'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">{name}</h3>
        {current && (
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">
            ATUAL
          </span>
        )}
      </div>
      <p className="text-white font-black text-xl">{price}</p>
      <p className="text-zinc-500 text-xs mb-3">{tag}</p>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
            <Check size={13} className="text-emerald-400 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
