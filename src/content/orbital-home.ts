export type OrbitalSectionId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

export type EditorialPrinciple = {
  id: "kaynak" | "baglam" | "anlatim";
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
    { label: "Yazılar", href: "#journal" },
    { label: "Hakkımızda", href: "#hakkinda" },
  ],
  hero: {
    title: "Beslenmenin bir ritmi var.",
    prelude: "Bağımsız beslenme dergisi",
    body: "CALORYTHM, beslenme alanındaki bilgi kirliliği içinde güvenilir kaynaklara dayanan, özenle hazırlanmış yazılar yayımlar.",
    cta: "Yazıları keşfet",
    attribution: "Bir diyetisyen ve yazılımcı tarafından kuruldu.",
  },
  sections: [
    {
      id: "01",
      title: ["Beslenme hakkında", "çok fazla gürültü var."],
      body: "Her gün yeni bir iddia, kesin bir sonuç ve bir öncekini geçersiz kılan başka bir öneri dolaşıma giriyor. Kaynağı belirsiz içeriklerin arasında neye güvenileceğini ayırt etmek giderek zorlaşıyor.",
    },
    {
      id: "02",
      title: ["Her iddia,", "aynı ağırlıkta değildir."],
      body: "Bir yazı yayımlamadan önce kaynağına, kanıtın gücüne ve hangi koşullarda geçerli olduğuna bakıyoruz.",
    },
    {
      id: "03",
      title: ["Her dosya,", "tek bir soruyla başlar."],
      body: "Konuyu yüzeyde bırakmayız. Kanıtları karşılaştırır, yanlış anlaşılan noktaları ayırır ve günlük hayattaki karşılığını açıklarız.",
    },
    {
      id: "04",
      title: ["Doğru bilgi,", "iyi anlatılmayı hak eder."],
      body: "Bilimsel bilgiyi anlaşılır hâle getirmek, onu basitleştirip eksiltmek değildir. Her dosyayı kendi görsel dili ve editoryal kurgusuyla hazırlıyoruz.",
      emphasis: ["Önce doğru anla.", "Sonra iyi anlat."],
    },
    {
      id: "05",
      title: ["İlk dosya", "hazırlanıyor."],
      body: "İlk CALORYTHM dosyası, beslenme alanında en çok bilgi kirliliği üreten sorulardan birini güvenilir kaynaklar eşliğinde ele alacak.",
      emphasis: "Konu ve yayın tarihi yakında açıklanacak.",
    },
    {
      id: "06",
      title: ["Üzerinde çalıştığımız", "konular."],
    },
    {
      id: "07",
      title: ["CALORYTHM,", "katkılarla büyüyecek."],
      body: "Kendi dosyalarımızın yanında, beslenme bilimine özenle yaklaşan uzmanların ve yazarların metinlerine de yer vereceğiz.",
      emphasis: "Her katkı; kaynak, dil ve anlatım açısından editoryal süreçten geçecek.",
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
  editorialPrinciples: [
    {
      id: "kaynak",
      title: "Kaynak",
      statement: "Bilginin nereden geldiğine bakarız.",
      detail: "Araştırmayı, yöntemi ve kanıtın niteliğini inceleriz.",
      tone: "coral",
    },
    {
      id: "baglam",
      title: "Bağlam",
      statement: "Sonucu sınırlarıyla birlikte okuruz.",
      detail: "Kimin için, hangi koşullarda geçerli olduğunu gözetiriz.",
      tone: "orange",
    },
    {
      id: "anlatim",
      title: "Anlatım",
      statement: "Karmaşık olanı açık hâle getiririz.",
      detail: "Bilgiyi çarpıtmadan, özenli bir yayına dönüştürürüz.",
      tone: "olive",
    },
  ] satisfies readonly EditorialPrinciple[],
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
