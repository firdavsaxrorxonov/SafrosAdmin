"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types/order";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetails({ isOpen, onClose, order }: OrderDetailsProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Responsive: ekran kattaligiga qarab itemsPerPage dinamik o‘zgartirish
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width < 480) setItemsPerPage(3);
      else if (width < 640) setItemsPerPage(5);
      else setItemsPerPage(10);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Sahifa 1 ga qaytarish, itemsPerPage o‘zgarganda
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (!order) return null;

  const totalPages = Math.ceil(order.items.length / itemsPerPage);
  const currentItems = order.items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("orderDetails")} - {order.customerName}
          </DialogTitle>
          <DialogDescription>{t("completeOrderInfo")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t("customerInformation")}</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">{t("name")}:</span>{" "}
                {order.customerName}
              </div>
              <div>
                <span className="font-medium">{t("contactNumber")}:</span>{" "}
                {order.contact_number}
              </div>
              <div>
                <p className="max-w-md break-words">
                  {order.comment || t("noComment")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t("orderItems")}</h3>

            {/* Scrollable table wrapper */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("product")}</TableHead>
                    <TableHead>{t("quantity")}</TableHead>
                    <TableHead>{t("unity")}</TableHead>
                    <TableHead>{t("price")}</TableHead>
                    <TableHead>{t("total")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentItems.map((item, idx) => (
                    <TableRow key={`${item.productId}-${idx}`}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unity}</TableCell>
                      <TableCell>{item.productPrice} UZS</TableCell>
                      <TableCell>{item.price} UZS</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination tugmalari */}
            {totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
