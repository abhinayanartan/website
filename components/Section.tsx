import type { ReactNode } from "react";

export default function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative py-14 sm:py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 xs:px-6 sm:px-8 md:px-12">
        {children}
      </div>
    </section>
  );
}