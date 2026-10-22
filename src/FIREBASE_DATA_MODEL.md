# Model data Firebase Nutrio

Implementasi Spark memakai Firebase Authentication dan Firestore database `nutrio`.
Firestore adalah document database, bukan SQL. Firebase Spark tidak menyediakan
Cloud Functions yang dibutuhkan untuk stored procedure tepercaya maupun trigger
server; karena itu aplikasi saat ini memakai transaksi klien yang dibatasi rules
dan menghitung ringkasan dari log milik pengguna.

## Skema normalisasi

| Koleksi | Isi dan relasi |
| --- | --- |
| `profiles/{uid}` | Profil aplikasi; `uid` sama dengan Firebase Auth UID. Email dan kata sandi tetap dikelola Auth, tidak disalin ke Firestore. |
| `food_catalog/{foodId}` | Sumber menu kanonis: nama, kategori, harga, skor gizi/eco, dan nutrisi per porsi. Simpan referensi kategori/bahan sebagai ID, bukan menyalin detailnya ke setiap menu. |
| `food_categories/{categoryId}` | Nama dan atribut kategori yang dipakai bersama banyak menu. |
| `ingredients/{ingredientId}` | Data bahan pangan yang dapat dipakai kembali lintas menu. |
| `food_catalog/{foodId}/ingredients/{ingredientId}` | Relasi menu-bahan dan jumlah/satuan; subkoleksi ini mencegah daftar bahan berulang pada banyak dokumen menu. |
| `nutrition_menu_views/{foodId}` | Proyeksi baca opsional untuk paket Blaze/trigger. Di Spark katalog dibaca langsung dari `food_catalog`. |
| `users/{uid}/meal_logs/{logId}` | Riwayat konsumsi yang dibuat transaksi klien setelah rules mencocokkan harga dan nutrisi dengan menu kanonis. Pengguna hanya dapat membuat dan membaca log miliknya. |
| `users/{uid}/nutrition_days/{yyyy-MM-dd}` | Ringkasan/materialized view opsional. Di Spark ringkasan harian dihitung langsung dari log melalui listener Firestore. |
| `users/{uid}/processed_meal_events/{eventId}` | Penanda idempotensi opsional untuk agregasi event Cloud Functions pada paket Blaze. |

Data `food_catalog` yang sudah ada dapat tetap memakai `base_price` selama migrasi.
Data baru sebaiknya memakai `base_price_minor` (bilangan bulat) dan `currency_code`
(ISO 4217, misalnya `IDR`); jangan menyimpan harga sebagai floating point. Satuan
minor mengikuti digit desimal mata uang. Ringkasan menyimpan total per kode mata
uang (`spend_by_currency`) agar mata uang berbeda tidak dijumlahkan tanpa kurs.
Simpan `price_year` sebagai tahun estimasi harga (default katalog Nutrio: 2026).
Harga contoh adalah estimasi kantin per porsi standar, bukan harga real-time dan
dapat berbeda menurut lokasi maupun penyedia.

## Transaksi dan batasan paket Spark

- Pendaftaran membuat profil langsung dari klien; kredensial tetap dikelola
  Firebase Authentication.
- Pencatatan menu memakai transaksi Firestore klien. Rules memverifikasi UID,
  menu kanonis, harga, mata uang, jumlah porsi, dan total gizi sebelum log dapat
  dibuat. Log hanya dapat dibuat sekali pada ID dokumen baru, tidak bisa diubah
  atau dihapus melalui klien.
- Ringkasan harian dijumlahkan dari log pada listener Firestore. Ini menghindari
  ringkasan buatan klien yang bisa berbeda dari catatan sumber.
- Firebase Functions memerlukan paket Blaze. Source opsional di `functions/`
  berisi trigger/prosedur untuk deployment Blaze, tetapi tidak dikonfigurasi
  maupun dipakai pada deployment Spark ini.
- Trigger, agregasi server, dan materialized view yang selalu tersinkron tidak
  dapat berjalan pada Spark. Jika fitur tersebut diwajibkan, perlu Blaze atau
  backend tepercaya terpisah.

Riwayat menu bukan bukti pembayaran. `amount_minor` adalah estimasi harga menu
pada saat dicatat; integrasi payment gateway memerlukan alur dan rekonsiliasi
terpisah.

## Indeks dan query tuning

`firestore.indexes.json` menyimpan indeks komposit untuk katalog dan view opsional:

- `is_published ASC, nutrition_score DESC` untuk urutan menu publik berdasarkan gizi.
- `is_published ASC, category_name ASC, nutrition_score DESC` untuk kategori dan gizi.

Katalog Spark dibaca dari `food_catalog` dengan urutan `nutrition_score DESC`;
gunakan pagination (`limit` dan cursor) ketika katalog tumbuh. Pencarian substring di UI saat ini hanya memfilter data yang
sudah dimuat—Firestore tidak menyediakan pencarian teks bebas. Gunakan
Algolia/extension pencarian bila kebutuhan pencarian skala besar muncul. Periksa
Firestore Query Explain/Usage di console untuk biaya, index scan, dan latensi.

## Katalog dan penggunaan offline

`foodCatalog.js` adalah sumber data contoh yang dipakai aplikasi dan skrip seed.
Setelah mengautentikasi Firebase Admin SDK melalui Application Default
Credentials, isi/perbarui `food_catalog` dengan:

```sh
FIREBASE_PROJECT_ID=nutrioproject npm --prefix functions run seed:catalog
```

Skrip melakukan upsert berdasarkan ID menu dan menetapkan menu sebagai
`is_published: true`; rules tetap melarang penulisan katalog dari klien.
Setelah seed selesai, pengguna dapat membuka aplikasi sekali saat online agar
Firestore menyimpan katalog pada IndexedDB perangkat. Service worker
menyimpan app shell dan aset hosting untuk pemuatan berikutnya tanpa jaringan.
Bundel juga menyertakan katalog contoh lokal sebagai fallback sehingga halaman
menu tetap dapat dibuka meskipun perangkat belum pernah memuat data Firestore.

Mode offline hanya menyediakan pembacaan katalog yang tersimpan/lokal.
Autentikasi pertama kali, sinkronisasi data terbaru, dan pencatatan menu ke
Firestore memerlukan koneksi. Cache Firestore tersimpan pada browser/perangkat
yang digunakan; gunakan perangkat pribadi dan hapus data situs untuk menghapus
cache lokal.

## Deploy

Isi katalog, lalu deploy aplikasi Vite ke Firebase Hosting beserta rules dan
indeks (komponen yang tersedia pada paket Spark):

```sh
FIREBASE_PROJECT_ID=nutrioproject npm --prefix functions run seed:catalog
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes --project nutrioproject
```

Rules membatasi profil dan riwayat pengguna ke pemiliknya serta mengizinkan log
menu hanya jika harga dan nutrisi cocok dengan data katalog. Untuk memakai
Cloud Functions di masa depan, upgrade ke Blaze, tambahkan kembali konfigurasi
Functions ke `firebase.json`, lalu deploy Functions dari direktori aplikasi.
