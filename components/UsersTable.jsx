// app/components/UsersTable.jsx  (hoặc đường dẫn file client hiện tại của bạn)
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Check, X, Ban, CheckCircle } from "lucide-react";

export default function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // danh sách role từ DB
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({}); // lưu tạm dữ liệu đang edit
  const [loading, setLoading] = useState(false);

  // load users + roles
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.users)) setUsers(data.users);
        else if (data && data.users) setUsers(data.users);
        else console.error("Dữ liệu user không hợp lệ:", data);
      })
      .catch((err) => console.error("Lỗi khi load users:", err));

    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.roles) setRoles(data.roles);
      })
      .catch((err) => console.error("Lỗi khi load roles:", err));
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.hoten || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // bắt đầu edit: lưu dữ liệu hiện tại vào editForm
  const handleEditClick = (user) => {
    setEditingRow(user.id);
    setEditForm({
      id: user.id,
      email: user.email || "",
      sodienthoai: user.sodienthoai || "",
      diachi: user.diachi || "",
      vaitro: user.vaitro || "",
    });
  };

  // huỷ edit và quay lại dữ liệu cũ
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditForm({});
  };

  // thay đổi ô input khi edit
  const handleChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

 const handleSaveClick = async () => {
  if (!editForm || !editForm.id) {
    console.error("handleSaveClick - missing id in editForm:", editForm);
    alert("Thiếu ID người dùng. Không thể lưu.");
    return;
  }

  setLoading(true);

  // lưu bản sao để rollback khi lỗi
  const originalUsers = [...users];

  try {
    const id = encodeURIComponent(editForm.id);

    // chuẩn body theo backend của bạn (vaitro tên role là ok)
    const payload = {
      email: editForm.email,
      sodienthoai: editForm.sodienthoai,
      diachi: editForm.diachi,
      vaitro: editForm.vaitro,
    };

    // gọi PATCH (server route của bạn đang dùng PATCH để update)
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // luôn parse JSON (vì server trả NextResponse.json)
    const data = await res.json();

    if (!res.ok) {
      console.error("PUT/PATCH response not ok:", res.status, data);
      alert(data.message || "Cập nhật thất bại (server).");
      // rollback local state
      setUsers(originalUsers);
    } else if (data.success) {
      // cập nhật local state với dữ liệu editForm (giữ nguyên hoten nếu không chỉnh)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editForm.id
            ? {
                ...u,
                email: editForm.email,
                sodienthoai: editForm.sodienthoai,
                diachi: editForm.diachi,
                vaitro: editForm.vaitro,
              }
            : u
        )
      );
      setEditingRow(null);
      setEditForm({});
    } else {
      console.error("PUT/PATCH response error body:", data);
      alert(data.message || "Cập nhật thất bại");
      setUsers(originalUsers);
    }
  } catch (err) {
    console.error("Lỗi khi update user:", err);
    alert("Lỗi mạng / server");
    // rollback
    setUsers((prev) => prev); // (or setUsers(originalUsers))
  } finally {
    setLoading(false);
  }
};

// khi ban/unban (PATCH)
const handleBanToggle = async (id, currentStatus) => {
  if (!id) {
    console.error("handleBanToggle - missing id:", id);
    return alert("Thiếu id");
  }

  const confirmMsg = currentStatus
    ? "Bạn có chắc muốn mở khóa tài khoản này?"
    : "Bạn có chắc muốn khóa (ban) tài khoản này?";
  if (!confirm(confirmMsg)) return;

  // optimistic update: cập nhật UI ngay, rollback nếu lỗi
  const originalUsers = [...users];
  setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, banned: currentStatus ? 0 : 1 } : u)));

  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: currentStatus ? 0 : 1 }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("PATCH(ban) failed:", res.status, data);
      alert(data.message || "Thao tác thất bại");
      // rollback
      setUsers(originalUsers);
    } else {
      // success — optional toast
      // setUsers already updated optimistically
    }
  } catch (err) {
    console.error("Lỗi khi ban/unban:", err);
    alert("Lỗi mạng / server");
    setUsers(originalUsers);
  }
};

