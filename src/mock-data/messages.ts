import type { HealthMessage } from '@/types';

export const healthMessages: HealthMessage[] = [
  {
    id: 'msg-1',
    senderId: 'p-careteam-1',
    senderName: 'دکتر علی رضایی',
    senderRole: 'care_team',
    recipientId: 'p-citizen-1',
    recipientName: 'سارا محمدی',
    subject: 'پیگیری LDL',
    body: `سلام خانم محمدی،

نتایج آزمایش ۱۰ فروردین را بررسی کردم. LDL شما ۱۱۸ mg/dL است که کمی بالاتر از هدف (< ۱۰۰) است.

توصیه‌ها:
- رژیم کم‌چرب و افزایش فیبر
- پیاده‌روی ۳۰ دقیقه، ۵ روز در هفته
- آزمایش مجدد ۳ ماه دیگر

در صورت سؤال با من تماس بگیرید.

با احترام،
دکتر علی رضایی`,
    priority: 'normal',
    isRead: false,
    threadId: 'thread-sara-rezaei-1',
    createdAt: '2025-07-15T11:00:00.000Z',
    updatedAt: '2025-07-15T11:00:00.000Z',
  },
  {
    id: 'msg-2',
    senderId: 'p-citizen-1',
    senderName: 'سارا محمدی',
    senderRole: 'citizen',
    recipientId: 'p-careteam-1',
    recipientName: 'دکتر علی رضایی',
    subject: 'Re: پیگیری LDL',
    body: `دکتر رضایی سلام،

ممنون از راهنمایی. آیا نیاز به داروی statin داریم یا فعلاً فقط با رژیم و ورزش پیش برویم؟

سارا محمدی`,
    priority: 'normal',
    isRead: true,
    readAt: '2025-07-16T09:00:00.000Z',
    threadId: 'thread-sara-rezaei-1',
    createdAt: '2025-07-16T08:30:00.000Z',
    updatedAt: '2025-07-16T09:00:00.000Z',
  },
  {
    id: 'msg-3',
    senderId: 'p-citizen-1',
    senderName: 'سارا محمدی',
    senderRole: 'citizen',
    recipientId: 'p-careteam-1',
    recipientName: 'دکتر علی رضایی',
    subject: 'سؤال درباره لوزارتان',
    body: `سلام دکتر،

حدود یک هفته است که گاهی احساس سرگیجه خفیف دارم، مخصوصاً صبح‌ها. آیا می‌تواند مربوط به لوزارتان باشد؟

با تشکر`,
    priority: 'normal',
    isRead: false,
    threadId: 'thread-sara-rezaei-2',
    createdAt: '2025-07-16T15:00:00.000Z',
    updatedAt: '2025-07-16T15:00:00.000Z',
  },
  {
    id: 'msg-4',
    senderId: 'prov-nutrition-1',
    senderName: 'مهسا رحمانی',
    senderRole: 'provider',
    recipientId: 'p-citizen-1',
    recipientName: 'سارا محمدی',
    subject: 'برنامه غذایی هفته اول',
    body: `سلام خانم محمدی،

برنامه غذایی شخصی‌سازی‌شده برای کنترل LDL پیوست شد. لطفاً قبل از جلسه ویدئویی ۵ مرداد، فرم ۳ روزه غذایی را تکمیل کنید.

موفق باشید،
مهسا رحمانی`,
    priority: 'normal',
    isRead: true,
    readAt: '2025-07-12T10:00:00.000Z',
    threadId: 'thread-sara-nutrition-1',
    attachments: [
      {
        id: 'att-msg-4-1',
        fileName: 'meal-plan-week1.pdf',
        mimeType: 'application/pdf',
        url: '/documents/meal-plan-week1.pdf',
        uploadedAt: '2025-07-10T14:00:00.000Z',
      },
    ],
    createdAt: '2025-07-10T14:00:00.000Z',
    updatedAt: '2025-07-12T10:00:00.000Z',
  },
  {
    id: 'msg-5',
    senderId: 'p-careteam-1',
    senderName: 'دکتر علی رضایی',
    senderRole: 'care_team',
    recipientId: 'p-citizen-1',
    recipientName: 'سارا محمدی',
    subject: 'تأیید حساسیت بادام زمینی',
    body: `خانم محمدی،

گزارش حساسیت بادام زمینی شما را دریافت کردم. تا زمان ارجاع به آلرژیست، از مصرف هرگونه محصول حاوی بادام زمینی خودداری کنید. در صورت تورم ناگهانی یا تنگی نفس، فوراً ۱۱۵ تماس بگیرید.

دکتر علی رضایی`,
    priority: 'urgent',
    isRead: true,
    readAt: '2025-05-12T08:00:00.000Z',
    threadId: 'thread-sara-allergy-1',
    createdAt: '2025-05-11T16:00:00.000Z',
    updatedAt: '2025-05-12T08:00:00.000Z',
  },
  {
    id: 'msg-6',
    senderId: 'p-citizen-1',
    senderName: 'سارا محمدی',
    senderRole: 'citizen',
    recipientId: 'p-careteam-1',
    recipientName: 'دکتر علی رضایی',
    subject: 'پیگیری HbA1c مادر',
    body: `دکتر رضایی،

گزارش HbA1c مادر (مریم احمدی) را بارگذاری کردم. مقدار ۷.۲٪ است. آیا نیاز به تغییر دوز متفورمین دارد؟

سارا`,
    priority: 'normal',
    isRead: true,
    readAt: '2025-05-03T10:00:00.000Z',
    threadId: 'thread-mother-diabetes-1',
    createdAt: '2025-05-02T18:00:00.000Z',
    updatedAt: '2025-05-03T10:00:00.000Z',
  },
  {
    id: 'msg-7',
    senderId: 'prov-peds-1',
    senderName: 'دکتر زهرا موسوی',
    senderRole: 'provider',
    recipientId: 'p-citizen-1',
    recipientName: 'سارا محمدی',
    subject: 'پیگیری آسم آوا',
    body: `سلام خانم محمدی،

آخرین ویزیت آوا را بررسی کردم. علائم تحت کنترل است. لطفاً اسپری سالبوتامول را همیشه در کیف مدرسه داشته باشید. نوبت بعدی ۱۱ مرداد است.

دکتر زهرا موسوی`,
    priority: 'normal',
    isRead: true,
    readAt: '2025-07-02T09:00:00.000Z',
    threadId: 'thread-ava-asthma-1',
    createdAt: '2025-07-01T11:00:00.000Z',
    updatedAt: '2025-07-02T09:00:00.000Z',
  },
  {
    id: 'msg-8',
    senderId: 'system',
    senderName: 'سامانه خودمراقبتی',
    senderRole: 'admin',
    recipientId: 'p-citizen-1',
    recipientName: 'سارا محمدی',
    subject: 'خوش آمدید به سامانه',
    body: `سلام سارا محمدی عزیز،

به سامانه خودمراقبتی خوش آمدید. می‌توانید پرونده سلامت، نوبت‌ها، یادآوری‌ها و خودارزیابی‌ها را از یکجا مدیریت کنید.

برای شروع، پروفایل خود را تکمیل کنید و یک خودارزیابی BMI انجام دهید.`,
    priority: 'normal',
    isRead: true,
    readAt: '2024-01-10T09:00:00.000Z',
    createdAt: '2024-01-10T08:00:00.000Z',
    updatedAt: '2024-01-10T09:00:00.000Z',
  },
];

export const messagesByUser = (userId: string): HealthMessage[] =>
  healthMessages.filter((m) => m.recipientId === userId || m.senderId === userId);

export const unreadMessages = (userId: string): HealthMessage[] =>
  healthMessages.filter((m) => m.recipientId === userId && !m.isRead);

export const messagesByThread = (threadId: string): HealthMessage[] =>
  healthMessages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
