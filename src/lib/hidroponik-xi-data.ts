import { TeachingMaterial, Quiz, QuizQuestion } from '@/types';

export const HIDROPONIK_XI_MATERIAL: TeachingMaterial = {
  id: 'mat-hidroponik-xi',
  title: 'Teknologi Budidaya Tanaman Sistem Hidroponik (Kelas XI SMK ATPH)',
  slug: 'teknologi-budidaya-tanaman-sistem-hidroponik-kelas-xi',
  description:
    'Modul lengkap pembelajaran Hidroponik Kelas XI SMK ATPH mencakup Materi Pembelajaran (Fisiologi Rizosfer, Media Inert, Sistem Wick, Rakit Apung, NFT, DFT, Drip Fertigasi, Ebb & Flow, Aeroponik, Kimia AB Mix, Parameter pH/EC/DO, & Diagnosis Masalah), Rangkuman, Glosarium, dan Daftar Pustaka beserta dokumen PDF.',
  categoryId: 'cat-9',
  categoryName: 'Sistem Hidroponik',
  targetClassId: 'cls-xi-at-1',
  targetClassName: 'XI ATPH',
  topic: 'Sistem Hidroponik, Nutrisi AB Mix, Parameter pH/EC/DO, dan Pemecahan Masalah',
  learningObjectives: [
    'Menganalisis prinsip fisiologi perakaran hidroponik meliputi ketersediaan air, ion hara terlarut, dan oksigen terlarut (Dissolved Oxygen/DO)',
    'Membedakan karakteristik media tanam hidroponik inert (rockwool, hydroton, perlite) dan media organik (cocopeat, arang sekam)',
    'Membandingkan konstruksi, cara kerja, keunggulan, dan kelemahan sistem Wick, Rakit Apung, NFT, DFT, Drip System (Fertigasi), Ebb & Flow, serta Aeroponik',
    'Menjelaskan reaksi kimia presipitasi pada pencampuran pekatan AB Mix (Stok A dan Stok B) serta prosedur pengendalian pH (5,5–6,5), EC/TDS, dan suhu larutan (<28°C)',
    'Mendiagnosis dan memecahkan masalah fisiologis maupun patologis pada tanaman hidroponik (etiolasi, tipburn, klorosis hara, dan busuk akar Pythium sp.)',
  ],
  content: `
# MODUL PEMBELAJARAN KEJURUAN SMK ATPH KELAS XI (FASE F)
## TEKNOLOGI BUDIDAYA TANAMAN SISTEM HIDROPONIK

---

## BAGIAN 1: MATERI PEMBELAJARAN

### 1.1 Konsep Dasar dan Fisiologi Budidaya Hidroponik
**Hidroponik** (berasal dari bahasa Yunani: *hydro* = air, dan *ponos* = daya atau kerja) adalah teknologi budidaya tanaman tanpa menggunakan tanah sebagai media tumbuh (*soilless culture*), melainkan memanfaatkan air yang diperkaya dengan larutan unsur hara mineral esensial dalam takaran yang presisi. Dalam sistem budidaya konvensional, tanah berfungsi sebagai penyangga mekanis tegaknya tanaman serta gudang penyimpan air dan hara. Apabila kebutuhan air, ion mineral terlarut, oksigen terlarut, dan penopang fisik akar dapat dipenuhi secara terkontrol pada zona perakaran (**rizosfer**), tanaman dapat tumbuh lebih cepat, seragam, dan produktif tanpa tanah.

Tiga pilar fisiologi utama pada zona perakaran hidroponik adalah:
- **Ketersediaan Air dan Ion Hara Terlarut:** Unsur hara diberikan langsung dalam bentuk ion anorganik terlarut (seperti NO₃⁻, NH₄⁺, H₂PO₄⁻, K⁺, Ca²⁺, Mg²⁺, SO₄²⁻) sehingga rambut akar dapat menyerapnya secara langsung tanpa menunggu proses dekomposisi mikrobiologis tanah.
- **Ketersediaan Oksigen Terlarut (*Dissolved Oxygen* / DO):** Akar tanaman membutuhkan respirasi aerobik untuk menghasilkan energi metabolisme (ATP) guna melakukan penyerapan hara aktif melawan gradien konsentrasi. Kadar DO ideal dalam larutan nutrisi adalah **5 – 8 mg/L (ppm)**. Jika DO turun di bawah 3 mg/L (kondisi hipoksia), penyerapan hara terhenti dan akar membusuk.
- **Stabilitas Suhu dan Derajat Keasaman (pH) Rizosfer:** Menjaga kelarutan ion hara dan mencegah perkembangan patogen tular air.

---

### 1.2 Karakteristik Media Tanam Hidroponik (Media Inert & Substrat)
Media tanam hidroponik yang baik harus bersifat **inert** (tidak bereaksi kimiawi mengubah pH maupun komposisi larutan nutrisi dan tidak mudah melapuk), memiliki keseimbangan porositas (aerasi udara) serta daya simpan air (*Water Holding Capacity* / WHC), bebas patogen (steril), dan ringan:

| Jenis Media | Asal Bahan | Karakteristik Fisik & Kimia | Penggunaan Utama |
|---|---|---|---|
| **Rockwool** | Serat batuan basalt vulkanik yang dilelehkan pada suhu 1.600°C | Porositas ~95%, daya pegang air ~80%, steril, ringan, pH cenderung agak basa di awal (perlu pembasahan air bersih) | Standar utama persemaian & budidaya sayuran daun (selada, pakcoy, sawi, kangkung) pada sistem NFT/DFT/Rakit Apung |
| **Hydroton** (*Expanded Clay*) | Pelet tanah liat yang dipanaskan suhu tinggi hingga mengembang berpori | Bentuk bulat, pH netral (7,0), aerasi sangat tinggi, kuat, dapat dicuci dan disterilisasi untuk dipakai berulang kali | Sistem *Dutch Bucket*, *Ebb & Flow*, dan aquaponik |
| **Cocopeat** | Serbuk halus sabut kelapa | Daya simpan air (WHC) sangat tinggi (6–8 kali bobotnya), namun mengandung **zat tanin** (penghambat tumbuh) serta garam K/Cl tinggi sehingga **wajib dicuci/direndam berulang** sebelum dipakai | Campuran media polybag pada sistem *Drip Irrigation* (Fertigasi) tanaman buah |
| **Arang Sekam** | Pembakaran tidak sempurna sekam padi (karbonisasi) | Porositas tinggi, ringan, steril dari patogen, pH 6,5–7,0, meningkatkan aerasi bila dicampur cocopeat (rasio 1:1) | Media substrat fertigasi cabai, melon, tomat, dan paprika |
| **Perlite & Vermiculite** | Batuan silika vulkanik & mineral mika yang dipanaskan | Sangat ringan, steril, perlite unggul dalam drainase/aerasi sedangkan vermiculite unggul menahan air dan kation | Campuran persemaian benih bernilai ekonomi tinggi |

---

### 1.3 Klasifikasi Sistem Instalasi Hidroponik
Berdasarkan mekanisme pemberian larutan nutrisi dan aerasi oksigen, sistem hidroponik dibagi menjadi 7 tipe utama:

1. **Sistem Sumbu (*Wick System*):**
   - **Prinsip Kerja:** Sistem hidroponik pasif paling sederhana tanpa pompa listrik. Larutan nutrisi ditarik dari bak penampung ke media tanam di netpot memanfaatkan **gaya kapilaritas** melalui sumbu (kain flanel).
   - **Keunggulan & Kelemahan:** Biaya murah dan tidak bergantung listrik, namun suplai oksigen terlarut rendah dan berisiko terjadi akumulasi garam mineral karena larutan tidak bersirkulasi.

2. **Sistem Rakit Apung (*Water Culture / Floating Raft System*):**
   - **Prinsip Kerja:** Netpot berisi tanaman dipasang pada lubang lembaran styrofoam yang mengapung langsung di atas kolam larutan nutrisi.
   - **Keunggulan & Kelemahan:** Suhu larutan stabil karena volume air besar; namun **wajib dilengkapi aerator** (pompa udara + batu aerasi) atau sirkulasi venturi untuk menyuplai oksigen terlarut (DO).

3. **Sistem NFT (*Nutrient Film Technique*):**
   - **Prinsip Kerja:** Akar tanaman tumbuh pada lapisan aliran larutan nutrisi yang **sangat tipis (1 – 3 mm)** menyerupai film di dasar talang (*gully*) miring yang bersirkulasi terus-menerus selama 24 jam.
   - **Spesifikasi Teknis:** Kemiringan talang diatur **1% – 5%** (umumnya **2% – 3%**, artinya turun 2–3 cm setiap 1 meter panjang talang) dengan debit aliran **1 – 2 liter/menit** per talang.
   - **Keunggulan:** Bagian atas massa akar berada di ruang udara lembap sehingga memperoleh pasokan oksigen bebas yang melimpah, sedangkan bagian bawah menyerap nutrisi.
   - **Kelemahan Kritis:** Sangat bergantung pada aliran listrik dan keandalan pompa. Jika listrik padam lebih dari 2–4 jam pada siang hari terik, tidak ada cadangan air di dasar talang sehingga akar cepat mengering dan tanaman mengalami kelayuan permanen.

4. **Sistem DFT (*Deep Flow Technique*):**
   - **Prinsip Kerja:** Mirip dengan NFT, namun konstruksi ujung *outlet* pipa/talang diberi penyekat (*elbow* ditinggikan) sehingga menahan **genangan larutan nutrisi sedalam 3 – 5 cm** di dalam talang.
   - **Keunggulan Utama:** Saat listrik padam atau pompa mati, akar tanaman tetap terendam cadangan larutan nutrisi sehingga aman dari kekeringan mendadak.

5. **Sistem Irigasi Tetes (*Drip System / Fertigasi*):**
   - **Prinsip Kerja:** Larutan nutrisi dari tandon dipompa melalui pipa utama, pipa lateral PE, selang mikro (*spaghetti tube*), dan penetes (*dripper/emitter* terkalibrasi, misal 2 liter/jam) langsung ke pangkal akar tanaman di dalam polybag atau *Dutch Bucket* berisi media substrat (cocopeat + arang sekam atau hydroton).
   - **Peruntukan:** Standar utama untuk tanaman sayuran buah berumur panjang dan berperakaran besar seperti **melon, tomat, cabai, paprika, dan mentimun Jepang (*kyuri*)**.

6. **Sistem Pasang Surut (*Ebb and Flow / Flood and Drain*):**
   - **Prinsip Kerja:** Meja/bak tanam dibanjiri larutan nutrisi menggunakan pompa ber-*timer* selama beberapa menit (**fase pasang**), lalu pompa berhenti dan air surut kembali ke tandon (**fase surut**). Saat air surut, udara segar kaya oksigen tersedot masuk ke rongga perakaran.

7. **Sistem Aeroponik:**
   - **Prinsip Kerja:** Akar tanaman menggantung bebas di udara dalam ruang gelap tertutup dan disemprot **kabut nutrisi berukuran mikro (*fine mist*)** secara berkala melalui *nozzle* bertekanan tinggi.
   - **Keunggulan & Kelemahan:** Penyerapan oksigen dan hara paling cepat (sangat cocok untuk produksi benih kentang G0 dan sayuran daun premium), namun biaya investasi tinggi dan sangat rawan gagal jika *nozzle* tersumbat endapan garam atau listrik padam.

---

### 1.4 Manajemen Larutan Nutrisi AB Mix dan Kimia Presipitasi Hara
Tanaman membutuhkan 16 unsur hara esensial: C, H, O (dari udara dan air), **6 Unsur Hara Makro** (**N, P, K, Ca, Mg, S**), serta **7 Unsur Hara Mikro** (**Fe, Mn, Zn, B, Cu, Mo, Cl**).

#### Mengapa Pekatan Pupuk AB Mix Harus Dipisah Menjadi Stok A dan Stok B?
- **Kandungan Stok A:** Kalsium Nitrat [Ca(NO₃)₂], Kalium Nitrat (KNO₃), dan Besi Khelat (Fe-EDTA / Fe-DTPA).
- **Kandungan Stok B:** Kalium Dihidrogen Fosfat (KH₂PO₄), Magnesium Sulfat (MgSO₄ / garam Inggris), Kalium Sulfat (K₂SO₄), Amonium Sulfat, serta unsur mikro (Mn, Zn, B, Cu, Mo).
- **Alasan Kimiawi (Reaksi Presipitasi):** Apabila larutan pekat Stok A dan Stok B dicampur langsung tanpa diencerkan air terlebih dahulu, kation **Kalsium (Ca²⁺)** berkonsentrasi tinggi pada Stok A akan bereaksi langsung dengan anion **Sulfat (SO₄²⁻)** pada Stok B membentuk endapan kristal putih **Kalsium Sulfat (CaSO₄ / gipsum)**, serta bereaksi dengan anion **Fosfat (PO₄³⁻)** membentuk endapan **Kalsium Fosfat [Ca₃(PO₄)₂]**. Endapan ini bersifat tidak larut dalam air, tidak dapat diserap oleh akar tanaman (memicu defisiensi Ca, S, dan P), serta menyumbat pipa dan *emitter*.

#### Prosedur Pembuatan Larutan Siap Pakai di Tandon:
1. Isi tandon dengan air baku bersih ber-TDS rendah (< 100–150 ppm).
2. Tuangkan pekatan **Stok A** sesuai dosis (misal 5 mL/liter air) ke dalam air tandon, lalu **aduk hingga homogen**.
3. Tuangkan pekatan **Stok B** dengan volume yang sama (5 mL/liter air) ke dalam tandon, lalu **aduk kembali hingga merata**.
4. Ukur kepekatan akhir dengan **EC/TDS meter** dan periksa derajat keasaman dengan **pH meter**.

---

### 1.5 Pengendalian Parameter Lingkungan (pH, EC/TDS, Suhu, & DO)
1. **Derajat Keasaman (pH):**
   - Rentang pH ideal larutan hidroponik adalah **5,5 – 6,5**.
   - **Dampak pH Terlalu Tinggi / Basa (> 7,0):** Unsur hara mikro terutama **Besi (Fe), Mangan (Mn), Boron (B), Seng (Zn)** serta hara makro **Fosfor (P) dan Kalsium (Ca)** mengalami pengendapan (presipitasi) sehingga tidak dapat diserap akar. Akibatnya daun muda mengalami **klorosis interveinal** (menguning di antara tulang daun) meskipun nilai EC larutan tinggi.
   - **Dampak pH Terlalu Rendah / Asam (< 4,5):** Keracunan ion H⁺, kerusakan dinding sel rambut akar, dan terhambatnya serapan Kalsium/Magnesium.
   - **Koreksi pH:** Jika pH > 6,5 diturunkan dengan larutan **pH Down** (**Asam Fosfat / H₃PO₄** atau **Asam Nitrat / HNO₃** encer). Jika pH < 5,5 dinaikkan dengan larutan **pH Up** (**Kalium Hidroksida / KOH**).

2. **Kepekatan Larutan Nutrisi (EC dan TDS/PPM):**
   - **EC (*Electrical Conductivity*)** mengukur daya hantar listrik ion mineral terlarut dalam satuan **mS/cm** atau **μS/cm**, sedangkan **TDS (*Total Dissolved Solids*)** menunjukkan kepekatan dalam satuan **ppm** (1 mS/cm ≈ 500 ppm skala NaCl atau ≈ 700 ppm skala 442).
   - **Standar EC Berdasarkan Fase Pertumbuhan:**
     - Fase Persemaian / Bibit Muda (0–10 HSS): **0,5 – 0,8 mS/cm (300 – 500 ppm)**.
     - Sayuran Daun (Selada, Pakcoy, Sawi) Fase Vegetatif: **1,2 – 1,8 mS/cm (600 – 1.100 ppm)**.
     - Sayuran Buah (Melon, Tomat, Cabai) Fase Vegetatif–Generatif: **2,0 – 4,0 mS/cm (1.200 – 2.500 ppm)**.
   - **Dinamika Cuaca Panas:** Saat siang hari terik dan suhu tinggi, laju transpirasi meningkat sehingga tanaman menyerap molekul air jauh lebih banyak daripada ion garam. Akibatnya volume air tandon berkurang dan **nilai EC di tandon meningkat (larutan makin pekat)**. Tindakan koreksi yang benar adalah **menambahkan air baku bersih** ke dalam tandon hingga nilai EC kembali ke standar.

3. **Suhu Larutan dan Oksigen Terlarut (DO):**
   - Suhu larutan nutrisi ideal dijaga pada kisaran **22°C – 28°C**.
   - Jika suhu larutan naik di atas **30°C**, kelarutan gas oksigen (DO) di dalam air turun drastis di bawah 4 mg/L, sedangkan laju respirasi akar meningkat. Kondisi kekurangan oksigen dan air hangat memicu ledakan infeksi patogen *oomycetes* **_Pythium_ sp.** penyebab penyakit **busuk akar (*root rot*)**.

---

### 1.6 Tahapan Operasional Budidaya & Diagnosis Pemecahan Masalah
1. **Persemaian dan Pencegahan Etiolasi:**
   - Benih disemai pada rockwool lembap. Segera setelah benih pecah kecambah (*sprout* / 1–2 hari), nampan semai **wajib dikenakan sinar matahari pagi**. Keterlambatan pemberian cahaya menyebabkan **etiolasi** (batang hipokotil memanjang kurus, rapuh, pucat, dan rebah).
2. **Pindah Tanam (*Transplanting*):**
   - Dilakukan saat bibit berumur **10–14 HSS** dengan ciri memiliki **3–4 helai daun sejati** dan akar putih sehat telah menembus bagian bawah rockwool.
3. **Diagnosis Gangguan Fisiologis dan Patologis:**
   - ***Tipburn* (Tepi Daun Muda Terbakar/Kecokelatan pada Selada):** Gangguan fisiologis akibat **defisiensi Kalsium (Ca) lokal** pada jaringan daun pucuk yang sedang tumbuh cepat. Kalsium bersifat *immobile* dan diangkut bersama aliran transpirasi (*xylem*). Jika suhu udara greenhouse terlalu panas, kelembapan udara jenuh/stagnan (angin tidak bergerak), atau EC terlalu tinggi, maka aliran transpirasi ke daun pucuk terhambat sehingga sel tepi daun kolaps dan menghitam. Solusi: nyalakan kipas sirkulasi udara (*exhaust/circulation fan*), pasang *shading net* (paranet), jaga EC optimal, dan pastikan pasokan Ca cukup.
   - **Klorosis Daun Tua (Bawah):** Daun tua menguning merata dari ujung daun karena **defisiensi Nitrogen (N)**. Karena N bersifat *mobile*, tanaman memindahkan cadangan N dari daun tua ke pucuk muda.
   - **Klorosis Daun Muda (Pucuk):** Daun muda menguning sedangkan tulang daun tetap hijau karena **defisiensi Besi (Fe)**, umumnya akibat pH larutan terlalu tinggi (> 7,0).
   - **Busuk Akar (*Pythium Root Rot*):** Akar berwarna cokelat kehitaman, berlendir, mudah putus, dan tanaman layu di siang hari akibat suhu air > 30°C dan DO rendah.

---

## BAGIAN 2: RANGKUMAN

1. **Hidroponik** adalah teknologi budidaya tanaman tanpa tanah (*soilless culture*) yang memenuhi kebutuhan air, ion hara mineral esensial (AB Mix), dan oksigen terlarut (**DO 5–8 ppm**) secara presisi di zona perakaran (rizosfer).
2. **Media tanam hidroponik** harus bersifat *inert*, poros, mampu menyimpan air, dan bebas patogen; contohnya *rockwool* (persemaian sayuran daun), *hydroton* (*Dutch bucket*), serta campuran *cocopeat* bebas tanin dan arang sekam (fertigasi tanaman buah).
3. **Tujuh sistem hidroponik utama** meliputi: *Wick System* (kapilaritas sumbu), Rakit Apung (*floating raft* beraerator), **NFT** (aliran tipis 1–3 mm pada talang miring 1–5%), **DFT** (genangan 3–5 cm sebagai cadangan saat listrik padam), *Drip System*/Fertigasi (irigasi tetes untuk komoditas buah), *Ebb & Flow* (pasang surut), dan **Aeroponik** (kabut nutrisi lewat *nozzle*).
4. **Pekatan Stok A dan Stok B** pada nutrisi AB Mix tidak boleh dicampur dalam keadaan pekat karena kation **Ca²⁺** pada Stok A akan bereaksi dengan anion **SO₄²⁻** dan **PO₄³⁻** pada Stok B membentuk endapan tidak larut **Kalsium Sulfat (CaSO₄ / gipsum)** dan **Kalsium Fosfat [Ca₃(PO₄)₂]**.
5. **Parameter kritis larutan nutrisi** wajib dijaga pada **pH 5,5–6,5** (dikoreksi dengan *pH Down* H₃PO₄/HNO₃ atau *pH Up* KOH), nilai **EC sesuai fase fisiologis**, dan **suhu larutan < 28°C** guna menjaga kelarutan oksigen dan mencegah serangan jamur *_Pythium_ sp.*
6. **Masalah utama hidroponik** meliputi *etiolasi* (kurang cahaya saat kecambah), *tipburn* (defisiensi Ca lokal di daun muda akibat terhambatnya transpirasi pada suhu panas/kelembapan stagnan), klorosis Fe (pH basa > 7,0), dan busuk akar (suhu larutan panas & hipoksia).

---

## BAGIAN 3: GLOSARIUM

| Istilah Teknis | Definisi Ilmiah dan Operasional |
|---|---|
| **AB Mix** | Formula pupuk hidroponik dua bagian (Stok A berisi Ca & Fe; Stok B berisi P, S, Mg, & mikro) untuk mencegah reaksi pengendapan kimia saat penyimpanan pekatan. |
| **Aeroponik** | Sistem hidroponik di mana akar tanaman menggantung di udara tertutup dan disemprot kabut nutrisi mikro melalui *nozzle* bertekanan tinggi. |
| **DFT (*Deep Flow Technique*)** | Sistem hidroponik sirkulasi yang mempertahankan genangan larutan nutrisi sedalam 3–5 cm di dalam talang sebagai cadangan saat aliran listrik terputus. |
| **Dissolved Oxygen (DO)** | Kadar gas oksigen terlarut di dalam larutan nutrisi (satuan mg/L atau ppm) yang dibutuhkan bagi respirasi aerobik sel-sel akar tanaman. |
| **EC (*Electrical Conductivity*)** | Daya hantar listrik larutan nutrisi (mS/cm atau μS/cm) yang berbanding lurus dengan konsentrasi total ion garam mineral terlarut. |
| **Etiolasi** | Pertumbuhan bibit yang abnormal (batang memanjang kurus, lemah, pucat) akibat kekurangan intensitas cahaya matahari setelah benih berkecambah. |
| **Fertigasi (*Drip System*)** | Aplikasi pemupukan (*fertilization*) yang diintegrasikan bersama air irigasi tetes (*drip irrigation*) langsung ke zona perakaran tanaman. |
| **Media Inert** | Media tanam yang stabil secara fisik dan kimiawi serta tidak mengubah pH atau kandungan hara larutan nutrisi (contoh: *rockwool*, *hydroton*, *perlite*). |
| **NFT (*Nutrient Film Technique*)** | Sistem hidroponik resirkulasi dengan aliran larutan nutrisi sangat tipis (1–3 mm) pada talang miring (1–5%) sehingga akar memperoleh oksigen dan hara secara simultan. |
| **pH (*Potential of Hydrogen*)** | Ukuran derajat keasaman atau kebasaan larutan pada skala 0–14; rentang optimum ketersediaan hara hidroponik adalah 5,5–6,5. |
| **Presipitasi Hara** | Reaksi kimia pembentukan endapan padat yang tidak larut dalam air (seperti gipsum CaSO₄) akibat pencampuran konsentrat A dan B atau pH larutan yang terlalu basa. |
| **_Pythium_ sp.** | Mikroorganisme patogen tular air (*oomycetes*) penyebab penyakit busuk akar (*root rot*) pada instalasi hidroponik bersuhu air tinggi dan miskin oksigen. |
| **Rockwool** | Media semai hidroponik berbahan serat batuan basalt vulkanik dengan porositas (~95%) dan daya simpan air (~80%) yang sangat tinggi. |
| **Tipburn** | Gejala nekrosis (terbakar cokelat kehitaman) pada tepi daun muda selada/sawi akibat gagalnya translokasi Kalsium (Ca) ketika laju transpirasi terhambat. |
| **Wick System** | Sistem hidroponik pasif tanpa pompa yang menyalurkan larutan nutrisi dari bak ke media tanam menggunakan gaya kapilaritas kain sumbu/flanel. |

---

## BAGIAN 4: DAFTAR PUSTAKA

- Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). *Buku Panduan Guru dan Siswa: Agribisnis Tanaman Pangan dan Hortikultura Kelas XI SMK/MAK (Kurikulum Merdeka Fase F)*. Jakarta: Kemendikbudristek.
- Resh, H. M. (2022). *Hydroponic Food Production: A Definitive Guidebook for the Advanced Home Gardener and the Commercial Hydroponic Grower* (8th ed.). Boca Raton: CRC Press.
- Jones, J. B. (2016). *Hydroponics: A Practical Guide for the Soilless Grower* (2nd ed.). Boca Raton: Taylor & Francis.
- Sutiyoso, Y. (2018). *Meramu Pupuk Hidroponik: Tanaman Sayur, Tanaman Buah, dan Tanaman Bunga*. Jakarta: Penebar Swadaya.
- Untung, O. (2019). *Hidroponik Sayuran Sistem NFT (Nutrient Film Technique) dan DFT untuk Skala Komersial*. Jakarta: PT AgroMedia Pustaka.
  `,
  imageUrl: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1200&q=80',
  videoUrl: 'https://www.youtube.com/embed/n3H8k3dJzQ0',
  pdfUrl: '/materials/modul-hidroponik-kelas-xi-atph.pdf',
  attachments: [
    {
      id: 'att-modul-hidroponik-xi-pdf',
      name: 'Modul_Pembelajaran_Hidroponik_Kelas_XI_SMK_ATPH.pdf',
      fileUrl: '/materials/modul-hidroponik-kelas-xi-atph.pdf',
      fileSize: '30.2 KB',
      fileType: 'pdf',
    },
  ],
  orderIndex: 1,
  status: 'published',
  createdAt: '2026-08-10T08:00:00Z',
  updatedAt: '2026-11-10T08:00:00Z',
};

