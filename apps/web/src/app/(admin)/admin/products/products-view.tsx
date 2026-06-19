'use client';

import dynamic from 'next/dynamic';
import {
  Copy,
  Download,
  Eye,
  ImagePlus,
  List,
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
import { AdminPagination } from '../common/ui';
import type { AdminPolicy, AdminProduct, OptionItem } from '../common/types';

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
  policyId: string;
  groupId: string;
  relatedProductIds: string[];
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
  policyId: '',
  groupId: '',
  relatedProductIds: [],
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
  const [policies, setPolicies] = useState<AdminPolicy[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [screen, setScreen] = useState<'list' | 'form'>('list');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
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

  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page]
  );

  useEffect(() => {
    setPage(1);
  }, [brandFilter, categoryFilter, query]);

  async function load() {
    setLoading(true);
    try {
      const [products, categoryList, brandList, policyList] = await Promise.all([
        authRequest<ProductRow[]>('/admin/products', token),
        authRequest<OptionItem[]>('/admin/categories', token),
        authRequest<OptionItem[]>('/admin/brands', token),
        authRequest<AdminPolicy[]>('/admin/policies', token)
      ]);
      setItems(products);
      setCategories(categoryList);
      setBrands(brandList);
      setPolicies(policyList);
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

  function relatedIdsFor(item: ProductRow) {
    if (!item.groupId) return [];
    return items
      .filter((product) => product.id !== item.id && product.groupId === item.groupId)
      .map((product) => product.id);
  }

  function openEdit(item: ProductRow) {
    setForm({
      id: item.id,
      title: item.title,
      variantName: item.variantName ?? '',
      sku: item.sku,
      slug: item.slug ?? '',
      categoryId: item.categoryId,
      brandId: item.brandId,
      policyId: item.policyId ?? '',
      groupId: item.groupId ?? '',
      relatedProductIds: relatedIdsFor(item),
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
      variantName: item.variantName ?? '',
      sku: '',
      slug: item.slug ? `${item.slug}-copy` : '',
      categoryId: item.categoryId,
      brandId: item.brandId,
      policyId: item.policyId ?? '',
      groupId: item.groupId ?? '',
      relatedProductIds: item.groupId
        ? items
            .filter((product) => product.id !== item.id && product.groupId === item.groupId)
            .map((product) => product.id)
        : [item.id],
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
      policyId: form.policyId,
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
      size: form.size.trim(),
      groupId: form.groupId,
      relatedProductIds: form.relatedProductIds
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
      const result = await authUpload<{ url: string }>('/admin/uploads/products', token, formData);
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
          items={pagedItems}
          page={page}
          pageSize={pageSize}
          totalItems={filteredItems.length}
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
          onPageChange={setPage}
          onRefresh={() => void load()}
        />
      ) : (
        <ProductFormScreen
          brands={brands}
          categories={categories}
          errors={errors}
          form={form}
          products={items}
          policies={policies}
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
  page,
  pageSize,
  totalItems,
  categories,
  brands,
  query,
  categoryFilter,
  brandFilter,
  loading,
  onQueryChange,
  onPageChange,
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
  page: number;
  pageSize: number;
  totalItems: number;
  categories: OptionItem[];
  brands: OptionItem[];
  query: string;
  categoryFilter: string;
  brandFilter: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
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
    <div className="mx-auto">
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
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}

function ProductFormScreen({
  form,
  products,
  policies,
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
  products: ProductRow[];
  policies: AdminPolicy[];
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
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  function moveImage(sourceUrl: string, targetUrl: string) {
    if (sourceUrl === targetUrl) return;

    const sourceIndex = form.images.indexOf(sourceUrl);
    const targetIndex = form.images.indexOf(targetUrl);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextImages = [...form.images];
    const [movedImage] = nextImages.splice(sourceIndex, 1);
    nextImages.splice(targetIndex, 0, movedImage);
    onUpdate('images', nextImages);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid gap-4">
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
              onClick={() => setPreviewOpen(true)}
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
          <Select
            label="Chính sách"
            value={form.policyId}
            onChange={(value) => onUpdate('policyId', value)}
          >
            <option value="">Chính sách mặc định</option>
            {policies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.packageName}
              </option>
            ))}
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
            <RelatedProductsField
              currentProductId={form.id}
              groupId={form.groupId}
              products={products}
              selectedIds={form.relatedProductIds}
              onGroupChange={(value) => onUpdate('groupId', value)}
              onSelectedChange={(value) => onUpdate('relatedProductIds', value)}
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
          {form.images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              draggable
              onDragStart={() => setDraggedImage(imageUrl)}
              onDragEnd={() => setDraggedImage(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedImage) moveImage(draggedImage, imageUrl);
                setDraggedImage(null);
              }}
              className={`relative h-20 w-20 cursor-grab overflow-hidden rounded-xl border bg-white active:cursor-grabbing ${
                draggedImage === imageUrl
                  ? 'border-blue-500 opacity-60 ring-4 ring-blue-100'
                  : 'border-slate-200'
              }`}
              title="Kéo thả để đổi vị trí"
            >
              <span className="absolute bottom-1 left-1 z-10 rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {index + 1}
              </span>
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

      {previewOpen ? (
        <ProductPreviewModal
          brands={brands}
          categories={categories}
          form={form}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </form>
  );
}

function ProductPreviewModal({
  form,
  categories,
  brands,
  onClose
}: {
  form: ProductForm;
  categories: OptionItem[];
  brands: OptionItem[];
  onClose: () => void;
}) {
  const category = categories.find((item) => item.id === form.categoryId)?.title ?? 'Chưa chọn';
  const brand = brands.find((item) => item.id === form.brandId)?.title ?? 'Chưa chọn';
  const image = form.image || form.images[0] || '';
  const price = Number(form.price || 0);
  const salePrice = Number(form.salePrice || 0);
  const displayPrice = salePrice > 0 ? salePrice : price;
  const galleryImages = form.images.length ? form.images : image ? [image] : [];

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase text-blue-600">Preview sản phẩm</div>
            <h3 className="mt-1 line-clamp-1 text-lg font-bold text-slate-800">
              {form.title || 'Sản phẩm chưa có tên'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="Đóng preview"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto bg-[#f1f5f9] p-5">
          <div className="grid overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm lg:grid-cols-2">
            <div className="border-gray-50 p-5 lg:border-r">
              <div className="grid aspect-square place-items-center rounded-xl bg-slate-50">
                {image ? (
                  <img
                    src={mediaUrl(image)}
                    alt={form.title || 'Ảnh sản phẩm'}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <ImagePlus className="text-slate-300" size={52} />
                )}
              </div>
              {galleryImages.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {galleryImages.map((item) => (
                    <div
                      key={item}
                      className="grid h-16 w-16 place-items-center rounded-lg border border-slate-200 bg-white"
                    >
                      <img
                        src={mediaUrl(item)}
                        alt="Ảnh album"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-gray-50/30 p-5">
              <div className="mb-3 text-sm font-bold uppercase text-blue-600">{brand}</div>
              <h1 className="text-2xl font-bold leading-tight text-slate-900">
                {form.title || 'Sản phẩm chưa có tên'}
              </h1>
              {form.variantName ? (
                <div className="mt-2 text-sm font-semibold text-slate-500">
                  Phiên bản: {form.variantName}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="text-3xl font-bold text-rose-600">{money(displayPrice)}</div>
                {salePrice > 0 && price > salePrice ? (
                  <div className="text-lg font-semibold text-slate-400 line-through">
                    {money(price)}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">Danh mục: {category}</div>
                <div className="rounded-xl bg-slate-50 p-3">SKU: {form.sku || 'Chưa nhập'}</div>
                <div className="rounded-xl bg-slate-50 p-3">Tồn kho: {form.stockQty || '0'}</div>
                <div className="rounded-xl bg-slate-50 p-3">
                  Trạng thái: {form.status === '0' ? 'Tạm ẩn' : 'Đang kinh doanh'}
                </div>
                {form.color ? (
                  <div className="rounded-xl bg-slate-50 p-3">Màu: {form.color}</div>
                ) : null}
                {form.size ? (
                  <div className="rounded-xl bg-slate-50 p-3">Kích thước: {form.size}</div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm lg:col-span-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Mô tả chi tiết</h2>
              {form.content ? (
                <div
                  className="product-content sun-editor-editable max-w-full text-base leading-8 text-slate-700 [overflow-wrap:anywhere] [word-break:break-word] [&_*]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_table]:my-6 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_td]:whitespace-normal [&_td]:break-words [&_td]:border [&_td]:border-slate-200 [&_td]:p-3 [&_th]:whitespace-normal [&_th]:break-words [&_th]:border [&_th]:border-slate-200 [&_th]:p-3"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              ) : (
                <div className="text-sm font-medium text-slate-500">Chưa có nội dung chi tiết.</div>
              )}
            </section>

            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm lg:col-span-4">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-5">
                <List size={20} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900 md:text-xl">
                  Thông số kỹ thuật
                </h2>
              </div>
              {form.specification ? (
                <div
                  className="spec-table sun-editor-editable max-w-full text-base leading-7 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: form.specification }}
                />
              ) : (
                <div className="text-sm font-medium text-slate-500">Chưa có thông số kỹ thuật.</div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
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

function RelatedProductsField({
  currentProductId,
  groupId,
  products,
  selectedIds,
  onGroupChange,
  onSelectedChange
}: {
  currentProductId: string;
  groupId: string;
  products: ProductRow[];
  selectedIds: string[];
  onGroupChange: (value: string) => void;
  onSelectedChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const selectedProducts = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is ProductRow => Boolean(product));
  const keyword = query.trim().toLowerCase();
  const suggestions = products
    .filter((product) => product.id !== currentProductId)
    .filter((product) => !selectedIds.includes(product.id))
    .filter((product) => {
      if (!keyword) return false;
      return (
        product.title.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword) ||
        (product.slug ?? '').toLowerCase().includes(keyword)
      );
    })
    .slice(0, 6);

  function add(product: ProductRow) {
    const nextGroupId = groupId || product.groupId || crypto.randomUUID();
    onGroupChange(nextGroupId);
    onSelectedChange([...selectedIds, product.id]);
    setQuery('');
  }

  function remove(productId: string) {
    const nextSelectedIds = selectedIds.filter((id) => id !== productId);
    onSelectedChange(nextSelectedIds);
    if (!nextSelectedIds.length) onGroupChange('');
  }

  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-black uppercase text-slate-500">Chọn sản phẩm cùng loại</div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tên, SKU hoặc slug..."
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />

      {selectedProducts.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <span
              key={product.id}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
            >
              {product.title}
              <button
                type="button"
                onClick={() => remove(product.id)}
                className="grid h-5 w-5 place-items-center rounded-full bg-blue-200 text-blue-800"
                aria-label="Xóa sản phẩm cùng loại"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-xs font-medium text-slate-500">
          Chưa chọn sản phẩm cùng loại. Khi chọn, hệ thống sẽ dùng chung nhóm để hiển thị phiên bản
          trên trang chi tiết.
        </div>
      )}

      {keyword && suggestions.length ? (
        <div className="grid gap-1 rounded-xl bg-white p-2 ring-1 ring-slate-200">
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => add(product)}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50"
            >
              <span className="min-w-0">
                <span className="block truncate font-bold text-slate-700">{product.title}</span>
                <span className="block truncate text-xs font-medium text-slate-400">
                  {product.sku} {product.groupId ? `- Nhóm ${product.groupId}` : ''}
                </span>
              </span>
              <Plus size={16} className="shrink-0 text-blue-600" />
            </button>
          ))}
        </div>
      ) : keyword ? (
        <div className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : null}
    </div>
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
