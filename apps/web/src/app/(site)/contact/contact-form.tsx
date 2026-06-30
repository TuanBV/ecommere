'use client';

import { type FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { apiBaseUrl } from '@/lib/api';

type Status = {
  type: 'success' | 'error';
  message: string;
} | null;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      serviceType: String(formData.get('serviceType') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim()
    };

    if (!payload.fullName || !payload.phone) {
      setStatus({ type: 'error', message: 'Vui lòng nhập họ tên và số điện thoại.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch(`${apiBaseUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Request failed');
      form.reset();
      setStatus({
        type: 'success',
        message: 'Cảm ơn bạn. Green Home Shop đã nhận thông tin và sẽ liên hệ lại sớm.'
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'Chưa gửi được thông tin. Vui lòng thử lại hoặc gọi hotline 0852 262 666.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Họ và tên *" name="fullName" placeholder="Ví dụ: Nguyễn Văn A" />
        <Field label="Số điện thoại *" name="phone" placeholder="09xx xxx xxx" type="tel" />
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-gray-700">Dịch vụ bạn quan tâm</span>
        <select
          name="serviceType"
          className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
        >
          <option value="Robot hút bụi">Robot hút bụi lau nhà</option>
          <option value="Máy lọc không khí">Máy lọc không khí chính hãng</option>
          <option value="Bảo hành/Sửa chữa">Dịch vụ bảo hành và kỹ thuật</option>
          <option value="Hợp tác đại lý">Hợp tác đại lý/CTV</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-gray-700">Nội dung tin nhắn</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Bạn cần Green Home Shop hỗ trợ gì thêm?"
          className="resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
        />
      </label>

      {status ? (
        <div
          className={[
            'rounded-xl px-4 py-3 text-sm font-semibold',
            status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
          ].join(' ')}
        >
          {status.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold uppercase text-white shadow-lg shadow-green-700/20 transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send size={18} />
        {loading ? 'Đang gửi...' : 'Gửi thông tin ngay'}
      </button>
      <p className="text-center text-xs font-medium text-gray-500">
        Thông tin của bạn chỉ được dùng để tư vấn và hỗ trợ dịch vụ.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = 'text'
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        required={label.includes('*')}
        placeholder={placeholder}
        className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}
