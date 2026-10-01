import React from "react";
import { OrderDetailClient } from "./OrderDetailClient";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailClient orderIdentifier={id} />;
}
