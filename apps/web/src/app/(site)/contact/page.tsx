import type React from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone, Smartphone } from 'lucide-react';
import { ContactForm } from './contact-form';

const phone = '0852 262 666';
const cleanPhone = '0852262666';
const email = 'lienheghd@gmail.com';
const address =
  'LK7-142, Khu tái định cư phục vụ giải phóng mặt bằng, Xã Tứ Hiệp, Huyện Thanh Trì, Thành phố Hà Nội, Việt Nam';

export const metadata = {
  title: 'Liên hệ Green Home Shop - Hỗ trợ và tư vấn',
  description:
    'Liên hệ Green Home Shop để được tư vấn robot hút bụi, máy lọc không khí chính hãng và hỗ trợ kỹ thuật tại Hà Nội.'
};

export default function ContactPage() {
  return (
    <main className="container pb-10">
      <div className="grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="h-full rounded-2xl bg-white p-6 shadow-sm md:p-10">
            <div className="mb-2 text-base text-gray-600">Trang chủ / Liên hệ</div>
            <h1 className="text-3xl font-semibold text-gray-800">Gửi yêu cầu tư vấn</h1>
            <p className="mt-4 max-w-2xl leading-8 text-gray-600">
              Hãy để lại thông tin, đội ngũ Green Home Shop sẽ liên hệ lại để tư vấn sản phẩm, bảo
              hành hoặc hỗ trợ kỹ thuật trong thời gian sớm nhất.
            </p>
            <div className="mt-7">
              <ContactForm />
            </div>
          </div>
        </section>

        <aside className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-3xl font-semibold text-green-700">Kết nối với chúng tôi</h2>
            <div className="mt-6 grid gap-4">
              <ContactLink
                href={`tel:${cleanPhone}`}
                icon={<Phone />}
                title="Hotline tư vấn"
                text={phone}
              />
              <ContactLink
                href={`https://zalo.me/${cleanPhone}`}
                icon={<MessageCircle />}
                title="Chat Zalo"
                text="Zalo Green Home Shop"
                external
              />
              <ContactLink
                href={`sms:${cleanPhone}`}
                icon={<Smartphone />}
                title="Gửi tin nhắn SMS"
                text={phone}
              />
              <ContactLink
                href={`mailto:${email}`}
                icon={<Mail />}
                title="Gửi email phản hồi"
                text={email}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-gray-800">Showroom Green Home Shop</h2>
            <div className="mt-5 grid gap-4">
              <InfoRow icon={<MapPin />} title="Địa chỉ" text={address} />
              <InfoRow
                icon={<Clock />}
                title="Giờ làm việc"
                text="08:00 - 18:00, Thứ 2 - Chủ nhật"
              />
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7452.571635488802!2d105.84375719959951!3d20.94103408590247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad926a912381%3A0x58f4b3bf10788674!2zQ8OUTkcgVFkgVE5ISCBUSMavxqBORyBN4bqgSSBWw4AgQ8OUTkcgTkdI4buGIEdIRA!5e0!3m2!1svi!2s!4v1778579330893!5m2!1svi!2s"
          width="100%"
          height="360"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ vị trí Green Home Shop"
          className="block border-0"
        />
      </section>
    </main>
  );
}

function ContactLink({
  href,
  icon,
  title,
  text,
  external
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'nofollow noopener noreferrer' : undefined}
      className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 shadow-sm transition hover:bg-green-50"
    >
      <span className="rounded-xl bg-green-100 p-3 text-green-700 [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-gray-500">{title}</span>
        <span className="mt-1 block text-lg font-semibold text-gray-800">{text}</span>
      </span>
    </a>
  );
}

function InfoRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-gray-50 p-4">
      <span className="text-blue-600 [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="mt-1 leading-7 text-gray-600">{text}</div>
      </div>
    </div>
  );
}
