/**
 * Standard fetcher untuk SWR
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || errorData.message || "Gagal memuat data dari server";
    throw new Error(message);
  }
  return res.json();
}
