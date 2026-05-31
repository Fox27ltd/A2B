// v0.1 — JsonLd
// Injects a schema.org JSON-LD payload into the page head.
// Server component — safe to use anywhere.
type Props = { data: object | object[] };

export function JsonLd({ data }: Props) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
