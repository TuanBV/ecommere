'use client';

import dynamic from 'next/dynamic';
import {
  Copy,
  Download,
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import 'suneditor/dist/css/suneditor.min.css';
import { mediaUrl, money } from '@/lib/api';
import { authRequest, authUpload, handleError } from '../common/api';
import type { AdminProduct, OptionItem } from '../common/types';

const SunEditor = dynamic(() => import('suneditor-react'), { ssr: false });

type ProductRow = AdminProduct & {
  category?: OptionItem | null;
  brand?: OptionItem | null;
};

type ProductForm = {
  id: string;
  title: string;
  variantName: string;
  sku: string;
  slug: string;
  categoryId: string;
  brandId: string;
  price: string;
  salePrice: string;
  stockQty: string;
  status: string;
  image: string;
  images: string[];
  color: string;
  size: string;
  description: string;
  content: string;
  specification: string;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

type Toast = {
  id: number;
  type: 'success' | 'error';
  message: string;
};

const emptyProduct: ProductForm = {
  id: '',
  title: '',
  variantName: '',
  sku: '',
  slug: '',
  categoryId: '',
  brandId: '',
  price: '',
  salePrice: '',
  stockQty: '0',
  status: '1',
  image: '',
  images: [],
  color: '',
  size: '',
  description: '',
  content: '',
  specification: ''
};

export function ProductsView({
  token,
  onUnauthorized
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [brands, setBrands] = useState<OptionItem[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [screen, setScreen] = useState<'list' | 'form'>('list');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword) ||
        (item.slug ?? '').toLowerCase().includes(keyword);
      const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
      const matchesBrand = !brandFilter || item.brandId === brandFilter;

      return matchesKeyword && matchesCategory && matchesBrand;
    });
  }, [brandFilter, categoryFilter, items, query]);

  async function load() {
    setLoading(true);
    try {
      const [products, categoryList, brandList] = await Promise.all([
        authRequest<ProductRow[]>('/admin/products', token),
        authRequest<OptionItem[]>('/admin/categories', token),
        authRequest<OptionItem[]>('/admin/brands', token)
      ]);
      setItems(products);
      setCategories(categoryList);
      setBrands(brandList);
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showSuccess(message: string) {
    setToast({ id: Date.now(), type: 'success', message });
  }

  function showError(message: string) {
    setToast({ id: Date.now(), type: 'error', message });
  }

  function updateField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openCreate() {
    setForm(emptyProduct);
    setErrors({});
    setScreen('form');
  }

  function openEdit(item: ProductRow) {
    setForm({
      id: item.id,
      title: item.title,
      variantName: '',
      sku: item.sku,
      slug: item.slug ?? '',
      categoryId: item.categoryId,
      brandId: item.brandId,
      price: String(item.price ?? ''),
      salePrice: String(item.salePrice ?? ''),
      stockQty: String(item.stockQty ?? 0),
      status: String(item.status ?? 1),
      image: item.image ?? '',
      images: item.images?.map((image) => image.imageUrl) ?? [],
      color: item.color ?? '',
      size: item.size ?? '',
      description: item.description ?? '',
      content: item.content ?? '',
      specification: item.specification ?? ''
    });
    setErrors({});
    setScreen('form');
  }

  function duplicate(item: ProductRow) {
    setForm({
      id: '',
      title: `${item.title} copy`,
      variantName: '',
      sku: '',
      slug: item.slug ? `${item.slug}-copy` : '',
      categoryId: item.categoryId,
      brandId: item.brandId,
      price: String(item.price ?? ''),
      salePrice: String(item.salePrice ?? ''),
      stockQty: String(item.stockQty ?? 0),
      status: String(item.status ?? 1),
      image: item.image ?? '',
      images: item.images?.map((image) => image.imageUrl) ?? [],
      color: item.color ?? '',
      size: item.size ?? '',
      description: item.description ?? '',
      content: item.content ?? '',
      specification: item.specification ?? ''
    });
    setErrors({});
    setScreen('form');
  }

  function validateProduct(values: ProductForm) {
    const nextErrors: FormErrors = {};
    const price = Number(values.price);
    const salePrice = Number(values.salePrice || 0);
    const stock = Number(values.stockQty);

    if (!values.title.trim()) nextErrors.title = 'Vui lòng nhập tên sản phẩm.';
    if (!values.sku.trim()) nextErrors.sku = 'Vui lòng nhập SKU / model.';
    if (!values.slug.trim()) nextErrors.slug = 'Vui lòng nhập slug.';
    if (!values.categoryId) nextErrors.categoryId = 'Vui lòng chọn danh mục.';
    if (!values.brandId) nextErrors.brandId = 'Vui lòng chọn thương hiệu.';
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Giá niêm yết phải lớn hơn 0.';
    if (!Number.isFinite(salePrice) || salePrice < 0)
      nextErrors.salePrice = 'Giá ưu đãi không hợp lệ.';
    if (salePrice > price) nextErrors.salePrice = 'Giá ưu đãi không được lớn hơn giá niêm yết.';
    if (!Number.isInteger(stock) || stock < 0)
      nextErrors.stockQty = 'Tồn kho phải là số nguyên từ 0.';

    return nextErrors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProduct(form);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      showError('Vui lòng kiểm tra lại thông tin sản phẩm.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      sku: form.sku.trim(),
      slug: form.slug.trim(),
      categoryId: form.categoryId,
      brandId: form.brandId,
      price: form.price,
      salePrice: form.salePrice || '0',
      stockQty: Number(form.stockQty),
      status: Number(form.status),
      image: form.image.trim(),
      images: form.images,
      description: form.description.trim(),
      content: form.content,
      specification: form.specification,
      variantName: form.variantName.trim(),
      color: form.color.trim(),
      size: form.size.trim()
    };

    setSaving(true);
    try {
      if (form.id) {
        await authRequest(`/admin/products/${form.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        showSuccess('Cập nhật sản phẩm thành công.');
      } else {
        await authRequest('/admin/products', token, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showSuccess('Thêm sản phẩm thành công.');
      }

      setScreen('list');
      setForm(emptyProduct);
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ProductRow) {
    if (!window.confirm(`Xóa sản phẩm "${item.title}"?`)) return;

    try {
      await authRequest(`/admin/products/${item.id}`, token, { method: 'DELETE' });
      showSuccess('Xóa sản phẩm thành công.');
      await load();
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    }
  }

  async function uploadImage(file: File, target: 'avatar' | 'album') {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const result = await authUpload<{ url: string }>(
        '/admin/uploads/product-image',
        token,
        formData
      );
      if (target === 'avatar') {
        updateField('image', result.url);
        setForm((current) => ({
          ...current,
          images: current.images.includes(result.url)
            ? current.images
            : [result.url, ...current.images]
        }));
      } else {
        setForm((current) => ({
          ...current,
          images: current.images.includes(result.url)
            ? current.images
            : [...current.images, result.url]
        }));
      }
      showSuccess('Upload ảnh thành công.');
    } catch (err) {
      handleError(err, showError, onUnauthorized);
    } finally {
      setUploading(false);
    }
  }

  function exportCsv() {
    const rows = [
      ['Tên sản phẩm', 'SKU', 'Danh mục', 'Thương hiệu', 'Giá', 'Giá ưu đãi', 'Tồn kho'],
      ...filteredItems.map((item) => [
        item.title,
        item.sku,
        item.category?.title ?? '',
        item.brand?.title ?? '',
        item.price,
        item.salePrice,
        String(item.stockQty)
      ])
    ];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Đã xuất danh sách sản phẩm.');
  }

  return (
    <div className="relative min-h-screen bg-[#f2f2f2] px-4 py-8 lg:px-8">
      <ToastMessage toast={toast} onClose={() => setToast(null)} />

      {screen === 'list' ? (
        <ProductList
          brandFilter={brandFilter}
          brands={brands}
          categoryFilter={categoryFilter}
          categories={categories}
          items={filteredItems}
          loading={loading}
          query={query}
          onBrandChange={setBrandFilter}
          onCategoryChange={setCategoryFilter}
          onCreate={openCreate}
          onDelete={remove}
          onDuplicate={duplicate}
          onEdit={openEdit}
          onExport={exportCsv}
          onQueryChange={setQuery}
          onRefresh={() => void load()}
        />
      ) : (
        <ProductFormScreen
          brands={brands}
          categories={categories}
          errors={errors}
          form={form}
          saving={saving}
          uploading={uploading}
          onCancel={() => {
            setScreen('list');
            setErrors({});
          }}
          onSubmit={submit}
          onUpdate={updateField}
          onUpload={uploadImage}
        />
      )}
    </div>
  );
}

function ProductList({
  items,
  categories,
  brands,
  query,
  categoryFilter,
  brandFilter,
  loading,
  onQueryChange,
  onCategoryChange,
  onBrandChange,
  onRefresh,
  onCreate,
  onExport,
  onEdit,
  onDuplicate,
  onDelete
}: {
  items: ProductRow[];
  categories: OptionItem[];
  brands: OptionItem[];
  query: string;
  categoryFilter: string;
  brandFilter: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onRefresh: () => void;
  onCreate: () => void;
  onExport: () => void;
  onEdit: (item: ProductRow) => void;
  onDuplicate: (item: ProductRow) => void;
  onDelete: (item: ProductRow) => void;
}) {
  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Xem danh sách, giá bán và tồn kho của các phiên bản
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <Download size={18} />
            Xuất Excel
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 lg:grid-cols-[1fr_188px_188px_auto]">
          <label className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <FilterSelect value={categoryFilter} onChange={onCategoryChange}>
            <option value="">Tất cả danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={brandFilter} onChange={onBrandChange}>
            <option value="">Tất cả thương hiệu</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </FilterSelect>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[minmax(360px,1.8fr)_minmax(180px,0.7fr)_170px_150px_170px] bg-slate-50 px-6 py-4 text-xs font-black uppercase text-slate-500">
            <div>Sản phẩm</div>
            <div>Danh mục/Hãng</div>
            <div>Tồn kho</div>
            <div>Trạng thái</div>
            <div className="text-right">Hành động</div>
          </div>

          {items.length ? (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(360px,1.8fr)_minmax(180px,0.7fr)_170px_150px_170px] items-center border-t border-slate-100 px-6 py-4 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={mediaUrl(item.image)}
                      alt={item.title}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-700">{item.title}</div>
                    <div className="mt-1 text-xs font-medium text-slate-400">
                      {money(item.salePrice || item.price)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-600">
                    {item.category?.title ?? categoryTitle(item.categoryId, categories)}
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {item.brand?.title ?? brandTitle(item.brandId, brands)}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item.stockQty} tồn kho
                </div>
                <div>
                  <span
                    className={
                      item.status === 0
                        ? 'rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase text-slate-500'
                        : 'rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase text-emerald-700'
                    }
                  >
                    {item.status === 0 ? 'Tạm ẩn' : 'Hoạt động'}
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <IconButton
                    label="Xem sản phẩm"
                    className="text-emerald-600"
                    onClick={() => {
                      if (item.slug) window.open(`/products/${item.slug}`, '_blank', 'noopener');
                    }}
                  >
                    <Eye size={18} />
                  </IconButton>
                  <IconButton
                    label="Nhân bản"
                    className="text-violet-600"
                    onClick={() => onDuplicate(item)}
                  >
                    <Copy size={18} />
                  </IconButton>
                  <IconButton label="Sửa" className="text-blue-600" onClick={() => onEdit(item)}>
                    <Pencil size={18} />
                  </IconButton>
                  <IconButton label="Xóa" className="text-rose-600" onClick={() => onDelete(item)}>
                    <Trash2 size={18} />
                  </IconButton>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductFormScreen({
  form,
  categories,
  brands,
  errors,
  saving,
  uploading,
  onUpdate,
  onUpload,
  onSubmit,
  onCancel
}: {
  form: ProductForm;
  categories: OptionItem[];
  brands: OptionItem[];
  errors: FormErrors;
  saving: boolean;
  uploading: boolean;
  onUpdate: <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => void;
  onUpload: (file: File, target: 'avatar' | 'album') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  function addImageUrl(value: string) {
    const imageUrl = value.trim();
    if (!imageUrl) return;
    onUpdate('images', form.images.includes(imageUrl) ? form.images : [...form.images, imageUrl]);
  }

  function removeImageUrl(imageUrl: string) {
    onUpdate(
      'images',
      form.images.filter((item) => item !== imageUrl)
    );
    if (form.image === imageUrl) onUpdate('image', '');
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-[1280px] gap-4">
      <Section
        title="Thông tin sản phẩm"
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-black uppercase text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() =>
                form.slug && window.open(`/products/${form.slug}`, '_blank', 'noopener')
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black uppercase text-blue-700 transition hover:bg-blue-100"
            >
              <Eye size={16} />
              Xem trước
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black uppercase text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        }
      >
        <Input
          label="Tên sản phẩm *"
          value={form.title}
          error={errors.title}
          onChange={(value) => onUpdate('title', value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Tên hiển thị phiên bản"
            value={form.variantName}
            placeholder="VD: Bản 1.2m, màu trắng..."
            onChange={(value) => onUpdate('variantName', value)}
          />
          <Input
            label="Slug *"
            value={form.slug}
            error={errors.slug}
            onChange={(value) => onUpdate('slug', value)}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            label="Danh mục *"
            value={form.categoryId}
            error={errors.categoryId}
            onChange={(value) => onUpdate('categoryId', value)}
          >
            <option value="">Chọn danh mục</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
          <Select
            label="Thương hiệu *"
            value={form.brandId}
            error={errors.brandId}
            onChange={(value) => onUpdate('brandId', value)}
          >
            <option value="">Chọn thương hiệu</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
          <Select label="Chính sách" value="" onChange={() => undefined}>
            <option value="">Chính sách mặc định</option>
          </Select>
        </div>
      </Section>

      <Section title="Giá bán & kho hàng">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-blue-300 bg-blue-50">
              {form.image ? (
                <>
                  <img
                    src={mediaUrl(form.image)}
                    alt={form.title || 'Ảnh sản phẩm'}
                    className="h-full w-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate('image', '')}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white"
                    aria-label="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <ImagePlus className="text-blue-400" size={28} />
              )}
            </div>
            <label className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black uppercase text-white transition hover:bg-blue-700">
              <ImagePlus size={16} />
              {uploading ? 'Đang upload...' : 'Upload ảnh'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(file, 'avatar');
                  event.target.value = '';
                }}
              />
            </label>
          </div>
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="SKU / Model *"
                value={form.sku}
                error={errors.sku}
                onChange={(value) => onUpdate('sku', value)}
              />
              <Input
                label="Giá niêm yết *"
                type="number"
                value={form.price}
                error={errors.price}
                onChange={(value) => onUpdate('price', value)}
              />
              <Input
                label="Giá ưu đãi *"
                type="number"
                value={form.salePrice}
                error={errors.salePrice}
                onChange={(value) => onUpdate('salePrice', value)}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="Tồn kho"
                type="number"
                value={form.stockQty}
                error={errors.stockQty}
                onChange={(value) => onUpdate('stockQty', value)}
              />
              <Input
                label="Màu sắc"
                value={form.color}
                onChange={(value) => onUpdate('color', value)}
              />
              <Input
                label="Kích thước"
                value={form.size}
                onChange={(value) => onUpdate('size', value)}
              />
            </div>
            <Input
              label="Đường dẫn ảnh"
              value={form.image}
              placeholder="/uploads/products/example"
              onChange={(value) => onUpdate('image', value)}
            />
            <Input
              label="Sản phẩm cùng loại"
              value=""
              placeholder="Tìm kiếm sản phẩm theo tên..."
              onChange={() => undefined}
            />
          </div>
        </div>
      </Section>

      <Section title="Album ảnh slider">
        <div className="flex flex-wrap gap-3">
          <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-blue-400 hover:text-blue-500">
            <Plus size={22} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file, 'album');
                event.target.value = '';
              }}
            />
          </label>
          {form.images.map((imageUrl) => (
            <div
              key={imageUrl}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                aria-label="Xóa ảnh album"
                onClick={() => removeImageUrl(imageUrl)}
                className="absolute right-1 top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white"
              >
                <X size={12} />
              </button>
              <button
                type="button"
                onClick={() => onUpdate('image', imageUrl)}
                className="h-full w-full"
                title="Đặt làm ảnh đại diện"
              >
                <img
                  src={mediaUrl(imageUrl)}
                  alt="Ảnh slider"
                  className="h-full w-full object-contain p-1"
                />
              </button>
            </div>
          ))}
        </div>
        <AddImageUrlInput onAdd={addImageUrl} />
      </Section>

      <Section title="Mô tả ngắn gọn">
        <Textarea
          value={form.description}
          onChange={(value) => onUpdate('description', value)}
          rows={5}
        />
      </Section>

      <Section title="Mô tả chi tiết">
        <RichEditor value={form.content} onChange={(value) => onUpdate('content', value)} />
      </Section>

      <Section title="Thông số kỹ thuật">
        <RichEditor
          value={form.specification}
          onChange={(value) => onUpdate('specification', value)}
        />
      </Section>

      <Section title="Thiết lập">
        <Select
          label="Trạng thái kinh doanh"
          value={form.status}
          onChange={(value) => onUpdate('status', value)}
        >
          <option value="1">Đang kinh doanh</option>
          <option value="0">Tạm ẩn</option>
        </Select>
      </Section>
    </form>
  );
}

function Section({
  title,
  actions,
  children
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xs font-black uppercase tracking-wide text-slate-600">{title}</h2>
        {actions}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  error,
  type = 'text',
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={
          error
            ? 'h-11 rounded-xl border border-rose-400 bg-white px-4 text-sm font-semibold text-slate-700 outline-none ring-4 ring-rose-50'
            : 'h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }
      />
      {error ? <span className="text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}

function Select({
  label,
  value,
  error,
  children,
  onChange
}: {
  label: string;
  value: string;
  error?: string;
  children: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          error
            ? 'h-11 rounded-xl border border-rose-400 bg-white px-4 text-sm font-semibold text-slate-700 outline-none ring-4 ring-rose-50'
            : 'h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }
      >
        {children}
      </select>
      {error ? <span className="text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}

function Textarea({
  value,
  rows,
  onChange
}: {
  value: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  );
}

function FilterSelect({
  value,
  children,
  onChange
}: {
  value: string;
  children: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    >
      {children}
    </select>
  );
}

function IconButton({
  label,
  className,
  children,
  onClick
}: {
  label: string;
  className: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg transition hover:bg-slate-100 ${className}`}
    >
      {children}
    </button>
  );
}

function AddImageUrlInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div className="grid gap-2">
      <span className="text-[11px] font-black uppercase text-slate-500">
        Thêm ảnh bằng đường dẫn
      </span>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          value={value}
          placeholder="/uploads/products/example.webp"
          onChange={(event) => setValue(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={() => {
            onAdd(value);
            setValue('');
          }}
          className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          Thêm ảnh
        </button>
      </div>
    </div>
  );
}

function RichEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white [&_.sun-editor]:border-0">
      <SunEditor
        setContents={value}
        onChange={onChange}
        height="360px"
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike'],
            ['fontColor', 'hiliteColor'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView']
          ]
        }}
      />
    </div>
  );
}

function EditorPlaceholder() {
  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-500">
      {['Font', 'Formats', 'Size', 'B', 'U', 'I', 'A', '≡', '•', '↗', '</>'].map((item) => (
        <span key={item} className="rounded border border-slate-200 bg-white px-3 py-1">
          {item}
        </span>
      ))}
    </div>
  );
}

function ToastMessage({ toast, onClose }: { toast: Toast | null; onClose: () => void }) {
  if (!toast) return null;

  return (
    <div
      className={
        toast.type === 'success'
          ? 'fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg'
          : 'fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg'
      }
      role="status"
    >
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Đóng thông báo">
        <X size={16} />
      </button>
    </div>
  );
}

function categoryTitle(categoryId: string, categories: OptionItem[]) {
  return categories.find((item) => item.id === categoryId)?.title ?? 'Chưa có danh mục';
}

function brandTitle(brandId: string, brands: OptionItem[]) {
  return brands.find((item) => item.id === brandId)?.title ?? 'Chưa có thương hiệu';
}
