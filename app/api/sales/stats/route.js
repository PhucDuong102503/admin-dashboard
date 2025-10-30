import pool from "@/lib/connect";

export async function GET() {
  try {
    // Doanh thu tháng hiện tại (chỉ đơn đã giao)
    const [currentRevenueRows] = await pool.execute(`
      SELECT SUM(tongtien) AS currentRevenue
      FROM thoitrang.donhang
      WHERE MONTH(ngaydathang) = MONTH(NOW()) AND YEAR(ngaydathang) = YEAR(NOW())
        AND trangthai = 'Đã giao hàng'
    `);

    // Doanh thu tháng trước (chỉ đơn đã giao)
    const [previousRevenueRows] = await pool.execute(`
      SELECT SUM(tongtien) AS previousRevenue
      FROM thoitrang.donhang
      WHERE MONTH(ngaydathang) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND YEAR(ngaydathang) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
        AND trangthai = 'Đã giao hàng'
    `);

    // Tổng số đơn hàng tháng hiện tại (chỉ đơn đã giao)
    const [orderRows] = await pool.execute(`
      SELECT COUNT(*) AS totalOrders
      FROM thoitrang.donhang
      WHERE MONTH(ngaydathang) = MONTH(NOW()) AND YEAR(ngaydathang) = YEAR(NOW())
        AND trangthai = 'Đã giao hàng'
    `);

    // Tổng sản phẩm bán ra tháng hiện tại (chỉ đơn đã giao)
    const [productRows] = await pool.execute(`
      SELECT SUM(soluong) AS totalProducts
      FROM thoitrang.chitietdonhang
      WHERE donhang_id IN (
        SELECT id FROM thoitrang.donhang
        WHERE MONTH(ngaydathang) = MONTH(NOW()) AND YEAR(ngaydathang) = YEAR(NOW())
          AND trangthai = 'Đã giao hàng'
      )
    `);

    const currentRevenue = currentRevenueRows[0].currentRevenue || 0;
    const previousRevenue = previousRevenueRows[0].previousRevenue || 0;
    const totalOrders = orderRows[0].totalOrders || 0;
    const totalProducts = productRows[0].totalProducts || 0;

    const averageOrderValue =
      totalOrders > 0 ? currentRevenue / totalOrders : 0;

    const growthRate =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    const salesOverview = [
      { label: "Tháng trước", value: previousRevenue },
      { label: "Tháng này", value: currentRevenue },
    ];

    const categoryDistribution = [
      { label: "Áo", value: 49 },
      { label: "Quần", value: 10 },
      { label: "Giày dép", value: 18 },
      { label: "Phụ kiện", value: 23 },
    ];

    return Response.json({
      totalRevenue: currentRevenue,
      averageOrderValue: averageOrderValue.toFixed(0),
      totalSales: totalProducts,
      totalOrders,
      totalGrowth: `${growthRate.toFixed(1)}%`,
      salesOverview,
      categoryDistribution,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu thống kê:", error);
    return Response.json(
      { error: "Không thể lấy dữ liệu thống kê" },
      { status: 500 }
    );
  }
}