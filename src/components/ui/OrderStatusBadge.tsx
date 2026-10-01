import React from "react";
import type { OrderStatus } from "@/types";
import { Badge } from "./Badge";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="offer" className={className}>
          Pending Verification
        </Badge>
      );
    case "confirmed":
      return (
        <Badge variant="brand" className={className}>
          Confirmed
        </Badge>
      );
    case "packing":
      return (
        <Badge variant="neutral" className={className}>
          Packing Cases
        </Badge>
      );
    case "dispatched":
      return (
        <Badge variant="neutral" className={className}>
          Dispatched
        </Badge>
      );
    case "out_for_delivery":
      return (
        <Badge variant="offer" className={className}>
          Out for Delivery
        </Badge>
      );
    case "delivered":
      return (
        <Badge variant="success" className={className}>
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="danger" className={className}>
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {status}
        </Badge>
      );
  }
}
