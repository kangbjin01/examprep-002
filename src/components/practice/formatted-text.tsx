"use client";

/**
 * Renders text with <u>underline</u> and <b>bold</b> formatting.
 * Safely parses only these specific tags — no dangerouslySetInnerHTML.
 */
export function FormattedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Split by <u>...</u> and <b>...</b> tags
  const parts = text.split(/(<u>[\s\S]*?<\/u>|<b>[\s\S]*?<\/b>)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("<u>") && part.endsWith("</u>")) {
          const inner = part.slice(3, -4);
          return (
            <span
              key={i}
              className="underline decoration-2 underline-offset-4 decoration-foreground/70"
            >
              {inner}
            </span>
          );
        }
        if (part.startsWith("<b>") && part.endsWith("</b>")) {
          const inner = part.slice(3, -4);
          return (
            <strong key={i} className="font-semibold">
              {inner}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
