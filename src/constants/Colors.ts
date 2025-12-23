// FinalTeacher Renk Paleti
// Modern, temiz, yumuşak ve kullanıcı dostu tasarım

export const Colors = {
  // Ana Renkler
  primary: '#F687B3',        // Canlı pastel pembe - Butonlar, başlıklar, ikonlar
  background: '#FFF5F7',     // Çok açık pembe/beyaz - Sayfa zeminleri
  card: '#FFFFFF',           // Bembeyaz - Kartlar

  // Durum Renkleri
  success: '#48BB78',        // Canlı yeşil - Ders Yapıldı, Ödendi, tik işaretleri
  warning: '#ECC94B',        // Sarı - Uyarılar
  error: '#FC8181',          // Açık kırmızı - Hatalar
  danger: '#FC8181',         // Açık kırmızı - Tehlikeli işlemler (error ile aynı)
  info: '#63B3ED',           // Açık mavi - Bilgilendirme

  // Metin Renkleri
  text: '#2D3748',           // Koyu gri - Ana metin (asla #000 kullanma)
  textSecondary: '#718096',  // Orta gri - İkincil metin
  textLight: '#A0AEC0',      // Açık gri - Placeholder

  // Input & Border
  border: '#E2E8F0',         // Gri kenarlık
  inputBackground: '#FFFFFF', // Input arka planı

  // Gölge (iOS)
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Elevation (Android)
  elevation: 4,

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 16,
    large: 20,
    full: 9999,
  },
};

// Tema sabitleri (eski yapıyla uyumluluk için)
export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.textLight,
    tabIconSelected: Colors.primary,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A202C',
    tint: Colors.primary,
    tabIconDefault: '#718096',
    tabIconSelected: Colors.primary,
  },
};
