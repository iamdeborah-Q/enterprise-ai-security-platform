export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d.toISOString().split('T')[0];
}

export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}
