import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-2",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "secondary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        className
      )}
      {...props}
    />
  );
}
