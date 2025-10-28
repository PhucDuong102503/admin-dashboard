"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/donhang");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    // Debug: log ra để xem giá trị thực tế
    console.log("Status:", status);
    
    if (!status) return "bg-gray-500 text-white";
    
    const statusText = status.toLowerCase();
    
    // Kiểm tra nhiều cách viết có thể
    if (statusText.includes("giao hàng") && statusText.includes("đã")) {
      return "bg-green-600 text-white";
    }
    if (statusText.includes("chờ") || statusText.includes("đang giao")) {
      return "bg-yellow-500 text-black font-bold";
    }
    if (statusText.includes("hủy") || statusText.includes("hùy")) {
      return "bg-red-600 text-white";
    }
    
    return "bg-gray-500 text-white";
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    
    try {
      await fetch(`/api/donhang?id=${id}`, { method: "DELETE" });
      const res = await fetch("/api/donhang");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
    }
  };

  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus);
  };

  const handleSave = async (id) => {
    try {
      await fetch("/api/donhang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangthai: editedStatus }),
      });
      const res = await fetch("/api/donhang");
      const data = await res.json();
      setOrders(data);
      setEditingId(null);
      setEditedStatus("");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trangthai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#1e1e1e] rounded-xl shadow-xl p-6 md:p-8 border border-[#2a2a2a]"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">📦 Danh sách đơn hàng</h2>
        <input
          type="text"
          placeholder="🔍 Tìm theo email hoặc trạng thái..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#2f2f2f] text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 w-full md:w-64 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white">
          <thead>
            <tr className="bg-[#2f2f2f] text-gray-400 uppercase text-xs border-b border-gray-700">
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Số lượng</th>
              <th className="px-4 py-3 text-left font-semibold">Tổng tiền</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày đặt</th>
              <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-700 hover:bg-[#2a2a2a] transition-colors duration-200"
              >
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3 font-medium">{order.email}</td>
                <td className="px-4 py-3 font-medium">{order.soluong}</td>
                <td className="px-4 py-3 font-medium">
                  {order.tongtien?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </td>
                <td className="px-4 py-3">
                  {editingId === order.id ? (
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="bg-[#2f2f2f] text-white px-3 py-1 rounded border border-gray-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Đã giao hàng">Đã giao hàng</option>
                      <option value="Chờ giao hàng">Chờ giao hàng</option>
                      <option value="Đã hủy đơn">Đã hủy đơn</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[100px] px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          order.trangthai
                        )}`}
                        style={{
                          backgroundColor: 
                            order.trangthai?.includes('Đã giao') ? '#16a34a' :
                            order.trangthai?.includes('Chờ') ? '#eab308' :
                            order.trangthai?.includes('hủy') || order.trangthai?.includes('hùy') ? '#dc2626' : '#6b7280',
                          color: order.trangthai?.includes('Chờ') ? '#000' : '#fff'
                        }}
                      >
                        {order.trangthai}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {order.ngaydathang
                    ? new Date(order.ngaydathang).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-3">
                    {editingId === order.id ? (
                      <button
                        title="Lưu"
                        onClick={() => handleSave(order.id)}
                        className="text-green-400 hover:text-green-300 transition-colors p-1 rounded"
                      >
                        <FaSave size={16} />
                      </button>
                    ) : (
                      <button
                        title="Sửa"
                        onClick={() => handleEdit(order.id, order.trangthai)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded"
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                    <button
                      title="Xóa"
                      onClick={() => handleDelete(order.id)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1 rounded"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8 font-medium">
            {orders.length === 0 ? "Đang tải dữ liệu..." : "Không tìm thấy đơn hàng nào."}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default OrdersTable;