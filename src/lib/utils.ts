import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-accent";
  return "text-error";
}

export function scoreBg(score: number) {
  if (score >= 80) return "bg-success/10 border-success/30";
  if (score >= 60) return "bg-accent/10 border-accent/30";
  return "bg-error/10 border-error/30";
}
