import type { Metadata } from "next";
import { editorialEmail } from "@/lib/editorial-contact";
import styles from "../legal/legal.module.css";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | CALORYTHM",
  description: "CALORYTHM web sitesi ve yayın araçlarında kişisel verilerin kullanımına ilişkin bilgiler.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page} id="ana-icerik" tabIndex={-1} data-header-tone="light">
      <p className={styles.eyebrow}>CALORYTHM · 24 Eylül 2026</p>
      <h1>Gizlilik politikası.</h1>
      <p>Bu metin, CALORYTHM web sitesi ve içerik yayımlama araçları kullanılırken işlenen bilgileri açıklar. Sorularınız ve veri talepleriniz için <a href={`mailto:${editorialEmail}`}>{editorialEmail}</a> adresinden bize ulaşabilirsiniz.</p>

      <h2>Web sitesini ziyaret ettiğinizde</h2>
      <p>Sayfaları görüntülemek için cihazınız ile web sitesinin sunucusu arasında teknik veriler (örneğin IP adresi, istek zamanı ve tarayıcı bilgisi) iletilir. Bu veriler sitenin sunulması ve güvenliği için barındırma hizmeti tarafından işlenebilir. Sitedeki dış bağlantılara gittiğinizde ilgili hizmetin kendi gizlilik koşulları geçerli olur.</p>

      <h2>Bize yazdığınızda</h2>
      <p>E-posta ile paylaştığınız ad, iletişim bilgisi ve mesaj içeriğini talebinizi yanıtlamak ve ilgili yazışmayı yürütmek için kullanırız. E-posta göndermek isteğe bağlıdır.</p>

      <h2>Sosyal medya bağlantıları</h2>
      <p>CALORYTHM’ün içerik yayımlama aracında bir sosyal medya hesabını bağlamayı seçerseniz, ilgili platformun izin ekranında onayladığınız yetkiler kapsamında erişim belirteçleri alınır. Bu bilgiler hesabı bağlamak ve sizin başlattığınız video yükleme işlemlerini yürütmek için kullanılır. Yüklemeyi seçtiğiniz video ve açıklama ilgili platforma gönderilir. Hesap bağlantısını araç içinden kesebilirsiniz. TikTok, Instagram ve YouTube’un kendi gizlilik politikaları platformlardaki işlemler için ayrıca geçerlidir.</p>

      <h2>Haklarınız ve iletişim</h2>
      <p>Hakkınızdaki bilgilere erişim, düzeltme veya silme talebinizi <a href={`mailto:${editorialEmail}`}>{editorialEmail}</a> adresine iletebilirsiniz. Talebi değerlendirirken kimliğinizi doğrulamamız gerekebilir. Bu politika, hizmetteki değişikliklere göre güncellenebilir; güncel sürüm bu sayfada yayımlanır.</p>
    </main>
  );
}
