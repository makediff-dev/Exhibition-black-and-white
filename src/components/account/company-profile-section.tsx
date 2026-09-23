"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2, FileText, Globe, Hash, MapPin, Phone, ShieldCheck, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CompanyAvatarUpload } from "@/components/account/company-avatar-upload";
import { ContractorCitiesSection } from "@/components/contractor/contractor-cities-section";
import { ContractorPortfolioListSection } from "@/components/contractor/contractor-portfolio-section";
import { ContractorProductionSection } from "@/components/contractor/contractor-production-section";
import { ContractorReviewsSection } from "@/components/contractor/contractor-reviews-section";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import type { CompanyProfile } from "@/data/types";
import { getContractorIdForUser } from "@/lib/utils/user-entity-map";
import { useUnsavedChanges } from "@/lib/hooks/use-unsaved-changes";
import { FormStatus } from "@/components/ui/form-status";

type CompanyProfileTab = "general" | "company" | "cities" | "production" | "portfolio" | "reviews";

const CUSTOMER_PROFILE_TABS = [
  { id: "general", label: "Общая информация" },
  { id: "company", label: "Данные компании" },
];

const CONTRACTOR_PROFILE_TABS = [
  ...CUSTOMER_PROFILE_TABS,
  { id: "cities", label: "Города оказания услуг" },
  { id: "production", label: "Производственные мощности" },
  { id: "portfolio", label: "Портфолио" },
  { id: "reviews", label: "Отзывы и рейтинг" },
];

interface Props {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  initialTab?: CompanyProfileTab;
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

function CompanyLegalFields({
  user,
  onSave,
}: {
  user: CompanyProfile;
  onSave: () => void;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-medium">Юридические и платёжные данные</p>
        <p className="text-xs text-gray-500 mt-1">
          Реквизиты компании и банковские данные для договоров и оплат
        </p>
      </div>
      <Input label="ИНН" defaultValue={user.inn} />
      <Input label="КПП" defaultValue="770101001" />
      <Input label="ОГРН (для ООО)" defaultValue={user.ogrn} />
      <Input
        label="ОГРНИП (для ИП)"
        defaultValue=""
        placeholder="Заполняется для индивидуальных предпринимателей"
      />
      <Input label="Юридический адрес" defaultValue={user.address} />
      <Input label="Руководитель" defaultValue={user.director} />
      <Input label="Расчётный счёт" defaultValue="40702810XXXXXXXXXXXX" />
      <Input label="БИК" defaultValue="044525225" />
      <Input label="Банк" defaultValue="ПАО «Вымышленный Банк»" />
      <Input label="Корреспондентский счёт банка" defaultValue="30101810XXXXXXXXXXXX" />
      <Button type="button" onClick={onSave}>Сохранить</Button>
    </Card>
  );
}

function GeneralProfileFields({
  user,
  logoUrl,
  displayName,
  setDisplayName,
  description,
  setDescription,
  actualAddress,
  setActualAddress,
  website,
  setWebsite,
  phone,
  setPhone,
  onLogoUpload,
  onLogoError,
  onSave,
  dirty,
  saved,
}: {
  user: CompanyProfile;
  logoUrl?: string;
  displayName: string;
  setDisplayName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  actualAddress: string;
  setActualAddress: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  onLogoUpload: (url: string) => void;
  onLogoError: (message: string) => void;
  onSave: () => void;
  dirty: boolean;
  saved: boolean;
}) {
  return (
    <>
      <Card>
        <CompanyAvatarUpload
          logoUrl={logoUrl}
          companyName={user.displayName ?? user.name}
          onUpload={onLogoUpload}
          onError={onLogoError}
        />
      </Card>

      <Card className="space-y-4">
        <p className="text-sm font-medium">Публичная информация</p>
        <Input
          label="Отображаемое название"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
          help="Так компанию видят заказчики в каталоге"
        />
        <Textarea
          label="Описание компании"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="text-sm font-medium">Контакты</p>
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
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={onSave}>Сохранить</Button>
          <FormStatus dirty={dirty} saved={saved} />
        </div>
      </Card>
    </>
  );
}

export function CompanyProfileSection({ showToast, initialTab = "general" }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setCompanyLogo = usePrototypeStore((state) => state.setCompanyLogo);
  const logoUrl = usePrototypeStore((state) =>
    user?.id ? state.companyLogos[user.id] : undefined
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const isContractor = user?.role === "contractor";
  const useTabbedCompanyProfile = user?.role === "customer" || isContractor;
  const contractorId = getContractorIdForUser(user) ?? "ctr-1";
  const tabFromQuery = searchParams.get("tab") as CompanyProfileTab | null;
  const resolvedInitialTab =
    isContractor && tabFromQuery && CONTRACTOR_PROFILE_TABS.some((tab) => tab.id === tabFromQuery)
      ? tabFromQuery
      : initialTab;
  const [activeTab, setActiveTab] = useState<CompanyProfileTab>(resolvedInitialTab);

  const [displayName, setDisplayName] = useState(user?.displayName ?? user?.name ?? "");
  const [description, setDescription] = useState(user?.description ?? "");
  const [actualAddress, setActualAddress] = useState(user?.actualAddress ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(() => {
    if (!user) return false;
    return (
      displayName !== (user.displayName ?? user.name) ||
      description !== (user.description ?? "") ||
      actualAddress !== (user.actualAddress ?? "") ||
      website !== (user.website ?? "") ||
      phone !== (user.phone ?? "")
    );
  }, [user, displayName, description, actualAddress, website, phone]);

  useUnsavedChanges(dirty);

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      displayName: displayName.trim() || user.name,
      description: description.trim(),
      actualAddress: actualAddress.trim(),
      website: website.trim(),
      phone: phone.trim(),
    });
    setSaved(true);
    showToast("Профиль сохранён", "success");
  };

