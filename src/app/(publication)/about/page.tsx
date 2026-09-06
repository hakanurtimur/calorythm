import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";

const method = [
  { title: "Kaynağına bakarız.", label: "Araştırma", body: "Bir araştırmanın başlığından fazlasını okuruz. Nasıl yapıldığı, kimleri kapsadığı ve ne bulduğu, anlatacağımız hikâyenin başlangıcıdır." },
  { title: "Bildiğimiz kadarını söyleriz.", label: "Açıklık", body: "Tek bir çalışma her soruyu yanıtlamaz. Güçlü bulgularla henüz tartışılan noktaları ayırır, belirsizliği metnin dışında bırakmayız." },
  { title: "Bütünü gözden kaçırmayız.", label: "Bağlam", body: "Bir besini, bir sayıyı ya da bir sonucu tek başına ele almayız. Hangi koşullarda, kimler için ve ne anlama geldiğini açıklamaya çalışırız." },
  { title: "Anlaşılır hâle getiririz.", label: "Anlatım", body: "Metni, görseli ve hareketi aynı sorunun etrafında kurarız. Tasarımın görevi, okuduklarını takip etmeyi ve anlamayı kolaylaştırmaktır." },
] as const;

const contributionPrinciples = [
  { title: "Konu uyumu", body: "Beslenme, gıda ve insan bedeni üzerine açıklamak istediğin bir soru, ele almak istediğin bir araştırma ya da geliştirdiğin bir yazı fikriyle başlayabilirsin." },
  { title: "Kaynak beklentisi", body: "Temel iddiaların dayandığı araştırmaları ve rehberleri önerinle birlikte paylaş. Kaynağın niteliği kadar, bulgunun metinde nasıl yorumlandığına da bakıyoruz." },
  { title: "Editoryal inceleme", body: "Öneriyi önce konu ve kapsam açısından değerlendiririz. Yayına hazırlanan metinleri kaynakları, bilimsel doğruluğu ve anlatımıyla birlikte inceleriz. Her öneri yayımlanmayabilir." },
  { title: "Kapsam ve sınırlar", body: "Yazının kimler ve hangi koşullar için geçerli olduğunu açıkça belirt. Genel bir bilgiyi kişiye özel beslenme önerisi gibi sunmamak bizim için önemli." },
  { title: "Çıkar çatışması", body: "Konuyla ilgili ticari ilişkileri, ürün bağlantılarını ve diğer çıkar çatışmalarını önerinle birlikte açıkla. Okurun bunları bilmesi gerekir." },
] as const;

export default function AboutPage() {
  const configuredContact = process.env.NEXT_PUBLIC_EDITORIAL_CONTACT_URL?.trim();

  return (
    <main className={styles.about} id="ana-icerik" tabIndex={-1} data-header-tone="light">
      <header className={styles.manifesto}>
        <div className={styles.coverArt}>
          <Image src="/images/calorythm-folio-base-branded-v2.webp" alt="CALORYTHM dergisini okuyan taş heykel." fill priority sizes="100vw" />
        </div>
        <div className={styles.coverCopy}>
          <p className={styles.eyebrow}>CALORYTHM hakkında</p>
          <h1>Beslenmeyi<br /> <em>anlamak için.</em></h1>
          <p className={styles.deck}>Beslenme bilimine merakla bakan<br className={styles.desktopBreak} /> bağımsız bir dijital dergiyiz.</p>
          <p className={styles.introduction}>Çok şey söyleniyor, çok azı açıklanıyor. CALORYTHM’de araştırmalara dayanan, sorulara yer açan ve okumaktan keyif alacağın hikâyeler hazırlıyoruz.</p>
          <Link className={styles.coverLink} href="/journal">Dergiyi keşfet <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.coverFoot}><span>Beslenme bilimi · Kültür · Merak</span><a href="#editorial-method">Yayının arkasında <span aria-hidden="true">↓</span></a></div>
      </header>

      <section className={styles.method} aria-labelledby="editorial-method">
        <header>
          <p className={styles.eyebrow}>Nasıl çalışıyoruz?</p>
          <h2 id="editorial-method">Editoryal<br /> <em>yöntem.</em></h2>
          <p>İyi bir yazı, okurun aklındaki soruyu ciddiye alır. Bizim için her konu bu özenle başlar.</p>
        </header>
        <ol>
          {method.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepLabel}><span>0{index + 1}</span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <aside className={styles.founder} aria-labelledby="kurucu-notu">
        <h2 id="kurucu-notu">Kısa bir kurucu notu</h2>
        <p>CALORYTHM, diyetisyenlik deneyimiyle yazılım ve tasarım merakının bir araya gelmesiyle doğdu. Çıkış noktası basitti: beslenme bilimini hem güvenilir hem de okumak isteyeceğimiz bir biçimde anlatmak. Şimdi bu yayını, aynı özeni paylaşan yeni seslerle büyütmek istiyoruz.</p>
      </aside>

      <section className={styles.contribution} id="katki" aria-labelledby="katki-basligi" data-header-tone="dark">
        <div className={styles.contributionIntro}>
          <p className={styles.eyebrow}>Birlikte yayımlayalım</p>
          <h2 id="katki-basligi">Anlatmak<br /> istediğin bir<br /> <em>konu var mı?</em></h2>
          <p>Beslenme alanında çalışan, araştıran ya da yazan biriysen, fikrini duymak isteriz. Birlikte üzerinde çalışabileceğimiz iyi bir soruyla başlayabiliriz.</p>
          <Link className={styles.contactLink} href={configuredContact || "#iletisim-bilgisi"}>
            {configuredContact ? "Katkı için iletişime geç" : "Başvuru bilgisi"}<span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className={styles.guidelines}>
          <h3>Yazar olarak katıl</h3>
          <p>Bir öneri hazırlamadan önce</p>
          {contributionPrinciples.map((principle, index) => (
            <details key={principle.title}>
              <summary><span className={styles.detailNumber}>0{index + 1}</span>{principle.title}<span className={styles.plus} aria-hidden="true" /></summary>
              <p>{principle.body}</p>
            </details>
          ))}
          <div className={styles.contact} id="iletisim-bilgisi">
            <h3>İletişim bilgisi</h3>
            {configuredContact ? <p>Yazı fikrini, kısa bir tanıtımını ve yararlanmak istediğin kaynakları katkı bağlantısı üzerinden paylaşabilirsin.</p> : <p>Katkı başvuruları henüz açılmadı. Başvuru kanalını hazır olduğunda burada paylaşacağız.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
