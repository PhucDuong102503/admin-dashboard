"use client";

export default function HelpPage() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🛠 Trung tâm trợ giúp</h1>

      <p className="text-black font-semibold mb-6">
  Đây là nơi bạn có thể tìm hiểu cách sử dụng hệ thống quản trị, xử lý đơn hàng, quản lý sản phẩm và hỗ trợ khách hàng.
</p>

      <ul className="space-y-4">
        <li className="bg-[#2f2f2f] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-1">📦 Quản lý sản phẩm</h2>
          <p className="text-gray-400 text-sm">
            Thêm, sửa, xóa sản phẩm trong mục <strong>Products</strong>. Đảm bảo thông tin đầy đủ và hình ảnh rõ ràng.
          </p>
        </li>

        <li className="bg-[#2f2f2f] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-1">🧾 Xử lý đơn hàng</h2>
          <p className="text-gray-400 text-sm">
            Kiểm tra trạng thái đơn hàng, xác nhận thanh toán và cập nhật vận chuyển trong mục <strong>Orders</strong>.
          </p>
        </li>

        <li className="bg-[#2f2f2f] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-1">👥 Quản lý khách hàng</h2>
          <p className="text-gray-400 text-sm">
            Xem danh sách người dùng, kiểm tra lịch sử mua hàng và hỗ trợ qua mục <strong>Messages</strong>.
          </p>
        </li>

        <li className="bg-[#2f2f2f] p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-1">⚙️ Cài đặt hệ thống</h2>
          <p className="text-gray-400 text-sm">
            Tùy chỉnh thông tin cửa hàng, cấu hình email, ngôn ngữ và quyền truy cập trong mục <strong>Settings</strong>.
          </p>
        </li>
      </ul>
    </div>
  );
}