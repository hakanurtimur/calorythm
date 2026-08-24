export type TopicRecord = Readonly<{
  definition: string;
  slug: string;
  title: string;
  tone: "orange" | "coral" | "ochre" | "olive";
}>;

export const topics = [
  {
    slug: "protein",
    title: "Protein",
    definition: "Yapı, onarım, taşıma ve savunmada kullanılan amino asitlerin hikâyesi.",
    tone: "coral",
  },
  {
    slug: "karbonhidrat",
    title: "Karbonhidrat",
    definition: "Enerji, depolama ve lifin farklı rollerini birlikte okumak.",
    tone: "orange",
  },
  {
    slug: "yaglar",
    title: "Yağlar",
    definition: "Hücre zarından enerji rezervine uzanan çok yönlü bir besin grubu.",
    tone: "olive",
  },
  {
    slug: "enerji",
    title: "Enerji",
    definition: "Bedenin aldığı ve harcadığı enerjinin değişen dengesi.",
    tone: "ochre",
  },
  {
    slug: "metabolizma",
    title: "Metabolizma",
    definition: "Maddelerin beden içinde dönüştüğü, taşındığı ve kullanıldığı süreçler.",
    tone: "orange",
  },
  {
    slug: "lif",
    title: "Lif",
    definition: "Bağırsak, tokluk ve mikrobiyota ile ilişkili sindirilmeyen bileşenler.",
    tone: "olive",
  },
  {
    slug: "hidrasyon",
    title: "Hidrasyon",
    definition: "Sıvı dengesinin dolaşım, ısı ve gündelik işlevlerle ilişkisi.",
    tone: "coral",
  },
  {
    slug: "mikro-besinler",
    title: "Mikro Besinler",
    definition: "Az miktarlarda alınsa da çok sayıda süreci destekleyen vitamin ve mineraller.",
    tone: "ochre",
  },
] as const satisfies readonly TopicRecord[];
