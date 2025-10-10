"use client";

import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { OrderTable } from "@/components/orders/order-table";
import { OrderDetails } from "@/components/orders/order-details";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Order } from "@/types/order";
import { useLanguage } from "@/contexts/language-context";

export default function OrdersPage() {
  const { t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("agroAdminToken") : null;

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Buyurtmalarni olish
  const fetchOrders = async (page: number = 1) => {
    try {
      const params: any = { page, page_size: itemsPerPage };
      if (selectedDate) params.date = selectedDate;

      const res = await api.get("/order/list/", { params });
      const data = res.data;

      const formattedOrders: Order[] = data.results.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        customerName:
          o.user?.first_name && o.user?.last_name
            ? `${o.user.first_name} ${o.user.last_name}`
            : o.name || t("noName"),
        customerEmail: o.user?.username || t("noEmail"),
        amount: o.total_price,
        createdAt: o.created_at,
        items: o.items.map((item: any) => ({
          productId: item.product.id,
          productName: item.product.name_uz,
          quantity: item.quantity,
          price: item.price, // buyurtmadagi narx
          productPrice: item.product.price, // productning o‘zidagi narx
        })),
      }));

      setOrders(formattedOrders);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
  }, [selectedDate]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchOrders(page);
  };

  // Client-side filter orders by selectedUser
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesUser =
        selectedUser === "all" || order.customerName === selectedUser;
      const matchesDate =
        !selectedDate ||
        new Date(order.createdAt).toLocaleDateString() ===
        new Date(selectedDate).toLocaleDateString();
      return matchesUser && matchesDate;
    });
  }, [orders, selectedUser, selectedDate]);

  // Excel eksport
  const exportToExcel = () => {
    if (!filteredOrders.length) return;

    const rows: any[] = [];
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        rows.push({
          [t("Buyurtma raqami")]: order.order_number,
          [t("customerName")]: order.customerName,
          [t("customerEmail")]: order.customerEmail,
          [t("product")]: item.productName,
          [t("quantity")]: item.quantity,
          [t("price")]: item.productPrice, // productdagi narx
          [t("total")]: item.price, // buyurtmadagi narx
          [t("date")]: new Date(order.createdAt).toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          [t("time")]: new Date(order.createdAt).toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });

      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    const formattedDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString("uz-UZ")
      : "";
    const fileName = `Buyurtmalar${formattedDate}.xlsx`;

    saveAs(data, fileName);
  };

  const uniqueUsers = Array.from(new Set(orders.map((o) => o.customerName)));

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{t("orders")}</h1>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="all">{t("allUsers")}</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded"
            />

            <Button onClick={exportToExcel}>{t("exportExcel")}</Button>
          </div>

          {/* Orders Table */}
          <OrderTable
            orders={filteredOrders}
            onViewOrder={handleViewOrder}
            onDeleteSuccess={() => fetchOrders(currentPage)}
          />

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {"<"}
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {">"}
            </Button>
          </div>

          {/* Order Details Modal */}
          <OrderDetails
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            order={selectedOrder}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
