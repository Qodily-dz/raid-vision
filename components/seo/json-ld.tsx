/**
 * Component that safely injects JSON-LD Schema.org structured data script.
 */
export default function JsonLd({
  schema,
}: {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
