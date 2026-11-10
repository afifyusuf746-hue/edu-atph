import {
  UserProfile,
  ClassItem,
  MaterialCategory,
  TeachingMaterial,
  Assignment,
  Submission,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  GradeRecord,
  Announcement,
} from '@/types';
import {
  HIDROPONIK_XI_MATERIAL,
  HIDROPONIK_XI_QUIZ,
  HIDROPONIK_XI_QUESTIONS,
} from './hidroponik-xi-data';

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-x-at-1',
    name: 'X AT 1',
    gradeLevel: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 1 - Rombel Dasar Kejuruan ATPH',
    academicYear: '2025/2026',
    studentCount: 32,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-x-at-2',
    name: 'X AT 2',
    gradeLevel: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 2 - Rombel Dasar Kejuruan ATPH',
    academicYear: '2025/2026',
    studentCount: 32,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-x-at-3',
    name: 'X AT 3',
    gradeLevel: 'X',
    description: 'Kelas 10 Agribisnis Tanaman 3 - Rombel Dasar Kejuruan ATPH',
    academicYear: '2025/2026',
    studentCount: 30,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xi-at-1',
    name: 'XI AT 1',
    gradeLevel: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 1 - Praktik Budidaya Lanjutan ATPH',
    academicYear: '2025/2026',
    studentCount: 32,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xi-at-2',
    name: 'XI AT 2',
    gradeLevel: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 2 - Praktik Budidaya Lanjutan ATPH',
    academicYear: '2025/2026',
    studentCount: 31,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xi-at-3',
    name: 'XI AT 3',
    gradeLevel: 'XI',
    description: 'Kelas 11 Agribisnis Tanaman 3 - Praktik Budidaya Lanjutan ATPH',
    academicYear: '2025/2026',
    studentCount: 30,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xii-at-1',
    name: 'XII AT 1',
    gradeLevel: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 1 - Pascapanen & Kewirausahaan Mandiri',
    academicYear: '2025/2026',
    studentCount: 30,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xii-at-2',
    name: 'XII AT 2',
    gradeLevel: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 2 - Pascapanen & Kewirausahaan Mandiri',
    academicYear: '2025/2026',
    studentCount: 29,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'cls-xii-at-3',
    name: 'XII AT 3',
    gradeLevel: 'XII',
    description: 'Kelas 12 Agribisnis Tanaman 3 - Pascapanen & Kewirausahaan Mandiri',
    academicYear: '2025/2026',
    studentCount: 28,
    createdAt: '2026-07-15T08:00:00Z',
  },
];

export const INITIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'cat-1',
    name: 'Dasar-Dasar Agribisnis Tanaman',
    slug: 'dasar-dasar-agribisnis-tanaman',
    description: 'Pengenalan prinsip ekologi pertanian, fisiologi tanaman, dan keselamatan kerja di kebun.',
    iconName: 'BookOpen',
    orderIndex: 1,
  },
  {
    id: 'cat-2',
    name: 'Penyiapan Media Tanam',
    slug: 'penyiapan-media-tanam',
    description: 'Formula media tanam tanah, kompos matang, arang sekam, cocopeat, dan sterilisasi media.',
    iconName: 'Layers',
    orderIndex: 2,
  },
  {
    id: 'cat-3',
    name: 'Penyiapan Benih dan Bibit',
    slug: 'penyiapan-benih-dan-bibit',
    description: 'Seleksi benih bersertifikat, perlakuan benih (seed treatment), dan uji daya berkecambah.',
    iconName: 'CheckCircle',
    orderIndex: 3,
  },
  {
    id: 'cat-4',
    name: 'Pembibitan Tanaman',
    slug: 'pembibitan-tanaman',
    description: 'Teknik persemaian di tray, pemeliharaan bibit muda di greenhouse, dan adaptasi lingkungan.',
    iconName: 'Sprout',
    orderIndex: 4,
  },
  {
    id: 'cat-5',
    name: 'Budidaya Tanaman Pangan',
    slug: 'budidaya-tanaman-pangan',
    description: 'Teknologi budidaya padi sawah intensif, jagung hibrida, kedelai, dan ubi jalar bermutu.',
    iconName: 'Wheat',
    orderIndex: 5,
  },
  {
    id: 'cat-6',
    name: 'Budidaya Tanaman Hortikultura',
    slug: 'budidaya-tanaman-hortikultura',
    description: 'Sayuran daun (pakcoy, selada), sayuran buah (cabai, tomat), tanaman hias, dan biofarmaka.',
    iconName: 'Apple',
    orderIndex: 6,
  },
  {
    id: 'cat-7',
    name: 'Pertanian Lahan Basah',
    slug: 'pertanian-lahan-basah',
    description: 'Sistem irigasi teknis sawah, tata kelola air pasang surut, dan penanganan tanah masam.',
    iconName: 'Droplets',
    orderIndex: 7,
  },
  {
    id: 'cat-8',
    name: 'Pertanian Lahan Kering',
    slug: 'pertanian-lahan-kering',
    description: 'Teknik konservasi air tanah, mulsa jerami/plastik hitam perak, dan pola tanam tumpang sari.',
    iconName: 'Sun',
    orderIndex: 8,
  },
  {
    id: 'cat-9',
    name: 'Sistem Hidroponik',
    slug: 'sistem-hidroponik',
    description: 'Teknik NFT, DFT, Wick System, manajemen larutan nutrisi AB Mix, dan kalibrasi pH/EC meter.',
    iconName: 'Pipette',
    orderIndex: 9,
  },
  {
    id: 'cat-10',
    name: 'Pemeliharaan Tanaman',
    slug: 'pemeliharaan-tanaman',
    description: 'Teknik penyulaman, penyiangan, pemangkasan pucuk/tunas air (pruning), dan pemasangan ajir.',
    iconName: 'Scissors',
    orderIndex: 10,
  },
  {
    id: 'cat-11',
    name: 'Pemupukan',
    slug: 'pemupukan',
    description: 'Penerapan prinsip 5T (Tepat Jenis, Dosis, Waktu, Cara, Tempat), POC, dan pupuk berimbang.',
    iconName: 'FlaskConical',
    orderIndex: 11,
  },
  {
    id: 'cat-12',
    name: 'Pengendalian Hama dan Penyakit Tanaman',
    slug: 'pengendalian-hama-dan-penyakit-tanaman',
    description: 'Penerapan Pengendalian Hama Terpadu (PHT), perangkap likat kuning, pestisida nabati.',
    iconName: 'ShieldAlert',
    orderIndex: 12,
  },
  {
    id: 'cat-13',
    name: 'Panen dan Pascapanen',
    slug: 'panen-dan-pascapanen',
    description: 'Penentuan waktu petik optimum, sortasi, grading SNI, pengemasan vakum, dan cold chain.',
    iconName: 'PackageCheck',
    orderIndex: 13,
  },
  {
    id: 'cat-14',
    name: 'Keselamatan dan Kesehatan Kerja Pertanian',
    slug: 'keselamatan-dan-kesehatan-kerja-pertanian',
    description: 'Penggunaan APD pertanian, SOP pengoperasian traktor/sprayer, dan penanganan pestisida.',
    iconName: 'HardHat',
    orderIndex: 14,
  },
  {
    id: 'cat-15',
    name: 'Agripreneurship',
    slug: 'agripreneurship',
    description: 'Analisis kelayakan usaha tani (R/C ratio, BEP), branding produk hortikultura, pemasaran online.',
    iconName: 'TrendingUp',
    orderIndex: 15,
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-okta',
    email: 'okta.nofiyanto@eduatph.sch.id',
    fullName: 'Okta Nofiyanto',
    role: 'admin',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-tch-001',
    email: 'budi.santoso@guru.eduatph.sch.id',
    fullName: 'Budi Santoso, S.P., M.Si.',
    role: 'teacher',
    nip: '198005122005011003',
    subjectName: 'Dasar-Dasar Agribisnis Tanaman',
    assignedClasses: ['cls-x-at-1', 'cls-x-at-2', 'cls-x-at-3'],
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-tch-002',
    email: 'siti.aminah@guru.eduatph.sch.id',
    fullName: 'Siti Aminah, S.Pd., M.Pd.',
    role: 'teacher',
    nip: '198503212009022004',
    subjectName: 'Agribisnis Tanaman Pangan & Hortikultura',
    assignedClasses: ['cls-xi-at-1', 'cls-xi-at-2', 'cls-xii-at-1'],
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-student-rizky',
    email: 'rizky.pratama@siswa.eduatph.sch.id',
    fullName: 'Rizky Pratama',
    role: 'student',
    nisn: '0078129381',
    classId: 'cls-x-at-1',
    className: 'X AT 1',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-07-16T09:00:00Z',
  },
  {
    id: 'usr-student-siti',
    email: 'siti.rahma@siswa.eduatph.sch.id',
    fullName: 'Siti Rahmawati',
    role: 'student',
    nisn: '0078129382',
    classId: 'cls-x-at-2',
    className: 'X AT 2',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-07-16T09:15:00Z',
  },
  {
    id: 'usr-student-dimas',
    email: 'dimas.anggoro@siswa.eduatph.sch.id',
    fullName: 'Dimas Anggoro',
    role: 'student',
    nisn: '0068129401',
    classId: 'cls-xi-at-1',
    className: 'XI AT 1',
    major: 'Agribisnis Tanaman Pangan dan Hortikultura',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    isActive: true,
    createdAt: '2026-07-16T10:00:00Z',
  },
];