// khi delete (DELETE)
const handleHardDelete = async (id) => {
  if (!id) {
    console.error("handleHardDelete - missing id:", id);
    alert("Thiếu ID người dùng");
    return;
  }

  if (!confirm("Xóa hoàn toàn người dùng này? Hành động không thể hoàn tác.")) return;

  // optimistic: remove locally then restore on error
  const originalUsers = [...users];
  setUsers((prev) => prev.filter((u) => u.id !== id));

  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("DELETE failed:", res.status, data);
      alert(data.message || "Xóa thất bại");
      // rollback
      setUsers(originalUsers);
    } else {
      // success: already removed
    }
  } catch (err) {
    console.error("Lỗi khi xóa:", err);
    alert("Lỗi mạng / server");
    setUsers(originalUsers);
  }
};

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
          Danh sách người dùng
        </h2>

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
              {["#", "Họ tên", "Email", "SĐT", "Địa chỉ", "Vai trò", "Trạng thái", "Hành động"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {filteredUsers.map((user, index) => {
              const isEditing = editingRow === user.id;
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-[#2a2a2a] transition duration-150"
                >
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-400">{index + 1}</td>

                  {/* Họ tên (không edit) */}
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-100">{user.hoten}</td>

                  {/* Email */}
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                    {isEditing ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-44 text-sm"
                      />
                    ) : (
                      user.email
                    )}
                  </td>

                  {/* SĐT */}
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                    {isEditing ? (
                      <input
                        value={editForm.sodienthoai}
                        onChange={(e) => handleChange("sodienthoai", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-36 text-sm"
                      />
                    ) : (
                      user.sodienthoai || "—"
                    )}
                  </td>

                  {/* Địa chỉ */}
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                    {isEditing ? (
                      <input
                        value={editForm.diachi}
                        onChange={(e) => handleChange("diachi", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded w-56 text-sm"
                      />
                    ) : (
                      user.diachi || "—"
                    )}
                  </td>

                  {/* Vai trò */}
                  <td className="px-3 md:px-6 py-3 text-sm">
                    {isEditing ? (
                      <select
                        value={editForm.vaitro}
                        onChange={(e) => handleChange("vaitro", e.target.value)}
                        className="bg-[#2f2f2f] text-white px-2 py-1 rounded text-sm"
                      >
                        {/* use roles fetched from DB */}
                        {roles.map((r) => (
                          <option key={r.id} value={r.tenrole}>
                            {r.tenrole}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.vaitro === "Admin"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {user.vaitro || "Customer"}
                      </span>
                    )}
                  </td>

                  {/* Trạng thái banned */}
                  <td className="px-3 md:px-6 py-3 text-sm text-gray-300">
                    {user.banned ? (
                      <span className="text-red-400 font-medium">Đang bị khóa</span>
                    ) : (
                      <span className="text-green-400 font-medium">Hoạt động</span>
                    )}
                  </td>

                  {/* Hành động: icons */}
                  <td className="px-3 md:px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {/* Edit / Save / Cancel */}
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveClick}
                            disabled={loading}
                            className="p-2 rounded hover:bg-white/5 text-green-400"
                            title="Lưu"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 rounded hover:bg-white/5 text-gray-300"
                            title="Hủy"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 rounded hover:bg-white/5 text-indigo-400"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}

                      {/* Ban / Unban */}
                      <button
                        onClick={() => handleBanToggle(user.id, user.banned)}
                        className={`p-2 rounded hover:bg-white/5 ${
                          user.banned ? "text-green-400" : "text-red-400"
                        }`}
                        title={user.banned ? "Mở khóa" : "Khoá (ban)"}
                      >
                        {user.banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>

                      {/* Hard delete */}
                      <button
                        onClick={() => {
                          if (confirm("Xóa hoàn toàn người dùng?")) handleHardDelete(user.id);
                        }}
                        className="p-2 rounded hover:bg-white/5 text-red-600"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
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
}