export const HIDROPONIK_XI_QUIZ: Quiz = {
  id: 'quiz-hidroponik-xi',
  title: 'Evaluasi Pembelajaran: Teknologi Budidaya Tanaman Hidroponik (Kelas XI ATPH)',
  description:
    'Evaluasi komprehensif materi Hidroponik Kelas XI SMK ATPH berdasarkan PDF Modul Ajar: 10 Soal Pilihan Ganda mandiri dan terstandarisasi.',
  targetClassId: 'cls-xi-at-1',
  targetClassName: 'XI ATPH',
  topic: 'Teknologi Budidaya Tanaman Sistem Hidroponik',
  materialId: 'mat-hidroponik-xi',
  pdfUrl: '/materials/modul-hidroponik-kelas-xi-atph.pdf',
  durationMinutes: 60,
  maxAttempts: 3,
  passingScore: 75,
  isPublished: true,
  isClosed: false,
  allowStudentReview: false,
  weightsConfig: {
    mcqWeight: 100,
    essayWeight: 0,
    caseStudyWeight: 0,
  },
  questionCount: 10,
  createdAt: '2026-08-10T08:30:00Z',
};

export const HIDROPONIK_XI_QUESTIONS: QuizQuestion[] = [
  // ============================================================================
  // BAGIAN A: 10 SOAL PILIHAN GANDA (points: 1 per soal)
  // ============================================================================
  {
    id: 'q-hidro-xi-pg-1',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Media tanam hidroponik berbahan serat batuan basalt vulkanik yang dipanaskan pada suhu ~1.600°C hingga memiliki porositas ~95% dan daya pegang air ~80% serta menjadi standar persemaian sayuran daun adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Cocopeat' },
      { id: 'B', text: 'Arang sekam' },
      { id: 'C', text: 'Rockwool' },
      { id: 'D', text: 'Serbuk gergaji kayu' },
    ],
    correctAnswer: 'C',
    explanation:
      'Rockwool terbuat dari lelehan batuan basalt vulkanik pada suhu ~1.600°C yang dipintal menjadi serat dengan porositas ~95% dan daya simpan air ~80%.',
    points: 1,
    orderIndex: 1,
  },
  {
    id: 'q-hidro-xi-pg-2',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Pada instalasi hidroponik sistem NFT (Nutrient Film Technique), ketebalan aliran larutan nutrisi di dasar talang (gully) dan kemiringan talang yang ideal diatur pada kisaran...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Ketebalan aliran 1–3 mm dengan kemiringan talang 1%–5%' },
      { id: 'B', text: 'Ketebalan genangan 15–20 cm dengan kemiringan talang 0% (mendatar)' },
      { id: 'C', text: 'Ketebalan aliran 8–10 cm dengan kemiringan talang 25%–30%' },
      { id: 'D', text: 'Tanpa aliran air dengan kemiringan talang 45%' },
    ],
    correctAnswer: 'A',
    explanation:
      'Prinsip NFT mengharuskan lapisan film nutrisi sangat tipis (1–3 mm) dengan kemiringan talang 1%–5% (umumnya 2%–3%) dan debit 1–2 L/menit agar akar mendapat oksigen dan hara sekaligus.',
    points: 1,
    orderIndex: 2,
  },
  {
    id: 'q-hidro-xi-pg-3',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Keunggulan utama konstruksi sistem DFT (Deep Flow Technique) dibandingkan sistem NFT ketika terjadi pemadaman listrik di lokasi budidaya adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'DFT tidak membutuhkan pupuk AB Mix sama sekali' },
      { id: 'B', text: 'DFT menyisakan genangan larutan nutrisi sedalam 3–5 cm di dalam talang sehingga akar tidak cepat kering dan layu saat pompa mati' },
      { id: 'C', text: 'DFT dapat menyemprotkan kabut nutrisi otomatis tanpa tekanan pompa' },
      { id: 'D', text: 'DFT memiliki bobot konstruksi talang yang jauh lebih ringan karena selalu kosong dari air' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada sistem DFT, penyekat outlet menahan genangan larutan nutrisi setebal 3–5 cm di dalam pipa/talang sebagai cadangan bagi akar ketika pompa berhenti akibat listrik padam.',
    points: 1,
    orderIndex: 3,
  },
  {
    id: 'q-hidro-xi-pg-4',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Untuk membudidayakan tanaman sayuran buah berumur panjang dan berperakaran besar seperti melon, tomat, cabai, dan paprika di dalam greenhouse, sistem hidroponik yang paling sesuai diterapkan adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Sistem Sumbu (Wick System) dengan botol bekas berukuran 500 mL' },
      { id: 'B', text: 'Sistem Irigasi Tetes (Drip System / Fertigasi) menggunakan polybag/Dutch Bucket bermedia cocopeat dan arang sekam' },
      { id: 'C', text: 'Sistem Rakit Apung tanpa aerator dengan styrofoam tipis 1 cm' },
      { id: 'D', text: 'Persemaian rockwool tanpa pindah tanam hingga panen buah' },
    ],
    correctAnswer: 'B',
    explanation:
      'Tanaman buah seperti melon, cabai, dan tomat memiliki massa akar besar dan tajuk berat sehingga paling optimal dibudidayakan dengan Drip System (Fertigasi) pada media substrat cocopeat + arang sekam atau hydroton.',
    points: 1,
    orderIndex: 4,
  },
  {
    id: 'q-hidro-xi-pg-5',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Apabila larutan pekat Stok A dan larutan pekat Stok B dicampur langsung tanpa diencerkan air terlebih dahulu, reaksi kimia yang terjadi adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Terbentuknya endapan putih Kalsium Sulfat (CaSO₄ / gipsum) dan Kalsium Fosfat [Ca₃(PO₄)₂] yang tidak larut air' },
      { id: 'B', text: 'Larutan berubah menjadi gas oksigen murni yang menyuburkan daun' },
      { id: 'C', text: 'Kelarutan unsur hara meningkat dua kali lipat tanpa residu' },
      { id: 'D', text: 'Suhu larutan turun menjadi titik beku 0°C secara permanen' },
    ],
    correctAnswer: 'A',
    explanation:
      'Ion Ca²⁺ pekat dari Stok A bereaksi dengan ion SO₄²⁻ dan PO₄³⁻ pekat dari Stok B membentuk endapan Kalsium Sulfat (gipsum) dan Kalsium Fosfat yang tidak dapat diserap akar.',
    points: 1,
    orderIndex: 5,
  },
  {
    id: 'q-hidro-xi-pg-6',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Rentang derajat keasaman (pH) larutan nutrisi hidroponik yang paling optimal agar seluruh unsur hara makro dan mikro berada dalam bentuk terlarut dan siap diserap akar adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: '3,0 – 4,0' },
      { id: 'B', text: '5,5 – 6,5' },
      { id: 'C', text: '7,5 – 8,5' },
      { id: 'D', text: '9,0 – 10,5' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada pH 5,5–6,5 kelarutan ion hara makro (N, P, K, Ca, Mg, S) maupun mikro (Fe, Mn, Zn, B, Cu, Mo) berada pada zona ketersediaan optimum bagi akar tanaman.',
    points: 1,
    orderIndex: 6,
  },
  {
    id: 'q-hidro-xi-pg-7',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Jika hasil pengukuran pH larutan nutrisi di tandon menunjukkan angka 7,6 (terlalu basa), dampak fisiologis yang akan dialami tanaman serta tindakan koreksi yang tepat adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Unsur Fe, Mn, dan P mengendap sehingga daun muda klorosis; dikoreksi dengan menambahkan larutan pH Down (Asam Fosfat / H₃PO₄)' },
      { id: 'B', text: 'Unsur Nitrogen menguap habis; dikoreksi dengan menambahkan larutan pH Up (Kalium Hidroksida / KOH)' },
      { id: 'C', text: 'Akar tanaman tumbuh terlalu cepat; dikoreksi dengan menambahkan kapur pertanian (CaCO₃)' },
      { id: 'D', text: 'Kadar oksigen terlarut meningkat drastis; dikoreksi dengan mematikan pompa sirkulasi' },
    ],
    correctAnswer: 'A',
    explanation:
      'Pada pH > 7,0 unsur mikro seperti Fe dan Mn serta Fosfor (P) mengendap sehingga memicu klorosis daun muda. Penurunan pH dilakukan dengan larutan pH Down (Asam Fosfat H₃PO₄ atau Asam Nitrat HNO₃).',
    points: 1,
    orderIndex: 7,
  },
  {
    id: 'q-hidro-xi-pg-8',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Pada cuaca siang hari yang sangat terik dan panas di dalam greenhouse, volume air tandon menyusut drastis sementara hasil ukur EC meter justru melonjak naik dari 1,4 mS/cm menjadi 2,2 mS/cm. Penyebab ilmiah dan langkah penanganan yang tepat adalah...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Tanaman menyerap air jauh lebih cepat daripada ion garam karena laju transpirasi tinggi; tambahkan air baku bersih ke tandon hingga EC kembali ke 1,4 mS/cm' },
      { id: 'B', text: 'Akar tanaman mengeluarkan pupuk baru ke dalam tandon; tambahkan lagi pekatan AB Mix dosis ganda' },
      { id: 'C', text: 'Sensor EC meter rusak terkena cahaya; buang seluruh tanaman dari instalasi' },
      { id: 'D', text: 'Garam mineral menguap ke udara; tambahkan garam dapur (NaCl) ke dalam tandon' },
    ],
    correctAnswer: 'A',
    explanation:
      'Saat suhu tinggi, laju transpirasi meningkat sehingga tanaman menyerap air lebih banyak dibanding ion mineral. Akibatnya larutan di tandon menjadi pekat (EC naik) dan harus diencerkan dengan penambahan air baku bersih.',
    points: 1,
    orderIndex: 8,
  },
  {
    id: 'q-hidro-xi-pg-9',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Bibit sayuran daun yang baru pecah benih (sprout) namun terlambat dikenakan sinar matahari akan tumbuh dengan batang memanjang kurus, lemah, pucat, dan mudah rebah. Gejala abnormal ini disebut...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Gutasi' },
      { id: 'B', text: 'Etiolasi' },
      { id: 'C', text: 'Plasmolisis' },
      { id: 'D', text: 'Imbibisi' },
    ],
    correctAnswer: 'B',
    explanation:
      'Etiolasi adalah pertumbuhan kecambah yang memanjang kurus, pucat, dan rapuh akibat kekurangan intensitas cahaya matahari pada fase awal persemaian.',
    points: 1,
    orderIndex: 9,
  },
  {
    id: 'q-hidro-xi-pg-10',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Gejala tepi daun muda selada hidroponik yang tampak terbakar kecokelatan atau menghitam (tipburn) disebabkan secara fisiologis oleh...',
    questionType: 'multiple_choice',
    options: [
      { id: 'A', text: 'Kelebihan unsur Nitrogen pada daun tua saat malam hari' },
      { id: 'B', text: 'Defisiensi Kalsium (Ca) lokal pada jaringan pucuk daun muda akibat terhambatnya aliran transpirasi saat suhu udara panas dan sirkulasi udara stagnan' },
      { id: 'C', text: 'Serangan hama ulat grayak yang memakan lapisan epidermis bawah daun' },
      { id: 'D', text: 'Suhu larutan nutrisi yang terlalu dingin di bawah 18°C' },
    ],
    correctAnswer: 'B',
    explanation:
      'Tipburn disebabkan oleh gagalnya distribusi Kalsium (Ca) ke tepi daun muda yang tumbuh cepat karena laju transpirasi terhambat (akibat suhu greenhouse panas, udara lembap stagnan tanpa kipas sirkulasi, atau EC terlalu tinggi).',
    points: 1,
    orderIndex: 10,
  },
];

