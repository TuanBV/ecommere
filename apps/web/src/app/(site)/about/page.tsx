export default function AboutPage() {
  return (
    <InfoPage
      title="Giới thiệu Green Home Shop"
      body="Green Home Shop chuyên phân phối thiết bị gia dụng thông minh, robot hút bụi, robot lau kính, máy lọc không khí, TV và các sản phẩm công nghệ cho gia đình. Giao diện trang này được giữ theo template gốc với bố cục thông tin rõ ràng, nền trắng, bo góc và màu xanh chủ đạo."
    />
  );
}
function InfoPage({ title, body }: { title: string; body: string }) {
  return (
    <main className="container py-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-2 text-base text-gray-600">Trang chủ / Giới thiệu</div>
        <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
        <p className="mt-5 max-w-3xl leading-8 text-gray-700">{body}</p>
      </section>
    </main>
  );
}
