import db from './db.js';

export async function sinkronisasiDataOffline() {
  console.log("Mulai memeriksa data transaksi offline...");

  // 1. Ambil semua transaksi yang statusnya 'belum_sinkron'
  const antreanTransaksi = await db.transaksi
    .where('status_sinkron')
    .equals('belum_sinkron')
    .toArray();

  if (antreanTransaksi.length === 0) {
    console.log("Semua data sudah sinkron. Tidak ada antrean.");
    return;
  }

  console.log(`Menemukan ${antreanTransaksi.length} transaksi tertunda. Mengunggah...`);

  // 2. Kirim data satu per satu ke server
  for (const transaksi of antreanTransaksi) {
    try {
      const response = await fetch('https://api.tokokamu.com/v1/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaksi)
      });

      if (response.ok) {
        // 3. Jika server sukses menerima, update statusnya di IndexedDB agar tidak dikirim ulang
        await db.transaksi.update(transaksi.id, { status_sinkron: 'sukses' });
        console.log(`Transaksi ID lokal ${transaksi.id} berhasil disinkronkan ke cloud.`);
      }
    } catch (err) {
      console.error(`Gagal menyinkronkan transaksi ID ${transaksi.id}:`, err);
      // Stop perulangan jika internet mendadak putus lagi di tengah jalan
      break; 
    }
  }
}

// 4. Detektor Otomatis Perubahan Jaringan Browser
// Memicu sinkronisasi seketika saat browser mendeteksi sinyal internet kembali (Online)
window.addEventListener('online', () => {
  console.log("Koneksi internet terdeteksi kembali!");
  sinkronisasiDataOffline();
});

// Jalankan juga saat aplikasi pertama kali dibuka (jika kebetulan sedang online)
if (navigator.onLine) {
  sinkronisasiDataOffline();
}