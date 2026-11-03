# PANDUAN LENGKAP SETUP DATABASE SUPABASE EDUATPH

Dokumen ini berisi panduan langkah demi langkah untuk mengeksekusi migration database PostgreSQL di Supabase Dashboard untuk platform pembelajaran **EduATPH**.

---

## 1. INFORMASI DATABASE & PROYEK
* **Platform:** Supabase PostgreSQL
* **Domain Produksi:** `https://edu-atph.vercel.app`
* **Project URL Supabase:** `https://ngreirksuoraurufzftn.supabase.co` (atau Project ID yang aktif di akun Anda)
* **Administrator:** Okta Nofiyanto
* **File Migration Tersedia:**
  1. `supabase/migrations/001_initial_eduatph.sql` (Inisialisasi tabel dasar `edu_*`)
  2. `supabase/migrations/002_auto_register_students_classes.sql` (Tabel `classes`, `students`, `class_students`, `assessments`, auto-register & sinkronisasi nilai)
  3. `supabase/migrations/003_role_based_access_control.sql` (Tabel `teachers`, role separation Admin, Guru, Siswa, dan RLS)

---

## 2. LANGKAH MENJALANKAN MIGRATION DI SUPABASE DASHBOARD

Ikuti langkah-langkah mudah berikut:

1. **Buka Supabase Dashboard:**
   * Buka browser dan akses: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   * Masuk menggunakan akun Supabase Anda.
   * Pilih proyek **EduATPH**.

2. **Buka SQL Editor:**
   * Pada bilah navigasi kiri, klik ikon terminal/SQL (**SQL Editor**).

3. **Jalankan File `002_auto_register_students_classes.sql`:**
   * Klik tombol **"+ New Query"**.
   * Buka file `supabase/migrations/002_auto_register_students_classes.sql`.
   * Salin seluruh kodenya (Ctrl+A lalu Ctrl+C), tempelkan di SQL Editor, lalu klik tombol hijau **"Run"**.
   * Tunggu hingga muncul pesan `Success. No rows returned`.

4. **Jalankan File `003_role_based_access_control.sql`:**
   * Klik tombol **"+ New Query"** lagi.
   * Buka file `supabase/migrations/003_role_based_access_control.sql`.
   * Salin seluruh kodenya, tempelkan di SQL Editor, lalu klik **"Run"**.
   * Pesan sukses akan muncul.

---

## 3. STRUKTUR TABEL YANG TERBENTUK

Setelah migration dijalankan, buka menu **Table Editor** di Supabase Dashboard. Anda akan melihat tabel-tabel utama:

| Nama Tabel | Peran Utama | Kolom Kunci |
| :--- | :--- | :--- |
| `classes` | Daftar Rombel Belajar ATPH | `id`, `name`, `grade_level`, `academic_year`, `description` |
| `students` | Data Identitas Siswa Terdaftar | `id`, `full_name`, `email`, `nis`, `nisn`, `class_id`, `class_name`, `major`, `status`, `last_login_at` |
| `class_students` | Relasi Siswa dengan Rombel | `id`, `class_id`, `student_id`, `academic_year`, `status` |
| `teachers` | Data Guru & Pendidik ATPH | `id`, `full_name`, `nip`, `email`, `role`, `subject_name`, `assigned_classes` |
| `assessments` | Rekapitulasi Penilaian Kuis | `id`, `student_id`, `quiz_id`, `score`, `aspect_scores`, `is_passed` |
| `quiz_attempts` | Riwayat Pengerjaan Kuis | `id`, `quiz_id`, `student_id`, `score`, `answers`, `completed_at` |
| `assignments` | Daftar Tugas Lapangan | `id`, `title`, `description`, `max_score`, `due_date` |
| `submissions` | Pengumpulan Tugas Siswa | `id`, `assignment_id`, `student_id`, `file_url`, `score` |

---

## 4. SISTEM TIGA ROLE (HAK AKSES)

Website EduATPH memisahkan akses secara ketat dengan Next.js Server-Side Middleware (`src/middleware.ts`):

1. **ADMIN:**
   * Login: `oktanofiyanto123@gmail.com` / `admin@atph.sch.id` (Password: `skaneba123` / `admin123`)
   * Dashboard: `/admin/dashboard`
   * Hak Akses: Penuh (Siswa, Guru, Kelas, Materi, Kuis, Rekap Nilai, Pengaturan).

2. **GURU:**
   * Login: `budi.santoso@guru.eduatph.sch.id` / `siti.aminah@guru.eduatph.sch.id` (Password: `skaneba123`)
   * Dashboard: `/guru/dashboard`
   * Hak Akses: Kelas Binaan (`/guru/classes`), Siswa Binaan (`/guru/students`), Modul (`/guru/materials`), Tugas (`/guru/assignments`), Bank Soal (`/guru/quizzes`), Rekap Nilai (`/guru/grades`).
   * **Proteksi:** Ditolak dari `/admin/*` (muncul 403 Forbidden).

3. **SISWA:**
   * Login: Email pribadi / email siswa (Password: `skaneba123`)
   * Registrasi: Otomatis saat login pertama kali (pilih rombel kelas X, XI, atau XII).
   * Dashboard: `/siswa/dashboard` (atau `/student/dashboard`)
   * Hak Akses: Belajar modul Bab I - IV, kerjakan kuis & tugas, lihat nilai pribadi.
   * **Proteksi:** Ditolak dari `/admin/*` dan `/guru/*` (muncul 403 Forbidden).
