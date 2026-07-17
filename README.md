# سامانه خودمراقبتی

پلتفرم دیجیتال سلامت فارسی (RTL) برای مدیریت پرونده سلامت، نوبت‌دهی، خودارزیابی، یادآوری‌ها، مراکز نزدیک، آموزش سلامت و دستیار ایمن.

## اجرای محلی

```bash
npm install
cp .env.example .env
npm run dev
```

به‌صورت پیش‌فرض `VITE_USE_MOCK_DATA=true` است و تمام داده‌ها ساختگی فارسی هستند.

## حساب‌های آزمایشی

| نقش | ایمیل | رمز |
|-----|--------|-----|
| شهروند | `sara.mohammadi@demo.selfcare.ir` | `Demo@1404` |
| تیم سلامت | `dr.rezaei@demo.selfcare.ir` | `Demo@1404` |
| مدیر | `admin@demo.selfcare.ir` | `Admin@1404` |

از صفحه ورود می‌توانید با یک کلیک وارد هر نقش شوید.

## Supabase

اسکیما و RLS در `supabase/migrations/` تعریف شده‌اند.

```bash
npx supabase start
npx supabase db reset
```

سپس `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را از خروجی Studio تنظیم کنید و `VITE_USE_MOCK_DATA=false` بگذارید.

**نکته امنیتی:** کلید `service_role` هرگز در فرانت‌اند قرار نگیرد. مدیران به‌صورت خودکار به محتوای بالینی دسترسی نامحدود ندارند.

## ساخت تولید

```bash
npm run build
npm run preview
```
