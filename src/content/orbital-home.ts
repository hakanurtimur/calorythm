export type OrbitalSectionId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

export type MacroRoute = {
  id: "protein" | "karbonhidrat" | "yag";
  title: string;
  statement: string;
  detail: string;
  tone: "coral" | "orange" | "olive";
};

export type JournalTopic = {
  id: string;
  title: string;
  description: string;
  tone: "orange" | "coral" | "ochre" | "olive";
};

export type OrbitalSection = {
  id: OrbitalSectionId;
  title: readonly [string, string];
  body?: string;
  emphasis?: string | readonly [string, string];
};

export const orbitalHomeContent = {
  splash: {
    label: "CALORYTHM",
    statement: "Beslenmenin bir ritmi var.",
  },
  navigation: [
    { label: "Keşfet", href: "#section-01" },
    { label: "Konular", href: "#konular" },
    { label: "Journal", href: "#journal" },
    { label: "Hakkımızda", href: "#hakkinda" },
  ],
  hero: {
    title: "Beslenmenin bir ritmi var.",
    prelude: "Bağımsız beslenme yayını",
    body: "Ne yiyeceğini söyleyen bir site değil. Besinlerin bedende nasıl çalıştığını gösteren bağımsız bir yayın.",
    cta: "Konuları keşfet",
    attribution: "Bir diyetisyen ve yazılımcı tarafından hazırlanır.",
  },
  sections: [
    {
      id: "01",
      title: ["Beslenme bilgisi çok.", "Bağlamı az."],
      body: "Her gün yeni bir beslenme iddiası dolaşıma giriyor. CALORYTHM iddiaları değil; mekanizmaları, kanıtı ve insan bedenini takip eder.",
    },
    {
      id: "02",
      title: ["Bir besin,", "tek bir sonuç değildir."],
      body: "Etkisi; miktara, zamana, harekete, uykuya ve bedenin o anki koşullarına göre değişir.",
    },
    {
      id: "03",
      title: ["Ne yapacağını ezberleme.", "Nedenini anla."],
      body: "Her konu tek bir sorudan başlar; mekanizmasına iner, kanıtı tartar ve günlük yaşamla bağlantısını kurar.",
    },
    {
      id: "04",
      title: ["Konuyu seç.", "Derinine in."],
      body: "Protein, karbonhidrat, yağ, metabolizma, lif, hidrasyon ve mikro besinler. Her dosya tek bir soruyu yüzeyde bırakmadan ele alır.",
      emphasis: ["Mekanizmayı gör.", "Kanıtı tart. Bağlamı koru."],
    },
    {
      id: "05",
      title: ["İlk dosya", "hazırlanıyor."],
      body: "İlk CALORYTHM dosyası, beslenme hakkında sık sorulan tek bir soruyu mekanizmasından gündelik karşılığına kadar takip edecek.",
      emphasis: "Yalnızca cevabı değil, cevaba nasıl ulaşıldığını da göreceksin.",
    },
    {
      id: "06",
      title: ["Merak ettiğin", "yerden başla."],
    },
    {
      id: "07",
      title: ["Beslenme bilimi,", "anlaşıldığında işe yarar."],
      body: "Yeni dosyalar, yeni sorular ve daha sağlam bir kavrayış için.",
      emphasis: "Ezberden önce mekanizmayı, iddiadan önce kanıtı takip et.",
    },
  ] as const satisfies readonly [
    OrbitalSection,
    OrbitalSection,
    OrbitalSection,
    OrbitalSection,
    OrbitalSection,
    OrbitalSection,
    OrbitalSection,
  ],
  knowledgeFragments: ["İddia", "Kanıt", "Bağlam"],
  topicAtlas: [
    { title: "Metabolizma", note: "Enerji nasıl dönüşür ve kullanılır?" },
    { title: "Enerji dengesi", note: "Alım, harcama ve uyum" },
    { title: "Lif", note: "Bağırsak, tokluk ve mikrobiyota" },
    { title: "Hidrasyon", note: "Sıvı dengesi, dolaşım ve ısı" },
    { title: "Mikro besinler", note: "Az miktarda, kritik görevler" },
  ],
  macroRoutes: [
    {
      id: "protein",
      title: "Protein",
      statement: "Yapı kurar, onarır ve taşır.",
      detail: "Kasın ötesinde: enzimler, antikorlar ve dokular.",
      tone: "coral",
    },
    {
      id: "karbonhidrat",
      title: "Karbonhidrat",
      statement: "Enerjiyi erişilebilir kılar.",
      detail: "Glikoz, glikojen ve lif; aynı başlığın farklı işleri.",
      tone: "orange",
    },
    {
      id: "yag",
      title: "Yağ",
      statement: "Depolar, zar kurar ve emilimi destekler.",
      detail: "Hücre zarları, sinyalleşme ve yağda çözünen vitaminler.",
      tone: "olive",
    },
  ] satisfies readonly MacroRoute[],
  journalTopics: [
    { id: "protein", title: "Protein", description: "Kasın ötesinde: yapı, enzim ve taşıma.", tone: "coral" },
    { id: "karbonhidrat", title: "Karbonhidrat", description: "Enerji, depolama ve lifin farklı rolleri.", tone: "orange" },
    { id: "yaglar", title: "Yağlar", description: "Hücre zarından enerji rezervine.", tone: "olive" },
    { id: "metabolizma", title: "Metabolizma", description: "Beden enerjiyi nasıl dönüştürüyor?", tone: "ochre" },
    { id: "enerji-dengesi", title: "Enerji Dengesi", description: "Alım, harcama ve uyum neden sabit değil?", tone: "orange" },
    { id: "lif", title: "Lif", description: "Bağırsak, tokluk ve mikrobiyota.", tone: "olive" },
    { id: "hidrasyon", title: "Hidrasyon", description: "Sıvı dengesi beden boyunca nasıl korunur?", tone: "coral" },
    { id: "mikro-besinler", title: "Mikro Besinler", description: "Az miktarlar neden kritik işler yapar?", tone: "ochre" },
  ] satisfies readonly JournalTopic[],
} as const;
