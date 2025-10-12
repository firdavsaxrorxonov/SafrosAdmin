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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    try {
      setLoadingId(deleteId);
      const token = localStorage.getItem("agroAdminToken");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/${deleteId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": language,
          },
        }
      );

      onDeleteSuccess();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
      setDeleteId(null);
    }
  };

  const exportSingleOrderToExcel = (order: Order) => {
    const rows: any[] = [];

    order.items.forEach((item) => {
      rows.push({
        [t("orderNumber")]: order.order_number,
        [t("customerName")]: order.customerName,
        [t("productCode")]: item.productCode,
        [t("product")]: item.productName,
        [t("quantity")]: item.quantity,
        [t("Unit")]: item.unity,
        [t("price")]: item.productPrice,
        [t("total")]: item.price,
        [t("date")]: new Date(order.createdAt).toLocaleDateString("uz-UZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const worksheetRange = XLSX.utils.decode_range(worksheet["!ref"]!);

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[
        t("comment"),
        order.comment || "—",
        t(""),
        new Date(order.createdAt).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      ]],
      { origin: { r: worksheetRange.e.r + 5, c: 0 } }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    const fileName = `buyurtma_${order.order_number}_${order.customerName}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <>
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
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customerEmail}</div>
                </TableCell>
                <TableCell>{order.items.length} {t("items")}</TableCell>
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
                    <Button size="sm" variant="ghost" onClick={() => onViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirmDelete(order.id)}
                      disabled={loadingId === order.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {loadingId === order.id ? "..." : <Trash2 className="h-4 w-4" />}
                    </Button>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("ConDel")}</DialogTitle>
            <DialogDescription>{t("sure")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("Cancele")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              {t("Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}