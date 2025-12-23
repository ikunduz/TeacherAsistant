import { Student, Lesson } from '../types';

export const generateReportMessage = (student: Student, allLessons: Lesson[]) => {
    // 1. Öğrencinin derslerini bul ve YENİDEN ESKİYE sırala
    const studentLessons = allLessons
        .filter(l => l.studentId === student.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let unpaidLessons: Lesson[] = [];

    if (student.balance > 0) {
        // --- MANTIK: Borcu kapatana kadar dersleri listeye ekle ---
        let collectedAmount = 0;

        for (const lesson of studentLessons) {
            if (collectedAmount < student.balance) {
                unpaidLessons.push(lesson);
                // Eğer dersin ücreti girilmemişse 0 sayar, hata vermez
                collectedAmount += lesson.fee || 0;
            } else {
                // Borç miktarını doldurduk, döngüden çık
                break;
            }
        }
    } else {
        // Borcu yoksa, bilgi amaçlı sadece en son işlenen dersi gösterelim mi?
        // "Hiç ödenmemiş ders yok" demek yerine en sonuncuyu koymak nezaketen iyidir.
        unpaidLessons = studentLessons.slice(0, 1);
    }

    // --- LİSTEYİ METNE DÖKME ---
    // Listeyi ters çevirip (Eskiden Yeniye) yazdıralım ki mantıklı dursun
    // Ya da Yeniden Eskiye (En son yapılan en üstte) kalsın. (Şu an en son yapılan en üstte)

    const topicsStr = unpaidLessons.length > 0
        ? unpaidLessons.map(l => `- ${new Date(l.date).toLocaleDateString('tr-TR')}: ${l.topic || 'Genel Tekrar'} (${l.fee} TL)`).join('\n')
        : "Listelenecek ders kaydı yok.";

    // --- BAKİYE METNİ ---
    let headerText = "";
    let balanceText = "";

    if (student.balance > 0) {
        headerText = "Aşağıdaki tarihlerde derslerimizi tamamladık:";
        balanceText = `Toplam ödenmesi gereken tutar: *${student.balance} TL*`;
    } else {
        headerText = "Tüm ödemeleriniz günceldir. Son işlenen dersimiz:";
        balanceText = student.balance === 0
            ? "Güncel bakiyeniz bulunmamaktadır. Teşekkürler."
            : `Hesabınızda *${Math.abs(student.balance)} TL* fazladan bakiye (alacak) bulunmaktadır.`;
    }

    // --- SON MESAJ ---
    return `Merhaba, ${student.fullName} ile güncel durumumuz:

${headerText}
${topicsStr}

${balanceText}

İyi günler dilerim.`;
};