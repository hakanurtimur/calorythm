import Link from "next/link";
import styles from "./about.module.css";

const method = [
  {
    title: "Kaynak",
    body: "İddianın ilk elden kaynağını arar, özetlerin özetine yaslanmayız.",
  },
  {
    title: "Kanıtın gücü",
    body: "Çalışma tasarımını, örneklemi ve bulgunun ne kadar kesin konuşmaya izin verdiğini ayırırız.",
  },
  {
    title: "Bağlam",
    body: "Nüfus referansını kişisel hedefe, kısa vadeli sonucu uzun vadeli sağlığa dönüştürmeyiz.",
  },
  {
    title: "Anlatım",
    body: "Bilimsel sınırları saklamadan açık, görsel ve gündelik bir dil kurarız.",
  },
] as const;

const contributionPrinciples = [
  {
    title: "Konu uyumu",
    body: "Beslenme bilimi, gıda, fizyoloji ve bunların gündelik yaşamla ilişkisini açıklayan özgün önerileri değerlendiririz.",
  },
  {
    title: "Kaynak beklentisi",
    body: "Temel iddialar birincil araştırma, sistematik derleme ya da yetkin kurum rehberliğiyle açıkça desteklenmelidir.",
  },
  {
    title: "Editoryal inceleme",
    body: "Her metin doğruluk, kanıtın gücü, bağlam ve anlatım açısından editoryal incelemeden geçer; kabul yayın garantisi değildir.",
  },
  {
    title: "Kapsam ve sınırlar",
    body: "Metin, kimler ve hangi koşullar için konuştuğunu; nerede kişisel değerlendirme gerektiğini dürüstçe belirtmelidir.",
  },
  {
    title: "Çıkar çatışması",
    body: "Finansal bağlar, ürün ilişkileri ve konuya dair mesleki çıkar çatışması olabilecek tüm ilişkiler başvuruda açıklanmalıdır.",
  },
] as const;

export default function AboutPage() {
  const configuredContact = process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL?.trim();
  const contactHref = configuredContact || "#iletisim-bilgisi";

  return (
    <main className={styles.about} id="ana-icerik" tabIndex={-1}>
      <header className={styles.manifesto}>
        <p>Bağımsız beslenme bilimi yayını</p>
        <h1>CALORYTHM nedir?</h1>
        <p>
          CALORYTHM, beslenme bilimini kaynak, kanıt ve bağlamıyla açıklayan bağımsız
          bir dijital yayındır. Bedenin ritmini tek bir sayıya, besini tek bir rozete
          indirmeden; okurun bilgiyi nasıl tartacağını görünür kılar.
        </p>
      </header>

      <section className={styles.method} aria-labelledby="editorial-method">
        <header>
          <h2 id="editorial-method">Editoryal yöntem</h2>
          <p>
            Bir iddiayı yayımlamadan önce yalnızca sonucuna değil, nereden geldiğine
            ve hangi sınırlar içinde okunabileceğine bakarız.
          </p>
        </header>
        <ol>
          {method.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <aside className={styles.founder} aria-labelledby="kurucu-notu">
        <h2 id="kurucu-notu">Kurucudan kısa bir not</h2>
        <blockquote>
          <p>
            CALORYTHM, diyetisyenlik bilgisinin yazılım ve tasarım düşüncesiyle
            buluştuğu bir editoryal çalışma olarak doğdu. Bu iki perspektif, bilgiyi
            daha açık ve incelenebilir kılmak için burada; yayın ise tek bir kişinin
            portfolyosu değil, kendi ilkeleri olan ortak bir masa.
          </p>
        </blockquote>
      </aside>

      <section className={styles.contribution} id="katki" aria-labelledby="katki-basligi">
        <header>
          <h2 id="katki-basligi">Yazar olarak katıl</h2>
          <p>
            İyi bilgi, iyi editörlükle büyür. Uzmanların, araştırmacıların ve
            yazarların katkılarını aşağıdaki ilkelerle değerlendiriyoruz.
          </p>
        </header>
        <ul>
          {contributionPrinciples.map((principle) => (
            <li key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </li>
          ))}
        </ul>
        <Link className={styles.contactLink} href={contactHref}>
          Katkı için iletişime geç <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className={styles.contact} id="iletisim-bilgisi" aria-labelledby="iletisim-basligi">
        <h2 id="iletisim-basligi">İletişim bilgisi</h2>
        {configuredContact ? (
          <p>
            Editoryal iletişim hedefi yapılandırıldı. Katkı bağlantısı sizi başvuru
            kanalına götürür.
          </p>
        ) : (
          <p>
            Yayın sahibi, canlıya geçmeden önce NEXT_PUBLIC_EDITORIAL_CONTACT_URL
            değerini yapılandırmalıdır. Bu alan hazır olana kadar herhangi bir e-posta
            adresi ya da başvuru bağlantısı varsaymıyoruz.
          </p>
        )}
      </section>
    </main>
  );
}
