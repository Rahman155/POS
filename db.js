// Mengimpor Dexie via CDN (jika tidak menggunakan bundler seperti Webpack/Vite)
import Dexie from 'https://unpkg.com/dexie@4.0.1/dist/dexie.js';

// 1. Inisialisasi Database
const db = new Dexie('POS_Local_DB');

// 2. Tentukan skema tabel
// Kita gunakan 'id' sebagai auto-increment primary key
// Kita beri indeks pada 'status_sinkron' agar mudah mencari transaksi yang belum dikirim
db.version(1).stores({
  transaksi: '++id, tanggal, total_harga, status_sinkron'
});

export default db;