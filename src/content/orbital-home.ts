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
  emphasis?: string;
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
    body: "Beslenme bilimini; görsel hikâyeler ve deneyimlenen anlatılarla yeniden keşfet.",
    cta: "Keşfet",
  },
  sections: [
    {
      id: "01",
      title: ["Bilgiyi okumak kolaydır.", "Anlamak zordur."],
      body: "CALORYTHM bilgiyi içerik olarak bırakmaz. Her konu, bağlantıları görünür kılan ve adım adım açılan bir hikâyeye dönüşür.",
    },
    {
      id: "02",
      title: ["Her konu,", "kendi hikâyesini anlatır."],
      body: "Her hikâye tek bir fikrin peşinden gider; onu parçalarına ayırır, bağlamına yerleştirir ve yeniden kurar.",
    },
    {
      id: "03",
      title: ["Karmaşık olanı,", "anlaşılır hâle getiriyoruz."],
      body: "Beslenme biliminin en çok yanlış anlaşılan konularını; sade, görsel ve bilimsel bir anlatımla yeniden ele alıyoruz.",
    },
    {
      id: "04",
      title: ["Bir makale okumuyorsun.", "Bir düşüncenin içine giriyorsun."],
      body: "Her hikâye kendi anlatım dilini kurar. Büyük fikirler açılır, veriler bağlam kazanır, parçalar birbirine bağlanır.",
      emphasis: "Amaç yalnızca bilgi vermek değil. Anlaşılmasını sağlamak.",
    },
    {
      id: "05",
      title: ["Protein Sadece", "Kas İçin Değildir"],
      body: "Protein denince aklına ilk kas geliyor olabilir. Oysa beden, proteini bundan çok daha fazlası için kullanır.",
      emphasis: "Bu hikâye, proteine yeniden bakmanı sağlayacak.",
    },
    {
      id: "06",
      title: ["Keşfetmeye", "devam et."],
    },
    {
      id: "07",
      title: ["Merak iyi bir", "başlangıçtır."],
      body: "Her hafta yeni hikâyeler. Yeni araştırmalar. Yeni bakış açıları.",
      emphasis: "Beslenme bilimini ezberlerle değil, anlayarak keşfet.",
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
  knowledgeFragments: ["Oku", "Bağla", "Anla"],
  topicAtlas: [
    { title: "Metabolizma", note: "Enerjinin yönetimi" },
    { title: "Enerji dengesi", note: "Girdi ve çıktının ötesi" },
    { title: "Lif", note: "Sindirimin ötesindeki görevler" },
    { title: "Hidrasyon", note: "Suyun beden içindeki işi" },
    { title: "Mikro besinler", note: "Küçük miktarlar, büyük etkiler" },
  ],
  macroRoutes: [
    {
      id: "protein",
      title: "Protein",
      statement: "Protein yalnızca protein değildir.",
      detail: "Yapı, onarım ve çok daha fazlası.",
      tone: "coral",
    },
    {
      id: "karbonhidrat",
      title: "Karbonhidrat",
      statement: "Karbonhidrat yalnızca enerji değildir.",
      detail: "Hareketin ve dönüşümün yakıtı.",
      tone: "orange",
    },
    {
      id: "yag",
      title: "Yağ",
      statement: "Yağ yalnızca depolanan kalori değildir.",
      detail: "Zar, sinyal ve enerji rezervi.",
      tone: "olive",
    },
  ] satisfies readonly MacroRoute[],
  journalTopics: [
    { id: "protein", title: "Protein", description: "Yapı, onarım ve çok daha fazlası.", tone: "coral" },
    { id: "karbonhidrat", title: "Karbonhidrat", description: "Enerjinin en yanlış anlaşılan yüzü.", tone: "orange" },
    { id: "yaglar", title: "Yağlar", description: "Depolamaktan çok daha fazlası.", tone: "olive" },
    { id: "metabolizma", title: "Metabolizma", description: "Beden enerjiyi nasıl yönetiyor?", tone: "ochre" },
    { id: "enerji-dengesi", title: "Enerji Dengesi", description: "Bir sayıdan daha fazlası.", tone: "orange" },
    { id: "lif", title: "Lif", description: "Sindirimin ötesindeki görevleri.", tone: "olive" },
    { id: "hidrasyon", title: "Hidrasyon", description: "Su gerçekten ne yapar?", tone: "coral" },
    { id: "mikro-besinler", title: "Mikro Besinler", description: "Küçük miktarlar, büyük etkiler.", tone: "ochre" },
  ] satisfies readonly JournalTopic[],
} as const;
