import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-sm text-gray-500 mb-2">404</p>
      <h1 className="text-xl font-bold mb-2">Страница не найдена</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-md">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Link href="/">
        <Button>На главную</Button>
      </Link>
    </div>
  );
}