export const INITIAL_MATERIALS: TeachingMaterial[] = [
  {
    id: 'mat-manajemen-agribisnis-tanaman-x',
    title: 'Bab 1: Manajemen Agribisnis Tanaman (Dasar-Dasar Agribisnis Tanaman Kelas X)',
    slug: 'manajemen-agribisnis-tanaman-kelas-x',
    description: 'Panduan lengkap modul pembelajaran Bab 1: Mengenal alur 4 subsistem agribisnis, 10 karakteristik agribisnis, 5 fungsi manajemen (POACE & 6M), perencanaan produksi tanaman, serta implementasi SMK3LH di SMK Pertanian.',
    categoryId: 'cat-1',
    categoryName: 'Dasar-Dasar Agribisnis Tanaman',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Sistem Agribisnis, Fungsi Manajemen (6M & POACE), dan SMK3LH',
    learningObjectives: [
      'Mampu mengidentifikasi proses dan alur bisnis bidang agribisnis tanaman serta 4 subsistem utamanya (hulu, budi daya, hilir, dan layanan pendukung).',
      'Menganalisis 10 karakteristik khas agribisnis menurut Downey & Erickson yang membedakannya dengan industri manufaktur lain.',
      'Mendeskripsikan 5 fungsi manajemen (Perencanaan 6W/1H, Pengorganisasian, Pengarahan/Motivasi, Pengawasan Preventif-Represif, dan Evaluasi).',
      'Menerapkan perencanaan produksi pertanian (pemilihan komoditas, lokasi, skala usaha, penjadwalan hitung mundur panen cabai, serta sistem pengadaan buat vs beli).',
      'Menerapkan Sistem Manajemen Keselamatan dan Kesehatan Kerja Serta Lingkungan Hidup (SMK3LH) berdasarkan PP No. 50 Tahun 2012 di lingkungan kebun dan laboratorium agribisnis.',
    ],
    content: `
# BAB I: MANAJEMEN AGRIBISNIS TANAMAN
**Mata Pelajaran:** Dasar-Dasar Agribisnis Tanaman  
**Jenjang:** SMK/MAK Kelas X (Fase E) — Program Keahlian Agribisnis Tanaman  
**Buku Referensi Resmi:** Ani Susanti & Yustinanda Rahma Dewi (Kemendikbudristek RI, 2023)

---

## 🌾 Pertanyaan Pemantik
Setiap hari di meja makan kita selalu tersedia nasi hangat lengkap dengan lauk pauk seperti tempe, tahu, sayuran, dan sambal cabai segar. Pernahkah kalian membayangkan perjalanan panjang makanan tersebut hingga tersaji di meja makan?

Produk pertanian tersebut mengalami proses yang panjang sebelum sampai ke tangan konsumen:
1. Mulai dari pemuliaan dan pengadaan **benih** unggul,
2. Pengolahan lahan dan **budi daya** di sawah atau greenhouse,
3. Pemanenan, penyortiran, dan **pengolahan hasil**, hingga
4. Distribusi rantai pasok dan **pemasaran** ke supermarket atau pasar tradisional.

Banyak sekali pihak yang terlibat dalam mata rantai ini. Diperlukan sebuah **sistem agribisnis yang terencana dan terkelola secara terpadu** agar produk pertanian dapat sampai ke tangan konsumen dengan mutu prima, kuantitas terjaga, dan harga yang menguntungkan petani.

---

## A. Sistem Agribisnis Tanaman

### 1. Definisi Agribisnis
Istilah agribisnis pertama kali diperkenalkan oleh **Davis dan Golberg (1957)**:
> *"Agribisnis adalah penjumlahan keseluruhan dari semua kegiatan yang menyangkut manufaktur dan distribusi dari sarana produksi pertanian, kegiatan yang dilakukan usaha tani, serta penyimpanan, pengolahan, dan distribusi produk pertanian, serta produk-produk lain yang dihasilkan dari produk pertanian."*

Agribisnis bukan hanya sekadar bercocok tanam (budi daya), melainkan suatu **sistem utuh** yang terdiri atas subsistem yang saling terkait, tersinkronisasi, dan berkesinambungan.

### 2. Empat Subsistem Agribisnis Tanaman
Berdasarkan alur proses bisnisnya, sistem agribisnis terbagi menjadi 3 subsistem utama dan 1 subsistem pendukung:

1. **Subsistem Agribisnis Hulu (Up-stream Agribusiness):**
   - Mencakup seluruh kegiatan industri penyedia sarana produksi pertanian (saprotan).
   - *Contoh:* Industri benih/bibit bermutu, produsen pupuk organik & anorganik, produsen pestisida nabati/kimia, serta industri alat dan mesin pertanian (alsintan seperti traktor, cultivator, sprayer).

2. **Subsistem Budi Daya / Usaha Tani (On-farm Agribusiness):**
   - Sering disebut sebagai **pertanian primer**.
   - Meliputi seluruh kegiatan teknis budi daya tanaman di lahan terbuka maupun greenhouse: penyiapan lahan/media tanam, pembibitan, penanaman, pemeliharaan, irigasi, pemupukan berimbang, pengendalian Organisme Pengganggu Tanaman (OPT), hingga panen.
   - *Pelaku:* Petani mandiri, kelompok tani (Poktan/Gapoktan), perkebunan rakyat, hingga Perseroan Terbatas Perkebunan (PTPN/swasta).

3. **Subsistem Agribisnis Hilir (Down-stream Agribusiness):**
   - Mencakup kegiatan penanganan pascapanen, pengolahan hasil pertanian (agroindustri), penyimpanan (cold storage), pengemasan, distribusi logistik, dan pemasaran.
   - *Contoh:* Penggilingan gabah menjadi beras kemasan premium, pabrik pengolahan cabai menjadi saus sambal, industri tepung tapioka, pedagang besar, grosir, pasar modern/supermarket, dan pengecer.

4. **Subsistem Layanan Pendukung Agribisnis (Supporting Services):**
   - Menyediakan jasa penunjang yang vital agar ketiga subsistem di atas dapat berjalan optimal.
   - *Contoh:*
     - Lembaga Keuangan (Bank & Koperasi Pertanian) untuk modal usaha.
     - Lembaga Penelitian dan Pengembangan (R&D / Balai Penelitian Tanaman) untuk teknologi baru.
     - Lembaga Penyuluhan Pertanian untuk transfer teknologi kepada petani.
     - Lembaga Pendidikan & Pelatihan (SMK Pertanian, Perguruan Tinggi).
     - Jasa Transportasi & Distribusi Rantai Dingin.

### 💡 Pojok Info: Peran Koperasi Unit Desa (KUD)
Koperasi memiliki peran bersejarah dalam agribisnis pedesaan Indonesia:
- **1963:** Pembentukan *Koperta* untuk memenuhi kebutuhan bahan pangan pokok (khususnya beras).
- **1966–1967:** Berkembang menjadi *BUUD (Badan Usaha Unit Desa)* yang bertugas mengatasi kendala produksi, penyaluran pupuk, pembelian gabah, dan penggilingan beras ke Dolog.
- **Transformasi KUD:** Melalui 3 tahap pembinaan pemerintah:
  1. *Ofisialisasi* (didampingi penuh oleh pemerintah),
  2. *Deofisialisasi/Debirokratisasi* (ketergantungan mulai dikurangi), dan
  3. *Otonomi* (kemandirian penuh koperasi desa).

---

## B. Fungsi Manajemen dalam Agribisnis

### 1. Karakteristik Khusus Manajemen Agribisnis
Menurut **Hasibuan (2017)**, manajemen adalah ilmu dan seni yang mengatur pemanfaatan sumber daya manusia dan sumber daya lainnya secara efektif dan efisien guna mencapai target tertentu.

Menurut **Downey dan Erickson (1992)**, manajemen agribisnis memiliki karakteristik unik yang membedakannya secara mendasar dari manajemen industri manufaktur lainnya:
1. Keanekaragaman jenis bisnis yang luar biasa luas (dari hulu hingga hilir).
2. Jumlah pelaku usaha yang sangat besar (jutaan petani dan pelaku UMKM).
3. Terkait sangat erat dengan usaha tani primer (on-farm).
4. Keragaman skala usaha (dari skala pekarangan/rumah tangga hingga korporasi multinasional).
5. Persaingan pasar yang sangat ketat, khususnya pada komoditas segar.
6. Falsafah cara hidup (*the way of life*) tradisional yang masih kuat di kalangan petani.
7. Badan usaha agribisnis cenderung berbasis keluarga (*family farming*).
8. **Produksi bersifat musiman (*seasonality*).**
9. **Sangat tergantung pada faktor alam dan iklim (biologis & cuaca).**
10. Berdampak langsung terhadap kebijakan pangan strategis pemerintah.

### 2. Lima Fungsi Manajemen dalam Agribisnis (Rahim & Hastuti, 2005)
Untuk menggerakkan roda agribisnis, wajib diterapkan 5 fungsi manajerial:

#### a. Fungsi Perencanaan (Planning)
Menurut **Manullang (1996)**, perencanaan yang baik memuat unsur 6W/1H:
- **Way (Cara):** Penjabaran perincian langkah kegiatan dan pemanfaatan faktor-faktor produksi untuk menghasilkan produk.
- **Why (Mengapa):** Alasan pemilihan komoditas dan strategi untuk mencapai target profit serta kepuasan konsumen (*customer satisfaction*).
- **Where (Di mana):** Pemilihan lokasi fisik usaha tani/pabrik (mempertimbangkan akses bahan baku, ketersediaan air, dan pasar).
- **When (Kapan):** Ketetapan jadwal mulai dan selesainya tiap tahap pekerjaan.
- **Who (Siapa):** Penetapan kualifikasi tenaga kerja (manajer kebun, mandor, operator greenhouse, pekerja lapang).
- **How (Bagaimana):** Penetapan SOP teknis budidaya, standar mutu, dan efisiensi mekanisasi vs manual.

#### b. Fungsi Pengorganisasian (Organizing)
Menurut **Terry dan Rue (1993)**, pengorganisasian adalah mengelompokkan kegiatan penting dan mendelegasikan wewenang kerja.
- Menyusun bagan struktur organisasi yang jelas (alur komando, koordinasi, dan pembinaan).
- Menempatkan SDM sesuai kompetensinya (*the right man on the right place*). Contoh: Operator greenhouse harus memiliki kompetensi budidaya hidroponik bersertifikat.

#### c. Fungsi Pengarahan / Penggerakan (Actuating / Leading)
Pemimpin perusahaan memberikan instruksi kerja, briefing harian, dan motivasi.
Menurut **Hasibuan (2010)**, terdapat dua jenis motivasi kerja:
1. **Motivasi Positif (Insentif Positif):** Penghargaan berupa pujian, sertifikat karyawan teladan, bonus, atau kenaikan upah atas prestasi kerja baik. Dampak: Semangat kerja meningkat secara berkelanjutan.
2. **Motivasi Negatif (Insentif Negatif):** Pemberian teguran tertulis atau sanksi bagi pekerja yang lalai. Efektif dalam jangka pendek tetapi kurang baik untuk hubungan kerja jangka panjang.

#### d. Fungsi Pengawasan (Controlling)
Mengukur ketercapaian target dan melakukan tindakan koreksi bila terjadi deviasi/penyimpangan:
- **Pengawasan Preventif:** Dilakukan *sebelum* pekerjaan berlangsung untuk mencegah kesalahan (misal: kalibrasi sprayer sebelum aplikasi pestisida).
- **Pengawasan Represif:** Dilakukan *setelah* kegiatan selesai diukur berdasarkan standar baku yang ditetapkan (misal: grading berat buah cabai hasil panen).

#### e. Fungsi Evaluasi (Evaluation)
Menilai keberhasilan sistem usaha tani secara berkala dari aspek rasio input-output, efisiensi biaya, dan kendala lapangan untuk perbaikan musim tanam berikutnya.

### ⚙️ Mekanisme Kerja 6M dalam Agribisnis:
Sistem manajerial mengelola 6 sumber daya utama:
1. **Man (Manusia):** Tenaga kerja terampil, mandor bersertifikat LSP, agronomis.
2. **Money (Uang):** Modal kerja, arus kas, pembiayaan kredit perbankan.
3. **Material (Bahan Baku):** Benih bersertifikat, pupuk, media tanam, mulsa plastik.
4. **Machines (Mesin):** Traktor roda dua, transplanter, pompa irigasi tetes, combine harvester.
5. **Methods (Metode):** Standar Operasional Prosedur (SOP) dan Good Agricultural Practices (GAP).
6. **Market (Pasar):** Saluran pemasaran, kontrak suplai supermarket, pasar lelang cabai.

---

## C. Penerapan Manajemen dalam Proses Bisnis Tanaman

Menurut **Said dan Intan (2001)**, penerapan manajemen operasional mencakup:

### 1. Perencanaan Produksi Pertanian
- **Pemilihan Komoditas:** Mempertimbangkan permintaan pasar tinggi, kesesuaian iklim (ketinggian tempat, curah hujan), dan ketersediaan modal.
- **Pemilihan Lokasi:** Dekat dengan sumber air melimpah, aksesibilitas transportasi jalan raya, serta ketersediaan tenaga kerja sekitar.
- **Penentuan Skala Usaha:** Skala kecil (pekarangan/sayuran daun), menengah, atau skala luas (perkebunan PIR - Perkebunan Inti Rakyat).

### 2. Penjadwalan Produksi Mundur (Contoh Kasus Agribisnis Cabai)
Harga cabai merah di Indonesia cenderung melonjak tinggi pada bulan **Desember dan Januari** (musim perayaan akhir tahun dan musim hujan).
- Agribisnis cabai memerlukan waktu panen **3 bulan** setelah tanam.
- Pembibitan dan pengolahan lahan memerlukan **1,5 bulan**.
- **Perhitungan Mundur Penjadwalan:**
  - Target panen: Bulan Desember.
  - Tanam bibit di lahan: Akhir Agustus hingga awal September.
  - Semai benih di persemaian tray: **Pertengahan bulan Juli**.

### 3. Pengorganisasian Sarana: Buat Sendiri vs Membeli
Manajer harus menghitung rasio biaya ekonomis:
- Contoh bibit: Apakah lebih hemat membuat persemaian sendiri (membutuhkan greenhouse semai dan tenaga terampil) atau membeli bibit siap tanam dari nursery tersertifikasi?

---

## D. Sistem Manajemen K3LH (SMK3LH) di Agribisnis Tanaman

Sektor pertanian memiliki potensi bahaya kerja yang cukup tinggi:
- Paparan zat kimia beracun (insektisida, fungisida, herbisida),
- Bahaya pengoperasian alat mekanis (traktor, mesin perontok padi, pemotong rumput),
- Ergonomi kerja (beban angkat berat, posisi membungkuk seharian).

### Regulasi SMK3 di Indonesia:
- **Permenaker No. 05 Tahun 1996**, diperkuat dengan
- **Peraturan Pemerintah (PP) No. 50 Tahun 2012** tentang Penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja.

> **Ketentuan Wajib SMK3:** Wajib diterapkan oleh perusahaan yang mempekerjakan minimal **100 tenaga kerja** ATAU memiliki **potensi bahaya tinggi** (seperti penggunaan bahan kimia beracun dan alat berat).

### Tujuan Utama Penerapan SMK3LH:
1. Mencegah terjadinya kecelakaan kerja (*zero accident*).
2. Mencegah timbulnya **Penyakit Akibat Kerja (PAK)** seperti keracunan pestisida kronis atau gangguan saluran pernapasan.
3. Menciptakan lingkungan kebun dan laboratorium yang aman, sehat, nyaman, serta produktif.
4. Menjaga kelestarian lingkungan hidup dari pencemaran residu kimiawi.

---

## 📌 Rangkuman Intisari Bab 1
1. Agribisnis terdiri dari 4 subsistem: **Hulu**, **Budi Daya (On-farm)**, **Hilir**, dan **Layanan Pendukung**.
2. Manajemen agribisnis bersifat unik karena produknya bersifat musiman, mudah rusak (*perishable*), dan sangat dipengaruhi iklim biologis.
3. Lima pilar fungsi manajemen adalah: **Perencanaan (6W/1H)**, **Pengorganisasian**, **Pengarahan (Motivasi Positif/Negatif)**, **Pengawasan (Preventif & Represif)**, dan **Evaluasi**.
4. Pengelolaan 6M (Man, Money, Material, Machines, Methods, Market) adalah kunci efisiensi agribisnis modern.
5. Penerapan **SMK3LH** melindungi kesehatan petani dan pekerja agribisnis dari bahaya bahan kimia dan mekanisasi pertanian.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/-H1ZTKuj7eI',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attachments: [
      {
        id: 'att-buku-dasar-atph-x',
        name: 'Modul_Bab_1_Manajemen_Agribisnis_Tanaman_Kelas_X.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '3.8 MB',
        fileType: 'pdf',
      },
    ],
    status: 'published',
    orderIndex: 1,
    createdAt: '2026-08-01T07:00:00Z',
    updatedAt: '2026-10-27T08:00:00Z',
  },
  {
    id: 'mat-bab-iv-pengelolaan-faktor-produksi-x',
    title: 'BAB IV: Pengelolaan Faktor Produksi (Dasar-Dasar Agribisnis Tanaman Kelas X)',
    slug: 'bab-iv-pengelolaan-faktor-produksi-kelas-x',
    description: 'Buku Siswa Resmi Kemendikbudristek: BAB IV Pengelolaan Faktor Produksi (Dasar-Dasar Agribisnis Tanaman Kelas X) — Dokumen Lengkap 24 Halaman.',
    categoryId: 'cat-1',
    categoryName: 'Dasar-Dasar Agribisnis Tanaman',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Pengelolaan Faktor Produksi',
    learningObjectives: [
      'Memahami pengelolaan sumber daya pendukung (sumber daya alam, sumber daya manusia, sumber daya pendukung lainnya / faktor produksi lainnya) pada proses produksi tanaman.',
      'Mengklasifikasikan empat faktor produksi: tanah/lahan, tenaga kerja (TKDK & TKLK, perhitungan HOK), modal (tetap dan bergerak), serta keahlian manajerial.',
      'Menganalisis prinsip pertanian berkelanjutan (aspek ekonomi, ekologi, sosial, budaya) dan konsep Pengendalian Hama Terpadu (PHT) dengan musuh alami Trichogramma sp. serta Ambang Ekonomi (AE).',
      'Menerapkan teknik konservasi lahan dan air (terasering, rorak/parit buntu, biopori, embung, metode vegetatif, dan agroforestri stratifikasi tajuk).',
      'Mendeskripsikan 4 prinsip pertanian organik dan 4 teknik kunci pertanian regeneratif (pengolahan tanah konservasi, keanekaragaman tanaman, rotasi & penutup tanah).',
      'Mengidentifikasi peran strategis SDM pertanian (petani/pengusaha tani, pelaku agribisnis, aparat pemerintah) serta pembagian peran dalam kelompok tani (RDK dan RDKK).',
      'Memahami fungsi manajemen produksi tanaman (perencanaan, pengorganisasian, pelaksanaan, evaluasi) beserta tugas dan keterampilan manajerial.',
    ],
    content: `
# BAB IV: PENGELOLAAN FAKTOR PRODUKSI

**KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI REPUBLIK INDONESIA, 2023**  
**Mata Pelajaran:** Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X  
**Penulis:** Ani Susanti, Yustinanda Rahma Dewi  
**ISBN:** 978-623-194-505-1 (no.jil.lengkap PDF) / 978-623-194-506-8 (jil.1 PDF)

---

### Tujuan Pembelajaran
Setelah mempelajari materi ini melalui literasi, diskusi, observasi dan identifikasi, dan bermain peran, Kalian mampu memahami pengelolaan sumber daya pendukung (sumber daya alam, sumber daya manusia, sumber daya pendukung lainnya /faktor produksi lainnya).

### Pertanyaan Pemantik
Apakah kalian tahu tentang sumber daya pendukung pada proses produksi tanaman? Apa saja sumber pendukung tersebut? Bagaimana mengelola sumber daya pendukung tersebut supaya produksi tanaman optimal?

Pengelolaan Faktor Produksi
KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI REPUBLIK INDONESIA, 2023
Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X
Penulis: Ani Susanti, Yustinanda Rahma Dewi
ISBN: 978-623-194-505-1 (no.jil.lengkap PDF) / 978-623-194-506-8 (jil.1 PDF)

112 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X
Gambar 4.1 Peta Konsep Pengelolaan Faktor Produksi

### Peta Konsep
**Peta Konsep Pengelolaan Faktor Produksi:**
- Pengelolaan Faktor Produksi
  - Pengelolaan Sumber Daya Alam
  - Pengelolaan Sumber Daya Manusia
  - Pengelolaan Faktor Produksi Lainnya
- Berlanjut menuju BAB V

Sebelum membahas tentang pengelolaan sumber daya pendukung proses produksi tanaman, alangkah baiknya kita memahami terlebih dahulu tentang faktor produksi. Faktor produksi merupakan benda-benda yang diciptakan oleh alam atau dibuat oleh manusia dan dapat dimanfaatkan untuk menghasilkan barang dan jasa. Demikian halnya dengan kegiatan produksi pertanian yang juga membutuhkan ketersediaan faktor produksi. Sebagai ilustrasi, silakan simak tayangan berikut dengan memindai kode pada Gambar 4.2 atau tautan https://www.youtube.com/watch?v=rSQ5PQGDzU0.

Gambar 4.2 Kode Tayangan Audio Visual Budi daya Tanaman Vanili
Sumber: Rekayasa Teknologi (2022)

Bab IV  Pengelolaan Faktor Produksi 113

Berdasarkan tayangan audiovisual pada tautan atau barcode diatas, kita dapat mengklasifikasikan faktor produksi menjadi empat jenis, yaitu tanah, tenaga kerja, modal dan keahlian.

Berikut penjelasan tentang empat faktor produksi, yaitu tanah, tenaga kerja, modal dan keahlian:

### 1. Tanah
Tanah dan segala yang tumbuh di atasnya, serta yang terdapat di dalamnya (seperti benda-benda tambang). Sebagai tempat hidup beberapa makhluk hidup, tanah terdiri atas beberapa komponen, yaitu bahan padatan atau mineral, bahan organik, air dan udara. Bahan padatan penyusun tanah berupa batuan yang terbentuk secara alami, tersusun atas campuran mineral dan senyawa dengan berbagai komposisi. Batuan tersebut mengalami pelapukan menjadi bahan pembentuk tanah yang mengandung mineral berupa ion-ion positif dan ion-ion negatif. Contoh ion positif yang ada dalam tanah yaitu ion Kalium (K⁺), Magnesium (Mg²⁺), dan Kalsium (Ca²⁺), sedangkan ion negatif, yaitu ion nitrat (NO₃⁻), dan fosfat (PO₄²⁻). Ion yang terkandung dalam mineral merupakan nutrisi bagi tanaman.

Bahan organik tanah terdiri atas sisa-sisa makhluk hidup yang mati, daun yang gugur atau feses (kotoran hewan) yang telah diuraikan oleh bakteri dan jamur. Hasil penguraian ini disebut humus. Humus memiliki peran penting bagi kesuburan tanah dan tanaman yang ada di atasnya.

Gambar 4.3 Ilustrasi Kondisi Tanah

114 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Gambar 4.3 menunjukkan kondisi tanah, air dan udara akan menempati daerah pori-pori tanah (rongga) yang terletak di antara partikel tanah. Rongga udara dapat dijumpai di antara batuan dalam tanah atau di antara batuan dan partikel tanah atau di antara partikel tanah dengan akar tanaman atau di antara batuan dengan akar tanaman ataupun karena aktivitas hewan.

Dalam perkembangan saat ini untuk faktor produksi tanah, lebih tepat digunakan istilah lahan sebab maknanya lebih luas. Menurut Kamus Besar Bahasa Indonesia (KBBI) lahan adalah tanah terbuka atau tanah garapan. Selain itu, menurut Ngadisih (2020) lahan adalah lingkungan fisik (abiotik) dan biotik berkaitan dengan daya dukung untuk kehidupan dan kesejahteraan manusia. Untuk lebih memperjelas perbedaan pengertian tanah dan lahan, mari kita simak tayangan audiovisual pada tautan https://www.youtube.com/watch?v=1tut4wAt7GA atau pindai kode pada Gambar 4.4 berikut.

*(Gambar 4.4 Kode Tayangan Audio Visual Pengertian Tanah dan Lahan - Sumber: Kanal Pengetahuan Fakultas Teknologi Pertanian UGM, 2021)*

### 2. Tenaga Kerja
Tenaga kerja (labor) merupakan setiap usaha yang dihasilkan dari sebagian atau seluruh kemampuan jasmani dan rohani manusia dan atau kemampuan fisik ternak atau mesin yang digunakan untuk kegiatan produksi barang dan atau jasa. Tenaga kerja diperlukan untuk melaksanakan kegiatan budi daya tanaman seperti pengolahan lahan, penanaman, pemupukan, pemeliharaan, pengendalian hama dan penyakit, pemanenan, pascapanen, dan lain-lainnya.

Sumber tenaga kerja dalam usaha tani dibedakan sebagai berikut:
a. **Tenaga Kerja Dalam Keluarga (family labour)/TKDK**, yaitu seluruh tenaga kerja yang terdapat dalam keluarga, baik manusia, ternak ataupun tenaga mesin.
b. **Tenaga Kerja Luar Keluarga (hired labour)/TKLK**, yaitu seluruh tenaga kerja yang berasal dari luar keluarga, baik manusia, ternak maupun tenaga mesin.

Bab IV  Pengelolaan Faktor Produksi 115

Satuan tenaga kerja yang digunakan biasanya dalam menghitung analisis usaha tani disebut Hari Orang Kerja (HOK). Umumnya 1 HOK usaha tani dihitung 8 jam per hari, sudah termasuk dengan waktu istirahat selama 1 jam.

3. Modal
Modal (capital) merupakan semua jenis barang dan atau jasa yang jika diolah bersama dengan faktor produksi lain akan menghasilkan barang dan atau jasa baru atau menunjang kegiatan produksi barang dan atau jasa baru. Modal dapat berupa alat produksi seperti mesin, peralatan, bangunan dan lain-lain. Seluruh barang dan atau jasa yang memiliki sifat produktif dan dapat digunakan untuk kegiatan produksi berikutnya disebut barang modal/barang investasi/barang modal riil (real capital goods).

Modal berikutnya disebut modal operasional, yaitu modal dalam bentuk tunai yang dapat ditukarkan dengan barang modal lain misalnya sarana produksi dan tenaga kerja.

4. Keahlian
Faktor keahlian (skill) atau kecakapan tata laksana/kewirausahaan (entrepreneurship) adalah keahlian manajerial atau kecakapan tata laksana/kewirausahaan yang berperan dalam mengelola faktor produksi tanah, tenaga kerja dan modal pada kegiatan produksi barang dan atau jasa. Faktor produksi keahlian diperlukan agar ketiga faktor produksi yang lain berfungsi optimum.

Faktor produksi (input) perlu dikelola untuk menunjang terlaksananya kegiatan produksi tanaman. Bagaimana pengelolaannya mari kita pelajari bersama.

A. Pengelolaan Sumber Daya Alam

Apersepsi Awal
Apakah Kalian sering membantu orang tua Kalian yang berprofesi sebagai petani atau sering melihat aktivitas budi daya tanaman di lahan? Menurut Kalian, faktor sumber daya alam apa saja yang harus diperhatikan untuk menunjang keberhasilan budi daya tanaman tersebut? Bagaimana cara mengelolanya?

116 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Kata Kunci
sumber daya alam, tanah, air, makhluk hidup

Materi
Mari kita pelajari lebih dalam tentang pengelolaan sumber daya alam untuk menunjang keberhasilan budi daya tanaman. Pengelolaan sumber daya alam pertanian tak lepas dari upaya mewujudkan pertanian yang berkelanjutan.

Pertanian berkelanjutan adalah sebuah sistem usaha tani secara menyeluruh (holistik), yang harus memenuhi empat kriteria, yaitu aspek ekonomi, ekologi, sosial, dan budaya. Dari aspek ekonomi, harus menguntungkan. Pada aspek ekologi, pertanian berkelanjutan diharapkan bersahabat dan ramah lingkungan. Dari aspek sosial, pertanian berkelanjutan harus berkeadilan dan diterima oleh masyarakat, misalnya dalam hal akses pasar semua pelaku pertanian mempunyai akses yang sama baik itu pelaku usahatani skala kecil maupun besar. Dari aspek budaya, pertanian berkelanjutan secara kultural cocok diterapkan serta teknisnya mudah dilakukan.

Berikut merupakan audio visual tentang budi daya padi organik dengan metode System of Rice Intensification (SRI) yang menerapkan konsep pertanian berkelanjutan. Silakan Kalian simak melalui tautan https://www.youtube.com/watch?v=lPRPued7hDk atau dengan memindai kode pada Gambar 4.5 berikut serta simak bagan konsep holistik pertanian berkelanjutan pada Gambar 4.6.

Gambar 4.5 Kode Tayangan Audio Visual Budi Daya Padi Organik dengan Metode System of Rice Intensification (SRI)  
Sumber: TV Tani Indonesia (2021)

Bab IV  Pengelolaan Faktor Produksi 117

Gambar 4.6 Konsep Pertanian Berkelanjutan

Setelah kalian menyimak tayangan audio visual dan mencermati bagan yang disajikan, mari kita diskusikan tentang pengelolaan sumber daya alam. Terlebih dahulu kita identifikasi sumber daya alam apa saja yang tercakup di dalamnya. Selanjutnya kalian coba eksplorasi bagaimana pengelolaan sumber daya alam tersebut yang sesuai dengan konsep pertanian berkelanjutan.

Sebelumnya, silahkan kalian membentuk kelompok dengan anggota 4-5 siswa. Pilih salah satu teman kalian sebagai ketua kelompok dan satu lagi sebagai notulis. Ketua kelompok bertugas mengatur jalannya diskusi dan membagi tugas atau peran anggota kelompok. Sedangkan notulis bertugas mencatat hasil diskusi dan eksplorasi kalian bisa menggali informasi lebih mendalam melalui internet, buku penunjang maupun sumber lainnya. Hasil eksplorasi dan diskusi dicatat, dianalisis dan selanjutnya disimpulkan. Presentasikan hasil diskusi kalian di depan teman kelas dan konfirmasikan dengan guru atau pembimbing. Berikut contoh blangko diskusi. Blangko diskusi ini dapat dikembangkan sesuai kebutuhan.

118 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Tabel 4.1 Blangko Aktivitas Diskusi
**BLANGKO AKTIVITAS DISKUSI**
- Aktivitas Belajar : .........................................................................
- Hari / Tanggal Aktivitas : .........................................................................
- Kelompok : .........................................................................
- Nama Anggota Kelompok : .........................................................................

| Identifikasi Sumber Daya Alam | Cara pengelolaannya |
|---|---|
| ................................................................. | ................................................................. |
| ................................................................. | ................................................................. |
| ................................................................. | ................................................................. |

**Diskusi:**  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  

**Kesimpulan:**  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  

---

Bab IV  Pengelolaan Faktor Produksi 119

Bagaimana hasil diskusinya? Apakah kalian telah mengetahui cara pengelolaan sumber daya alam? Mari kita pelajari lebih dalam tentang pengelolaan sumber daya alam yang sudah kalian diskusikan. Sumber daya alam pertanian meliputi tanah, air, makhluk hidup (tumbuhan, hewan, manusia, dan mikrob), iklim, cuaca, curah hujan, batuan mineral, dan sebagainya.

Dalam memanfaatkan sumber daya alam untuk pertanian perlu memperhatikan pelestarian lingkungan, dengan prinsip tidak merusak ekosistem. System of Rice Intensification (SRI) merupakan salah satu metode pertanian yang menggunakan konsep kearifan lokal yang dapat menghemat penggunaan air, memperbaiki sifat fisik dan kimia tanah, mengembalikan kesuburan dan daya dukung tanah, dapat memulihkan ekosistem, dan menawarkan solusi substitusi pupuk anorganik dengan pupuk organik berbahan dasar kotoran hewan dan lain sebagainya.

Gambar 4.7 Trichogramma sp. yang Merupakan Musuh Alami Hama Penggerek Batang  
Sumber: flickr.com/ Nicky Bay (2016)

Pengelolaan sumber daya alam pertama adalah Pengendalian Hama Terpadu (PHT). Metode ini menggunakan pendekatan untuk mengendalikan hama dengan cara mengkombinasikan metode biologi, fisik, kimia, dan budaya dalam upaya untuk meminimalkan biaya, gangguan kesehatan dan risiko-risiko lingkungan. Beberapa cara yang dapat dilakukan di antaranya penggunaan musuh alami hama berupa serangga (insect), reptil atau binatang-binatang yang diseleksi untuk mengendalikan hama, yang dikenal dengan istilah agen pengendalian hayati. Sebagai contoh Trichogramma sp. (Gambar 4.7) sebagai musuh

120 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

alami dari parasit telur dan parasit larva hama tanaman. Metode ini memperhatikan ambang ekonomi. Ambang Ekonomi (AE) adalah kepadatan populasi hama yang memerlukan tindakan pengendalian untuk mencegah terjadinya peningkatan populasi hama. Istilah ini digunakan untuk pengambilan keputusan pengendalian hama sesuai dengan konsep pengendalian hama terpadu (PHT) supaya tidak menimbulkan kerugian ekonomi akibat serangan hama.

Pengendalian hama terpadu berikutnya, yaitu penggunaan tanaman perangkap hama, berfungsi sebagai pemikat (atraktan) yang menjauhkan hama dari tanaman utama. Upaya pengelolaan sumber daya alam yang kedua adalah penggunaan drainase dan mulsa sebagai metode alami untuk menurunkan infeksi jamur sebagai upaya menurunkan kebutuhan terhadap fungisida sintetis, serta melakukan rotasi tanaman untuk memutus populasi pertumbuhan hama.

Gambar 4.8 Terasering (Sumber: Firmansyah, 2023)  
Gambar 4.9 Embung (Sumber: Fandy, 2023)

Upaya pengelolaan sumber daya alam yang ketiga adalah konservasi lahan dan air. Konservasi lahan dan air dapat dilakukan dengan cara teknis mekanis seperti pembuatan terasering (Gambar 4.8), guludan, rorak/parit (Gambar 4.10), teras (Gambar 4.12), biopori (Gambar 4.11), waduk kecil, embung (Gambar 4.9), sumur resapan, bendungan dan pengolahan tanah menurut konturnya. Metode ini dimaksudkan untuk mengurangi erosi, memperlambat aliran air permukaan dan menampung serta menyalurkan aliran air permukaan. Konservasi lahan dan air juga dapat dilakukan dengan memanfaatkan tanaman atau vegetasi maupun sisa-sisa tanaman sebagai media pelindung tanah dari erosi. Cara ini dikenal dengan istilah metode vegetatif. Metode ini bertujuan memperbaiki sifat-sifat tanah baik fisik, kimia maupun biologi, menghambat laju aliran permukaan, dan meningkatkan kandungan lengas tanah. Konservasi selanjutnya dengan cara penggunaan bahan-bahan kimia organik maupun anorganik yang

Bab IV  Pengelolaan Faktor Produksi 121

bertujuan untuk memperbaiki sifat tanah dan menekan erosi. Namun teknik ini jarang digunakan petani karena membutuhkan dana cukup besar, kesulitan dalam pengadaan, dan hasilnya tidak jauh berbeda dengan pemanfaatan bahan-bahan alami.

Gambar 4.10 Rorak (Sumber: Ani, 2022)

Rorak atau parit buntu adalah teknik konservasi tanah dan air berupa pembuatan lubang-lubang buntu yang umumnya berukuran 100cm x 40cm x 40cm yang berfungsi untuk meresapkan air ke tanah dan menampung sedimen tanah dari bidang olah.

Istilah ini juga disebut teras saluran. Hasil penelitian Monde (2010) dalam Sallata (2017) menunjukan, rorak yang diberi mulsa secara vertikal efektif menekan aliran permukaan hingga 73%. Teknik konservasi rorak dapat menekan jumlah tanah yang tererosi 76%. Pemberian mulsa 6 ton/ha pada lahan kakao umur ≤ 3 tahun dapat menurunkan jumlah aliran permukaan hingga 71% dan erosi 87%.

Gambar 4.11 Biopori

122 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Biopori adalah lubang yang dibuat sedalam 80-100 cm dengan diameter 10-30 cm yang berfungsi untuk menampung air hujan dan meresapkannya kembali ke dalam tanah. Prinsip kerja lubang resapan biopori ini sederhana. Lubang yang telah dibuat kemudian diberi sampah organik seperti sampah dedaunan, yang akan memicu biota tanah seperti cacing, serangga dan akar tanaman untuk membuat rongga-rongga (lubang) di dalam tanah.

Gambar 4.12. menunjukkan pola pembuatan teras dengan mengurangi panjang lereng. Tujuan pembuatan teras untuk mengurangi kecepatan aliran permukaan (run off) dan memperbesar peresapan air oleh tanah. Teras ada bermacam-macam diantaranya teras bangku, teras individu, teras kebun, teras batu, teras kredit, teras datar, teras guludan dan teras saluran.

Gambar 4.12 Pembuatan Teras

Dalam pertanian, menjaga kualitas air/lahan basah dengan konservasi dan perlindungan sumber daya air sangat penting. Biasanya lahan basah berperan dalam melakukan penyaringan nutrisi (pupuk anorganik) dan pestisida. Berikut langkah-langkah yang ditujukan untuk menjaga kualitas air, antara lain:
1. mengurangi tambahan senyawa kimia sintetis ke dalam lapisan tanah bagian atas (top soil) yang dapat mencuci hingga muka air tanah (water table)
2. menggunakan irigasi tetes (drip irrigation)
3. menggunakan jalur-jalur konservasi sepanjang tepi saluran air.

Bab IV  Pengelolaan Faktor Produksi 123

Upaya konservasi berikutnya adalah dengan diversifikasi tanaman. Bertanam dengan jenis tanaman yang bervariasi di lahan pertanian dapat mengurangi kondisi ekstrem dari cuaca, hama pengganggu tanaman, dan harga pasar. Peningkatan diversifikasi tanaman dan jenis tanaman lain seperti pohon-pohon dan rumput-rumputan, juga dapat memberikan kontribusi terhadap konservasi lahan, habitat binatang, dan meningkatkan populasi serangga yang bermanfaat. Beberapa langkah konkret yang dapat dilakukan di antaranya:
1. Menciptakan sarana penyediaan air, yang menciptakan lingkungan bagi katak, burung, dan binatang-binatang lainnya yang memakan serangga dan insect lainnya.
2. Menanam tanaman-tanaman yang berbeda untuk meningkatkan pendapatan sepanjang tahun dan meminimalkan pengaruh dari kegagalan menanam sejenis tanaman saja
3. Penanaman tanaman-tanaman seperti gandum dan semanggi pada akhir musim panen tanaman sayuran dan sereal, dapat menyediakan beberapa manfaat termasuk menekan pertumbuhan gulma.

Pengelolaan nutrisi tanaman dengan baik dapat meningkatkan kondisi tanah dan melindungi lingkungan tanah. Penggunaan sumber daya nutrisi alami di lahan pertanian perlu ditingkatkan, seperti pupuk kandang, dan tanaman kacang-kacangan (leguminosae) sebagai penutup tanah dapat mengurangi biaya penggunaan pupuk anorganik yang harus dikeluarkan. Tanaman leguminosae dapat bersimbiosis dengan bakteri penambat nitrogen, untuk menyuplai ketersediaan unsur N di dalam tanah. Beberapa jenis pupuk organik yang dapat digunakan antara lain: kompos, kascing (kompos cacing), pupuk hijau (dedaunan). Ilustrasi pada tautan https://www.youtube.com/watch?v=enLlU-7MFxs berikut ini menggambarkan simbiosis mutualisme antara tanaman dengan Rhizobacteria dan juga mikoriza (Gambar 4.13).

Gambar 4.13 Kode Tayangan Audio Visual Simbiosis Tanaman dengan Rhizobakteri dan Mikoriza  
Sumber: Deki Kun Farm (2022)

124 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Konservasi lahan lainnya adalah agroforestri (wanatani). Agroforestri merupakan suatu sistem tata guna lahan yang permanen, yaitu tanaman semusim dan tanaman tahunan ditanam bersamaan atau dalam rotasi membentuk suatu tajuk berlapis sehingga sangat efektif untuk melindungi tanah dari hempasan air hujan. Contohnya, budi daya pertanaman jagung di sela-sela tanaman jati. Secara ekologi dan ekonomi, sistem agroforestri ini memberikan manfaat sebagai berikut.
1. Hasil tanaman musiman dan tanaman tahunan dapat diperoleh secara berkesinambungan sehingga akan menambah pendapatan petani.
2. Sistem ini dapat mencegah terjadinya serangan hama secara total, seperti yang sering terjadi pada tanaman satu jenis (monokultur). Keanekaragaman jenis tanaman dalam sistem agroforestri memungkinkan terbentuknya stratifikasi (tingkatan) tajuk yang mengisi ruang secara berlapis ke arah vertikal (Gambar 4.14). Hal ini bermanfaat melindungi tanah dari hempasan air hujan.

Gambar 4.14 Stratifikasi Tajuk Tanaman

Pertanian berkelanjutan tidak terlepas dari konsep pertanian organik. Apakah yang dimaksud dengan pertanian organik? Pertanian organik merupakan sistem produksi pertanian terpadu yang menghindari penggunaan pestisida kimia, zat pengatur tumbuh dan pupuk buatan atau sintetis, hasil rekayasa genetik, serta menekan pencemaran tanah, air, dan udara. Prinsip-prinsip pertanian organik menurut Sulaiman (2007) antara lain sebagai berikut.
1. Prinsip ekologi, artinya pertanian organik harus dibangun berdasarkan siklus dan sistem ekologi kehidupan.

Bab IV  Pengelolaan Faktor Produksi 125

2. Prinsip kesehatan, artinya pertanian organik harus mempertahankan dan meningkatkan kesuburan tanah, kesehatan tanaman, hewan, dan manusia sebagai sesuatu yang utuh dan tidak terpisahkan.
3. Prinsip keadilan, artinya pertanian organik harus membangun hubungan yang mampu menjamin keadilan terkait dengan lingkungan dan kesempatan hidup bersama.
4. Prinsip perlindungan, artinya pertanian organik harus dikelola secara hati-hati dan bertanggung jawab untuk melindungi kesehatan dan kesejahteraan generasi sekarang dan mendatang serta lingkungan hidup.

Sejalan dengan konsep pertanian organik, saat ini dikenal istilah pertanian regeneratif. Apakah itu? Pertanian regeneratif adalah suatu konsep pertanian yang mengembalikan kesuburan tanah dengan cara mengikat kembali karbon yang ada di atmosfer ke dalam tanah. Bagaimana caranya? Tanaman mengambil karbon dari atmosfer untuk fotosintesis, hasil fotosintesis berupa gula sebagian diedarkan ke akar untuk memberi makan mikroorganisme tanah yang menggunakan karbon untuk membangun tanah. Dengan kata lain, pertanian regeneratif merupakan sistem prinsip dan praktik pertanian yang berupaya merehabilitasi dan meningkatkan seluruh ekosistem tanah dengan memprioritaskan pada kesehatan tanah. Terdapat empat teknik kunci pertanian regeneratif, yaitu sebagai berikut:
1. Pengolahan tanah konservasi, yaitu menerapkan praktik pengolahan tanah seminimal mungkin. Pengolahan ini bertujuan untuk meminimalkan gangguan fisik tanah dan menjaga karbon tidak lepas ke atmosfer.
2. Keanekaragaman tanaman di lahan akan menciptakan tanah yang kaya nutrisi, bervariasi, dan produktivitas tinggi. Penanaman tanaman yang berbeda akan melepaskan karbohidrat (gula) yang berbeda pula melalui akarnya sehingga dapat memperkaya nutrisi tanah.
3. Rotasi dan tanaman penutup. Rotasi tanaman dan penyebaran tanaman penutup dapat membantu memasukkan lebih banyak bahan organik ke tanah serta menghindari masalah penyakit dan hama secara alami.
4. Menghindari kekacauan, yaitu meminimalkan gangguan fisik seperti pengolahan lahan, juga berupaya berhati-hati terhadap aktivitas kimiawi maupun biologis yang dapat merusak kesehatan

126 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

tanah dalam jangka waktu panjang karena hal ini akan mengganggu hubungan alami antara mikroorganisme tanah dengan akar tanaman.

---

## B. Pengelolaan Sumber Daya Manusia

### Apersepsi Awal
Apakah pernah terbayang dalam benak kalian, suatu saat sumber daya manusia di bidang pertanian berkurang bahkan tidak ada sebab hilangnya minat generasi muda sebagai penerus dalam bidang pertanian? Siapa lagi yang akan memproduksi bahan pangan untuk kita?

Kalian setelah lulus dari SMK Pertanian tentunya ingin bekerja bahkan ada yang tertarik sebagai pengusaha di bidang pertanian. Seandainya kalian sebagai pengusaha yang memiliki karyawan/pekerja atau seandainya kalian diterima di sebuah perusahaan sebagai mandor atau supervisor, bagaimana kalian mengatur karyawan/pekerja? Hal-hal apa saja yang perlu kalian siapkan?

### Kata Kunci
sumber daya manusia, petani, pelaku usaha pertanian, mandor, supervisor, manajer, manajerial

### Materi
Dalam menjalankan proses bisnis pada agribisnis tanaman tidak terlepas dari peran sumber daya manusia. Dalam setiap subsistem agribisnis selalu melibatkan sumber daya manusia. Sumber daya manusia ini harus dikelola dengan baik supaya kegiatan agribisnis berjalan efektif dan efisien.

Di semester ganjil kalian sudah mempelajari tentang sistem agribisnis, masih ingat dengan subsistem apa saja yang terkait? Iya benar, ada empat subsistem dan satu penunjang. Nah, pada

Bab IV  Pengelolaan Faktor Produksi 127

subbab kali ini kalian akan mempelajari bagaimana sumber daya manusia itu berperan dalam setiap subsistem agribisnis tersebut dan penunjangnya.

Saragih (2004) menerangkan pengembangan sumber daya manusia (SDM) merupakan hal pokok yang strategis dan prioritas yang perlu diperhatikan dalam pembangunan sistem dan usaha agribisnis. Siapakah yang dimaksud SDM pertanian? Ya, berikut ini yang dimaksud SDM pertanian.
1. Para petani dan pengusaha tani yang jumlahnya puluhan juta, yang tiap hari berkutat dan menjalankan proses produksi.
2. Para pelaku usaha di bidang pertanian dan agribisnis yang mengusahakan dan menjalankan bisnis pengadaan dan pemasaran, baik sarana produksi yang diperlukan maupun produk yang dihasilkan petani.
3. Aparat pemerintah yang membuat dan mengembangkan kebijakan, seperti membuat Undang-Undang dan peraturan, mengawasi pelaksanaan peraturan tersebut, serta memfasilitasi proses produksi petani.

Bermain Peran
Nah, untuk kegiatan kali ini bagaimana kalau kalian bermain peran? Kalian bisa mengangkat kasus keseharian yang ada di masyarakat petani. Sebagai contoh bermain peran tentang “Peran Penyuluh Pertanian dalam Mendampingi Penyusunan Rencana Definitif Kelompok Tani (RDK) dan Rencana Definitif Kebutuhan Kelompok Tani (RDKK).” atau tema lainnya yang melibatkan seluruh sumber daya manusia (SDM) dalam pertanian, seperti tema kelangkaan pupuk, serangan hama, atau pengelolaan irigasi dan lain sebagainya.

Dalam bermain peran ini, semua siswa terlibat. Ketua kelas bertugas memimpin dalam pembagian peran, di antaranya: sebagai kelompok tani, Gapoktan, penyuluh, pihak aparat, dan lain-lain. Jumlah anggota kelompok disesuaikan dengan jumlah siswa dalam kelas. Semua siswa diharapkan terlibat dalam bermain peran ini. Berikut contoh blangko pembagian peran. Kalian dapat mengembangkan pembagian peran sesuai dengan kebutuhan skenario.

128 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

C. Pengelolaan Faktor Produksi Lainnya

Apersepsi Awal
Selain sumber daya alam dan sumber daya manusia sebagai faktor produksi, terdapat faktor produksi lain yang juga mendukung produksi tanaman, yaitu modal dan keahlian. Nah, bagaimana pengelolaan faktor produksi lain ini untuk mendukung produksi tanaman supaya optimal? Mari kita pelajari bersama.

Kata Kunci
modal tetap, modal bergerak, keahlian

Materi
Menurut Hanafie (2010) modal adalah keseluruhan nilai dari sumber-sumber ekonomi non-manusia. Modal dapat diartikan sebagai harta benda yang dapat dipergunakan untuk menghasilkan sesuatu yang menambah produksi atau menambah kekayaan.

Tabel 4.2 Contoh pembagian peran
| Peran | Nama Peserta Didik | Keterangan |
|---|---|---|
| Kelompok Tani A | 1. <br>2. <br>3. <br>dst. | dipilih salah satu peserta didik sebagai ketua kelompok tani |
| Kelompok Tani B | 1. <br>2. <br>3. <br>dst | dipilih salah satu peserta didik sebagai ketua kelompok tani |
| Penyuluh | | |
| Aparat pemerintah (RT, Kadus, dsb) | | |
| dst. | | |

Bab IV  Pengelolaan Faktor Produksi 129

Dalam usaha tani modal dapat dibedakan menjadi dua, yaitu modal tetap dan modal bergerak.
1. Modal tetap adalah barang-barang modal yang digunakan dalam proses produksi yang dapat digunakan beberapa kali. Meskipun pada akhirnya barang tersebut habis, tetapi modal tetap tidak akan habis hanya dalam satu kali produksi. Biasanya untuk ketepatan perhitungan modal tetap dihitung untuk penyusutan nilainya setiap satu kali masa produksi. Contoh modal tetap adalah bangunan, kendaraan farm, alat dan mesin pertanian.
2. Modal bergerak adalah modal yang habis dalam satu kali produksi. Contoh modal tetap adalah pupuk, bibit, pestisida, bahan bakar untuk mesin pertanian.

Agar lebih jelas kalian bisa menyimak contoh perhitungan sederhana modal awal untuk bertanam cabai, pada tautan berikut: https://www.youtube.com/watch?v=w3TTftfyvkI atau dengan memindai kode pada Gambar 4.15 berikut ini.

Gambar 4.15 Kode Tayangan Audio Visual Modal Awal Tanam Cabai  
Sumber: Petani Polycultur (2022)

Selain modal, faktor produksi lain yang berpengaruh adalah keahlian. Keahlian yang dimaksud adalah manajemen atau aspek pengelolaan, yang artinya kemampuan manusia mengelola atau mengkombinasikan seluruh faktor-faktor produksi dalam waktu tertentu untuk memperoleh hasil dalam proses produksi tanaman. Untuk lebih jelasnya silahkan menyimak infografis pada Gambar 4.16

Secara sederhana, fungsi manajemen meliputi fungsi perencanaan, pengorganisasian, pelaksanaan, dan evaluasi seluruh kegiatan usaha tani. Nah, setelah menyimak tayangan dan infografis di Gambar 4.16., mari kita perdalam pemahaman tentang modal dan pengelolaan dalam proses agribisnis tanaman, agar kalian mendapatkan pengalaman belajar yang nyata.

130 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Gambar 4.16 Infografis Manajemen dalam Proses Produksi Tanaman

1. Bentuklah kelompok diskusi yang terdiri atas 4-5 orang.
2. Kemudian bermainlah peran seolah-olah Kalian adalah seorang manajer dalam sebuah produksi tanaman. Kalian dibebaskan untuk memilih komoditas yang akan diproduksi. Identifikasilah kebutuhan tenaga kerja dan keterampilan yang dibutuhkan dari tenaga kerja tersebut, modal tetap, dan modal tidak tetap yang digunakan dalam proses produksi komoditas tersebut!
3. Lalu lakukan penilaian antar-teman dalam satu kelompok, jika menjadi seorang manager kira-kira keterampilan atau keahlian apa saja yang perlu Kalian tingkatkan.

BLANGKO AKTIVITAS DISKUSI
Aktivitas Belajar : .........................................................................  
Hari / Tanggal Aktivitas : .........................................................................  
Kelompok : .........................................................................  
Nama Anggota Kelompok : .........................................................................  

Tabel 4.3 Blangko Aktivitas Diskusi

Bab IV  Pengelolaan Faktor Produksi 131

| Kegiatan Produksi | Tenaga Kerja | Keterampilan Tenaga Kerja | Modal Tetap | Modal Tidak Tetap |
|---|---|---|---|---|
| ..................................... | ..................................... | ..................................... | ..................................... | ..................................... |
| ..................................... | ..................................... | ..................................... | ..................................... | ..................................... |

| Nama Anggota Kelompok | Keterampilan Manajemen yang Perlu ditingkatkan | Penjelasan |
|---|---|---|
| ................................................................. | ................................................................. | ................................................................. |
| ................................................................. | ................................................................. | ................................................................. |

Diskusi  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
……………………………………………………………………………………………………  
…………………………………………………………………………………………………...  

Kesimpulan  
……………………………………………………………………………………………………  
…...............................................................................................................................  
.................................................................................................................................  

Setelah melakukan berbagai aktivitas belajar dan diskusi, apakah Kalian semakin tertarik untuk menjadi seorang agripreneur atau manajer agribisnis tanaman? Proses pembelajaran ini diharapkan

132 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

menjadi refleksi dan motivasi kalian dalam mempersiapkan diri menjadi agripreneur, manajer, atau tenaga terampil di bidang agribisnis tanaman.

Rangkuman
1. Faktor produksi merupakan benda-benda yang diciptakan oleh alam atau diciptakan oleh manusia yang dapat digunakan untuk memproduksi barang dan jasa. Kegiatan produksi pertanian yang juga membutuhkan ketersediaan faktor produksi.
2. Pengelolaan sumber daya alam tidak lepas dari upaya mewujudkan pertanian yang berkelanjutan. Dalam memanfaatkan sumber daya alam untuk pertanian perlu memperhatikan pelestarian lingkungan, dengan prinsip tidak merusak ekosistem. Pengelolaan sumber daya alam meliputi Konsep Pengendalian Hama Terpadu (PHT) dan konservasi lahan dan air.
3. Sumber daya manusia dalam proses produksi pertanian meliputi petani dan pengusaha tani, pelaku usaha, dan aparat pemerintah.
a. Para petani dan pengusaha tani yang jumlahnya puluhan juta, yang tiap hari berkutat dan menjalankan proses produksi.
b. Para pelaku usaha di bidang pertanian dan agribisnis yang mengusahakan dan menjalankan bisnis pengadaan dan pemasaran, baik sarana produksi yang diperlukan maupun produk yang dihasilkan petani.
c. Aparat pemerintah yang membuat dan mengembangkan kebijakan, seperti membuat undang-undang dan peraturan, mengawasi pelaksanaan peraturan tersebut, serta memfasilitasi proses produksi petani.
4. Selain sumber daya alam dan sumber daya manusia sebagai faktor produksi, ada faktor produksi lain yang juga mendukung produksi tanaman yaitu modal dan keahlian.
a. Modal adalah keseluruhan nilai dari sumber-sumber ekonomi non-manusia. Modal dapat diartikan sebagai harta benda yang dapat dipergunakan untuk menghasilkan

Bab IV  Pengelolaan Faktor Produksi 133

sesuatu yang menambah produksi atau menambah kekayaan. Dalam usaha tani modal dibedakan menjadi dua, yaitu modal tetap dan modal bergerak.
b. Keahlian yang dimaksud adalah manajemen atau aspek pengelolaan, yang artinya kemampuan manusia mengelola atau mengkombinasikan seluruh faktor-faktor produksi dalam waktu tertentu untuk memperoleh hasil dalam proses produksi tanaman.

Asesmen

Asesmen Nontes
a. Portofolio
Portofolio kalian berupa laporan hasil diskusi kelompok, laporan hasil observasi kelompok yang telah kalian lakukan.

Asesmen Tes
Jawablah pertanyaan-pertanyaan berikut secara jelas.
1. Menurutmu bagaimana pengelolaan sumber daya alam yang baik?
2. Jelaskan yang dimaksud sumber daya manusia pada proses produksi tanaman.
3. Sebutkan dua jenis modal dalam proses produksi tanaman dan berikan contoh masing-masing.
4. Sebutkan keterampilan manajerial yang paling diperlukan dalam mengatasi konflik di tempat kerja. Jelaskan alasannya.

Pengayaan
Selamat, kalian telah melewati tahapan belajar di bab ini. Untuk lebih membuka wawasan Kalian silakan simak tayangan audiovisual pada tautan https://www.youtube.com/watch?v=HnC4C_zSVnI atau dengan memindai kode berikut ini (Gambar 4.17).

134 Dasar-Dasar Agribisnis Tanaman untuk SMK/MAK Kelas X

Gambar 4.17 Kode Tayangan Audio Visual Konsep Pertanian Zero Waste  
Sumber: AFH Channel (2020)

Refleksi
Setelah Kalian mempelajari semua materi pada bab ini, saatnya Kalian merefleksikan hasil belajar dengan mencentang pada kolom pemahaman dan kompeten. Centang kolom “Ya” apabila Kalian telah memahami materi yang telah dipelajari. Sebaliknya, centang kolom “Belum”, apabila Kalian belum memahami materi dan perlu mengulanginya lagi.

Tabel 4.4 Refleksi Pembelajaran pada Bab IV
| Materi yang telah saya pelajari | Pemahaman Saya: Ya | Pemahaman Saya: Belum |
|---|---|---|
| Pengelolaan sumber daya alam | [ ] | [ ] |
| Pengelolaan sumber daya manusia | [ ] | [ ] |
| Pengelolaan faktor produksi lainnya | [ ] | [ ] |
    `,
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/rSQ5PQGDzU0',
    pdfUrl: '/materials/bab-4-pengelolaan-faktor-produksi-kelas-x.pdf',
    attachments: [
      {
        id: 'att-bab-iv-pengelolaan-faktor-produksi-pdf',
        name: 'Buku Siswa BAB IV - Pengelolaan Faktor Produksi (Kelas X - 24 Halaman).pdf',
        fileUrl: '/materials/bab-4-pengelolaan-faktor-produksi-kelas-x.pdf',
        fileSize: '66.7 KB',
        fileType: 'pdf',
      },
    ],
    status: 'published',
    orderIndex: 2,
    createdAt: '2026-08-05T07:00:00Z',
    updatedAt: '2026-10-29T10:25:00Z',
  },
  {
    id: 'mat-hidroponik-nft',
    title: 'Teknologi Budidaya Hidroponik Sistem NFT pada Tanaman Selada',
    slug: 'teknologi-budidaya-hidroponik-nft-selada',
    description: 'Panduan komprehensif budidaya selada (Lactuca sativa) dengan Nutrient Film Technique (NFT), mulai dari persemaian rockwool hingga panen.',
    categoryId: 'cat-9',
    categoryName: 'Sistem Hidroponik',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Instalasi & Manajemen Nutrisi NFT',
    learningObjectives: [
      'Memahami prinsip sirkulasi tipis nutrisi pada sistem Nutrient Film Technique (NFT)',
      'Mampu mengukur dan mengatur pH (5.5 - 6.5) serta nilai EC larutan AB Mix (1.2 - 1.6 mS/cm)',
      'Menerapkan tahapan semai rockwool dan pemindahan bibit (transplanting) pada netpot',
      'Mengidentifikasi gejala kekurangan nutrisi (defisiensi hara) pada selada hidroponik',
    ],
    content: `
### 1. Pengenalan Sistem NFT (Nutrient Film Technique)
Sistem NFT adalah salah satu teknik hidroponik di mana akar tanaman tumbuh pada lapisan aliran larutan nutrisi yang dangkal dan bersirkulasi terus-menerus. Lapisan nutrisi dibuat sangat tipis (seperti lapisan film tipis, sekitar 1–3 mm) agar bagian atas akar tetap terpapar oksigen udara bebas sementara ujung bawahnya menyerap air dan unsur hara.

#### Keunggulan Sistem NFT:
1. **Pasokan Oksigen Optimal:** Karena lapisan nutrisi tipis, akar tanaman memperoleh aerasi yang melimpah sehingga perakaran berkembang putih dan sehat.
2. **Efisiensi Penggunaan Air & Pupuk:** Sistem tertutup (re-sirkulasi) meminimalkan evaporasi dan pemborosan hara.
3. **Pertumbuhan Lebih Cepat:** Tanaman selada dapat dipanen dalam waktu 30–35 hari setelah semai, lebih singkat dibandingkan media tanah.

---

### 2. Parameter Kritis Larutan Nutrisi AB Mix
Untuk mencapai kualitas selada krispi dan bebas rasa pahit:
- **Tingkat Keasaman (pH):** Rentang ideal adalah **5.5 – 6.5**. Jika pH terlalu tinggi (>7.0), zat besi (Fe) dan fosfat (P) akan mengendap dan tidak terserap.
- **Nilai EC (Electrical Conductivity):**
  - Fase Bibit (Hari 1–10 setelah pindah): **800 – 1.000 μS/cm**
  - Fase Vegetatif Cepat (Hari 11–25): **1.200 – 1.400 μS/cm**
  - Fase Menjelang Panen: **1.000 – 1.200 μS/cm**
- **Suhu Air Tandon:** Usahakan tidak melebihi **28°C**. Suhu air yang terlalu panas memicu kebusukan akar (*pythium root rot*).

---

### 3. Langkah Kerja Praktik di Greenhouse SMK
1. **Perendaman Benih & Semai:** Potong dadu media rockwool ukuran 2.5 x 2.5 cm. Lubangi sedalam 0.5 cm, letakkan 1 benih selada per lubang. Basahi sampai lembap (tidak menggenang).
2. **Pencahayaan:** Segera kenakan sinar matahari pagi setelah benih pecah (sprout) untuk mencegah *etiolasi* (kutilang - kurus tinggi langsing).
3. **Pindah Tanam:** Setelah bibit memiliki 3–4 helai daun sejati (umur 10–14 HSS), masukkan ke dalam netpot dan pasang pada pipa/gully NFT.
4. **Monitoring Rutin:** Lakukan pengecekan pH dan EC setiap pagi pukul 07.30 WIB dan sore pukul 16.00 WIB. Catat pada logbook pertanian digital.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/n3H8k3dJzQ0',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attachments: [
      {
        id: 'att-1',
        name: 'Modul_Praktik_NFT_Selada_SMK.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '2.4 MB',
        fileType: 'pdf',
      },
      {
        id: 'att-2',
        name: 'Tabel_Standar_PPM_EC_Sayuran_Daun.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '1.1 MB',
        fileType: 'pdf',
      },
    ],
    orderIndex: 1,
    status: 'published',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'mat-media-tanam',
    title: 'Penyiapan Media Tanam: Fondasi Rumah Bagi Akar & Keberhasilan Budidaya',
    slug: 'penyiapan-media-tanam',
    description: 'Modul Pembelajaran Resmi & Dokumen PDF Lengkap Penyiapan Media Tanam (28 Slide): Konsep rumah bagi akar, 5 fungsi rizosfer, 6 bahan baku, formula 1:1:1, serta sistem Tanah, Hidroponik, Aeroponik, dan Akuaponik.',
    categoryId: 'cat-2',
    categoryName: 'Penyiapan Media Tanam',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Fisika & Kimia Media Tanam, Formulasi Campuran, dan Sistem Media Modern',
    learningObjectives: [],
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
    videoUrl: '',
    pdfUrl: '/materials/penyiapan-media-tanam.pdf',
    attachments: [
      {
        id: 'att-media-tanam-full',
        name: 'Penyiapan_media_tanam_full.pdf',
        fileUrl: '/materials/penyiapan-media-tanam.pdf',
        fileSize: '12.5 MB',
        fileType: 'pdf',
      },
    ],
    orderIndex: 2,
    status: 'published',
    createdAt: '2026-08-05T08:00:00Z',
    updatedAt: '2026-10-28T08:15:00Z',
  },

  HIDROPONIK_XI_MATERIAL,
  {
    id: 'mat-pht-hortikultura',
    title: 'Pengendalian Hama Terpadu (PHT) Tanaman Cabai Merah',
    slug: 'pengendalian-hama-terpadu-cabai-merah',
    description: 'Strategi pencegahan dan pengendalian hama thrips, kutu kebul (Bemisia tabaci), serta antraknosa dengan pestisida nabati.',
    categoryId: 'cat-12',
    categoryName: 'Pengendalian Hama dan Penyakit Tanaman',
    targetClassId: 'cls-11-atph',
    targetClassName: 'XI ATPH',
    topic: 'Identifikasi Gejala Serangan & Ambang Ekonomi Hama',
    learningObjectives: [
      'Mengenali morfologi dan gejala serangan hama Thrips sp. dan Tungau',
      'Membuat formulasi pestisida nabati berbahan daun mimba dan ekstrak bawang putih',
      'Menetapkan keputusan penyemprotan berdasarkan nilai ambang kendali ekonomi',
    ],
    content: `
### Konsep Dasar PHT pada Agribisnis Cabai
PHT bukan berarti anti-pestisida, melainkan pendekatan ekologis untuk membatasi populasi organisme pengganggu tanaman (OPT) di bawah tingkat yang merugikan secara ekonomis dengan memanfaatkan musuh alami dan metode kultur teknis.

1. **Kultur Teknis:** Pemasangan mulsa plastik hitam perak (MPHP) untuk memantulkan sinar UV yang mengusir kutu kebul dan thrips.
2. **Pemasangan Perangkap:** Yellow sticky trap dengan kerapatan 40 buah per hektar.
3. **Penyemprotan Pestisida Nabati:** Rebusan ekstrak daun nimba konsentrasi 5% diaplikasikan di pagi atau sore hari.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1200&q=80',
    attachments: [],
    orderIndex: 1,
    status: 'published',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'mat-pembiakan-vegetatif-xi',
    title: 'Teknik Pembiakan Vegetatif Okulasi & Sambung Pucuk Tanaman Buah (Kelas XI)',
    slug: 'pembiakan-vegetatif-okulasi-sambung-pucuk',
    description: 'Modul praktikum kejuruan Kelas XI: Teknik penyambungan batang bawah (rootstock) dan entres unggul pada tanaman mangga, alpukat, dan jeruk.',
    categoryId: 'cat-4',
    categoryName: 'Pembibitan Tanaman',
    targetClassId: 'cls-xi-at-1',
    targetClassName: 'XI AT 1',
    topic: 'Okulasi Mata Tunas, Cleft Grafting, dan Pemeliharaan Bibit Pascasambung',
    learningObjectives: [
      'Memilih batang bawah sehat berakar tunggang kuat dan batang atas (entres) bersertifikat',
      'Mempraktikkan teknik sambung pucuk (cleft grafting) dengan tingkat keberhasilan minimal 85%',
      'Melakukan pemeliharaan sungkup dan penyiraman terkontrol di nursery greenhouse',
    ],
    content: `
### 1. Prinsip Dasar Sambung Pucuk (Grafting)
Sambung pucuk adalah seni menggabungkan dua bagian tanaman yang masih hidup sedemikian rupa sehingga keduanya bersatu dan tumbuh menjadi satu tanaman utuh yang memiliki sifat unggul kedua tetuanya.

#### Kunci Keberhasilan:
- **Kesesuaian Kambium:** Lapisan kambium antara batang bawah dan entres harus bertemu rapat tanpa rongga udara.
- **Kebersihan Alat:** Pisau okulasi harus sangat tajam dan steril (dibersihkan dengan alkohol 70%).
- **Pengikatan & Penutupan Sungkup:** Gunakan plastik parafilm atau tali PE 0.2 mm dengan ikatan genting dari bawah ke atas agar air hujan tidak merembes.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    attachments: [],
    orderIndex: 2,
    status: 'published',
    createdAt: '2026-08-11T08:00:00Z',
    updatedAt: '2026-08-11T08:00:00Z',
  },
  {
    id: 'mat-fertigasi-melon-xi',
    title: 'Manajemen Irigasi Tetes & Fertigasi Presisi Tanaman Melon Greenhouse (Kelas XI)',
    slug: 'fertigasi-presisi-melon-greenhouse',
    description: 'Panduan operasional sistem drip irrigation, perhitungan formula hara N-P-K bertahap, dan pemangkasan cabang lateral melon.',
    categoryId: 'cat-6',
    categoryName: 'Budidaya Tanaman Hortikultura',
    targetClassId: 'cls-xi-at-2',
    targetClassName: 'XI AT 2',
    topic: 'Kebutuhan Debit Air, Dosing Pump, dan Manajemen Brix Buah',
    learningObjectives: [
      'Mengoperasikan dripper emitter dengan debit terkalibrasi 2 liter/jam per tanaman',
      'Mengatur rasio hara Kalium tinggi pada fase pembuahan untuk meningkatkan kadar gula (Brix > 13)',
      'Melakukan seleksi 1 buah terbaik per pohon pada ruas daun ke-9 hingga ke-12',
    ],
    content: `
### Sistem Fertigasi Presisi pada Melon Golden
Fertigasi (fertilisasi + irigasi) memberikan larutan hara langsung ke daerah rizosfer tanaman secara seragam dan terukur dengan pemantauan EC berkala.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=1200&q=80',
    attachments: [],
    orderIndex: 3,
    status: 'published',
    createdAt: '2026-08-12T08:00:00Z',
    updatedAt: '2026-08-12T08:00:00Z',
  },
  {
    id: 'mat-pascapanen-kewirausahaan-xii',
    title: 'Standardisasi Mutu Pascapanen, Sortasi, & Kemasan Vakum Sayuran Premium (Kelas XII)',
    slug: 'standardisasi-mutu-pascapanen-kemasan-vakum',
    description: 'Modul kejuruan Kelas XII: Standar mutu ekspor/supermarket, grading SNI, penanganan rantai dingin (cold chain 4°C), dan modified atmosphere packaging (MAP).',
    categoryId: 'cat-13',
    categoryName: 'Panen dan Pascapanen',
    targetClassId: 'cls-xii-at-1',
    targetClassName: 'XII AT 1',
    topic: 'Pascapanen Sayuran Buah & Daun, Grading SNI, dan Packaging Modern',
    learningObjectives: [
      'Menerapkan tahapan pembersihan, trimming, sortasi ukuran dan bentuk sesuai standar supermarket',
      'Mengoperasikan vacuum sealer dan labeling nutrition facts ber-barcode',
      'Menjaga suhu rantai dingin (cold chain 2-5°C) guna memperpanjang masa simpan (shelf-life)',
    ],
    content: `
### Standar Operasional Prosedur (SOP) Pascapanen Hortikultura
Pascapanen menentukan 70% penerimaan harga jual di pasar retail modern. Penurunan mutu fisik dan susut bobot dapat ditekan melalui precooling dan sanitasi klorin food-grade 50-100 ppm.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    attachments: [],
    orderIndex: 1,
    status: 'published',
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-08-15T08:00:00Z',
  },
  {
    id: 'mat-agripreneur-digital-xii',
    title: 'Analisis Kelayakan Finansial Usaha Tani & Pemasaran Digital Hasil Panen ATPH (Kelas XII)',
    slug: 'analisis-finansial-pemasaran-digital-agribisnis',
    description: 'Kewirausahaan Agribisnis Kelas XII: Perhitungan HPP, R/C Ratio, BEP (Break Even Point), Payback Period, serta strategi direct-to-consumer (D2C) marketplace pertanian.',
    categoryId: 'cat-15',
    categoryName: 'Agripreneurship',
    targetClassId: 'cls-xii-at-2',
    targetClassName: 'XII AT 2',
    topic: 'Rencana Bisnis Pertanian Mandiri (Business Model Canvas) & E-Commerce',
    learningObjectives: [
      'Menghitung harga pokok produksi (HPP) per kilogram hasil panen greenhouse',
      'Menghitung rasio kelayakan investasi (R/C ratio > 1.3 dan B/C ratio)',
      'Membuat strategi kampanye penjualan online dengan konten storytelling pertanian organik',
    ],
    content: `
### Analisis Keuangan Usaha Agribisnis SMK
Siswa dilatih menyusun laporan laba rugi, cash flow harian, dan menetapkan titik impas (Break Even Point) baik dalam unit maupun rupiah.
    `,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    attachments: [],
    orderIndex: 2,
    status: 'published',
    createdAt: '2026-08-16T08:00:00Z',
    updatedAt: '2026-08-16T08:00:00Z',
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-logbook-nft',
    title: 'Tugas Praktik 1: Logbook Kalibrasi pH & EC Nutrisi Hidroponik',
    description: 'Lakukan pengukuran harian larutan nutrisi tandon hidroponik NFT selama 3 hari berturut-turut. Dokumentasikan foto alat ukur dan tuliskan analisis perubahan nilai EC serta tindakan koreksi yang diambil.',
    instructions: `
1. Catat nilai pH dan EC larutan tandon setiap pukul 07.30 WIB dan 16.00 WIB.
2. Buat tabel perbandingan pada dokumen laporan (bisa diketik langsung atau upload PDF/Word).
3. Jika pH naik di atas 6.8, jelaskan takaran penambahan larutan pH Down (asam fosfat).
4. Lampirkan minimal 2 foto dokumentasi saat siswa melakukan kalibrasi dan pembacaan sensor.
5. Format pengumpulan: PDF atau Word (maksimal 10 MB).
    `,
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Sistem Hidroponik NFT',
    startDate: '2026-08-01T00:00:00Z',
    dueDate: '2026-11-15T23:59:00Z',
    submissionType: 'text_and_file',
    points: 100,
    rubricCriteria: [
      { criteria: 'Kelengkapan Data Logbook 3 Hari', weight: 40, description: 'Mencantumkan data pH & EC pagi dan sore secara lengkap.' },
      { criteria: 'Ketepatan Analisis Tindakan Koreksi', weight: 35, description: 'Menjelaskan formula pH Down / penambahan air baku dengan benar.' },
      { criteria: 'Dokumentasi Foto Praktik Mandiri', weight: 25, description: 'Foto orisinal siswa di greenhouse atau instalasi mini.' },
    ],
    status: 'published',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'asg-formula-media',
    title: 'Tugas 2: Rencana Anggaran Biaya & Formulasi Media Tanam Sayuran Organik',
    description: 'Hitung kebutuhan bahan dan estimasi biaya pembuatan media tanam untuk 100 polybag ukuran 35x35 cm.',
    instructions: `
1. Hitung volume kebutuhan topsoil, kompos matang, dan arang sekam dalam satuan karung/m3.
2. Buat tabel estimasi harga bahan baku di toko pertanian lokal terdekat.
3. Tuliskan langkah perlakuan agens hayati Trichoderma pada media.
    `,
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Penyiapan Media Tanam',
    startDate: '2026-08-10T00:00:00Z',
    dueDate: '2026-11-20T23:59:00Z',
    submissionType: 'text_and_file',
    points: 100,
    rubricCriteria: [
      { criteria: 'Ketepatan Perhitungan Volume Bahan', weight: 50, description: 'Kesesuaian rumus konversi polybag ke volume tanah.' },
      { criteria: 'Rasionalitas Rincian Anggaran', weight: 30, description: 'Kesesuaian harga pasar terkini.' },
      { criteria: 'Format dan Kerapian Laporan', weight: 20, description: 'Tata bahasa baku dan struktur rapi.' },
    ],
    status: 'published',
    createdAt: '2026-08-10T08:00:00Z',
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-rizky-logbook',
    assignmentId: 'asg-logbook-nft',
    assignmentTitle: 'Tugas Praktik 1: Logbook Kalibrasi pH & EC Nutrisi Hidroponik',
    studentId: 'usr-student-rizky',
    studentName: 'Rizky Pratama',
    studentEmail: 'rizky.pratama@siswa.eduatph.sch.id',
    studentNisn: '0078129381',
    classId: 'cls-10-atph',
    className: 'X ATPH',
    textContent: 'Berikut laporan hasil pengukuran nutrisi hidroponik NFT selada di greenhouse sekolah. Hari 1 pH 6.2 EC 1240, Hari 2 pH 6.6 EC 1310, Hari 3 pH 6.9 EC 1190. Pada hari ketiga dilakukan koreksi pH Down sebanyak 15 ml sehingga pH kembali ke 6.1.',
    fileName: 'Laporan_Praktik_Rizky_Pratama_X_ATPH.pdf',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.4 MB',
    fileType: 'pdf',
    attachments: [
      {
        id: 'att-rizky-1',
        name: 'Laporan_Praktik_Rizky_Pratama_X_ATPH.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '1.4 MB',
        fileType: 'pdf',
      },
      {
        id: 'att-rizky-2',
        name: 'Tabel_Pengukuran_Sensor_TDS_EC.xlsx',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '240 KB',
        fileType: 'sheet',
      },
      {
        id: 'att-rizky-3',
        name: 'Foto_Dokumentasi_Akar_Selada_NFT.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
        fileSize: '850 KB',
        fileType: 'image',
      },
    ],
    submittedAt: '2026-08-14T14:30:00Z',
    status: 'sudah_dinilai',
    grade: 92,
    feedback: 'Luar biasa Rizky! Analisis kenaikan pH dijelaskan dengan sangat tepat. Dokumentasi foto dan lampiran tabel spreadsheet sangat rapi.',
    gradedAt: '2026-08-15T10:00:00Z',
    gradedBy: 'Okta Nofiyanto',
  },
  {
    id: 'sub-siti-logbook',
    assignmentId: 'asg-logbook-nft',
    assignmentTitle: 'Tugas Praktik 1: Logbook Kalibrasi pH & EC Nutrisi Hidroponik',
    studentId: 'usr-student-siti',
    studentName: 'Siti Rahmawati',
    studentEmail: 'siti.rahma@siswa.eduatph.sch.id',
    studentNisn: '0078129382',
    classId: 'cls-10-atph',
    className: 'X ATPH',
    textContent: 'Tugas logbook kalibrasi tandon nutrisi selada hijau. Sudah dilampirkan foto display TDS meter dan dokumen laporan Microsoft Word.',
    fileName: 'Siti_Rahma_Logbook_Hidroponik.docx',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.1 MB',
    fileType: 'doc',
    attachments: [
      {
        id: 'att-siti-1',
        name: 'Siti_Rahma_Logbook_Hidroponik.docx',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: '1.1 MB',
        fileType: 'doc',
      },
      {
        id: 'att-siti-2',
        name: 'Foto_Kalibrasi_pH_Meter.png',
        fileUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1200&q=80',
        fileSize: '620 KB',
        fileType: 'image',
      },
    ],
    submittedAt: '2026-08-15T09:12:00Z',
    status: 'sudah_dikumpulkan',
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-manajemen-agribisnis-x',
    title: 'Evaluasi Bab 1: Manajemen Agribisnis Tanaman (Kelas X ATPH)',
    description: 'Kuis evaluasi komprehensif Bab I mencakup 4 subsistem agribisnis, 10 karakteristik agribisnis, fungsi manajemen (POACE & 6M), perencanaan produksi tanaman, serta penerapan SMK3LH di SMK Pertanian.',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Manajemen Agribisnis Tanaman',
    durationMinutes: 30,
    maxAttempts: 2,
    passingScore: 75,
    isPublished: true,
    questionCount: 10,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'quiz-dasar-hidroponik',
    title: 'Evaluasi Pembelajaran: Prinsip Hidroponik & Nutrisi Tanaman',
    description: 'Kuis interaktif untuk mengukur pemahaman konsep nutrisi tanaman, fungsi hara makro mikro, serta teknik NFT dan aeroponik.',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Sistem Hidroponik',
    durationMinutes: 20,
    maxAttempts: 2,
    passingScore: 75,
    isPublished: true,
    questionCount: 5,
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    title: 'Evaluasi Pembelajaran: BAB IV Pengelolaan Faktor Produksi (Kelas X ATPH)',
    description: 'Kuis evaluasi pemahaman BAB IV Pengelolaan Faktor Produksi: 4 faktor produksi (tanah/lahan, tenaga kerja/HOK, modal tetap & bergerak, keahlian manajerial), pertanian berkelanjutan, PHT, konservasi lahan & air (terasering, rorak, biopori), diversifikasi tanaman, agroforestri, pertanian organik/regeneratif, serta pengelolaan SDM pertanian.',
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    topic: 'Pengelolaan Faktor Produksi',
    durationMinutes: 40,
    maxAttempts: 3,
    passingScore: 75,
    isPublished: true,
    questionCount: 20,
    createdAt: '2026-08-05T08:00:00Z',
  },
  HIDROPONIK_XI_QUIZ,
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-mgt-1',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Istilah "Agribisnis" pertama kali diperkenalkan secara ilmiah pada tahun 1957 oleh...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Malayu S.P. Hasibuan' },
      { id: 'B', text: 'Davis dan Golberg' },
      { id: 'C', text: 'Downey dan Erickson' },
      { id: 'D', text: 'George R. Terry dan Leslie Rue' },
    ],
    correctAnswer: 'B',
    explanation: 'Istilah agribisnis pertama kali diperkenalkan oleh Davis dan Golberg pada tahun 1957 yang mendefinisikan agribisnis sebagai penjumlahan keseluruhan dari semua kegiatan manufaktur, budidaya, hingga distribusi produk pertanian.',
    points: 10,
    orderIndex: 1,
  },
  {
    id: 'q-mgt-2',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Perusahaan atau industri yang memproduksi benih unggul, pupuk organik, pestisida nabati, dan traktor tangan termasuk ke dalam...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Subsistem Agribisnis Hulu (Up-stream Agribusiness)' },
      { id: 'B', text: 'Subsistem Budi Daya / Usaha Tani (On-farm Agribusiness)' },
      { id: 'C', text: 'Subsistem Agribisnis Hilir (Down-stream Agribusiness)' },
      { id: 'D', text: 'Subsistem Layanan Pendukung Agribisnis' },
    ],
    correctAnswer: 'A',
    explanation: 'Subsistem Agribisnis Hulu mencakup seluruh kegiatan penyediaan sarana produksi pertanian (saprotan) seperti benih, pupuk, pestisida, dan alat mesin pertanian (alsintan).',
    points: 10,
    orderIndex: 2,
  },
  {
    id: 'q-mgt-3',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Kegiatan penggilingan gabah menjadi beras, pengolahan cabai menjadi saus sambal, serta pengemasan dan distribusi ke pasar swalayan merupakan bagian dari...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Subsistem Agribisnis Hulu' },
      { id: 'B', text: 'Subsistem Pertanian Primer' },
      { id: 'C', text: 'Subsistem Agribisnis Hilir (Down-stream Agribusiness)' },
      { id: 'D', text: 'Subsistem Layanan Pendukung' },
    ],
    correctAnswer: 'C',
    explanation: 'Subsistem Agribisnis Hilir meliputi kegiatan pascapanen, pengolahan hasil pertanian (agroindustri), distribusi logistik, dan pemasaran hasil panen ke tangan konsumen.',
    points: 10,
    orderIndex: 3,
  },
  {
    id: 'q-mgt-4',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Manakah di bawah ini lembaga yang berperan dalam Subsistem Layanan Pendukung Agribisnis (Supporting Services)?',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Pabrik pestisida kimia dan produsen traktor' },
      { id: 'B', text: 'Petani cabai dan buruh pemetik tomat' },
      { id: 'C', text: 'Bank, Koperasi Tani, Balai Penelitian Pertanian (R&D), dan Balai Penyuluhan' },
      { id: 'D', text: 'Pabrik saus sambal dan pedagang grosir pasar induk' },
    ],
    correctAnswer: 'C',
    explanation: 'Subsistem layanan pendukung menyediakan jasa vital penunjang sistem agribisnis, seperti pembiayaan modal (Bank/Koperasi), riset & inovasi (R&D), penyuluhan lapangan, dan lembaga diklat SMK Pertanian.',
    points: 10,
    orderIndex: 4,
  },
  {
    id: 'q-mgt-5',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Salah satu karakteristik agribisnis menurut Downey dan Erickson (1992) yang membedakannya secara tajam dari industri manufaktur lainnya adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Produksi dapat diatur konstan setiap hari tanpa terpengaruh cuaca' },
      { id: 'B', text: 'Produksi agribisnis bersifat musiman dan sangat tergantung pada kondisi biologis serta alam' },
      { id: 'C', text: 'Jumlah pelakunya sangat sedikit dan hanya dikuasai satu perusahaan raksasa' },
      { id: 'D', text: 'Produk agribisnis bersifat tahan lama dan tidak pernah mengalami kebusukan' },
    ],
    correctAnswer: 'B',
    explanation: 'Produksi pertanian sangat unik karena bersifat musiman (seasonality), mudah rusak (perishable), dan sangat dipengaruhi oleh faktor eksternal lingkungan alam dan cuaca.',
    points: 10,
    orderIndex: 5,
  },
  {
    id: 'q-mgt-6',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Dalam unsur perencanaan agribisnis 6W/1H menurut Manullang (1996), unsur "Way" (cara) menjelaskan tentang...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Alasan mengapa target profit perusahaan harus dicapai' },
      { id: 'B', text: 'Penjabaran perincian langkah kegiatan yang dibutuhkan dalam penciptaan produk dengan memanfaatkan faktor produksi' },
      { id: 'C', text: 'Kualifikasi pengalaman dan sertifikasi keahlian pegawai kebun' },
      { id: 'D', text: 'Penetapan jadwal waktu kapan panen dimulai dan berakhir' },
    ],
    correctAnswer: 'B',
    explanation: 'Unsur "Way" (cara) merupakan penjabaran dari perincian kegiatan apa saja yang dibutuhkan dalam penciptaan suatu produk agribisnis dengan memanfaatkan faktor-faktor produksi.',
    points: 10,
    orderIndex: 6,
  },
  {
    id: 'q-mgt-7',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Petani cabai menargetkan panen raya pada bulan Desember–Januari karena harga cabai tinggi. Jika masa budidaya tanaman di lahan adalah 3 bulan dan masa pembibitan di tray adalah 1,5 bulan, maka kegiatan pembibitan sebaiknya dimulai pada...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Awal bulan November' },
      { id: 'B', text: 'Pertengahan bulan Juli' },
      { id: 'C', text: 'Awal bulan Oktober' },
      { id: 'D', text: 'Akhir bulan Desember' },
    ],
    correctAnswer: 'B',
    explanation: 'Melalui teknik perhitungan mundur (penjadwalan produksi): Target panen Desember -> tanam di lahan akhir Agustus/awal September (3 bulan mundur) -> pembibitan dimulai 1,5 bulan sebelumnya, yaitu pertengahan Juli.',
    points: 10,
    orderIndex: 7,
  },
  {
    id: 'q-mgt-8',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Menurut Hasibuan (2010), pemberian motivasi kepada bawahan berupa pujian, penghargaan, sertifikat, atau bonus atas kinerja yang berprestasi disebut...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Motivasi represif' },
      { id: 'B', text: 'Motivasi positif (insentif positif)' },
      { id: 'C', text: 'Motivasi preventif' },
      { id: 'D', text: 'Motivasi negatif (insentif negatif)' },
    ],
    correctAnswer: 'B',
    explanation: 'Motivasi positif (insentif positif) memotivasi bawahan dengan memberikan apresiasi sehingga kepuasan dan semangat kerja meningkat secara jangka panjang.',
    points: 10,
    orderIndex: 8,
  },
  {
    id: 'q-mgt-9',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Tindakan pengawasan yang dilakukan SEBELUM terjadinya kesalahan atau penyimpangan dalam proses produksi agribisnis (seperti kalibrasi alat sprayer sebelum menyemprot) dinamakan...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Pengawasan preventif' },
      { id: 'B', text: 'Pengawasan represif' },
      { id: 'C', text: 'Pengawasan komparatif' },
      { id: 'D', text: 'Pengawasan pascatindakan' },
    ],
    correctAnswer: 'A',
    explanation: 'Pengawasan preventif dilakukan sebelum terjadinya kesalahan/penyelewengan guna melakukan tindakan pencegahan dini.',
    points: 10,
    orderIndex: 9,
  },
  {
    id: 'q-mgt-10',
    quizId: 'quiz-manajemen-agribisnis-x',
    questionText: 'Berdasarkan Peraturan Pemerintah (PP) No. 50 Tahun 2012, penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) diwajibkan bagi perusahaan yang...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Hanya memiliki kantor di gedung bertingkat tinggi' },
      { id: 'B', text: 'Mempekerjakan pekerja minimal 100 orang atau memiliki potensi bahaya tinggi' },
      { id: 'C', text: 'Memiliki modal usaha minimal 50 miliar rupiah' },
      { id: 'D', text: 'Hanya mengekspor komoditas buah ke luar negeri' },
    ],
    correctAnswer: 'B',
    explanation: 'PP No. 50 Tahun 2012 mewajibkan penerapan SMK3 bagi perusahaan yang mempekerjakan pekerja minimal 100 orang ATAU yang ruang lingkup pekerjaannya memiliki tingkat potensi bahaya tinggi (misalnya bahan kimia pestisida dan alsintan alat berat).',
    points: 10,
    orderIndex: 10,
  },
  {
    id: 'q-1',
    quizId: 'quiz-dasar-hidroponik',
    questionText: 'Berapakah rentang pH ideal larutan nutrisi untuk budidaya selada hidroponik agar penyerapan unsur hara optimal?',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: '4.0 - 5.0' },
      { id: 'B', text: '5.5 - 6.5' },
      { id: 'C', text: '7.5 - 8.5' },
      { id: 'D', text: '8.5 - 9.5' },
    ],
    correctAnswer: 'B',
    explanation: 'Pada rentang pH 5.5 - 6.5, sebagian besar unsur hara makro (N, P, K, Ca, Mg, S) dan mikro (Fe, Mn, Zn, Cu, B, Mo) berada dalam bentuk terlarut yang mudah diserap akar tanaman.',
    points: 20,
    orderIndex: 1,
  },
  {
    id: 'q-2',
    quizId: 'quiz-dasar-hidroponik',
    questionText: 'Alat ukur yang digunakan untuk mendeteksi kepekatan garam mineral/larutan nutrisi dalam air hidroponik adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Anemometer' },
      { id: 'B', text: 'TDS / EC Meter' },
      { id: 'C', text: 'Higrometer' },
      { id: 'D', text: 'Barometer' },
    ],
    correctAnswer: 'B',
    explanation: 'EC (Electrical Conductivity) meter mengukur daya hantar listrik larutan yang berbanding lurus dengan kepekatan total garam terlarut (TDS - Total Dissolved Solids) dalam satuan ppm atau mS/cm.',
    points: 20,
    orderIndex: 2,
  },
  {
    id: 'q-3',
    quizId: 'quiz-dasar-hidroponik',
    questionText: 'Pada sistem NFT (Nutrient Film Technique), ketebalan aliran nutrisi di dasar talang atau pipa sebaiknya diatur sangat tipis (1–3 mm). Pernyataan ini benar atau salah?',
    questionType: 'true_false',
    options: [
      { id: 'true', text: 'Benar' },
      { id: 'false', text: 'Salah' },
    ],
    correctAnswer: 'true',
    explanation: 'Benar, tujuan aliran tipis seperti film adalah agar bagian atas massa akar mendapatkan suplai oksigen langsung dari udara terbuka sementara bagian bawah menyerap larutan nutrisi.',
    points: 20,
    orderIndex: 3,
  },
  {
    id: 'q-4',
    quizId: 'quiz-dasar-hidroponik',
    questionText: 'Kekurangan unsur hara Nitrogen (N) pada tanaman sayuran daun ditandai dengan gejala utama yaitu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Daun muda mengkerut dan kerdil' },
      { id: 'B', text: 'Daun-daun tua menguning secara merata (klorosis)' },
      { id: 'C', text: 'Tepi daun terbakar warna ungu kebiruan' },
      { id: 'D', text: 'Batang tanaman menjadi berkayu keras dan tebal' },
    ],
    correctAnswer: 'B',
    explanation: 'Nitrogen bersifat mobile di dalam jaringan tanaman. Jika terjadi defisiensi, tanaman akan merelokasi cadangan N dari daun tua ke titik tumbuh baru, menyebabkan daun tua menguning terlebih dahulu.',
    points: 20,
    orderIndex: 4,
  },
  {
    id: 'q-5',
    quizId: 'quiz-dasar-hidroponik',
    questionText: 'Mengapa pupuk pekatan Stok A dan Stok B dalam formula AB Mix tidak boleh dicampur bersamaan dalam keadaan konsentrat pekat?',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Kalsium pada Stok A akan bereaksi dengan Sulfat/Fosfat pada Stok B membentuk endapan kalsium sulfat/gipsum yang tidak larut' },
      { id: 'B', text: 'Menimbulkan bau menyengat yang mengundang lalat buah' },
      { id: 'C', text: 'Menurunkan pH air secara drastis hingga mendekati asam murni' },
      { id: 'D', text: 'Menghilangkan warna merah dan hijau pada pupuk' },
    ],
    correctAnswer: 'A',
    explanation: 'Kation Ca2+ pekat pada Stok A bila bertemu dengan anion SO4 2- atau PO4 3- pada Stok B konsentrat akan membentuk endapan kalsium sulfat (gipsum) yang tidak larut dan tidak dapat diserap akar tanaman.',
    points: 20,
    orderIndex: 5,
  },
  // --- 20 SOAL EVALUASI BAB IV: PENGELOLAAN FAKTOR PRODUKSI ---
  {
    id: 'q-fp-1',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Benda-benda yang diciptakan oleh alam atau dibuat oleh manusia dan dapat dimanfaatkan untuk menghasilkan barang dan jasa dalam proses produksi pertanian disebut...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Sarana dan prasarana transportasi' },
      { id: 'B', text: 'Faktor produksi' },
      { id: 'C', text: 'Produk hilir agribisnis' },
      { id: 'D', text: 'Komoditas pasar bebas' },
    ],
    correctAnswer: 'B',
    explanation: 'Berdasarkan Bab IV buku Dasar-Dasar Agribisnis Tanaman, faktor produksi merupakan benda-benda yang diciptakan oleh alam atau dibuat oleh manusia dan dapat dimanfaatkan untuk menghasilkan barang dan jasa.',
    points: 5,
    orderIndex: 1,
  },
  {
    id: 'q-fp-2',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Dalam kegiatan proses produksi tanaman pertanian, faktor produksi dapat diklasifikasikan menjadi empat jenis utama, yaitu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Tanah, bibit, pupuk, dan pestisida' },
      { id: 'B', text: 'Tanah, tenaga kerja, modal, dan keahlian' },
      { id: 'C', text: 'Lahan, traktor, modal tunai, dan pasar' },
      { id: 'D', text: 'Petani, penyuluh, sarana produksi, dan iklim' },
    ],
    correctAnswer: 'B',
    explanation: 'Empat jenis faktor produksi dalam produksi tanaman meliputi: 1. Tanah/lahan, 2. Tenaga kerja (labor), 3. Modal (capital), dan 4. Keahlian/kewirausahaan (skill/management).',
    points: 5,
    orderIndex: 2,
  },
  {
    id: 'q-fp-3',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Sebagai tempat hidup beberapa makhluk hidup dan media tumbuh perakaran tanaman, tanah tersusun atas empat komponen utama, yaitu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Bahan padatan (mineral), bahan organik, air, dan udara' },
      { id: 'B', text: 'Pasir, kerikil, pupuk kandang, dan mikroorganisme' },
      { id: 'C', text: 'Batu kapur, pestisida kimia, air tanah, dan cacing' },
      { id: 'D', text: 'Lapisan humus, mulsa plastik, air irigasi, dan gas metana' },
    ],
    correctAnswer: 'A',
    explanation: 'Tanah terdiri atas empat komponen utama, yaitu bahan padatan atau mineral batuan, bahan organik (termasuk humus), air, dan udara yang mengisi rongga pori-pori tanah.',
    points: 5,
    orderIndex: 3,
  },
  {
    id: 'q-fp-4',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Batuan tanah mengalami pelapukan menjadi mineral berupa ion positif dan ion negatif sebagai nutrisi tanaman. Contoh ion positif (kation) penting di dalam tanah adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Ion nitrat (NO₃⁻) dan fosfat (PO₄²⁻)' },
      { id: 'B', text: 'Ion sulfat (SO₄²⁻) dan klorida (Cl⁻)' },
      { id: 'C', text: 'Ion Kalium (K⁺), Magnesium (Mg²⁺), dan Kalsium (Ca²⁺)' },
      { id: 'D', text: 'Ion karbonat (CO₃²⁻) dan nitrit (NO₂⁻)' },
    ],
    correctAnswer: 'C',
    explanation: 'Contoh ion positif yang ada dalam tanah sebagai nutrisi tanaman yaitu ion Kalium (K+), Magnesium (Mg2+), dan Kalsium (Ca2+). Sedangkan ion negatifnya antara lain ion nitrat (NO3-) dan fosfat (PO4 2-).',
    points: 5,
    orderIndex: 4,
  },
  {
    id: 'q-fp-5',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Menurut Ngadisih (2020), istilah "lahan" lebih tepat digunakan dalam agribisnis dibanding "tanah" karena memiliki makna yang lebih luas, yaitu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Permukaan batuan keras yang tidak dapat ditumbuhi tanaman' },
      { id: 'B', text: 'Lingkungan fisik (abiotik) dan biotik berkaitan dengan daya dukung untuk kehidupan dan kesejahteraan manusia' },
      { id: 'C', text: 'Tanah garapan yang hanya boleh ditanami tanaman pangan semusim' },
      { id: 'D', text: 'Lapisan terluar bumi yang khusus diperuntukkan bagi permukiman dan perkotaan' },
    ],
    correctAnswer: 'B',
    explanation: 'Menurut Ngadisih (2020), lahan adalah lingkungan fisik (abiotik) dan biotik berkaitan dengan daya dukung untuk kehidupan dan kesejahteraan manusia.',
    points: 5,
    orderIndex: 5,
  },
  {
    id: 'q-fp-6',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Seluruh tenaga kerja yang terdapat di dalam lingkungan keluarga petani itu sendiri, baik berupa tenaga manusia, ternak, maupun tenaga mesin disebut...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Tenaga Kerja Luar Keluarga (TKLK / hired labour)' },
      { id: 'B', text: 'Tenaga Kerja Borongan Musiman' },
      { id: 'C', text: 'Tenaga Kerja Dalam Keluarga (TKDK / family labour)' },
      { id: 'D', text: 'Tenaga Kerja Alih Daya (outsourcing)' },
    ],
    correctAnswer: 'C',
    explanation: 'Tenaga Kerja Dalam Keluarga (family labour)/TKDK adalah seluruh tenaga kerja yang berasal dan terdapat dalam keluarga petani, baik tenaga manusia, ternak, maupun mesin.',
    points: 5,
    orderIndex: 6,
  },
  {
    id: 'q-fp-7',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Satuan yang digunakan dalam analisis kebutuhan tenaga kerja usaha tani adalah Hari Orang Kerja (HOK). Ketentuan umum 1 HOK usaha tani dihitung setara...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: '6 jam kerja per hari tanpa istirahat' },
      { id: 'B', text: '7 jam kerja per hari termasuk 30 menit istirahat' },
      { id: 'C', text: '8 jam per hari, sudah termasuk dengan waktu istirahat selama 1 jam' },
      { id: 'D', text: '10 jam per hari termasuk lembur dan makan malam' },
    ],
    correctAnswer: 'C',
    explanation: 'Sesuai buku siswa Bab IV, umumnya 1 HOK usaha tani dihitung 8 jam per hari, sudah termasuk dengan waktu istirahat selama 1 jam.',
    points: 5,
    orderIndex: 7,
  },
  {
    id: 'q-fp-8',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Barang-barang modal yang digunakan dalam proses produksi yang dapat digunakan beberapa kali dan mengalami perhitungan penyusutan nilai setiap masa produksi disebut...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Modal bergerak (modal lancar)' },
      { id: 'B', text: 'Modal tetap (barang modal riil / investasi)' },
      { id: 'C', text: 'Modal operasional kas kecil' },
      { id: 'D', text: 'Modal pinjaman konsumtif' },
    ],
    correctAnswer: 'B',
    explanation: 'Modal tetap adalah barang modal yang dapat digunakan beberapa kali dalam proses produksi dan nilainya menyusut setiap masa produksi, contohnya bangunan farm, traktor, dan mesin pertanian.',
    points: 5,
    orderIndex: 8,
  },
  {
    id: 'q-fp-9',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Manakah kelompok sarana produksi berikut yang seluruhnya tergolong ke dalam modal bergerak (modal yang habis dalam satu kali masa produksi)?',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Traktor roda empat, mobil pick-up, dan cangkul' },
      { id: 'B', text: 'Gudang penyimpanan, instalasi irigasi, dan tandon air' },
      { id: 'C', text: 'Benih/bibit, pupuk tanaman, pestisida, dan bahan bakar mesin' },
      { id: 'D', text: 'Lahan sawah, sertifikat tanah, dan bangunan perontok padi' },
    ],
    correctAnswer: 'C',
    explanation: 'Modal bergerak adalah modal yang habis dalam satu kali siklus produksi. Contohnya adalah benih/bibit, pupuk, pestisida, dan bahan bakar untuk operasional mesin.',
    points: 5,
    orderIndex: 9,
  },
  {
    id: 'q-fp-10',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Peran utama faktor keahlian (skill) atau kecakapan tata laksana/kewirausahaan (entrepreneurship) dalam produksi tanaman adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Menggantikan seluruh tenaga kerja manusia dengan sistem robotik' },
      { id: 'B', text: 'Menyimpan modal uang tunai sebanyak-banyaknya di bank' },
      { id: 'C', text: 'Mengelola dan mengombinasikan faktor tanah, tenaga kerja, dan modal agar berfungsi optimum' },
      { id: 'D', text: 'Membeli sarana produksi pertanian impor dengan harga paling mahal' },
    ],
    correctAnswer: 'C',
    explanation: 'Faktor keahlian diperlukan untuk mengelola atau mengombinasikan faktor produksi tanah, tenaga kerja, dan modal agar seluruh faktor produksi tersebut berfungsi optimum.',
    points: 5,
    orderIndex: 10,
  },
  {
    id: 'q-fp-11',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Pertanian berkelanjutan adalah sebuah sistem usaha tani menyeluruh (holistik) yang harus memenuhi empat kriteria, yaitu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Aspek modernisasi, mekanisasi, komersialisasi, dan industrialisasi' },
      { id: 'B', text: 'Aspek ekonomi, ekologi, sosial, dan budaya' },
      { id: 'C', text: 'Aspek kimia sintetis, biologi murni, fisika terapan, dan geologi' },
      { id: 'D', text: 'Aspek subsidi pemerintah, pasar bebas, monopoli, dan ekspor' },
    ],
    correctAnswer: 'B',
    explanation: 'Empat kriteria pertanian berkelanjutan adalah: 1. Aspek ekonomi (menguntungkan), 2. Aspek ekologi (ramah lingkungan), 3. Aspek sosial (berkeadilan & diterima masyarakat), dan 4. Aspek budaya (cocok kultural & mudah dilakukan).',
    points: 5,
    orderIndex: 11,
  },
  {
    id: 'q-fp-12',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Metode System of Rice Intensification (SRI) pada budi daya padi organik menerapkan konsep pertanian berkelanjutan berbasis kearifan lokal karena mampu...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Menggunakan pupuk kimia sintetis berkonsentrasi tinggi' },
      { id: 'B', text: 'Menggenangi sawah secara permanen sedalam 50 cm' },
      { id: 'C', text: 'Menghemat penggunaan air, memulihkan sifat tanah, dan mensubstitusi pupuk kimia dengan pupuk organik' },
      { id: 'D', text: 'Menyemprotkan insektisida kimia setiap hari secara rutin' },
    ],
    correctAnswer: 'C',
    explanation: 'Metode SRI dapat menghemat penggunaan air, memperbaiki sifat fisik dan kimia tanah, memulihkan ekosistem, serta mensubstitusi pupuk anorganik dengan pupuk organik kotoran hewan.',
    points: 5,
    orderIndex: 12,
  },
  {
    id: 'q-fp-13',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Dalam Pengendalian Hama Terpadu (PHT), serangga Trichogramma sp. dimanfaatkan sebagai agen pengendalian hayati yang bertindak sebagai...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Pemakan daun gulma teki' },
      { id: 'B', text: 'Musuh alami parasit telur dan parasit larva hama penggerek batang' },
      { id: 'C', text: 'Pembusuk sisa jerami padi di lahan basah' },
      { id: 'D', text: 'Penyerbuk bunga tanaman jagung hibrida' },
    ],
    correctAnswer: 'B',
    explanation: 'Sesuai buku teks Bab IV, Trichogramma sp. merupakan musuh alami berupa agen pengendali hayati yang memparasit telur dan larva hama penggerek batang tanaman.',
    points: 5,
    orderIndex: 13,
  },
  {
    id: 'q-fp-14',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Dalam konsep Pengendalian Hama Terpadu (PHT), istilah "Ambang Ekonomi (AE)" didefinisikan sebagai...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Kondisi saat lahan pertanian telah kehilangan seluruh hasil panennya' },
      { id: 'B', text: 'Kepadatan populasi hama yang memerlukan tindakan pengendalian untuk mencegah timbulnya kerugian ekonomi' },
      { id: 'C', text: 'Jumlah minimal pupuk anorganik yang wajib dibeli oleh petani per musim' },
      { id: 'D', text: 'Harga pasar terendah komoditas pertanian yang menyebabkan petani merugi' },
    ],
    correctAnswer: 'B',
    explanation: 'Ambang Ekonomi (AE) adalah kepadatan populasi hama yang memerlukan tindakan pengendalian untuk mencegah terjadinya peningkatan populasi dan kerugian ekonomi.',
    points: 5,
    orderIndex: 14,
  },
  {
    id: 'q-fp-15',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Rorak atau parit buntu adalah teknik konservasi tanah dan air berupa pembuatan lubang buntu (ukuran 100 cm x 40 cm x 40 cm) yang berfungsi untuk...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Saluran pembuangan air limbah cair pestisida secara langsung ke sungai' },
      { id: 'B', text: 'Meresapkan air ke tanah dan menampung sedimen tanah dari bidang olah' },
      { id: 'C', text: 'Tempat pembakaran jerami dan sampah anorganik sisa budi daya' },
      { id: 'D', text: 'Jalur lintasan roda traktor pembajak sawah' },
    ],
    correctAnswer: 'B',
    explanation: 'Rorak berfungsi untuk meresapkan air ke tanah dan menampung sedimen tanah dari bidang olah, sehingga efektif menekan aliran permukaan dan erosi tanah.',
    points: 5,
    orderIndex: 15,
  },
  {
    id: 'q-fp-16',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Lubang resapan biopori dibuat sedalam 80-100 cm dengan diameter 10-30 cm dan diisi sampah organik. Prinsip kerja biopori adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Menghalangi perakaran tanaman agar tidak berkembang terlalu dalam' },
      { id: 'B', text: 'Memicu biota tanah seperti cacing dan serangga untuk membuat rongga lubang resapan di dalam tanah' },
      { id: 'C', text: 'Mengalirkan air tanah ke permukaan secara gravitasi' },
      { id: 'D', text: 'Membunuh mikroorganisme tanah agar tanah steril dari jamur' },
    ],
    correctAnswer: 'B',
    explanation: 'Sampah organik di dalam biopori memicu biota tanah (cacing, serangga, akar) untuk membuat rongga-rongga lubang alami di dalam tanah yang meningkatkan resapan air.',
    points: 5,
    orderIndex: 16,
  },
  {
    id: 'q-fp-17',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Pada sistem agroforestri (wanatani), keanekaragaman tanaman membentuk stratifikasi tajuk berlapis ke arah vertikal (Stratum A hingga E). Manfaat utama tajuk bertingkat ini adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Melindungi tanah dari hempasan langsung butiran air hujan sehingga menekan erosi' },
      { id: 'B', text: 'Menghentikan sirkulasi udara di bawah kanopi hutan' },
      { id: 'C', text: 'Menghilangkan kebutuhan tanaman terhadap air hujan dan embun' },
      { id: 'D', text: 'Membuat tanah menjadi lebih cepat kering dan tandus' },
    ],
    correctAnswer: 'A',
    explanation: 'Stratifikasi tajuk berlapis (Stratum A sampai E) berfungsi sebagai peredam yang melindungi permukaan tanah dari hempasan langsung tetesan air hujan sehingga mencegah erosi.',
    points: 5,
    orderIndex: 17,
  },
  {
    id: 'q-fp-18',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Menurut Sulaiman (2007), empat prinsip yang melandasi pelaksanaan sistem pertanian organik adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Prinsip ekologi, prinsip kesehatan, prinsip keadilan, dan prinsip perlindungan' },
      { id: 'B', text: 'Prinsip efisiensi biaya, mekanisasi, rekayasa genetika, dan komersialisasi' },
      { id: 'C', text: 'Prinsip monokultur, intensifikasi lahan, pemupukan kimia, dan proteksi pestisida' },
      { id: 'D', text: 'Prinsip pasar ekspor, laba maksimal, deregulasi, dan substitusi impor' },
    ],
    correctAnswer: 'A',
    explanation: 'Empat prinsip pertanian organik menurut Sulaiman (2007) meliputi: 1. Prinsip ekologi, 2. Prinsip kesehatan, 3. Prinsip keadilan, dan 4. Prinsip perlindungan.',
    points: 5,
    orderIndex: 18,
  },
  {
    id: 'q-fp-19',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Pertanian regeneratif berupaya merehabilitasi dan meningkatkan kesehatan ekosistem tanah. Mekanisme utama pertanian regeneratif adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Membakar jerami sisa panen untuk mempercepat siklus penanaman kembali' },
      { id: 'B', text: 'Mengikat kembali karbon yang ada di atmosfer ke dalam tanah melalui fotosintesis dan pemberian makan mikroorganisme tanah' },
      { id: 'C', text: 'Menyemprotkan zat pengatur tumbuh sintetis berdosis ganda' },
      { id: 'D', text: 'Mengolah tanah secara intensif setiap minggu dengan bajak piring' },
    ],
    correctAnswer: 'B',
    explanation: 'Pertanian regeneratif mengembalikan kesuburan tanah dengan mengikat kembali karbon atmosfer ke dalam tanah lewat fotosintesis, di mana hasil fotosintesis (gula) diedarkan ke akar untuk mikroba tanah.',
    points: 5,
    orderIndex: 19,
  },
  {
    id: 'q-fp-20',
    quizId: 'quiz-bab-iv-pengelolaan-faktor-produksi-x',
    questionText: 'Dalam pengelolaan sumber daya manusia (SDM) pertanian, kelompok tani didampingi oleh penyuluh menyusun RDK dan RDKK. Kepanjangan dari RDK dan RDKK adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Rencana Distribusi Kelompok dan Rencana Distribusi Kebutuhan Kas' },
      { id: 'B', text: 'Rencana Definitif Kelompok dan Rencana Definitif Kebutuhan Kelompok Tani' },
      { id: 'C', text: 'Rancangan Dana Kerja dan Rancangan Dana Kegiatan Kelompok Tani' },
      { id: 'D', text: 'Rencana Daerah Khusus dan Rencana Distribusi Komoditas Khusus' },
    ],
    correctAnswer: 'B',
    explanation: 'RDK adalah Rencana Definitif Kelompok, sedangkan RDKK adalah Rencana Definitif Kebutuhan Kelompok Tani, yaitu rencana yang disusun kelompok tani bersama penyuluh untuk kebutuhan sarana produksi dan budi daya.',
    points: 5,
    orderIndex: 20,
  },
  ...HIDROPONIK_XI_QUESTIONS,
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-rizky-1',
    quizId: 'quiz-dasar-hidroponik',
    quizTitle: 'Evaluasi Pembelajaran: Prinsip Hidroponik & Nutrisi Tanaman',
    studentId: 'usr-student-rizky',
    studentName: 'Rizky Pratama',
    className: 'X ATPH',
    startedAt: '2026-08-04T13:00:00Z',
    completedAt: '2026-08-04T13:14:20Z',
    answers: [
      { questionId: 'q-1', userAnswer: 'B', isCorrect: true, pointsAwarded: 20 },
      { questionId: 'q-2', userAnswer: 'B', isCorrect: true, pointsAwarded: 20 },
      { questionId: 'q-3', userAnswer: 'true', isCorrect: true, pointsAwarded: 20 },
      { questionId: 'q-4', userAnswer: 'B', isCorrect: true, pointsAwarded: 20 },
      { questionId: 'q-5', userAnswer: 'A', isCorrect: true, pointsAwarded: 20 },
    ],
    score: 100,
    maxScore: 100,
    percentage: 100,
    passed: true,
    attemptNumber: 1,
  },
];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    id: 'grd-rizky',
    studentId: 'usr-student-rizky',
    studentName: 'Rizky Pratama',
    nisn: '0078129381',
    classId: 'cls-10-atph',
    className: 'X ATPH',
    assignmentAverage: 92,
    quizAverage: 100,
    finalScore: 96,
    status: 'Tuntas',
    notes: 'Sangat kompeten dalam penyiapan nutrisi dan pengoperasian hidroponik NFT.',
  },
  {
    id: 'grd-siti',
    studentId: 'usr-student-siti',
    studentName: 'Siti Rahmawati',
    nisn: '0078129382',
    classId: 'cls-10-atph',
    className: 'X ATPH',
    assignmentAverage: 88,
    quizAverage: 80,
    finalScore: 84,
    status: 'Tuntas',
    notes: 'Pemahaman konsep dasar baik, aktif dalam praktik lapangan.',
  },
  {
    id: 'grd-dimas',
    studentId: 'usr-student-dimas',
    studentName: 'Dimas Anggoro',
    nisn: '0068129401',
    classId: 'cls-11-atph',
    className: 'XI ATPH',
    assignmentAverage: 85,
    quizAverage: 82,
    finalScore: 83.5,
    status: 'Tuntas',
    notes: 'Keterampilan budidaya cabai sangat baik.',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-praktik-lapangan',
    title: 'Jadwal Praktik Persemaian Tanaman Sayuran di Greenhouse Utama',
    content: `
Diberitahukan kepada seluruh siswa kelas X ATPH:
Praktik persemaian benih cabai dan selada akan dilaksanakan pada hari Rabu pukul 08.00 WIB. 
Harap membawa kelengkapan:
1. Pakaian kerja lapangan (wearpack ATPH)
2. Sepatu boots & sarung tangan berkebun
3. Spidol permanen & buku catatan logbook
Keterlambatan lebih dari 15 menit tidak diperkenankan memasuki area greenhouse steril.
    `,
    targetClassId: 'cls-10-atph',
    targetClassName: 'X ATPH',
    priority: 'important',
    isPublished: true,
    authorName: 'Okta Nofiyanto',
    createdAt: '2026-08-12T07:30:00Z',
  },
  {
    id: 'anc-evaluasi-tengah-semester',
    title: 'Pengumuman Pelaksanaan Evaluasi Teori ATPH Semester Ganjil',
    content: 'Evaluasi online akan dibuka serentak pada portal EduATPH mulai hari Senin pukul 09.00 WIB. Pastikan baterai laptop/ponsel terisi penuh dan koneksi internet stabil.',
    targetClassId: 'all',
    targetClassName: 'Semua Kelas',
    priority: 'normal',
    isPublished: true,
    authorName: 'Okta Nofiyanto',
    createdAt: '2026-08-10T11:00:00Z',
  },
];
