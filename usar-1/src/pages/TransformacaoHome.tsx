import KAIButton from '@/components/KAIButton';

export default function TransformacaoHome() {
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black">
        <iframe
          src="/ktp-final-perfil-gif-peso-novo_(2).html"
          title="K-TP Projeto Transformação 2026"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
        />
      </div>
      <div className="relative z-[100]">
        <KAIButton />
      </div>
    </>
  );
}
