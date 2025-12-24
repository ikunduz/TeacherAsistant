import { format } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { Lesson, Student, Teacher } from '../types';

export class ReportService {
  static async generateStudentReport(
    student: Student,
    teacher: Teacher | null,
    lessons: Lesson[],
    settings: any,
    t: any,
    language: string
  ) {
    try {
      const dateLocale = language === 'tr' ? tr : enUS;
      const reportDate = format(new Date(), 'dd MMMM yyyy', { locale: dateLocale });
      const monthName = format(new Date(), 'MMMM yyyy', { locale: dateLocale });

      // Business Branding - sadece renk ve isim, logo yok (performans için)
      const brandColor = teacher?.themeColor || teacher?.businessColor || '#007AFF';
      const teacherName = teacher?.fullName || 'Teacher';
      const teacherSubject = teacher?.subject || '';

      // Metrics HTML
      const metricsHtml = (student.metrics || []).map(metric => {
        const latestValue = metric.values?.length > 0 ? metric.values[metric.values.length - 1].score : 0;
        let progressDisplay = '';

        if (metric.type === 'star') {
          progressDisplay = `<div style="display: flex; gap: 4px;">${[1, 2, 3, 4, 5].map(s =>
            `<span style="color: ${latestValue >= s ? '#F59E0B' : '#E2E8F0'}; font-size: 18px;">★</span>`
          ).join('')}</div>`;
        } else {
          const percentage = metric.type === 'percentage' ? latestValue : Math.min((latestValue / 100) * 100, 100);
          progressDisplay = `
                        <div style="width: 100%; background: #F1F5F9; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 8px;">
                            <div style="width: ${percentage}%; background: ${brandColor}; height: 100%; border-radius: 5px;"></div>
                        </div>
                        <div style="font-size: 12px; font-weight: 700; color: #64748B; margin-top: 4px;">${latestValue}${metric.type === 'percentage' ? '%' : '/100'}</div>
                    `;
        }

        return `
                    <div style="margin-bottom: 20px; background: #F8FAFC; padding: 15px; border-radius: 12px; border: 1px solid #E2E8F0;">
                        <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 5px;">${metric.name}</div>
                        ${progressDisplay}
                    </div>
                `;
      }).join('');

      // Summary Logic
      const studentLessons = lessons.filter(l => l.studentId === student.id);
      const thisMonthLessons = studentLessons.filter(l => {
        const d = new Date(l.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      // Dil desteği için metin
      const texts = language === 'tr' ? {
        report: 'Öğrenci Gelişim Raporu',
        metrics: 'Gelişim Metrikleri',
        evaluation: 'Öğretmen Değerlendirmesi',
        lessonsThisMonth: 'Bu Ay Ders Sayısı',
        balance: 'Güncel Bakiye',
        totalLessons: 'Toplam Ders',
        level: 'Seviye',
        noMetrics: 'Henüz metrik tanımlanmadı',
        noEvaluation: 'Değerlendirme notu eklenmemiş',
        generatedBy: 'CoachPro ile oluşturuldu',
        preparedBy: 'Hazırlayan'
      } : {
        report: 'Student Progress Report',
        metrics: 'Progress Metrics',
        evaluation: 'Teacher Evaluation',
        lessonsThisMonth: 'Lessons This Month',
        balance: 'Current Balance',
        totalLessons: 'Total Lessons',
        level: 'Level',
        noMetrics: 'No metrics defined yet',
        noEvaluation: 'No evaluation note added',
        generatedBy: 'Generated with CoachPro',
        preparedBy: 'Prepared by'
      };

      // Premium HTML tasarım - fotoğraf yok, sadece isim initali
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #1E293B; 
            padding: 40px; 
            line-height: 1.6;
            background: #fff;
        }
        
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 40px; 
            border-bottom: 3px solid ${brandColor}; 
            padding-bottom: 25px; 
        }
        .branding { 
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .brand-initial {
            width: 50px;
            height: 50px;
            background: ${brandColor};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: 900;
        }
        .brand-info h2 { font-size: 18px; font-weight: 700; color: #0F172A; }
        .brand-info p { font-size: 14px; color: #64748B; }
        
        .report-info { text-align: right; }
        .report-title { 
            font-size: 14px; 
            color: ${brandColor}; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .report-date { font-size: 20px; font-weight: 800; color: #0F172A; }
        .report-sub { font-size: 13px; color: #94A3B8; margin-top: 3px; }
        
        .student-card { 
            display: flex; 
            align-items: center; 
            gap: 20px; 
            background: linear-gradient(135deg, ${brandColor}15, ${brandColor}05);
            padding: 25px; 
            border-radius: 16px; 
            border-left: 5px solid ${brandColor};
            margin-bottom: 35px;
        }
        .student-initial { 
            width: 70px; 
            height: 70px; 
            border-radius: 35px; 
            background: ${brandColor}; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            color: white; 
            font-size: 28px; 
            font-weight: 900;
            flex-shrink: 0;
        }
        .student-meta { flex: 1; }
        .student-name { font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 5px; }
        .student-info { font-size: 14px; color: #64748B; }
        .student-badge { 
            display: inline-block;
            background: ${brandColor}20;
            color: ${brandColor};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }
        
        .section-title { 
            font-size: 16px; 
            font-weight: 800; 
            border-left: 4px solid ${brandColor}; 
            padding-left: 14px; 
            margin: 35px 0 20px 0; 
            color: #0F172A;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metrics-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
        }
        
        .evaluation-box { 
            background: #FAFAFA; 
            padding: 25px; 
            border-radius: 16px; 
            border: 2px dashed #E2E8F0; 
            margin-bottom: 35px;
        }
        .evaluation-text { 
            font-size: 15px; 
            color: #475569; 
            font-style: italic; 
            white-space: pre-wrap;
            line-height: 1.8;
        }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 30px; }
        .stat-card { 
            background: #F8FAFC; 
            padding: 20px; 
            border-radius: 14px; 
            text-align: center;
            border: 1px solid #E2E8F0;
        }
        .stat-val { font-size: 28px; font-weight: 900; color: ${brandColor}; }
        .stat-label { font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700; margin-top: 6px; letter-spacing: 0.5px; }
        
        .footer { 
            text-align: center; 
            margin-top: 50px; 
            color: #94A3B8; 
            font-size: 11px; 
            border-top: 1px solid #F1F5F9; 
            padding-top: 20px;
        }
        .footer-brand { font-weight: 700; color: ${brandColor}; }
    </style>
</head>
<body>
    <div class="header">
        <div class="branding">
            <div class="brand-initial">${teacherName.charAt(0).toUpperCase()}</div>
            <div class="brand-info">
                <h2>${teacherName}</h2>
                <p>${teacherSubject}</p>
            </div>
        </div>
        <div class="report-info">
            <div class="report-title">${texts.report}</div>
            <div class="report-date">${monthName}</div>
            <div class="report-sub">${reportDate}</div>
        </div>
    </div>

    <div class="student-card">
        <div class="student-initial">${student.fullName.charAt(0).toUpperCase()}</div>
        <div class="student-meta">
            <div class="student-name">${student.fullName}</div>
            <div class="student-info">${student.grade || ''}</div>
            ${student.statusTag ? `<div class="student-badge">${student.statusTag}</div>` : ''}
        </div>
    </div>

    <div class="section-title">📊 ${texts.metrics}</div>
    <div class="metrics-grid">
        ${metricsHtml || `<div style="grid-column: span 2; color: #94A3B8; font-style: italic; padding: 20px; text-align: center;">${texts.noMetrics}</div>`}
    </div>

    <div class="section-title">📝 ${texts.evaluation}</div>
    <div class="evaluation-box">
        <div class="evaluation-text">${student.evaluationNote || texts.noEvaluation}</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-val">${thisMonthLessons.length}</div>
            <div class="stat-label">${texts.lessonsThisMonth}</div>
        </div>
        <div class="stat-card">
            <div class="stat-val">${studentLessons.length}</div>
            <div class="stat-label">${texts.totalLessons}</div>
        </div>
        <div class="stat-card">
            <div class="stat-val">${settings.currency}${Math.abs(student.balance || 0)}</div>
            <div class="stat-label">${texts.balance}</div>
        </div>
    </div>

    <div class="footer">
        <span class="footer-brand">CoachPro</span> • ${texts.preparedBy}: ${teacherName} • ${reportDate}
    </div>
</body>
</html>
            `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const safeStudentName = student.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const safeMonth = format(new Date(), 'yyyy-MM', { locale: dateLocale });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${student.fullName} - ${texts.report}`,
          UTI: 'com.adobe.pdf'
        });
      }
      return uri;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'PDF oluşturulurken bir hata oluştu.' : 'An error occurred while generating PDF.'
      );
      return null;
    }
  }

  // Finans raporu için yeni metod
  static async generateFinanceReport(
    grossIncome: number,
    netIncome: number,
    totalLessons: number,
    avgFee: number,
    recentPayments: any[],
    settings: any,
    teacher: Teacher | null,
    language: string,
    periodLabel: string
  ) {
    try {
      const dateLocale = language === 'tr' ? tr : enUS;
      const reportDate = format(new Date(), 'dd MMMM yyyy', { locale: dateLocale });
      const brandColor = teacher?.themeColor || '#007AFF';
      const teacherName = teacher?.fullName || 'Teacher';
      const currency = settings.currency || '₺';

      const texts = language === 'tr' ? {
        title: 'Finansal Rapor',
        gross: 'Brüt Gelir',
        net: 'Net Gelir',
        lessons: 'Toplam Ders',
        avgFee: 'Ortalama Ücret',
        recentPayments: 'Son Ödemeler',
        preparedBy: 'Hazırlayan',
        noPayments: 'Henüz ödeme yok'
      } : {
        title: 'Financial Report',
        gross: 'Gross Income',
        net: 'Net Income',
        lessons: 'Total Lessons',
        avgFee: 'Average Fee',
        recentPayments: 'Recent Payments',
        preparedBy: 'Prepared by',
        noPayments: 'No payments yet'
      };

      const paymentsHtml = recentPayments.length > 0
        ? recentPayments.map(p => `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">${p.studentName}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">${format(new Date(p.date), 'dd MMM', { locale: dateLocale })}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #10B981; font-weight: 700;">+${currency}${p.amount}</td>
                    </tr>
                `).join('')
        : `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #94A3B8;">${texts.noPayments}</td></tr>`;

      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #1E293B; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid ${brandColor}; padding-bottom: 20px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-icon { width: 45px; height: 45px; background: ${brandColor}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 900; }
        .brand-name { font-size: 18px; font-weight: 700; }
        .report-meta { text-align: right; }
        .report-title { font-size: 13px; color: ${brandColor}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .report-period { font-size: 22px; font-weight: 800; color: #0F172A; margin-top: 3px; }
        .report-date { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 35px; }
        .stat-box { background: #F8FAFC; padding: 20px; border-radius: 14px; text-align: center; border: 1px solid #E2E8F0; }
        .stat-box.primary { background: ${brandColor}10; border-color: ${brandColor}30; }
        .stat-val { font-size: 26px; font-weight: 900; color: ${brandColor}; }
        .stat-label { font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 700; margin-top: 5px; letter-spacing: 0.5px; }
        
        .section-title { font-size: 14px; font-weight: 800; border-left: 4px solid ${brandColor}; padding-left: 12px; margin: 30px 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; background: #FAFAFA; border-radius: 12px; overflow: hidden; }
        th { background: #F1F5F9; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; }
        
        .footer { text-align: center; margin-top: 50px; color: #94A3B8; font-size: 11px; border-top: 1px solid #F1F5F9; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <div class="brand-icon">${teacherName.charAt(0)}</div>
            <div class="brand-name">${teacherName}</div>
        </div>
        <div class="report-meta">
            <div class="report-title">${texts.title}</div>
            <div class="report-period">${periodLabel}</div>
            <div class="report-date">${reportDate}</div>
        </div>
    </div>

    <div class="stats-row">
        <div class="stat-box primary">
            <div class="stat-val">${currency}${Math.round(grossIncome).toLocaleString()}</div>
            <div class="stat-label">${texts.gross}</div>
        </div>
        <div class="stat-box">
            <div class="stat-val">${currency}${Math.round(netIncome).toLocaleString()}</div>
            <div class="stat-label">${texts.net}</div>
        </div>
        <div class="stat-box">
            <div class="stat-val">${totalLessons}</div>
            <div class="stat-label">${texts.lessons}</div>
        </div>
        <div class="stat-box">
            <div class="stat-val">${currency}${Math.round(avgFee)}</div>
            <div class="stat-label">${texts.avgFee}</div>
        </div>
    </div>

    <div class="section-title">💳 ${texts.recentPayments}</div>
    <table>
        <thead>
            <tr>
                <th>${language === 'tr' ? 'Öğrenci' : 'Student'}</th>
                <th>${language === 'tr' ? 'Tarih' : 'Date'}</th>
                <th style="text-align: right;">${language === 'tr' ? 'Tutar' : 'Amount'}</th>
            </tr>
        </thead>
        <tbody>
            ${paymentsHtml}
        </tbody>
    </table>

    <div class="footer">
        <strong style="color: ${brandColor};">CoachPro</strong> • ${texts.preparedBy}: ${teacherName} • ${reportDate}
    </div>
</body>
</html>
            `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: texts.title,
          UTI: 'com.adobe.pdf'
        });
      }
      return uri;
    } catch (error) {
      console.error('Finance PDF Error:', error);
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'PDF oluşturulurken bir hata oluştu.' : 'An error occurred while generating PDF.'
      );
      return null;
    }
  }
}
