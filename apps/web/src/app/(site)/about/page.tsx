import Link from 'next/link';
import { BadgeCheck, Clock, MapPin, ShieldCheck, Sparkles, Wrench } from 'lucide-react';

const address =
  'LK7-142, Khu tái định cư phục vụ giải phóng mặt bằng, Xã Tứ Hiệp, Huyện Thanh Trì, Thành phố Hà Nội, Việt Nam';

export const metadata = {
  title: 'Giới thiệu Green Home Shop - Thiết bị gia dụng thông minh chính hãng',
  description:
    'Green Home Shop chuyên cung cấp robot hút bụi, máy lọc không khí và thiết bị gia dụng thông minh chính hãng cho gia đình Việt.'
};

export default function AboutPage() {
  return (
    <main className="container pb-10">
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <header className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <div className="mb-3 text-base text-gray-600">Trang chủ / Giới thiệu</div>
            <h1 className="text-3xl font-semibold leading-tight text-blue-700 md:text-5xl">
              Green Home Shop - Giải pháp công nghệ cho gia đình Việt
            </h1>
            <p className="mt-5 text-xl font-semibold italic text-blue-600">
              Chia sẻ gánh nặng, thăng bằng cuộc sống, kiến tạo hạnh phúc.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-700">
              Green Home Shop là thương hiệu thuộc Công ty TNHH Thương mại và Công nghệ GHD, chuyên
              phân phối thiết bị gia dụng thông minh chính hãng tại Việt Nam. Chúng tôi cung cấp
              robot hút bụi, máy lọc không khí và các giải pháp công nghệ giúp nâng cao chất lượng
              sống cho gia đình Việt.
            </p>
            <Link
              href="/san-pham"
              className="mt-7 inline-flex rounded-full bg-blue-700 px-7 py-3 text-sm font-semibold uppercase text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
            >
              Mua sắm sản phẩm
            </Link>
          </div>
          <figure className="relative min-h-[260px] overflow-hidden rounded-2xl bg-blue-50">
            <img
              src="/client/images/greenhomeshop.jpg"
              alt="Green Home Shop cung cấp thiết bị gia dụng thông minh chính hãng"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </figure>
        </header>

        <section className="border-t border-gray-100 p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <ContentBlock
              title="Câu chuyện của chúng tôi"
              body={[
                'Trong thời đại công nghệ 4.0, Green Home Shop thấu hiểu rằng thời gian dành cho gia đình là vô giá. Chúng tôi không chỉ cung cấp thiết bị, mà còn mang lại sự thảnh thơi cho mỗi tổ ấm.',
                'Sứ mệnh của Green Home Shop là cung cấp robot hút bụi thông minh, máy lọc không khí và thiết bị gia dụng chính hãng từ các thương hiệu được nhiều người dùng tin tưởng như Roborock, Ecovacs, Dreame, LG.'
              ]}
            />
            <ContentBlock
              title="Cam kết của Green Home Shop"
              body={[
                'Tất cả sản phẩm được phân phối với nguồn gốc rõ ràng, hỗ trợ bảo hành và kỹ thuật theo chính sách của hãng.',
                'Đội ngũ Green Home Shop hỗ trợ tư vấn, hướng dẫn sử dụng và xử lý bảo hành qua hotline, email và showroom tại Hà Nội.'
              ]}
            />
          </div>
        </section>

        <section className="bg-gray-50 p-6 md:p-10">
          <h2 className="text-2xl font-semibold text-gray-800">Hệ sinh thái sản phẩm</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<Sparkles />}
              title="Robot hút bụi"
              text="Công nghệ dẫn đường, hút lau đồng thời."
            />
            <Feature
              icon={<ShieldCheck />}
              title="Máy lọc không khí"
              text="Hệ thống lọc HEPA, tối ưu chất lượng không khí."
            />
            <Feature
              icon={<BadgeCheck />}
              title="Thiết bị giải trí"
              text="Tivi và thiết bị thông minh nâng tầm không gian sống."
            />
            <Feature
              icon={<Wrench />}
              title="Bảo hành hãng"
              text="Đội ngũ kỹ thuật hỗ trợ tận tâm theo chính sách."
            />
          </div>
        </section>

        <section className="grid gap-6 border-t border-gray-100 p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Thông tin pháp lý</h2>
            <ul className="mt-5 space-y-3 leading-7 text-gray-700">
              <li>
                <strong>Công ty:</strong> CÔNG TY TNHH THƯƠNG MẠI VÀ CÔNG NGHỆ GHD
              </li>
              <li>
                <strong>MST:</strong> 0110891976
              </li>
              <li>
                <strong>Giờ làm việc:</strong> 08:00 - 18:00, Thứ 2 - Chủ nhật
              </li>
              <li>
                <strong>Địa chỉ:</strong> {address}
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex gap-3 text-gray-700">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
              <p className="leading-7">{address}</p>
            </div>
            <div className="mt-4 flex gap-3 text-gray-700">
              <Clock className="mt-1 h-6 w-6 shrink-0 text-blue-600" />
              <p className="leading-7">Showroom hỗ trợ tư vấn trong giờ làm việc.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

function ContentBlock({ title, body }: { title: string; body: string[] }) {
  return (
    <section>
      <h2 className="border-l-4 border-blue-700 pl-4 text-2xl font-semibold text-gray-800">
        {title}
      </h2>
      <div className="mt-5 space-y-4 leading-8 text-gray-700">
        {body.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700 [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-blue-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}
