'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  Info,
  Package,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Wrench
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ResponsiveImage } from '@/components/responsive-image';
import { apiBaseUrl, money } from '@/lib/api';
import { useCart } from '@/store/cart';

const schema = z.object({
  customerName: z.string().min(2, 'Vui lòng nhập họ tên'),
  customerPhone: z.string().min(8, 'Vui lòng nhập số điện thoại'),
  customerEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  shippingAddress: z.string().min(5, 'Vui lòng nhập địa chỉ nhận hàng'),
  note: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']).default('COD')
});

type CheckoutValues = z.infer<typeof schema>;

export function CheckoutForm() {
  const { items, remove, setQuantity, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'COD',
      customerEmail: '',
      note: ''
    }
  });

  const paymentMethod = form.watch('paymentMethod');

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const qrUrl = `https://img.vietqr.io/image/MB-097678888-compact2.png?amount=${total}`;

  async function submit(values: CheckoutValues) {
    if (!items.length) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          transferContent:
            values.paymentMethod === 'BANK_TRANSFER'
              ? `${values.customerPhone} ${values.customerName}`
              : '',
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      });

      if (!res.ok) throw new Error('Checkout failed');

      clear();
      form.reset();
      alert('Đặt hàng thành công!');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-[#f8fafc] py-8 text-base leading-relaxed text-gray-700 md:text-base">
      <div className="container">
        <h1 className="mb-6 text-3xl font-semibold">Thủ tục thanh toán</h1>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <form onSubmit={form.handleSubmit(submit)} className="space-y-8">
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-base text-blue-600">
                      1
                    </span>
                    Thông tin nhận hàng
                  </h2>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <Field
                        label="Họ và tên *"
                        error={form.formState.errors.customerName?.message}
                      >
                        <input
                          className="form-input w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="Nguyễn Văn A"
                          {...form.register('customerName')}
                        />
                      </Field>

                      <Field
                        label="Số điện thoại *"
                        error={form.formState.errors.customerPhone?.message}
                      >
                        <input
                          className="form-input w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="09xx xxx xxx"
                          {...form.register('customerPhone')}
                        />
                      </Field>
                    </div>

                    <Field label="Email" error={form.formState.errors.customerEmail?.message}>
                      <input
                        className="form-input w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder="example@gmail.com"
                        {...form.register('customerEmail')}
                      />
                    </Field>

                    <Field
                      label="Địa chỉ nhận hàng *"
                      error={form.formState.errors.shippingAddress?.message}
                    >
                      <textarea
                        rows={2}
                        className="form-input w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder="Số nhà, tên đường, xã/phường..."
                        {...form.register('shippingAddress')}
                      />
                    </Field>

                    <Field label="Ghi chú">
                      <textarea
                        rows={1}
                        className="form-input w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder="Lưu ý cho người giao hàng..."
                        {...form.register('note')}
                      />
                    </Field>
                  </div>
                </section>

                <section className="border-t border-gray-100 pt-8">
                  <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-base text-blue-600">
                      2
                    </span>
                    Phương thức thanh toán
                  </h2>

                  <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <PaymentCard
                      checked={paymentMethod === 'COD'}
                      title="Thanh toán khi nhận hàng"
                      desc="Trả tiền mặt khi shipper giao hàng."
                      icon={<Package size={22} />}
                      color="orange"
                      onClick={() => form.setValue('paymentMethod', 'COD')}
                    />

                    <PaymentCard
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      title="Chuyển khoản ngân hàng"
                      desc="Quét mã QR hoặc chuyển khoản App."
                      icon={<CreditCard size={22} />}
                      color="blue"
                      onClick={() => form.setValue('paymentMethod', 'BANK_TRANSFER')}
                    />
                  </div>

                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
                      <div className="flex flex-col items-center gap-5 md:flex-row">
                        <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                          <img
                            src={qrUrl}
                            alt="QR chuyển khoản"
                            className="h-36 w-36 object-contain"
                            width={144}
                            height={144}
                          />
                        </div>

                        <div className="flex-1 space-y-2 text-[14px]">
                          <BankRow label="Ngân hàng" value="NGÂN HÀNG TMCP QUÂN ĐỘI (MB Bank)" />
                          <BankRow label="Số tài khoản" value="097678888" highlight />
                          <BankRow label="Chủ TK" value="CTY TNHH THƯƠNG MẠI VÀ CÔNG NGHỆ GHD" />
                          <BankRow
                            label="Nội dung"
                            value="[Số điện thoại] + [Tên khách hàng]"
                            danger
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </form>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-[132px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:top-[176px] md:p-8 lg:top-[128px]">
              <h2 className="mb-3 flex items-center justify-between text-lg font-semibold text-gray-700">
                Đơn hàng
                <span className="text-base font-normal tracking-tight text-gray-600">
                  ({items.length} sản phẩm)
                </span>
              </h2>

              <div className="mb-3 space-y-4 pr-2">
                {items.length === 0 ? (
                  <div className="py-10 text-center text-base italic text-gray-500">
                    Giỏ hàng trống
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.productId}
                      className="group flex items-start gap-4 border-b border-gray-50 py-4 last:border-0"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                        <ResponsiveImage
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 p-1"
                          imgClassName="h-full w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-gray-700">
                            {item.title}
                          </h3>

                          <button
                            type="button"
                            onClick={() => remove(item.productId)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-end justify-between">
                          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200">
                            <button
                              type="button"
                              className="px-2 py-1"
                              onClick={() =>
                                setQuantity(item.productId, Math.max(1, item.quantity - 1))
                              }
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-2 py-1"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right text-base font-semibold text-blue-600">
                            {money(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 border-t border-dashed border-gray-200 pt-5">
                <div className="flex justify-between text-base text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-700">{money(total)}</span>
                </div>

                <div className="flex justify-between text-base text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-[15px] font-semibold text-gray-700">Tổng cộng</span>
                  <span className="text-2xl font-semibold text-red-600">{money(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={form.handleSubmit(submit)}
                disabled={!items.length || submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-[16px] font-semibold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
                <ArrowRight size={20} />
              </button>

              <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-6">
                <h5 className="mb-3 flex items-center gap-2 font-semibold text-orange-800">
                  <Info size={18} />
                  Lưu ý mua hàng
                </h5>
                <p className="text-base leading-relaxed text-orange-700">
                  Vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán. Sản phẩm được bảo hành tại
                  trung tâm ủy quyền toàn quốc.
                </p>
              </div>
            </div>
          </aside>
        </div>
        <PolicyBox />
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block">
        <span className="ml-1 block text-sm font-semibold uppercase text-gray-600">{label}</span>
        {children}
      </label>
      {error ? <p className="ml-1 mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function PaymentCard({
  checked,
  title,
  desc,
  icon,
  color,
  onClick
}: {
  checked: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: 'orange' | 'blue';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex h-full flex-col gap-2 overflow-hidden rounded-xl border-2 bg-white p-4 text-left transition-all',
        checked
          ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100 -translate-y-0.5'
          : 'border-gray-100 hover:border-blue-200'
      ].join(' ')}
    >
      <div
        className={[
          'flex h-10 w-10 items-center justify-center rounded-xl text-xl',
          color === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
        ].join(' ')}
      >
        {icon}
      </div>

      <div>
        <p className="text-[14px] font-semibold text-gray-700">{title}</p>
        <p className="mt-1 text-base text-gray-600">{desc}</p>
      </div>

      {checked && (
        <CheckCircle
          size={22}
          fill="currentColor"
          className="absolute right-3 top-3 text-blue-600"
        />
      )}
    </button>
  );
}

function BankRow({
  label,
  value,
  highlight,
  danger
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-gray-200 pb-1 last:border-b-0">
      <span className="text-gray-600">{label}:</span>
      <span
        className={[
          'text-right font-semibold',
          highlight ? 'text-blue-700' : '',
          danger ? 'text-red-600' : '',
          !highlight && !danger ? 'text-gray-700' : ''
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function PolicyBox() {
  return (
    <div className="my-6 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
          <ShieldCheck className="text-blue-600" size={20} />
          Chính sách mua hàng
        </h3>

        <div className="grid grid-cols-1 gap-3 text-base sm:grid-cols-2">
          <PolicyItem
            href="/chinh-sach/van-chuyen"
            icon={<Package size={18} />}
            title="Chính sách vận chuyển"
            desc="Miễn phí giao hàng, thời gian giao dự kiến và mã vận đơn."
            color="blue"
          />

          <PolicyItem
            href="/chinh-sach/thanh-toan"
            icon={<CreditCard size={18} />}
            title="Chính sách thanh toán"
            desc="Hỗ trợ COD và chuyển khoản ngân hàng an toàn."
            color="green"
          />

          <PolicyItem
            href="/chinh-sach/bao-hanh"
            icon={<Wrench size={18} />}
            title="Chính sách bảo hành"
            desc="Bảo hành chính hãng, hỗ trợ tại trung tâm ủy quyền."
            color="orange"
          />

          <PolicyItem
            href="/chinh-sach/doi-tra"
            icon={<RefreshCcw size={18} />}
            title="Chính sách đổi trả"
            desc="Hỗ trợ đổi trả theo điều kiện sản phẩm và thời gian quy định."
            color="purple"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          Bằng việc xác nhận đặt hàng, quý khách đồng ý với các điều khoản mua hàng, chính sách vận
          chuyển, thanh toán, bảo hành và đổi trả của Green Home Shop.
        </p>
      </div>
    </div>
  );
}

function PolicyItem({
  href,
  icon,
  title,
  desc,
  color
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-start gap-3 rounded-xl border border-blue-100 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-sm"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}
      >
        {icon}
      </span>

      <span>
        <span className="block font-semibold text-gray-700">{title}</span>
        <span className="mt-0.5 block text-sm text-gray-600">{desc}</span>
      </span>
    </Link>
  );
}
