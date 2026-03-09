/** Shared utility functions — single source of truth */

export const WHATSAPP_PHONE = "919830024611";

export function formatRs(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

export function formatBudgetShort(n: number): string {
  if (n >= 100000) return `${n / 100000}L`;
  return `${n / 1000}K`;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
