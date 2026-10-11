import { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: string;
  className?: string;
  children: ReactNode;
};

/** Layout wrapper: consistent spacing, max width and heading block for every section. */
export default function Section({ id, eyebrow, title, className = "", children }: Props) {
  return (
    <section id={id} className={`relative py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {(eyebrow || title) && (
          <header className="mb-14 text-center">
            {eyebrow && <p className="section-eyebrow mb-3">{eyebrow}</p>}
            {title && <h2 className="section-title mb-5">{title}</h2>}
            <div className="gold-rule" />
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
