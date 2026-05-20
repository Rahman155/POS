import db from './db.js';

// Fungsi untuk menyimpan transaksi baru
export async function simpanTransaksi(detailItem, totalHarga) {
  const dataTransaksi = {
    tanggal: new Date().toISOString(),
    items: detailItem, // Array berisi [{ produk_id: 1, qty: 2, harga: 15000 }, ...]
    total_harga: totalHarga,
    status_sinkron: 'belum_sinkron' // default awal
  };

  try {
    // Jalankan pengecekan koneksi sebelum menembak API asli
    if (navigator.onLine) {
      const respons = await kirimKeServer(dataTransaksi);
      if (respons.success) {
        dataTransaksi.status_sinkron = 'sukses';
      }
    }
  } catch (error) {
    console.warn("Gagal mengirim ke server (Kemungkinan Offline). Disimpan lokal dulu.", error);
    // Jika gagal/offline, status_sinkron tetap 'belum_sinkron'
  } finally {
    // Transaksi SELALU disimpan ke IndexedDB sebagai backup utama di toko
    const idLokal = await db.transaksi.add(dataTransaksi);
    console.log(`Transaksi berhasil dicatat secara lokal dengan ID: ${idLokal}`);
    return idLokal;
  }
}

// Simulasi fungsi hit ke backend API Anda
async function kirimKeServer(data) {
  // Ganti URL dengan endpoint API backend Anda asli
  const response = await fetch('https://api.tokokamu.com/v1/transaksi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
}