  const handleLogoUpload = (nextLogoUrl: string) => {
    if (!user.id) return;
    setCompanyLogo(user.id, nextLogoUrl);
    showToast("Логотип обновлён", "success");
  };

  const generalFields = (
    <GeneralProfileFields
      user={user}
      logoUrl={logoUrl}
      displayName={displayName}
      setDisplayName={setDisplayName}
      description={description}
      setDescription={setDescription}
      actualAddress={actualAddress}
      setActualAddress={setActualAddress}
      website={website}
      setWebsite={setWebsite}
      phone={phone}
      setPhone={setPhone}
      onLogoUpload={handleLogoUpload}
      onLogoError={(message) => showToast(message, "error")}
      onSave={handleSave}
      dirty={dirty}
      saved={saved && !dirty}
    />
  );

  const handleTabChange = (id: string) => {
    const nextTab = id as CompanyProfileTab;
    setActiveTab(nextTab);
    if (!isContractor) return;
    const href =
      nextTab === "general"
        ? "/account/contractor/profile"
        : `/account/contractor/profile?tab=${nextTab}`;
    router.replace(href, { scroll: false });
  };

  const tabbedContent =
    activeTab === "general" ? (
      generalFields
    ) : activeTab === "company" ? (
      <CompanyLegalFields
        user={user}
        onSave={() => showToast("Данные сохранены", "success")}
      />
    ) : activeTab === "cities" ? (
      <ContractorCitiesSection user={user} showToast={showToast} />
    ) : activeTab === "production" ? (
      <ContractorProductionSection user={user} showToast={showToast} />
    ) : activeTab === "portfolio" ? (
      <ContractorPortfolioListSection contractorId={contractorId} hideTitle />
    ) : (
      <ContractorReviewsSection user={user} />
    );

  return (
    <div className={isContractor ? "space-y-4" : "max-w-2xl space-y-4"}>
      <h1 className="text-xl font-bold text-gray-900">Профиль компании</h1>

      {useTabbedCompanyProfile ? (
        <>
          <Tabs
            tabs={isContractor ? CONTRACTOR_PROFILE_TABS : CUSTOMER_PROFILE_TABS}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
          {isContractor &&
          (activeTab === "production" || activeTab === "portfolio" || activeTab === "reviews")
            ? tabbedContent
            : <div className={isContractor ? "max-w-2xl space-y-4" : "space-y-4"}>{tabbedContent}</div>}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
