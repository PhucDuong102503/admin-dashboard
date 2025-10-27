"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import Image from "next/image";

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
  });

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
      });
  }, []);

  const filteredProducts = products.filter((p) =>
    (p.tensanpham || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (id) => {
    setEditingRow(id);
  };

  const handleSaveClick = async () => {
    const product = products.find((p) => p.id === editingRow);
    if (!product) return;

    const formData = new FormData()
    formData.append("id", product.id)
    formData.append("tensanpham", product.tensanpham)
    formData.append("giasanpham", product.giasanpham)
    formData.append("motasanpham", product.motasanpham)
    formData.append("idloaisanpham", product.idloaisanpham)
    formData.append("tenloaisanpham", product.tenloaisanpham)
    formData.append("hinhanhsanpham", product.hinhanhsanpham)
    formData.append("stock", product.stock)
    formData.append("sales", product.sales)
    console.log(newProduct)
    formData.append("file", newProduct.file)

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        // headers: { "Content-Type": "application/json" },
        body: formData
      });

      if (res.ok) {
        setEditingRow(null);
      } else {
        alert("Cập nhật sản phẩm thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Đã xảy ra lỗi khi cập nhật sản phẩm.");
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Xóa sản phẩm thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Đã xảy ra lỗi khi xóa sản phẩm.");
    }
  };

  const handleChange = (id, field, value) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: Number(value) } : p
      )
    );
  };

  const handleAddProduct = async () => {
    const {
      tensanpham,
      giasanpham,
      motasanpham,
      idloaisanpham,
      hinhanhsanpham,
      preview,
    } = newProduct;

    if (!tensanpham || !giasanpham || !motasanpham || !idloaisanpham || !preview) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tensanpham,
          giasanpham: Number(giasanpham),
          motasanpham,
          idloaisanpham: Number(idloaisanpham),
          hinhanhsanpham: preview,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProducts((prev) => [
          ...prev,
          {
            id: data.id,
            tensanpham,
            giasanpham: Number(giasanpham),
            motasanpham,
            idloaisanpham: Number(idloaisanpham),
            hinhanhsanpham: preview,
            stock: 0,
            sales: 0,
            tenloaisanpham: categories.find((c) => c.id === Number(idloaisanpham))?.name || "Không xác định",
          },
        ]);

        setNewProduct({
          tensanpham: "",
          giasanpham: "",
          motasanpham: "",
          idloaisanpham: "",
          hinhanhsanpham: null,
          preview: "",
        });
        setShowAddForm(false);
      } else {
        alert("Thêm sản phẩm thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      alert("Đã xảy ra lỗi khi thêm sản phẩm.");
    }
  };

  const editableFields = ["giasanpham", "stock"];
  return (
  <motion.div
    className="bg-[#1e1e1e] backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
  >
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 md:gap-0">
      <h2 className="text-lg md:text-xl font-semibold text-gray-100 text-center md:text-left">
        Products List
      </h2>

      {/* Search + Add Button */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>
    </div>

    {/* Add Product Form */}
    {showAddForm && (
      <div className="bg-[#2f2f2f] p-4 rounded-lg mb-6 space-y-4">
        {[
          { label: "Tên sản phẩm", key: "tensanpham", type: "text" },
          { label: "Giá sản phẩm", key: "giasanpham", type: "number" },
          { label: "Mô tả sản phẩm", key: "motasanpham", type: "textarea" },
        ].map(({ label, key, type }) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">{label}</label>
            {type === "textarea" ? (
              <textarea
                value={newProduct[key]}
                onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })}
                className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm"
              />
            ) : (
              <input
                type={type}
                value={newProduct[key]}
                onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })}
                className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}

        {/* Dropdown loại sản phẩm */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Loại sản phẩm</label>
          <select
            value={newProduct.idloaisanpham}
            onChange={(e) => setNewProduct({ ...newProduct, idloaisanpham: e.target.value })}
            className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">-- Chọn loại sản phẩm --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Upload ảnh */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1">Ảnh sản phẩm</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 2 * 1024 * 1024) {
                  alert('Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB.');
                  return;
                }
                const reader = new FileReader();
                // reader.onloadend = () => {
                //   setNewProduct((prev) => ({
                //     ...prev,
                //     hinhanhsanpham: file,
                //     file,
                //     preview: reader.result,
                //   }));
                // };
                console.log('file',file)
                reader.readAsDataURL(file);
                setImage(file)
              }
            }}
            className="text-white text-sm"
          />
          {newProduct.preview && (
            <img
              src={newProduct.preview}
              alt="Preview"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>

        {/* Nút lưu */}
        <button
          onClick={handleAddProduct}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
        >
          Lưu sản phẩm
        </button>
      </div>
    )}
        {/* Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            {["Tên", "Loại", "Giá", "Tồn kho", "Ảnh", "Thao tác"].map((header) => (
              <th
                key={header}
                className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {filteredProducts.map((product) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="hover:bg-[#2a2a2a] transition duration-150"
            >
              {/* Tên sản phẩm */}
              <td className="px-3 md:px-6 py-3 text-sm text-gray-100">
                {product.tensanpham || "—"}
              </td>

              {/* Loại sản phẩm */}
              <td className="px-3 md:px-6 py-3 text-sm text-gray-400">
                {product.tenloaisanpham || "Không xác định"}
              </td>

              {/* Giá và Tồn kho */}
              {editableFields.map((field) => {
                const value = product[field];
                const isEditing = editingRow === product.id;
                const isGia = field === "giasanpham";

                return (
                  <td key={field} className="px-3 md:px-6 py-3 text-sm text-gray-300">
                    {isEditing ? (
                      <input
                        type={isGia ? "number" : "text"}
                        value={value ?? ""}
                        onChange={(e) => handleChange(product.id, field, e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-24 text-sm"
                      />
                    ) : isGia ? (
                      `₫${Number(value ?? 0).toLocaleString()}`
                    ) : (
                      value ?? 0
                    )}
                  </td>
                );
              })}

              {/* Ảnh sản phẩm */}
              <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                {editingRow === product.id ? (
                  <div className="flex flex-col">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id
                                  ? { ...p, hinhanhsanpham: reader.result }
                                  : p
                              )
                            );
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-white text-sm"
                    />
                    {product.hinhanhsanpham && (
                      <img
                        src={product.hinhanhsanpham}
                        alt="Preview"
                        width={36}
                        height={36}
                        className="mt-2 rounded-full object-cover"
                      />
                    )}
                  </div>
                ) : product.hinhanhsanpham ? (
                  <img
                    src={product.hinhanhsanpham}
                    alt={product.tensanpham}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Không có ảnh</span>
                )}
              </td>

              {/* Thao tác */}
              <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                <div className="flex space-x-2">
                  {editingRow === product.id ? (
                    <>
                      <button
                        className="text-green-500 hover:text-green-300"
                        onClick={handleSaveClick}
                      >
                        Save
                      </button>
                      <button
                        className="text-yellow-500 hover:text-yellow-300"
                        onClick={() => setEditingRow(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-indigo-500 hover:text-indigo-300"
                      onClick={() => handleEditClick(product.id)}
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button
                    className="text-red-500 hover:text-red-300"
                    onClick={() => handleDeleteClick(product.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {filteredProducts.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">
          Không tìm thấy sản phẩm nào.
        </p>
      )}
    </div>
  </motion.div>
);
};

export default ProductsTable;