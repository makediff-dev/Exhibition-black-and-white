import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";

interface Props {
  title: string;
  description: string;
}

export function LegalPlaceholderPage({ title, description }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-site flex-1 px-4 py-8">
        <h1 className="mb-3 text-2xl font-bold">{title}</h1>
        <p className="mb-3 text-sm text-gray-700">{description}</p>
        <p className="text-sm text-gray-600">
          Полный юридический текст в прототипе не опубликован и недоступен для скачивания.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          На главную
        </Link>
      </main>
      <Footer />
    </div>
  );
}
