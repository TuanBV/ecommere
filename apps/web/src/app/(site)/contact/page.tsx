import { MapPin, Phone, Mail, Clock } from 'lucide-react';
export default function ContactPage() {
  return (
    <main className="container py-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-2 text-base text-gray-600">Trang chủ / Liên hệ</div>
        <h1 className="text-3xl font-semibold text-gray-800">Liên hệ</h1>
        <div className="mt-6 grid gap-4 text-gray-700 md:grid-cols-2">
          <Card
            icon={<MapPin />}
            title="Showroom"
            text="LK7-142, Khu tái định cư phục vụ giải phóng mặt bằng, Xã Tứ Hiệp, Huyện Thanh Trì, Hà Nội"
          />
          <Card icon={<Phone />} title="Hotline" text="0852 262 666" />
          <Card icon={<Mail />} title="Email" text="greenhomeshop.vn@gmail.com" />
          <Card icon={<Clock />} title="Giờ làm việc" text="08:00 - 18:00 (Thứ 2 - Chủ nhật)" />
        </div>
      </section>
    </main>
  );
}
function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-blue-50 p-4 [&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-blue-600">
      {icon}
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="mt-1 text-base leading-7">{text}</div>
      </div>
    </div>
  );
}
