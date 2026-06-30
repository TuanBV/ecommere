import Link from 'next/link';
import { notFound } from 'next/navigation';

const COMPANY = {
  name: 'CÔNG TY TNHH THƯƠNG MẠI VÀ CÔNG NGHỆ GHD',
  brand: 'Green Home Shop',
  taxId: '0110891976',
  phone: '0852 262 666',
  email: 'lienheghd@gmail.com',
  address:
    'LK7-142, Khu tái định cư phục vụ giải phóng mặt bằng, Xã Tứ Hiệp, Huyện Thanh Trì, Thành phố Hà Nội, Việt Nam'
};

type PolicySection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

type Policy = {
  title: string;
  description: string;
  lead: string;
  sections: PolicySection[];
};

const policies: Record<string, Policy> = {
  'quy-dinh-chung': {
    title: 'Điều khoản sử dụng',
    description:
      'Quy định và điều khoản sử dụng website Green Home Shop, bao gồm hướng dẫn sử dụng dịch vụ, bản quyền, giá cả và bảo mật.',
    lead: 'Quý khách vui lòng đọc kỹ các quy định dưới đây để hiểu rõ quyền lợi và trách nhiệm khi trải nghiệm dịch vụ tại Green Home Shop.',
    sections: [
      {
        heading: '1. Chúng tôi là ai',
        body: [
          `${COMPANY.brand} là thương hiệu thuộc ${COMPANY.name}, chuyên cung cấp giải pháp nhà thông minh và thiết bị gia dụng chính hãng như robot hút bụi, máy lọc không khí, tivi thông minh.`,
          `Mã số thuế: ${COMPANY.taxId}. Khi truy cập website, quý khách đồng ý tuân thủ các điều khoản sử dụng này. Green Home Shop có quyền cập nhật nội dung khi cần thiết để phù hợp với hoạt động kinh doanh và quy định pháp luật.`
        ]
      },
      {
        heading: '2. Hướng dẫn sử dụng website',
        body: [
          'Khi sử dụng website, quý khách cần đảm bảo đủ 18 tuổi hoặc truy cập dưới sự giám sát của người giám hộ hợp pháp. Quý khách cam kết có đầy đủ năng lực hành vi dân sự để thực hiện giao dịch mua bán theo quy định pháp luật Việt Nam.'
        ]
      },
      {
        heading: '3. Chấp nhận đơn hàng và giá cả',
        body: [
          'Green Home Shop có quyền từ chối hoặc hủy đơn hàng trong các trường hợp phát sinh lỗi kỹ thuật, lỗi hệ thống hoặc sai lệch giá khách quan. Chúng tôi luôn cố gắng cung cấp thông tin sản phẩm và giá bán chính xác nhất.'
        ]
      },
      {
        heading: '4. Thương hiệu và bản quyền',
        body: [
          'Mọi quyền sở hữu trí tuệ, nội dung, thiết kế, văn bản, hình ảnh, đồ họa và mã nguồn trên website là tài sản của Green Home Shop hoặc đối tác được cấp quyền sử dụng. Mọi hành vi sao chép, khai thác trái phép đều không được chấp nhận.'
        ]
      },
      {
        heading: '5. Quyền pháp lý và bảo mật',
        body: [
          'Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Quý khách không được sử dụng công cụ can thiệp vào hệ thống, thay đổi cấu trúc dữ liệu hoặc thực hiện hành vi gây ảnh hưởng tới hoạt động của website.'
        ]
      }
    ]
  },
  'dieu-khoan-su-dung-va-bao-mat': {
    title: 'Điều khoản sử dụng và bảo mật',
    description:
      'Điều khoản dịch vụ và chính sách bảo mật thông tin khách hàng tại Green Home Shop.',
    lead: 'Bảo vệ dữ liệu khách hàng là ưu tiên hàng đầu. Khi truy cập và đặt hàng, quý khách đồng ý tuân thủ các quy định nhằm đảm bảo quyền lợi cho cả hai bên.',
    sections: [
      {
        heading: '1. Quy định chung về mua hàng',
        body: [
          'Để đảm bảo trải nghiệm mua sắm minh bạch, quý khách vui lòng tham khảo các chính sách vận chuyển, đổi trả, bảo hành và thanh toán trước khi đặt hàng.'
        ],
        bullets: [
          'Chính sách vận chuyển: giao hàng toàn quốc và hỗ trợ đồng kiểm.',
          'Chính sách đổi trả: hỗ trợ đổi trả trong 07 ngày nếu đủ điều kiện.',
          'Chính sách bảo hành: áp dụng theo tiêu chuẩn hãng và từng nhóm sản phẩm.',
          'Chính sách thanh toán: hỗ trợ COD và chuyển khoản ngân hàng.'
        ]
      },
      {
        heading: '2. Thu thập dữ liệu',
        body: [
          'Green Home Shop thu thập họ tên, email, số điện thoại và địa chỉ để xác nhận đơn hàng, giao hàng chính xác, hỗ trợ bảo hành và chăm sóc khách hàng.'
        ]
      },
      {
        heading: '3. Phạm vi sử dụng dữ liệu',
        body: [
          'Thông tin cá nhân chỉ được sử dụng nội bộ hoặc cung cấp cho đối tác vận chuyển trong phạm vi cần thiết để giao hàng. Green Home Shop không bán hoặc chia sẻ dữ liệu cho bên thứ ba vì mục đích quảng cáo.'
        ]
      },
      {
        heading: '4. Cookie và lưu trữ',
        body: [
          'Website có thể sử dụng cookie để ghi nhớ giỏ hàng và tối ưu tốc độ tải trang. Dữ liệu khách hàng được lưu trữ an toàn cho đến khi có yêu cầu xóa hoặc theo thời hạn cần thiết cho hoạt động dịch vụ.'
        ]
      }
    ]
  },
  'bao-hanh': {
    title: 'Chính sách bảo hành',
    description:
      'Chính sách bảo hành chính hãng từ 12-24 tháng tại Green Home Shop cho robot hút bụi, tivi và thiết bị gia dụng thông minh.',
    lead: 'Green Home Shop cam kết sản phẩm có nguồn gốc rõ ràng. Mỗi thiết bị được cung cấp đều đi kèm chế độ hậu mãi tận tâm và minh bạch.',
    sections: [
      {
        heading: '1. Thời gian bảo hành',
        bullets: [
          'Thiết bị chính như robot hút bụi, tivi, máy lọc không khí được bảo hành từ 12-24 tháng theo tiêu chuẩn của hãng.',
          'Phụ kiện và linh kiện như pin, sạc, điều khiển được bảo hành từ 01-06 tháng tùy sản phẩm.',
          'Vật tư tiêu hao như màng lọc, chổi quét, khăn lau có thể không thuộc phạm vi bảo hành.'
        ]
      },
      {
        heading: '2. Điều kiện được bảo hành',
        bullets: [
          'Sản phẩm còn trong thời hạn bảo hành.',
          'Lỗi phát sinh do kỹ thuật hoặc nhà sản xuất.',
          'Tem bảo hành còn nguyên, không rách hoặc vỡ.',
          'IMEI/Serial Number trùng khớp với hệ thống hoặc chứng từ mua hàng.'
        ]
      },
      {
        heading: '3. Trường hợp từ chối bảo hành',
        bullets: [
          'Sản phẩm hết thời hạn bảo hành.',
          'Sản phẩm rơi vỡ, móp méo, vào nước, cháy nổ do nguồn điện hoặc tác động ngoại lực.',
          'Tự ý tháo dỡ hoặc sửa chữa tại trung tâm không được ủy quyền.',
          'Hư hỏng do côn trùng, thiên tai, hỏa hoạn hoặc sử dụng sai hướng dẫn.'
        ]
      },
      {
        heading: '4. Địa điểm và phương thức bảo hành',
        body: [
          'Quý khách có thể mang sản phẩm tới trung tâm bảo hành ủy quyền của hãng hoặc gửi qua Green Home Shop để chúng tôi hỗ trợ theo dõi tiến độ sửa chữa.',
          `Địa chỉ tiếp nhận: ${COMPANY.address}. Chi phí vận chuyển bảo hành sẽ được xác nhận cụ thể theo từng trường hợp.`
        ]
      },
      {
        heading: '5. Thời gian xử lý',
        body: [
          'Thời gian xử lý trung bình từ 07 đến 15 ngày làm việc. Với linh kiện đặc thù cần nhập khẩu, Green Home Shop sẽ cập nhật thời gian cụ thể tới quý khách qua số điện thoại đăng ký.'
        ]
      }
    ]
  },
  'thanh-toan': {
    title: 'Chính sách thanh toán',
    description:
      'Hướng dẫn các hình thức thanh toán tại Green Home Shop: COD khi nhận hàng hoặc chuyển khoản ngân hàng.',
    lead: 'Green Home Shop mang đến trải nghiệm mua sắm thuận tiện và an toàn với các phương thức thanh toán linh hoạt.',
    sections: [
      {
        heading: '1. Thanh toán tiền mặt khi nhận hàng (COD)',
        bullets: [
          'Quý khách đặt hàng qua website, nhận hàng và kiểm tra sản phẩm tại nhà.',
          'Quý khách được kiểm tra sản phẩm, số lượng và hóa đơn trước khi thanh toán.',
          'Thanh toán trực tiếp cho nhân viên giao hàng theo đúng tổng tiền đã xác nhận.'
        ]
      },
      {
        heading: '2. Chuyển khoản ngân hàng',
        body: [
          'Quý khách có thể thanh toán bằng chuyển khoản ngân hàng. Nội dung chuyển khoản nên ghi theo cấu trúc: Số điện thoại + Tên khách hàng để bộ phận chăm sóc khách hàng xác nhận nhanh chóng.',
          'Sau khi chuyển khoản thành công, Green Home Shop sẽ xác nhận và tiến hành giao hàng theo thông tin đơn hàng.'
        ]
      },
      {
        heading: '3. Quy định hoàn tiền',
        body: [
          'Trong trường hợp quý khách đã thanh toán chuyển khoản nhưng muốn hủy đơn trước khi giao hoặc trả hàng theo chính sách đổi trả, Green Home Shop sẽ hoàn tiền vào tài khoản quý khách đã sử dụng trong vòng 3-5 ngày làm việc sau khi yêu cầu được phê duyệt.'
        ]
      },
      {
        heading: '4. Hỗ trợ thanh toán',
        body: [
          `Mọi thắc mắc về giao dịch, vui lòng liên hệ hotline ${COMPANY.phone} hoặc email ${COMPANY.email}.`
        ]
      }
    ]
  },
  'van-chuyen': {
    title: 'Chính sách vận chuyển',
    description:
      'Thông tin giao hàng toàn quốc, thời gian vận chuyển, đồng kiểm và trách nhiệm hàng hóa tại Green Home Shop.',
    lead: 'Green Home Shop hỗ trợ giao hàng toàn quốc. Một số sản phẩm hoặc khu vực có thể được áp dụng chính sách hỗ trợ phí vận chuyển theo từng thời điểm.',
    sections: [
      {
        heading: '1. Chính sách phí vận chuyển',
        body: [
          'Green Home Shop hỗ trợ miễn phí vận chuyển cho các đơn hàng đủ điều kiện. Một số trường hợp hàng cồng kềnh, khu vực xa hoặc yêu cầu giao/lắp đặt đặc biệt có thể phát sinh chi phí và sẽ được xác nhận trước với khách hàng.'
        ]
      },
      {
        heading: '2. Đối tác vận chuyển',
        body: [
          'Chúng tôi hợp tác với các đơn vị vận chuyển chuyên nghiệp như Giao Hàng Tiết Kiệm, Viettel Post, J&T Express và hỗ trợ giao hỏa tốc nội thành Hà Nội khi đủ điều kiện.'
        ]
      },
      {
        heading: '3. Thời gian giao hàng',
        bullets: [
          'Nội thành Hà Nội: giao nhanh trong khoảng 1-3 ngày làm việc.',
          'Các tỉnh thành khác: chuyển phát tiêu chuẩn trong khoảng 3-5 ngày làm việc.',
          'Thời gian xử lý đơn hàng thường từ 0-1 ngày làm việc.'
        ]
      },
      {
        heading: '4. Khu vực giao hàng và VAT',
        body: [
          'Green Home Shop hiện hỗ trợ giao hàng trên toàn lãnh thổ Việt Nam. Giá sản phẩm đã bao gồm VAT theo quy định hiện hành.'
        ]
      },
      {
        heading: '5. Đồng kiểm và trách nhiệm',
        body: [
          'Green Home Shop khuyến khích quý khách mở hộp kiểm tra số lượng, chủng loại và ngoại quan cùng shipper. Nếu sản phẩm bể vỡ hoặc sai thông tin, quý khách có quyền từ chối nhận hàng.',
          'Công ty chịu trách nhiệm về rủi ro hư hại hoặc thất lạc trong quá trình vận chuyển cho đến khi sản phẩm được bàn giao thành công.'
        ]
      }
    ]
  },
  'doi-tra': {
    title: 'Chính sách đổi trả và hoàn tiền',
    description:
      'Quy định đổi trả trong vòng 07 ngày và chính sách hoàn tiền minh bạch tại Green Home Shop.',
    lead: 'Green Home Shop cam kết mang đến trải nghiệm mua sắm tốt nhất và đảm bảo quyền lợi cho khách hàng trong quá trình đổi trả.',
    sections: [
      {
        heading: '1. Thời hạn đổi trả',
        body: [
          'Khách hàng có quyền yêu cầu đổi trả sản phẩm trong vòng 07 ngày kể từ ngày nhận hàng thành công, căn cứ theo dấu bưu điện hoặc vận đơn của đơn vị vận chuyển.'
        ]
      },
      {
        heading: '2. Điều kiện đổi trả sản phẩm',
        bullets: [
          'Sản phẩm còn nguyên vẹn, đầy đủ bao bì, hộp đựng và xốp chèn nếu có.',
          'Sản phẩm còn đầy đủ tem mác, hóa đơn mua hàng và quà tặng kèm theo.',
          'Sản phẩm chưa qua sử dụng, không trầy xước hoặc hỏng hóc do tác động ngoại lực sau khi nhận hàng.'
        ]
      },
      {
        heading: '3. Quy trình đổi trả',
        bullets: [
          `Bước 1: Liên hệ hotline ${COMPANY.phone} hoặc email ${COMPANY.email} để thông báo yêu cầu.`,
          `Bước 2: Gửi sản phẩm về địa chỉ ${COMPANY.address}.`,
          'Bước 3: Green Home Shop kiểm tra tình trạng sản phẩm trong vòng 2-3 ngày làm việc và thông báo kết quả.'
        ]
      },
      {
        heading: '4. Chính sách hoàn tiền',
        bullets: [
          'Hoàn tiền qua chuyển khoản ngân hàng hoặc ví điện tử theo thông tin khách hàng cung cấp.',
          'Thời gian hoàn tiền từ 03 đến 05 ngày làm việc sau khi yêu cầu được phê duyệt.',
          'Green Home Shop không thu phí tái nhập kho.'
        ]
      },
      {
        heading: '5. Chi phí đổi trả',
        body: [
          'Nếu lỗi phát sinh từ Green Home Shop như sản phẩm lỗi hoặc giao sai mẫu, chúng tôi chịu chi phí vận chuyển đổi trả. Nếu khách hàng thay đổi ý định hoặc chọn nhầm mẫu mã, quý khách vui lòng thanh toán chi phí vận chuyển hai chiều theo biểu phí của đơn vị vận chuyển.'
        ]
      }
    ]
  }
};

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

type PolicyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) return {};

  return {
    title: `${policy.title} - Green Home Shop`,
    description: policy.description
  };
}

export default async function PolicyDetailPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <main className="container pb-10">
      <article className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="mb-3 text-base text-gray-600">Trang chủ / Chính sách</div>
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold uppercase leading-tight text-gray-900 md:text-5xl">
            {policy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
            {policy.lead}
          </p>
        </header>

        <div className="space-y-7">
          {policy.sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-gray-100 p-5">
              <h2 className="border-l-4 border-blue-600 pl-4 text-xl font-semibold text-gray-900">
                {section.heading}
              </h2>
              {section.body?.map((text) => (
                <p key={text} className="mt-4 leading-8 text-gray-700">
                  {text}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 grid gap-3 text-gray-700">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3 leading-7">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="mt-10 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">
            Thông tin hỗ trợ
          </p>
          <h3 className="mt-2 text-xl font-semibold">{COMPANY.name}</h3>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-200 md:grid-cols-3">
            <p>{COMPANY.address}</p>
            <p>Hotline: {COMPANY.phone}</p>
            <p>Email: {COMPANY.email}</p>
          </div>
          <Link
            href="/lien-he"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Liên hệ hỗ trợ
          </Link>
        </footer>
      </article>
    </main>
  );
}
