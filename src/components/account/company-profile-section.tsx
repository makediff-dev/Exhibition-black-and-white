"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2, FileText, Globe, Hash, MapPin, MessageSquare, Phone, ShieldCheck, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CompanyAvatarUpload } from "@/components/account/company-avatar-upload";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import type { CompanyProfile } from "@/data/types";

interface Props {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function CompanyRequisites({ user }: { user: CompanyProfile }) {
  const rows: { icon: typeof Building2; label: string; value: string }[] = [
    { icon: Building2, label: "Полное наименование", value: user.name },
    { icon: Hash, label: "ИНН", value: user.inn },
    { icon: Hash, label: "ОГРН", value: user.ogrn },
    { icon: MapPin, label: "Юридический адрес", value: user.address },
    ...(user.actualAddress
      ? [{ icon: MapPin, label: "Фактический адрес", value: user.actualAddress }]
      : []),
    ...(user.phone ? [{ icon: Phone, label: "Телефон", value: user.phone }] : []),
    ...(user.website ? [{ icon: Globe, label: "Сайт", value: user.website }] : []),
    { icon: User, label: "Генеральный директор", value: user.director },
    { icon: FileText, label: "Основной ОКВЭД", value: user.mainOkved },
  ];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-lg font-semibold">{user.displayName ?? user.name}</p>
          <p className="text-sm text-gray-600">{user.description}</p>
        </div>
        {user.verified && (
          <Badge className="shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" /> Верифицирована
          </Badge>
        )}
      </div>

      <dl className="divide-y divide-gray-200 border-t border-gray-200">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-start gap-4 py-2.5 text-sm">
            <dt className="flex items-center gap-2 text-gray-600 shrink-0">
              <row.icon className="h-4 w-4" /> {row.label}
            </dt>
            <dd className="text-right font-medium break-all">{row.value}</dd>
          </div>
        ))}
        {user.additionalOkved.length > 0 && (
          <div className="flex justify-between items-start gap-4 py-2.5 text-sm">
            <dt className="flex items-center gap-2 text-gray-600 shrink-0">
              <FileText className="h-4 w-4" /> Доп. ОКВЭД
            </dt>
            <dd className="text-right">
              <div className="flex flex-wrap gap-1.5 justify-end">
                {user.additionalOkved.map((okved) => (
                  <Badge key={okved} variant="dashed">{okved}</Badge>
                ))}
              </div>
            </dd>
          </div>
        )}
      </dl>

      <p className="text-xs text-gray-500 border border-dashed border-gray-300 p-2 mt-4">
        Реквизиты загружены из ЕГРЮЛ по ИНН и подтверждены при регистрации.
      </p>
    </Card>
  );
}

export function CompanyProfileSection({ showToast }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setCompanyLogo = usePrototypeStore((state) => state.setCompanyLogo);
  const logoUrl = usePrototypeStore((state) =>
    user?.id ? state.companyLogos[user.id] : undefined
  );
  const unreadCount = usePrototypeStore((state) =>
    state.messages.reduce((sum, thread) => sum + (thread.unread ?? 0), 0)
  );

  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.name ?? "");
  const [description, setDescription] = useState(user?.description ?? "");
  const [actualAddress, setActualAddress] = useState(user?.actualAddress ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      displayName: displayName.trim() || user.name,
      description: description.trim(),
      actualAddress: actualAddress.trim(),
      website: website.trim(),
      phone: phone.trim(),
    });
    showToast("Профиль сохранён", "success");
  };

  const handleLogoUpload = (nextLogoUrl: string) => {
    if (!user.id) return;
    setCompanyLogo(user.id, nextLogoUrl);
    showToast("Логотип обновлён", "success");
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CompanyAvatarUpload
          logoUrl={logoUrl}
          companyName={user.displayName ?? user.name}
          onUpload={handleLogoUpload}
          onError={(message) => showToast(message, "error")}
        />
      </Card>

      <CompanyRequisites user={user} />

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Данные для верификации</p>
          <p className="text-xs text-gray-500 mt-1">
            Указываются при регистрации и используются модерацией для проверки компании
          </p>
        </div>
        <Input
          label="Фактический адрес"
          value={actualAddress}
          onChange={(event) => setActualAddress(event.target.value)}
          placeholder="г. Москва, ул. Производственная, д. 12"
        />
        <Input
          label="Сайт"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          placeholder="https://company.ru"
        />
        <Input
          label="Телефон компании"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 900 000-00-00"
        />
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-medium">Публичная информация</p>
        <Input
          label="Отображаемое название"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <Textarea
          label="Описание компании"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button type="button" onClick={handleSave}>Сохранить</Button>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 shrink-0 text-gray-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Переписка с участниками</p>
            <p className="text-xs text-gray-500 mt-1">
              Общайтесь с заказчиками, исполнителями, площадками и организаторами внутри платформы
            </p>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-700 mt-2">
                Непрочитанных сообщений: {unreadCount}
              </p>
            )}
          </div>
        </div>
        <Link href="/messages">
          <Button type="button" variant="outline">Открыть сообщения</Button>
        </Link>
      </Card>
    </div>
  );
}