// ============================================================================
// SOAL ESAI & STUDI KASUS DINONAKTIFKAN UNTUK PENGERJAAN AKTIF/BARU
// Disimpan secara historis agar data percobaan lama tetap valid dan tidak hilang
// ============================================================================
export const HIDROPONIK_XI_HISTORICAL_SUBJECTIVE_QUESTIONS: QuizQuestion[] = [
  // ============================================================================
  // BAGIAN B: 5 SOAL URAIAN (questionType: 'essay', points: 100)
  // ============================================================================
  {
    id: 'q-hidro-xi-essay-1',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Jelaskan perbedaan prinsip kerja, konstruksi talang, keunggulan, serta kelemahan utama antara sistem hidroponik NFT (Nutrient Film Technique) dan DFT (Deep Flow Technique)! Mengapa pemilihan antara kedua sistem tersebut sangat dipengaruhi oleh keandalan pasokan listrik di lokasi greenhouse?',
    questionType: 'essay',
    correctAnswer:
      'Sistem NFT mengalirkan larutan nutrisi sangat tipis (1–3 mm) secara terus-menerus pada dasar talang miring (kemiringan 1–5%) tanpa menyisakan genangan, sehingga bagian atas akar memperoleh suplai oksigen melimpah dari udara sementara bagian bawah menyerap nutrisi. Kelemahan NFT adalah sangat bergantung pada listrik 24 jam; jika listrik padam atau pompa rusak pada siang hari, akar cepat kering dan tanaman layu. Sebaliknya, sistem DFT memiliki penyekat pada ujung outlet pipa/talang yang menahan genangan larutan nutrisi sedalam 3–5 cm. Keunggulan utama DFT adalah ketika listrik padam, akar tetap terendam cadangan nutrisi sehingga tanaman aman dari risiko kekeringan mendadak, meskipun aerasi oksigennya tidak setinggi NFT jika tidak dibantu sirkulasi.',
    explanation:
      'NFT mengandalkan lapisan tipis 1–3 mm dengan aerasi oksigen tinggi namun rawan kekeringan saat pompa mati. DFT menyisakan genangan 3–5 cm sebagai cadangan air dan hara saat listrik padam.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menjelaskan konsep aliran tipis 1–3 mm pada NFT (kemiringan 1–5%) serta genangan 3–5 cm pada konstruksi outlet DFT.',
      completeness:
        '0–30: Kelengkapan mencakup 4 komponen: prinsip kerja, konstruksi talang, keunggulan aerasi/cadangan air, serta kelemahan masing-masing sistem.',
      reasoning:
        '0–20: Ketajaman analisis hubungan keandalan listrik dengan risiko kekeringan akar pada NFT dibanding keamanan cadangan air pada DFT.',
      clarity:
        '0–10: Keruntutan kalimat, penggunaan istilah teknis hidroponik yang baku, dan kejelasan penyampaian.',
      keyPoints: [
        'aliran tipis 1-3 mm pada NFT',
        'kemiringan talang 1-5% dan pasokan oksigen udara bebas',
        'genangan 3-5 cm pada DFT dengan penyekat outlet',
        'dampak listrik padam / pompa mati terhadap kekeringan akar NFT vs cadangan larutan DFT',
      ],
    },
    points: 100,
    orderIndex: 11,
  },
  {
    id: 'q-hidro-xi-essay-2',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Mengapa pupuk hidroponik AB Mix harus dipisahkan menjadi pekatan Stok A dan Stok B? Jelaskan kandungan senyawa utama pada masing-masing stok, reaksi kimia yang terjadi apabila kedua pekatan dicampur langsung tanpa diencerkan air, serta prosedur pencampuran larutan nutrisi yang benar di dalam tandon!',
    questionType: 'essay',
    correctAnswer:
      'Pupuk AB Mix dipisahkan menjadi Stok A dan Stok B untuk mencegah reaksi pengendapan (presipitasi) kimia dalam kondisi konsentrat pekat. Stok A mengandung Kalsium Nitrat [Ca(NO3)2], Kalium Nitrat, dan Besi Khelat (Fe-EDTA), sedangkan Stok B mengandung Kalium Dihidrogen Fosfat (KH2PO4), Magnesium Sulfat (MgSO4), Kalium Sulfat (K2SO4), dan hara mikro. Jika dicampur dalam keadaan pekat, ion Kalsium (Ca2+) dari Stok A bereaksi dengan ion Sulfat (SO4 2-) dari Stok B membentuk endapan putih Kalsium Sulfat (CaSO4 / gipsum) dan bereaksi dengan ion Fosfat (PO4 3-) membentuk endapan Kalsium Fosfat [Ca3(PO4)2] yang tidak larut air, tidak dapat diserap akar, dan menyumbat pipa/dripper. Prosedur pencampuran yang benar: isi tandon dengan air baku bersih, tuang pekatan Stok A sesuai takaran lalu aduk hingga larut merata, kemudian tuang pekatan Stok B dengan volume yang sama, aduk kembali hingga homogen, lalu ukur nilai EC/TDS dan pH.',
    explanation:
      'Pemisahan Stok A (Ca, Fe) dan Stok B (SO4, PO4, Mg, mikro) mencegah presipitasi CaSO4 (gipsum) dan Ca3(PO4)2. Pencampuran dilakukan secara bertahap di dalam air baku tandon.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menyebutkan kandungan Stok A (Kalsium/Ca2+ & Fe) dan Stok B (Sulfat/SO4 2-, Fosfat/PO4 3-, Mg, mikro) serta reaksi presipitasi membentuk endapan Kalsium Sulfat (gipsum) / Kalsium Fosfat.',
      completeness:
        '0–30: Kelengkapan menjawab alasan pemisahan, kandungan kedua stok, dampak endapan terhadap tanaman/instalasi, dan urutan prosedur pengenceran di tandon.',
      reasoning:
        '0–20: Penalaran kausal mengapa ion Ca2+ tidak bereaksi mengendap setelah diencerkan dalam volume air tandon yang besar.',
      clarity:
        '0–10: Ketepatan penulisan nama senyawa/ion dan struktur langkah kerja yang sistematis.',
      keyPoints: [
        'Stok A mengandung Kalsium Nitrat (Ca2+) dan Fe',
        'Stok B mengandung Sulfat (SO4 2-) dan Fosfat (PO4 3-) serta Mg/mikro',
        'reaksi presipitasi / endapan Kalsium Sulfat (CaSO4 / gipsum) atau Kalsium Fosfat tidak larut',
        'prosedur pengenceran bertahap di air tandon (masukkan A aduk rata, baru masukkan B aduk rata)',
      ],
    },
    points: 100,
    orderIndex: 12,
  },
  {
    id: 'q-hidro-xi-essay-3',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Jelaskan pengaruh derajat keasaman (pH) dan kepekatan larutan (EC/TDS) terhadap penyerapan unsur hara pada tanaman hidroponik! Apa yang terjadi pada ketersediaan unsur hara apabila pH larutan naik di atas 7,0, dan bagaimana prosedur koreksinya?',
    questionType: 'essay',
    correctAnswer:
      'Derajat keasaman (pH) mengatur kelarutan ion hara di dalam air, dengan rentang ideal 5,5–6,5. Nilai EC (Electrical Conductivity) atau TDS menunjukkan konsentrasi total ion garam mineral terlarut yang menentukan tekanan osmotik dan kecukupan hara sesuai umur fisiologis tanaman. Apabila pH larutan naik di atas 7,0 (basa), unsur hara mikro seperti Besi (Fe), Mangan (Mn), Seng (Zn), Boron (B) serta unsur makro Fosfor (P) dan Kalsium (Ca) akan mengalami presipitasi (mengendap) menjadi bentuk yang tidak dapat diserap oleh akar tanaman, sehingga memicu gejala klorosis pada daun muda meskipun nilai EC terukur cukup. Prosedur koreksinya adalah menambahkan larutan pH Down (Asam Fosfat H3PO4 atau Asam Nitrat HNO3 encer) sedikit demi sedikit ke dalam tandon sambil diaduk dan diukur menggunakan pH meter terkalibrasi hingga pH kembali ke rentang 5,5–6,5.',
    explanation:
      'pH 5,5–6,5 menjaga kelarutan ion; pH > 7,0 mengendapkan Fe, Mn, dan P; koreksi dilakukan dengan pH Down (H3PO4/HNO3). EC mengatur konsentrasi hara dan tekanan osmotik.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menjelaskan rentang pH ideal (5,5–6,5), fungsi EC/TDS, serta fenomena pengendapan Fe, Mn, P, Ca saat pH > 7,0.',
      completeness:
        '0–30: Kelengkapan membahas peran pH, peran EC/TDS, gejala dampak pH > 7,0 (klorosis), dan prosedur koreksi dengan larutan pH Down (Asam Fosfat/Nitrat).',
      reasoning:
        '0–20: Penalaran hubungan antara kelarutan kimia ion hara, tekanan osmotik perakaran, dan gejala defisiensi fisiologis tanaman.',
      clarity:
        '0–10: Bahasa ilmiah yang runtut, jelas, dan mudah dipahami.',
      keyPoints: [
        'rentang pH ideal 5,5 - 6,5',
        'fungsi EC/TDS sebagai ukuran kepekatan ion hara terlarut',
        'pengendapan Fe, Mn, P, Ca pada pH > 7,0 yang memicu klorosis daun muda',
        'koreksi pH menggunakan larutan pH Down (Asam Fosfat H3PO4 / Asam Nitrat HNO3)',
      ],
    },
    points: 100,
    orderIndex: 13,
  },
  {
    id: 'q-hidro-xi-essay-4',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Uraikan hubungan antara suhu larutan nutrisi, kadar oksigen terlarut (Dissolved Oxygen / DO), laju respirasi akar, dan risiko serangan penyakit busuk akar (Pythium sp.) pada budidaya hidroponik di daerah beriklim tropis! Sebutkan minimal 3 upaya teknis untuk menjaga suhu larutan tetap sejuk (< 28°C)!',
    questionType: 'essay',
    correctAnswer:
      'Secara fisika, kelarutan gas oksigen (DO) di dalam air berbanding terbalik dengan suhu larutan. Ketika suhu larutan nutrisi meningkat di atas 28–30°C pada iklim tropis, kadar oksigen terlarut (DO) menurun drastis (kurang dari 4 mg/L), sedangkan laju respirasi metabolisme akar justru meningkat tajam. Akibatnya akar mengalami hipoksia (kekurangan oksigen), sel-sel epidermis akar melemah dan mati, sehingga sangat mudah diinfeksi oleh patogen tular air Pythium sp. yang berkembang pesat pada air hangat, menyebabkan akar membusuk kecokelatan dan tanaman layu. Tiga upaya teknis menjaga suhu larutan tetap sejuk (< 28°C): (1) Menanam atau menempatkan tandon nutrisi di bawah tanah/naungan teduh dan melapisinya dengan insulasi penahan panas (aluminium foil/styrofoam); (2) Menggunakan pipa/talang berwarna putih yang memantulkan radiasi panas matahari serta menjaga sirkulasi udara greenhouse (exhaust fan / paranet); (3) Menambahkan aerator/venturi untuk meningkatkan DO serta menggunakan chiller atau botol es beku di dalam tandon saat cuaca ekstrem.',
    explanation:
      'Suhu larutan > 28–30°C menurunkan DO dan menaikkan respirasi akar -> hipoksia -> infeksi Pythium sp. Pencegahan melalui insulasi/peneduhan tandon, talang warna terang, ventilasi greenhouse, dan aerasi.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menjelaskan hubungan terbalik antara suhu air dan kelarutan oksigen (DO), peningkatan respirasi akar, serta patogen Pythium sp.',
      completeness:
        '0–30: Kelengkapan menguraikan mekanisme fisiologis hipoksia akar, gejala busuk akar, serta minimal 3 langkah teknis pengendalian suhu larutan.',
      reasoning:
        '0–20: Analisis logis mengapa kondisi air hangat + DO rendah menjadi pemicu utama infeksi Pythium sp. di daerah tropis.',
      clarity:
        '0–10: Penyampaian terstruktur dan istilah teknis tepat.',
      keyPoints: [
        'suhu tinggi menurunkan kelarutan oksigen terlarut (DO)',
        'respirasi akar meningkat sehingga terjadi hipoksia / stres akar',
        'infeksi patogen air Pythium sp. penyebab busuk akar (root rot)',
        'minimal 3 solusi teknis (insulasi/pendam tandon, aerator/venturi, talang putih/naungan/pendinginan)',
      ],
    },
    points: 100,
    orderIndex: 14,
  },
  {
    id: 'q-hidro-xi-essay-5',
    quizId: 'quiz-hidroponik-xi',
    questionText:
      'Jelaskan tahapan kritis persemaian benih hingga pindah tanam (transplanting) pada budidaya sayuran daun hidroponik! Mengapa bibit dapat mengalami gejala etiolasi dan bagaimana langkah pencegahannya sejak benih mulai pecah kecambah (sprout)?',
    questionType: 'essay',
    correctAnswer:
      'Tahapan persemaian hingga pindah tanam meliputi: (1) Pemotongan media rockwool ukuran ~2,5 x 2,5 cm dan pembasahan dengan air bersih ber-pH netral hingga lembap (tidak tergenang jenuh); (2) Pembuatan lubang tanam sedalam ~0,5 cm dan peletakan 1 benih per lubang lalu disimpan di tempat teduh/gelap selama 24–48 jam hingga benih pecah kecambah (sprout); (3) Pengenalan sinar matahari pagi segera setelah benih pecah kecambah serta pemberian nutrisi AB Mix dosis rendah (EC 0,5–0,8 mS/cm atau 300–500 ppm) saat daun kotiledon membuka; (4) Pindah tanam (transplanting) ke netpot instalasi dilakukan pada umur 10–14 HSS ketika bibit telah memiliki 3–4 helai daun sejati dan akar putih menembus dasar rockwool. Gejala etiolasi terjadi karena hormon auksin bekerja memanjangkan sel batang secara berlebihan ketika kecambah kekurangan cahaya matahari, menyebabkan batang kurus tinggi, lemah, pucat, dan mudah rebah. Pencegahannya adalah segera memaparkan nampan semai pada sinar matahari pagi yang cukup (minimal 4–6 jam/hari atau grow light) tepat saat benih mulai pecah kecambah.',
    explanation:
      'Tahapan semai rockwool -> sprout -> paparan cahaya matahari pagi -> nutrisi rendah -> pindah tanam saat 3–4 daun sejati. Etiolasi akibat aktivitas auksin tanpa cahaya, dicegah dengan paparan sinar matahari sejak sprout.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menjelaskan tahapan semai rockwool, syarat pindah tanam (3–4 daun sejati, 10–14 HSS), serta mekanisme fisiologis etiolasi (peran cahaya & hormon auksin).',
      completeness:
        '0–30: Kelengkapan 4 tahapan operasional semai-transplanting, ciri visual etiolasi, dan langkah pencegahan dini.',
      reasoning:
        '0–20: Penalaran mengapa keterlambatan pengenalan cahaya 1–2 hari saja setelah sprout langsung memicu batang memanjang rapuh.',
      clarity:
        '0–10: Keruntutan kronologis tahapan kerja dan kejelasan bahasa.',
      keyPoints: [
        'penyiapan dan pembasahan media rockwool serta peletakan benih',
        'pengenalan cahaya matahari segera saat benih pecah kecambah (sprout)',
        'kriteria pindah tanam 3-4 daun sejati (10-14 HSS) dan pemberian nutrisi awal rendah',
        'penyebab etiolasi (kurang cahaya / hormon auksin) dan pencegahannya',
      ],
    },
    points: 100,
    orderIndex: 15,
  },

  // ============================================================================
  // BAGIAN C: 2 STUDI KASUS PEMECAHAN MASALAH (questionType: 'case_study', points: 100)
  // ============================================================================
  {
    id: 'q-hidro-xi-case-1',
    quizId: 'quiz-hidroponik-xi',
    caseStudyContext:
      'STUDI KASUS 1 — KRISIS INSTALASI NFT SELADA DI GREENHOUSE SMK ATPH:\nPada minggu ke-3 budidaya selada keriting (Lactuca sativa) sistem NFT di greenhouse praktik Kelas XI ATPH, cuaca siang hari sangat terik sehingga suhu udara di dalam greenhouse mencapai 36°C dan suhu larutan nutrisi di dalam tandon plastik hitam yang diletakkan di luar ruangan mencapai 33°C. Saat dilakukan pemeriksaan pukul 13.30 WIB, ditemukan tiga gejala serius:\n(1) Tanaman selada tampak layu serentak pada siang hari, dan ketika netpot diangkat, perakaran berwarna cokelat kehitaman, berlendir, serta berbau busuk;\n(2) Daun-daun muda di bagian pucuk menunjukkan gejala tepi daun terbakar kecokelatan/menghitam (tipburn);\n(3) Hasil pengukuran larutan tandon menunjukkan pH melonjak ke 7,4 dan nilai EC naik menjadi 2,4 mS/cm (padahal standar selada adalah 1,2–1,6 mS/cm).',
    questionText:
      'Berdasarkan data Studi Kasus 1 di atas, lakukan analisis pemecahan masalah secara komprehensif:\n1. Diagnosis penyebab ilmiah dari ketiga gejala tersebut (akar cokelat berlendir, tipburn daun muda, serta lonjakan EC 2,4 mS/cm dan pH 7,4)!\n2. Susun langkah tindakan penyelamatan darurat (koreksi larutan nutrisi, penanganan perakaran, dan pengaturan mikroklimat greenhouse) yang harus segera dilakukan hari itu!\n3. Rancang rekomendasi perbaikan desain instalasi dan SOP pemeliharaan agar kasus serupa tidak terulang pada siklus tanam berikutnya!',
    questionType: 'case_study',
    correctAnswer:
      '1. Diagnosis Penyebab Ilmiah:\n- Akar cokelat berlendir dan layu siang hari: Disebabkan oleh suhu larutan tandon yang terlalu panas (33°C, melebihi batas aman 28°C) akibat tandon hitam terpapar matahari langsung. Suhu tinggi menurunkan kadar oksigen terlarut (DO) drastis sehingga akar mengalami hipoksia dan terinfeksi patogen tular air Pythium sp. (busuk akar / root rot).\n- Tipburn pada tepi daun muda: Disebabkan oleh defisiensi Kalsium (Ca) lokal di jaringan pucuk akibat terhambatnya aliran transpirasi pada suhu udara ekstrem (36°C) dan sirkulasi udara yang buruk, diperparah oleh EC yang terlalu pekat (2,4 mS/cm) dan pengendapan Ca pada pH basa (7,4).\n- Lonjakan EC (2,4 mS/cm) dan pH (7,4): Karena suhu sangat panas, tanaman menyerap air jauh lebih cepat daripada garam mineral sehingga larutan di tandon memekat (EC melonjak), sedangkan pH 7,4 menyebabkan Fe, Mn, P, dan Ca mengendap.\n\n2. Langkah Penyelamatan Darurat:\n- Koreksi Larutan: Tambahkan air baku bersih yang sejuk ke dalam tandon untuk menurunkan EC dari 2,4 mS/cm kembali ke 1,2–1,4 mS/cm (atau ganti air tandon baru jika sudah terkontaminasi berat oleh lendir Pythium), lalu turunkan pH dari 7,4 ke 5,8–6,2 menggunakan larutan pH Down (Asam Fosfat H3PO4).\n- Penanganan Suhu Air & DO: Dinginkan tandon menggunakan botol es beku untuk menurunkan suhu air di bawah 28°C dan pasang aerator/venturi tambahan untuk meningkatkan DO.\n- Mikroklimat & Sanitasi: Nyalakan kipas sirkulasi/exhaust fan untuk memperlancar transpirasi (mengatasi tipburn), serta singkirkan tanaman yang akarnya sudah busuk parah agar spora Pythium tidak menyebar.\n\n3. Rekomendasi Perbaikan Desain & SOP:\n- Pindahkan atau tanam tandon di tempat teduh/bawah tanah dan lapisi dengan aluminium foil/insulasi termal.\n- Pasang shading net (paranet 50–65%) dan kipas sirkulasi udara otomatis di dalam greenhouse.\n- Terapkan SOP pengecekan pH, EC, dan suhu air 2 kali sehari (pagi dan siang/sore) serta sterilisasi gully dengan hidrogen peroksida (H2O2) atau klorin antar-siklus tanam.',
    explanation:
      'Kasus ini menguji kemampuan menganalisis interaksi suhu tandon (33°C) -> DO turun -> infeksi Pythium sp.; suhu udara (36°C) + EC tinggi (2,4) + pH 7,4 -> transpirasi & serapan Ca terhambat -> tipburn; serta menyusun tindakan koreksi pH/EC, pendinginan tandon, dan perbaikan desain.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan mendiagnosis infeksi Pythium sp. akibat suhu air 33°C & DO rendah, mekanisme tipburn akibat defisiensi Ca lokal & hambatan transpirasi, serta penyebab naiknya EC (2,4 mS/cm) dan pH (7,4).',
      completeness:
        '0–30: Kelengkapan menjawab ketiga sub-pertanyaan: (1) diagnosis 3 gejala, (2) tindakan darurat koreksi EC/pH/suhu/DO, dan (3) desain pencegahan jangka panjang.',
      reasoning:
        '0–20: Ketepatan mengaitkan hubungan sebab-akibat antara tandon hitam di luar ruangan, suhu air 33°C, lonjakan EC, pH 7,4, dan kegagalan fisiologis akar.',
      clarity:
        '0–10: Penyusunan solusi secara sistematis (poin per poin), logis, dan aplikatif untuk skala greenhouse SMK.',
      keyPoints: [
        'diagnosis busuk akar Pythium sp. akibat suhu larutan 33°C dan penurunan DO',
        'diagnosis tipburn akibat defisiensi Kalsium (Ca) lokal dan terhambatnya transpirasi pada suhu 36°C',
        'koreksi EC dengan penambahan air baku/ganti larutan ke 1,2-1,6 mS/cm dan koreksi pH 7,4 ke 5,5-6,5 dengan pH Down',
        'isolasi/peneduhan tandon, penambahan aerator, pemasangan paranet/kipas sirkulasi, dan sanitasi instalasi',
      ],
    },
    points: 100,
    orderIndex: 16,
  },
  {
    id: 'q-hidro-xi-case-2',
    quizId: 'quiz-hidroponik-xi',
    caseStudyContext:
      'STUDI KASUS 2 — KEGAGALAN FORMULASI NUTRISI & SUMBATAN DRIP IRRIGATION MELON:\nKelompok siswa Kelas XI ATPH sedang menyiapkan larutan nutrisi untuk 200 tanaman melon sistem Irigasi Tetes (Drip System / Fertigasi) bermedia cocopeat di dalam polybag. Agar pekerjaan cepat selesai, seorang siswa mencampurkan 5 liter pekatan Stok A dan 5 liter pekatan Stok B secara bersamaan di dalam satu ember kecil tanpa air, baru kemudian menuangkannya ke dalam tandon utama kapasitas 1.000 liter. Beberapa jam kemudian muncul tiga masalah:\n(1) Larutan di dasar ember dan tandon berubah keruh seperti susu dan menghasilkan endapan bubuk kristal putih yang tebal;\n(2) Sebagian besar penetes (dripper/emitter) mengalami kemacetan/tersumbat sehingga tanaman melon di ujung baris layu kekurangan air;\n(3) Setelah 5 hari, daun-daun muda tanaman melon tampak menguning pucat di antara tulang daun (klorosis interveinal) dan pertumbuhan pucuk kerdil.',
    questionText:
      'Berdasarkan Studi Kasus 2 di atas, pecahkan permasalahan tersebut secara ilmiah dan teknis:\n1. Jelaskan reaksi kimia spesifik yang menyebabkan larutan menjadi keruh dan membentuk endapan kristal putih saat pekatan Stok A dan Stok B dicampur langsung!\n2. Mengapa kesalahan pencampuran tersebut menyebabkan sumbatan emitter sekaligus memicu gejala klorosis daun muda dan pucuk kerdil pada tanaman melon?\n3. Tuliskan langkah penanganan perbaikan untuk menyelamatkan tanaman melon dan instalasi dripper yang tersumbat, serta susun SOP pembuatan larutan nutrisi AB Mix yang benar untuk 1.000 liter air tandon!',
    questionType: 'case_study',
    correctAnswer:
      '1. Analisis Reaksi Kimia Presipitasi:\nKetika pekatan Stok A dan Stok B dicampur langsung tanpa diencerkan air terlebih dahulu, kation Kalsium (Ca2+) berkonsentrasi tinggi dari Stok A [Ca(NO3)2] bereaksi langsung dengan anion Sulfat (SO4 2-) dari Stok B (MgSO4/K2SO4) membentuk endapan kristal putih Kalsium Sulfat (CaSO4 / gipsum) serta bereaksi dengan anion Fosfat (PO4 3-) dari KH2PO4 membentuk endapan Kalsium Fosfat [Ca3(PO4)2]. Selain itu, Besi (Fe) juga ikut terpresipitasi.\n\n2. Dampak Fisik (Sumbatan Emitter) & Fisiologis (Klorosis/Pucuk Kerdil):\n- Endapan CaSO4 dan Ca3(PO4)2 bersifat tidak larut dalam air. Partikel kristal padat ini tersedot pompa dan menyumbat celah sempit labirin dripper/emitter sehingga aliran fertigasi terhenti dan tanaman di ujung pipa layu.\n- Secara fisiologis, karena unsur Kalsium (Ca), Fosfor (P), Sulfur (S), dan Besi (Fe) telah mengendap di dasar tandon, ion-ion tersebut hilang dari larutan dan tidak dapat diserap oleh akar tanaman. Kekurangan Besi (Fe) menyebabkan klorosis interveinal pada daun muda, sedangkan kekurangan Kalsium (Ca) dan Fosfor (P) menyebabkan titik tumbuh pucuk kerdil/rusak.\n\n3. Langkah Penyelamatan & SOP Pembuatan Larutan 1.000 Liter:\n- Penanganan Instalasi & Tanaman: Kuras habis larutan tandon yang sudah rusak/mengendap dan bersihkan dasar tandon. Lakukan flushing (pencucian pipa lateral dan pembilasan dripper/emitter) menggunakan air bersih yang diberi sedikit larutan asam lemah (asam nitrat/fosfat encer) untuk melarutkan kerak endapan, serta periksa kelancaran tetesan tiap emitter.\n- SOP Pencampuran 1.000 Liter Air Tandon: (a) Isi tandon dengan air baku bersih (minimal 800–900 liter terlebih dahulu); (b) Masukkan 5 liter pekatan Stok A ke dalam air tandon, lalu aduk/sirkulasikan hingga benar-benar homogen; (c) Masukkan 5 liter pekatan Stok B ke dalam tandon, lalu aduk kembali hingga merata dan genapkan volume air menjadi 1.000 liter; (d) Ukur dan pastikan nilai EC (2,0–3,5 mS/cm sesuai fase melon) serta pH (5,5–6,5) sebelum disalurkan ke dripper.',
    explanation:
      'Pencampuran langsung konsentrat Stok A dan B memicu reaksi presipitasi Ca2+ + SO4 2- -> CaSO4 (gipsum) dan Ca2+ + PO4 3- -> Ca3(PO4)2. Endapan menyumbat emitter dan menghilangkan ketersediaan Ca, P, S, dan Fe sehingga tanaman mengalami klorosis dan kerdil pucuk.',
    rubric: {
      conceptAccuracy:
        '0–40: Ketepatan menjelaskan reaksi kimia kation Ca2+ (Stok A) dengan anion SO4 2- dan PO4 3- (Stok B) membentuk endapan Kalsium Sulfat (CaSO4 / gipsum) dan Kalsium Fosfat [Ca3(PO4)2].',
      completeness:
        '0–30: Kelengkapan menjawab (1) reaksi kimia endapan, (2) penyebab sumbatan emitter & klorosis/kerdil pucuk akibat hilangnya Fe/Ca/P terlarut, serta (3) langkah kuras/flushing pipa dan SOP pencampuran 1.000 L.',
      reasoning:
        '0–20: Ketajaman menghubungkan fenomena fisik (endapan menyumbat emitter) dengan fenomena fisiologis tanaman (defisiensi Ca dan Fe pada daun muda).',
      clarity:
        '0–10: Kejelasan urutan SOP kerja teknis dan ketepatan terminologi kimia pertanian.',
      keyPoints: [
        'reaksi kimia Ca2+ (Stok A) dengan SO4 2- dan PO4 3- (Stok B) membentuk endapan CaSO4 (gipsum) dan Ca3(PO4)2',
        'partikel endapan padat tidak larut menyumbat celah dripper/emitter irigasi tetes',
        'unsur Ca, Fe, P, S mengendap sehingga tidak terserap akar dan memicu klorosis daun muda serta pucuk kerdil',
        'pengurasan tandon, flushing/pembersihan emitter, dan SOP pencampuran bertahap di dalam 1.000 liter air tandon',
      ],
    },
    points: 100,
    orderIndex: 17,
  },
];

export const HIDROPONIK_XI_ALL_QUESTIONS: QuizQuestion[] = [
  ...HIDROPONIK_XI_QUESTIONS,
  ...HIDROPONIK_XI_HISTORICAL_SUBJECTIVE_QUESTIONS,
];


