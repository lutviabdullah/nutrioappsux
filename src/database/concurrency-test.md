# Uji Concurrency Nutrio

Jalankan dua sesi `psql` pada database Nutrio yang sama. Pastikan tabel `users` memiliki setidaknya satu baris. Kedua sesi memakai baris pengguna dengan ID terkecil agar mencoba mengunci baris yang sama.

## Isolation Level

Isolation level yang digunakan adalah `READ COMMITTED`, yaitu default PostgreSQL. Konfigurasi proyek tidak menetapkan isolation level lain, dan transaksi Prisma mewarisi default koneksi database.

Verifikasi level aktif pada masing-masing sesi dengan menjalankan query ini setelah `BEGIN`:

```sql
SHOW transaction_isolation;
```

Hasil yang diharapkan: `read committed`.

Pada level ini, setiap statement membaca data yang sudah di-commit sebelum statement dimulai. `SELECT ... FOR UPDATE` mengunci baris pengguna sampai transaksi berakhir, sehingga transaksi lain yang meminta lock pada baris yang sama harus menunggu transaksi pemegang lock melakukan `COMMIT` atau `ROLLBACK`.

## Transaksi A

Jalankan bagian ini di sesi pertama:

```sql
BEGIN;

SHOW transaction_isolation;

SELECT id
FROM users
ORDER BY id
LIMIT 1
FOR UPDATE;

SELECT pg_sleep(10);

COMMIT;
```

Saat `pg_sleep(10)` berjalan, transaksi A tetap memegang row lock. Segera jalankan Transaksi B di sesi kedua.

## Transaksi B

```sql
BEGIN;

SHOW transaction_isolation;

SELECT id
FROM users
ORDER BY id
LIMIT 1
FOR UPDATE;

COMMIT;
```

## Hasil yang Diharapkan

- Transaksi A menampilkan satu baris pengguna, menahan lock selama sekitar 10 detik, lalu menghasilkan `COMMIT`.
- Query `SELECT ... FOR UPDATE` pada Transaksi B tertahan selama A memegang lock.
- Setelah A menghasilkan `COMMIT`, query B melanjutkan dan menampilkan baris pengguna yang sama, lalu Transaksi B menghasilkan `COMMIT`.

Uji ini hanya mengunci dan membaca baris; tidak ada perubahan data yang disimpan.