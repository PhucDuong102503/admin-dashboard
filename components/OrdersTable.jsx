"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");

  // Lấy dữ liệu từ API
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/donhang");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Màu trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao hàng":
        return "bg-green-500";
      case "Chờ giao hàng":
        return "bg-yellow-500";
      case "Hủy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Xóa đơn hàng
  const handleDelete = async (id) => {
    try {
      await fetch(`/api/donhang?id=${id}`, { method: "DELETE" });
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
    }
  };

  // Bắt đầu sửa trạng thái
  const handleEdit = (id, currentStatus) => {
    setEditingId(id);
    setEditedStatus(currentStatus);
  };

  // Lưu trạng thái mới
  const handleSave = async (id) => {
    try {
      await fetch("/api/donhang", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trangthai: editedStatus }),
      });
      await fetchOrders();
      setEditingId(null);
      setEditedStatus("");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // Lọc đơn hàng theo email hoặc trạng thái
  const filteredOrders = orders.filter(
    (order) =>
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trangthai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[rgb(30,30,30)] rounded-2xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">Order List</h2>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2a2a3c] text-gray-300 px-4 py-2 rounded-lg outline-none w-64"
          />
        </div>

        <table className="w-full text-gray-300">
          <thead>
            <tr className="text-left border-b border-gray-600 text-sm text-gray-400">
              <th className="pb-3">ID</th>
              <th className="pb-3">EMAIL</th>
              <th className="pb-3">SỐ LƯỢNG</th>
              <th className="pb-3">TỔNG TIỀN</th>
              <th className="pb-3">TRẠNG THÁI</th>
              <th className="pb-3">NGÀY ĐẶT</th>
              <th className="pb-3 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-700 hover:bg-[#2a2a3c] transition-colors"
              >
                <td className="py-3">{order.id}</td>
                <td className="py-3">{order.email}</td>
                <td className="py-3">{order.soluong}</td>
                <td className="py-3 font-semibold text-white">
                  {order.tongtien?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </td>
                <td className="py-3">
                  {editingId === order.id ? (
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="bg-[#2a2a3c] text-white px-2 py-1 rounded"
                    >
                      <option value="Đã giao hàng">Đã giao hàng</option>
                      <option value="Chờ giao hàng">Chờ giao hàng</option>
                      <option value="Hủy">Hủy</option>
                    </select>
                  ) : (
                    <span
                      className={`text-sm px-3 py-1 rounded-full text-white ${getStatusColor(
                        order.trangthai
                      )}`}
                    >
                      {order.trangthai}
                    </span>
                  )}
                </td>
                <td className="py-3">
                  {new Date(order.ngaydat).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-3 text-center space-x-3">
                  {editingId === order.id ? (
                    <button
                      title="Save"
                      onClick={() => handleSave(order.id)}
                      className="text-green-400 hover:text-green-500"
                    >
                      <FaSave />
                    </button>
                  ) : (
                    <button
                      title="Edit"
                      onClick={() => handleEdit(order.id, order.trangthai)}
                      className="text-blue-400 hover:text-blue-500"
                    >
                      <FaEdit />
                    </button>
                  )}
                  <button
                    title="Delete"
                    onClick={() => handleDelete(order.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            Không tìm thấy đơn hàng nào.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default OrdersTable;