import type { Metadata } from "next";
import { editorialEmail } from "@/lib/editorial-contact";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | CALORYTHM",
  description: "CALORYTHM içerikleri ve yayın araçlarının kullanım koşulları.",
};

export default function TermsPage() {
  return (
    <main className={styles.page} id="ana-icerik" tabIndex={-1} data-header-tone="light">
      <p className={styles.eyebrow}>CALORYTHM · 24 Eylül 2026</p>
      <h1>Kullanım koşulları.</h1>
      <p>CALORYTHM, beslenme bilimi hakkında yazılı ve görsel içerik yayımlar. Siteyi veya CALORYTHM içerik yayımlama araçlarını kullanırken aşağıdaki koşullar geçerlidir. Sorularınız için <a href={`mailto:${editorialEmail}`}>{editorialEmail}</a> adresine yazabilirsiniz.</p>

      <h2>İçeriklerin kapsamı</h2>
      <p>Yayımlanan içerikler genel bilgilendirme amaçlıdır; kişiye özel beslenme veya sağlık hizmeti yerine geçmez. Sağlığınızla ilgili kararlar için uygun bir sağlık uzmanına başvurun.</p>

      <h2>İçeriklerin kullanımı</h2>
      <p>Kaynak göstererek içeriklerimize bağlantı verebilirsiniz. Metin, görsel ve videoların tamamını izinsiz kopyalamayın, yeniden yayımlamayın veya CALORYTHM adına sunmayın. Üçüncü taraflara ait kaynak ve görseller kendi hak sahiplerinin koşullarına tabidir.</p>

      <h2>Yayın araçları ve bağlı hesaplar</h2>
      <p>Bir sosyal medya hesabı bağlarsanız, yalnızca yetkili olduğunuz hesabı kullanın. Yüklediğiniz video, açıklama ve diğer materyallerden; bunları yayımlama hakkına sahip olmaktan siz sorumlusunuz. TikTok, Instagram ve YouTube bağlantıları ilgili platformların kullanım koşullarına da tabidir. Bir yükleme işlemi sizin başlatmanızla yapılır; platform, içeriği kendi kurallarına göre inceleyebilir veya reddedebilir.</p>

      <h2>Değişiklikler ve iletişim</h2>
      <p>Hizmet ve bu koşullar zaman içinde güncellenebilir. Güncel metin bu sayfada yayımlanır. İçeriğe veya kullanıma ilişkin taleplerinizi <a href={`mailto:${editorialEmail}`}>{editorialEmail}</a> adresine gönderebilirsiniz.</p>
    </main>
  );
}
