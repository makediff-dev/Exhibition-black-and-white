"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResponseDetailRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  useEffect(() => {
    router.replace(`/requests/${requestId}/responses`);
  }, [requestId, router]);

  return <div className="p-8 text-center text-sm text-gray-500">Загрузка...</div>;
}