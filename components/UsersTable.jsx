"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2 } from "lucide-react";

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    fetch("/data/users.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Dữ liệu user không hợp lệ:", data);
        }
      });
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.hoten || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (id) => setEditingRow(id);
  const handleSaveClick = () => setEditingRow(null);

  const handleDeleteClick = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa người dùng này?");
    if (!confirmDelete) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const handleChange = (id, field, value) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, [field]: value } : user
      )
    );
  };

  const editableFields = ["email", "sodienthoai", "diachi", "vaitro"];

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
          Users List
        </h2>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {[
                "Họ tên",
                "Email",
                "Số điện thoại",
                "Địa chỉ",
                "Vai trò",
                "Thao tác"
              ].map((header) => (
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
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-[#2a2a2a] transition duration-150"
              >
                {/* Họ tên */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-100">
                  {user.hoten || "—"}
                </td>

                {/* Email */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                  {editingRow === user.id ? (
                    <input
                      type="text"
                      value={user.email}
                      onChange={(e) =>
                        handleChange(user.id, "email", e.target.value)
                      }
                      className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-40 text-sm"
                    />
                  ) : (
                    user.email
                  )}
                </td>

                {/* Số điện thoại */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                  {editingRow === user.id ? (
                    <input
                      type="text"
                      value={user.sodienthoai}
                      onChange={(e) =>
                        handleChange(user.id, "sodienthoai", e.target.value)
                      }
                      className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-32 text-sm"
                    />
                  ) : (
                    user.sodienthoai || "—"
                  )}
                </td>

                {/* Địa chỉ */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                  {editingRow === user.id ? (
                    <input
                      type="text"
                      value={user.diachi}
                      onChange={(e) =>
                        handleChange(user.id, "diachi", e.target.value)
                      }
                      className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-48 text-sm"
                    />
                  ) : (
                    user.diachi || "—"
                  )}
                </td>

                {/* Vai trò */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                  {editingRow === user.id ? (
                    <select
                      value={user.vaitro}
                      onChange={(e) =>
                        handleChange(user.id, "vaitro", e.target.value)
                      }
                      className="bg-[#2f2f2f] text-white px-2 py-1 rounded text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  ) : (
                    user.vaitro
                  )}
                </td>

                {/* Thao tác */}
                <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                  <div className="flex space-x-2">
                    {editingRow === user.id ? (
                      <button
                        className="text-green-500 hover:text-green-300"
                        onClick={handleSaveClick}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="text-indigo-500 hover:text-indigo-300"
                        onClick={() => handleEditClick(user.id)}
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      className="text-red-500 hover:text-red-300"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">
            Không tìm thấy người dùng nào.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default UsersTable;
