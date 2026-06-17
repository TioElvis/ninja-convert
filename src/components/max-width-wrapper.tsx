import { cn } from "@/lib/utils";

type Props = React.PropsWithChildren<React.ComponentProps<"section">>;

export function MaxWidthWrapper({ children, className, ...props }: Props) {
  return (
    <section
      className={cn("w-full h-full mx-auto md:max-w-6xl px-4", className)}
      {...props}>
      {children}
    </section>
  );
}
