import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { ServiceView } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Formats a price according to the service's pricing mode, so visitors always
 * see a concrete figure rather than an empty cell.
 */
export function formatPrice(
  service: Pick<ServiceView, "priceType" | "price" | "maxPrice" | "currency" | "unit">,
  dict: ReturnType<typeof getDictionary>,
): string | null {
  const { priceType, price, maxPrice, currency, unit } = service;

  if (priceType === "custom_quote") return dict.services.onRequest;
  if (price === null || price === undefined) return null;

  const format = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);

  switch (priceType) {
    case "from":
      return `${dict.services.fromPrice} ${format(price)}`;
    case "range":
      return maxPrice ? `${format(price)} — ${format(maxPrice)}` : format(price);
    case "hourly":
      return `${format(price)} / ${dict.services.perHour}`;
    case "daily":
      return `${format(price)} / ${dict.services.perDay}`;
    case "fixed":
    default:
      return unit ? `${format(price)} / ${unit}` : format(price);
  }
}

type ServiceCardProps = {
  service: ServiceView;
  locale: string;
  index: number;
};

export default function ServiceCard({ service, locale, index }: ServiceCardProps) {
  const dict = getDictionary(locale);
  const price = formatPrice(service, dict);

  return (
    <article
      className={cn(
        "frame group relative flex flex-col p-6 transition-colors duration-500 sm:p-8",
        "hover:border-violet/50",
        service.featured && "border-violet/40",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[0.65rem] tracking-[0.2em] text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
        {service.featured ? (
          <span className="kicker text-violet">{dict.services.featured}</span>
        ) : null}
      </div>

      <h3 className="display mt-6 text-3xl leading-none sm:text-4xl">{service.name}</h3>

      {service.shortDescription ? (
        <p className="mt-4 max-w-measure leading-relaxed text-ink-dim">{service.shortDescription}</p>
      ) : null}

      {price ? (
        <p className="mt-6 font-mono text-sm tracking-[0.08em] text-ink">
          {price}
          <span className="ms-2 text-ink-faint">{dict.services.startingFrom}</span>
        </p>
      ) : null}

      {service.features.length > 0 ? (
        <>
          <p className="kicker mt-8">{dict.services.deliverables}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {service.features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-3 text-sm text-ink-dim">
                <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-violet" />
                {feature.label}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-8 pt-2">
        <Link
          href={`/${locale}/contact?service=${service.id}`}
          className="kicker inline-flex items-center gap-2 text-ink transition-colors hover:text-violet"
        >
          {dict.services.enquire}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}