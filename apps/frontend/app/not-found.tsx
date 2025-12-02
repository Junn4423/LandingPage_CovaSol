import Link from 'next/link';

export default function RootNotFound() {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1c6e8c]">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Trang bạn tìm không tồn tại</h1>
      <p className="mt-3 text-slate-600">Đường dẫn có thể đã thay đổi sau khi nâng cấp lên nền tảng mới.</p>
      <Link href="/" className="mt-8 rounded-full px-6 py-3 text-white" style={{ background: 'linear-gradient(135deg, #124e66, #1c6e8c)' }}>
        Quay lại trang chủ
      </Link>
    </section>
  );
}
