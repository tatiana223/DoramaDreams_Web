import type { Dorama } from "@/types/dorama";

type Props = {
  dorama: Dorama;
};

export function DoramaCard({ dorama }: Props) {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/5 backdrop-blur">
      <img
        src={dorama.posterUrl || ""}
        alt={dorama.title}
        className="w-full h-80 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold">{dorama.title}</h3>

        <p className="text-sm text-zinc-400">
          {dorama.releaseYear || "Год не указан"}
        </p>
      </div>
    </div>
  );
}