"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Save, X } from "lucide-react";

/**
 * ProductsTable.jsx
 * - Hiển thị sản phẩm
 * - Thêm sản phẩm (có nhập sizes)
 * - Edit sản phẩm (sửa thông tin + chỉnh sửa sizes)
 *
 * Yêu cầu server:
 * - GET /api/products/stats             -> list sản phẩm (như bạn có)
 * - POST /api/products/create           -> tạo sản phẩm; nhận FormData gồm sizes (JSON)
 * - GET  /api/products/[id]/sizes       -> lấy danh sách size của sản phẩm
 * - PUT  /api/products/[id]             -> cập nhật sản phẩm + sizes (sẽ dùng endpoint dưới)
 * - DELETE /api/products/[id]           -> xóa sản phẩm (bản cũ của bạn)
 */

const ProductsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    tensanpham: "",
    giasanpham: "",
    motasanpham: "",
    idloaisanpham: "",
    hinhanhsanpham: null,
    preview: "",
    file: null,
    sizes: [], // { size: "S" or "37", quantity: number }
  });

  // gợi ý size theo loại
  const sizeSets = {
    clothes: ["S", "M", "L", "XL"],
    shoes: ["37", "38", "39", "40", "41", "42"],
  };

  const categories = [
    { id: 1, name: "Áo" },
    { id: 2, name: "Quần" },
    { id: 3, name: "Giày Dép" },
    { id: 4, name: "Phụ kiện" },
  ];

  useEffect(() => {
    fetch("/api/products/stats")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else console.error("Dữ liệu không hợp lệ:", data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredProducts = products.filter((p) =>
    (p.tensanpham || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = async (id) => {
    setEditingRow(id);
    // khi edit, lấy sizes cụ thể của sản phẩm từ API
    try {
      const res = await fetch(`/api/products/${id}/sizes`);
      if (res.ok) {
        const sizes = await res.json(); // [{size_id, tensize, soluong}, ...]
        // map thành format client-side
        const clientSizes = sizes.map((s) => ({
          sizeId: s.size_id,
          size: s.tensize,
          quantity: Number(s.soluong),
        }));

        // đặt vào products state (thêm thuộc tính editingSizes cho bản ghi đang edit)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, editingSizes: clientSizes } : p
          )
        );
      } else {
        console.warn("Không thể lấy sizes cho product", id);
      }
    } catch (err) {
      console.error("Lỗi lấy sizes:", err);
    }
  };

  const handleChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // chỉnh sửa size trong chế độ edit
  const changeEditingSize = (productId, idx, key, val) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const sizes = (p.editingSizes || []).slice();
        sizes[idx] = { ...sizes[idx], [key]: key === "quantity" ? Number(val) : val };
        return { ...p, editingSizes: sizes };
      })
    );
  };

  const addEditingSize = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              editingSizes: [...(p.editingSizes || []), { sizeId: null, size: "", quantity: 0 }],
            }
      )
    );
  };

  const removeEditingSize = (productId, idx) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : { ...p, editingSizes: (p.editingSizes || []).filter((_, i) => i !== idx) }
      )
    );
  };

  // lưu toàn bộ (product info + sizes) khi edit
  const handleSaveClick = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // chuẩn bị payload
    // sizes: gửi mảng { size: "S" (hoặc "37"), quantity: number, sizeId?: number }
    const sizesPayload = (product.editingSizes || []).map((s) => ({
      size: s.size,
      quantity: Number(s.quantity) || 0,
      sizeId: s.sizeId || null,
    }));

    // nếu đổi ảnh -> file xử lý bằng FormData (nếu không -> gửi JSON)
    const hasFile = product.file instanceof File;

    try {
      if (hasFile) {
        const formData = new FormData();
        formData.append("tensanpham", product.tensanpham || "");
        formData.append("giasanpham", product.giasanpham || 0);
        formData.append("motasanpham", product.motasanpham || "");
        formData.append("idloaisanpham", product.idloaisanpham || "");
        formData.append("file", product.file);
        formData.append("sizes", JSON.stringify(sizesPayload));

        const res = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          body: formData,
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        // JSON body
        const res = await fetch(`/api/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tensanpham: product.tensanpham,
            giasanpham: product.giasanpham,
            motasanpham: product.motasanpham,
            idloaisanpham: product.idloaisanpham,
            sizes: sizesPayload,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      }

      // reload product list minimal: update local state stock from sizes sum
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                giasanpham: product.giasanpham,
                motasanpham: product.motasanpham,
                tenloaisanpham: p.tenloaisanpham,
                editingSizes: undefined,
                stock: (sizesPayload || []).reduce((s, x) => s + Number(x.quantity || 0), 0),
              }
            : p
        )
      );

      setEditingRow(null);
    } catch (err) {
      console.error("Lỗi khi lưu product:", err);
      alert("Lưu thất bại");
    }
  };

  // Xóa sản phẩm
  const handleDeleteClick = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
      else alert("Xóa thất bại");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa");
    }
  };

  // --- Add product (form) handlers ---
  const addSizeRow = () => {
    setNewProduct((prev) => ({ ...prev, sizes: [...(prev.sizes || []), { size: "", quantity: 0 }] }));
  };
  const removeSizeFromNew = (idx) => {
    setNewProduct((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
  };
  const changeNewSize = (idx, key, value) => {
    setNewProduct((prev) => {
      const sizes = (prev.sizes || []).slice();
      sizes[idx] = { ...sizes[idx], [key]: key === "quantity" ? Number(value) : value };
      return { ...prev, sizes };
    });
  };

  const handleAddProduct = async () => {
    const { tensanpham, giasanpham, motasanpham, idloaisanpham, file, sizes } = newProduct;
    if (!tensanpham || !giasanpham || !motasanpham || !idloaisanpham) {
      alert("Vui lòng nhập đủ thông tin");
      return;
    }

    const formData = new FormData();
    formData.append("tensanpham", tensanpham);
    formData.append("giasanpham", giasanpham);
    formData.append("motasanpham", motasanpham);
    formData.append("idloaisanpham", idloaisanpham);
    if (file) formData.append("file", file);
    formData.append("sizes", JSON.stringify(sizes || []));

    try {
      const res = await fetch("/api/products/create", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");

      const catName = categories.find((c) => c.id === Number(idloaisanpham))?.name || "Không xác định";
      setProducts((prev) => [
        ...prev,
        {
          id: data.id,
          tensanpham,
          giasanpham: Number(giasanpham),
          motasanpham,
          idloaisanpham: Number(idloaisanpham),
          hinhanhsanpham: newProduct.preview,
          tenloaisanpham: catName,
          stock: (sizes || []).reduce((s, x) => s + Number(x.quantity || 0), 0),
          sales: 0,
        },
      ]);

      setNewProduct({
        tensanpham: "",
        giasanpham: "",
        motasanpham: "",
        idloaisanpham: "",
        hinhanhsanpham: null,
        preview: "",
        file: null,
        sizes: [],
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Thêm sản phẩm thất bại");
    }
  };

  // helper: when selecting category in new product -> prefill sizes
  const onCategoryChangeForNew = (value) => {
    let suggested = [];
    if (Number(value) === 3) suggested = sizeSets.shoes.map((s) => ({ size: s, quantity: 0 }));
    else if (Number(value) === 1 || Number(value) === 2) suggested = sizeSets.clothes.map((s) => ({ size: s, quantity: 0 }));
    setNewProduct((prev) => ({ ...prev, idloaisanpham: value, sizes: suggested }));
  };

  return (
    <motion.div className="bg-[#1e1e1e] text-gray-100 p-5 rounded-xl border border-[#2a2a2a] shadow-lg mb-10"
      initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
        <h2 className="text-xl font-semibold">📦 Danh sách sản phẩm</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input type="text" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#2b2b2b] text-white pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition">
            <Plus size={16} /> Thêm
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div className="bg-[#2a2a2a] p-4 rounded-lg mb-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Tên sản phẩm</label>
              <input value={newProduct.tensanpham} onChange={(e) => setNewProduct({ ...newProduct, tensanpham: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Giá sản phẩm</label>
              <input type="number" value={newProduct.giasanpham} onChange={(e) => setNewProduct({ ...newProduct, giasanpham: e.target.value })}
                className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Mô tả</label>
            <textarea rows={2} value={newProduct.motasanpham} onChange={(e) => setNewProduct({ ...newProduct, motasanpham: e.target.value })}
              className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm mt-1" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Loại sản phẩm</label>
              <select value={newProduct.idloaisanpham} onChange={(e) => onCategoryChangeForNew(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm mt-1">
                <option value="">-- Chọn loại --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">Ảnh sản phẩm</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { alert("Ảnh quá lớn (max 2MB)"); return; }
                const reader = new FileReader();
                reader.onloadend = () => setNewProduct((prev) => ({ ...prev, file, hinhanhsanpham: file, preview: reader.result }));
                reader.readAsDataURL(file);
              }} className="w-full mt-1 text-sm text-gray-300" />
              {newProduct.preview && <img src={newProduct.preview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded" />}
            </div>
          </div>

          {/* Sizes input */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Kích thước & Số lượng</label>
            {(newProduct.sizes || []).map((s, idx) => (
              <div key={idx} className="flex gap-3 items-center mb-2">
                <input placeholder="Size (S / 37 ...)" value={s.size} onChange={(e) => changeNewSize(idx, "size", e.target.value)}
                  className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm w-1/3" />
                <input type="number" placeholder="Số lượng" value={s.quantity} onChange={(e) => changeNewSize(idx, "quantity", e.target.value)}
                  className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-2 text-sm w-1/3" />
                <button onClick={() => removeSizeFromNew(idx)} className="text-red-400 hover:text-red-200 text-sm">Xóa</button>
              </div>
            ))}
            <button onClick={addSizeRow} className="text-indigo-400 hover:text-indigo-200 text-sm">+ Thêm size</button>
          </div>

          <div>
            <button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm">Lưu sản phẩm</button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead>
            <tr>
              {["Tên", "Loại", "Giá", "Tồn kho", "Ảnh", "Hành động"].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredProducts.map((product) => (
              <React.Fragment key={product.id}>
                <motion.tr initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className="hover:bg-[#2b2b2b] transition">
                  <td className="px-3 py-2">{product.tensanpham}</td>
                  <td className="px-3 py-2 text-gray-400">{product.tenloaisanpham || "Không xác định"}</td>
                  <td className="px-3 py-2">
                    {editingRow === product.id ? (
                      <input type="number" value={product.giasanpham ?? ""} onChange={(e) => handleChange(product.id, "giasanpham", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-24" />
                    ) : `₫${Number(product.giasanpham ?? 0).toLocaleString()}`}
                  </td>
                  <td className="px-3 py-2">
                    {editingRow === product.id ? (
                      <input type="number" value={product.stock ?? 0} onChange={(e) => handleChange(product.id, "stock", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-20" />
                    ) : product.stock ?? 0}
                  </td>
                  <td className="px-3 py-2">
  {editingRow === product.id ? (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 2 * 1024 * 1024) {
            alert("Ảnh quá lớn (max 2MB)");
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === product.id
                  ? { ...p, file, preview: reader.result }
                  : p
              )
            );
          };
          reader.readAsDataURL(file);
        }}
        className="text-xs text-gray-300"
      />
      <img
        src={product.preview || product.hinhanhsanpham}
        alt="preview"
        className="mt-1 w-14 h-14 object-cover rounded border border-gray-600"
      />
    </div>
  ) : (
    <img
      src={product.hinhanhsanpham}
      alt={product.tensanpham}
      className="w-10 h-10 object-cover rounded-full border border-gray-700"
    />
  )}
</td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {editingRow === product.id ? (
                        <>
                          <button onClick={() => handleSaveClick(product.id)} className="text-green-500 hover:text-green-300"><Save size={16} /></button>
                          <button onClick={() => setEditingRow(null)} className="text-yellow-400 hover:text-yellow-200"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(product.id)} className="text-indigo-500 hover:text-indigo-300"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteClick(product.id)} className="text-red-500 hover:text-red-300"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>

                {/* nếu đang edit, hiển thị hàng chi tiết sizes ngay dưới */}
                {editingRow === product.id && (
                  <tr className="bg-[#171717]">
                    <td colSpan={6} className="px-4 py-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Chỉnh sửa kích thước & số lượng</h4>
                          <div className="text-xs text-gray-400">Thêm / sửa từng size cho sản phẩm này</div>
                        </div>

                        <div className="space-y-2">
                          {(product.editingSizes || []).map((s, i) => (
                            <div key={i} className="flex gap-3 items-center">
                              <input value={s.size} onChange={(e) => changeEditingSize(product.id, i, "size", e.target.value)}
                                className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-1 text-sm w-32" />
                              <input type="number" value={s.quantity} onChange={(e) => changeEditingSize(product.id, i, "quantity", e.target.value)}
                                className="bg-[#1e1e1e] border border-gray-600 rounded px-3 py-1 text-sm w-28" />
                              <button onClick={() => removeEditingSize(product.id, i)} className="text-red-400 text-sm">Xóa</button>
                            </div>
                          ))}
                          <div className="mt-2">
                            <button onClick={() => addEditingSize(product.id)} className="text-indigo-400 text-sm">+ Thêm size</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && <p className="text-center text-gray-400 py-4">Không tìm thấy sản phẩm nào.</p>}
      </div>
    </motion.div>
  );
};

export default ProductsTable;
