// OrderTable.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, FileDown } from "lucide-react";
import type { Order } from "@/types/order";
import { useLanguage } from "@/contexts/language-context";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface OrderTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onDeleteSuccess: () => void;
}

export function OrderTable({
  orders,
  onViewOrder,
  onDeleteSuccess,
}: OrderTableProps) {
  const { t, language } = useLanguage();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        t("Are you sure you want to delete this order?") || "Delete order?"
      )
    )
      return;

    try {
      setLoadingId(id);
      const token = localStorage.getItem("agroAdminToken");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${id}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": language,
          },
        }
      );

      onDeleteSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // 🔹 Bitta buyurtmani Excelga export qilish
  const exportSingleOrderToExcel = (order: Order) => {
    const rows: any[] = [];

    order.items.forEach((item) => {
      rows.push({
        [t("orderNumber")]: order.order_number,
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

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    const fileName = `buyurtma_${order.order_number}_${order.customerName}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>№</TableHead>
            <TableHead>{t("customerName")}</TableHead>
            <TableHead>{t("items")}</TableHead>
            <TableHead>{t("total")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow key={order.id}>
              {/* 🔹 index + 1 qilib qo‘yamiz */}
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground">
                  {order.customerEmail}
                </div>
              </TableCell>
              <TableCell>
                {order.items.length} {t("items")}
              </TableCell>
              <TableCell className="font-medium">{order.amount} UZS</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleString("uz-UZ", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* Ko‘rish */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* O‘chirish */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(order.id)}
                    disabled={loadingId === order.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {loadingId === order.id ? "..." : <Trash2 className="h-4 w-4" />}
                  </Button>

                  {/* 🔹 Excel export */}
                  <Button
                    className="bg-black hover:text-gray-950 text-white"
                    size="sm"
                    variant="ghost"
                    onClick={() => exportSingleOrderToExcel(order)}
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="ml-1">{t("Export")}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
