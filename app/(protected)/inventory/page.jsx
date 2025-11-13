"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PlusCircle, X } from "lucide-react";

// COMPONENT MODAL (CỬA SỔ POP-UP ĐỂ NHẬP HÀNG)
const RestockModal = ({ item, onClose, onRestockSuccess }) => {
  // ... (Nội dung component này không thay đổi)
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRestock = async () => {
    if (quantity <= 0) {
      setError("Số lượng nhập phải lớn hơn 0.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sanpham_id: item.sanpham_id,
          size_id: item.size_id,
          so_luong_nhap: Number(quantity),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Nhập hàng thất bại. Vui lòng thử lại."
        );
      }

      onRestockSuccess(item.sanpham_id, item.size_id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-xl w-full max-w-sm border border-[#3f3f3f] transform transition-all">
        <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
          <h3 className="text-lg font-bold text-white">Nhập Hàng Tồn Kho</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-full p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mb-4 space-y-1">
          <p className="text-white font-semibold text-lg">{item.tensanpham}</p>
          <p className="text-gray-300">
            Size: <span className="font-semibold">{item.tensize}</span>
          </p>
          <p className="text-gray-400">
            Tồn kho hiện tại:{" "}
            <span className="font-bold text-red-500">{item.so_luong_ton}</span>
          </p>
        </div>
        <div className="mb-4">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Số lượng cần nhập thêm
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#4a4a4a] text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            autoFocus
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleRestock}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận Nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

// COMPONENT CHÍNH CỦA TRANG
export default function InventoryStatsPage() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchLowStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/statistics/low-stock");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu từ server.");
      }
      const result = await response.json();
      setLowStockProducts(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockData();
  }, []);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleRestockSuccess = (sanpham_id, size_id) => {
    setLowStockProducts((prev) =>
      prev.filter(
        (p) => !(p.sanpham_id === sanpham_id && p.size_id === size_id)
      )
    );
  };

  // ⭐⭐⭐ BẮT ĐẦU SỬA LỖI TẠI ĐÂY ⭐⭐⭐
  const formatCurrency = (amount) => {
    // Chuyển đổi 'amount' (có thể là string) thành kiểu số
    const numericAmount = Number(amount);

    // Nếu chuyển đổi thất bại, trả về giá trị mặc định để tránh lỗi NaN
    if (isNaN(numericAmount)) {
      return "0 ₫";
    }

    // Định dạng số đã chuyển đổi
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericAmount);
  };
  // ⭐⭐⭐ KẾT THÚC SỬA LỖI ⭐⭐⭐

  const getImageUrl = (path) => {
    if (!path) return "/images/default-placeholder.png";
    return path;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Đang tải dữ liệu tồn kho...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  }

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-black-100 border-b border-gray-700 pb-4">
          Thống Kê Sản Phẩm Sắp Hết Hàng
        </h1>
        <div className="bg-[#1e1e1e] border border-[#2f2f2f] shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-[#2a2a2a]">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Sản Phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Giá Bán
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Số Lượng Tồn
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((item) => (
                    <tr
                      key={`${item.sanpham_id}-${item.size_id}`}
                      className="border-b border-[#2f2f2f] hover:bg-[#2a2a2a]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <Image
                            src={getImageUrl(item.hinhanhsanpham)}
                            alt={item.tensanpham}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-md border border-gray-600"
                          />
                          <div>
                            <p className="font-semibold text-white">
                              {item.tensanpham}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {item.sanpham_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 text-xs font-medium bg-gray-700 text-gray-200 rounded-full">
                          {item.tensize}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-200">
                        {formatCurrency(item.giasanpham)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-bold text-red-500">
                          {item.so_luong_ton}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="flex items-center justify-center mx-auto px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        >
                          <PlusCircle size={14} className="mr-1.5" />
                          Nhập Hàng
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center px-6 py-10 text-gray-400"
                    >
                      Tuyệt vời! Không có sản phẩm nào cần nhập thêm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedItem && (
        <RestockModal
          item={selectedItem}
          onClose={handleCloseModal}
          onRestockSuccess={handleRestockSuccess}
        />
      )}
    </>
  );
}
