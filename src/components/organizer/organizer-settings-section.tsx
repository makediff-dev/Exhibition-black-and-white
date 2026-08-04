"use client";

import { useMemo, useState } from "react";
import { Copy, ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PinLoginSettings } from "@/components/account/pin-login-settings";
import type { OrganizerEmployee, OrganizerPermissionSection } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";

const PERMISSION_SECTIONS: { id: OrganizerPermissionSection; label: string }[] = [
  { id: "dashboard", label: "Дашборд" },
  { id: "profile", label: "Профиль компании" },
  { id: "events", label: "Мероприятия" },
  { id: "venues", label: "Площадки проведения" },
  { id: "orders", label: "Заказы" },
  { id: "payments", label: "Оплаты" },
  { id: "documents", label: "Документы" },
];

const ALL_PERMISSIONS = PERMISSION_SECTIONS.map((section) => section.id);

const DEFAULT_INVITE_PERMISSIONS: OrganizerPermissionSection[] = [
  "dashboard",
  "events",
  "orders",
  "documents",
];

const EMPLOYEE_STATUS_LABELS: Record<OrganizerEmployee["status"], string> = {
  active: "Активен",
  invited: "Приглашение отправлено",
  pending_edo: "Ожидает подтверждения через ЭДО",
};

interface Props {
  organizerId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function OrganizerSettingsSection({
  organizerId = "user-organizer",
  showToast,
}: Props) {
  const {
    organizerEmployees,
    addOrganizerEmployee,
    updateOrganizerEmployee,
    removeOrganizerEmployee,
    delegateOrganizerAdmin,
  } = usePrototypeStore();

  const [email, setEmail] = useState("organizer@example.ru");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<OrganizerPermissionSection[]>([
    ...DEFAULT_INVITE_PERMISSIONS,
  ]);
  const [editingEmployee, setEditingEmployee] = useState<OrganizerEmployee | null>(null);
  const [editPermissions, setEditPermissions] = useState<OrganizerPermissionSection[]>([]);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  const employees = useMemo(
    () => organizerEmployees.filter((employee) => employee.organizerId === organizerId),
    [organizerEmployees, organizerId]
  );

  const currentAdmin = employees.find((employee) => employee.isAdmin);

  const toggleInvitePermission = (section: OrganizerPermissionSection) => {
    setInvitePermissions((prev) =>
      prev.includes(section) ? prev.filter((item) => item !== section) : [...prev, section]
    );
  };

  const toggleEditPermission = (section: OrganizerPermissionSection) => {
    setEditPermissions((prev) =>
      prev.includes(section) ? prev.filter((item) => item !== section) : [...prev, section]
    );
  };

  const handleInvite = () => {
    if (!inviteFullName.trim()) {
      showToast("Укажите ФИО сотрудника", "error");
      return;
    }
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      showToast("Укажите рабочий email", "error");
      return;
    }
    if (!invitePhone.trim()) {
      showToast("Укажите телефон", "error");
      return;
    }
    if (invitePermissions.length === 0) {
      showToast("Выберите хотя бы один раздел кабинета", "error");
      return;
    }

    const employeeId = `oemp-${Date.now()}`;
    const inviteLink = `${window.location.origin}/register?invite=${employeeId}&organizer=${organizerId}`;

    addOrganizerEmployee({
      id: employeeId,
      organizerId,
      fullName: inviteFullName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim(),
      isAdmin: false,
      status: "invited",
      edoVerified: false,
      permissions: invitePermissions,
      pinLoginEnabled: false,
      invitedAt: new Date().toISOString().split("T")[0],
    });

    setLastInviteLink(inviteLink);
    setInviteEmail("");
    setInviteFullName("");
    setInvitePhone("");
    setInvitePermissions([...DEFAULT_INVITE_PERMISSIONS]);
    showToast("Приглашение отправлено на email сотрудника");
  };

  const openPermissionsModal = (employee: OrganizerEmployee) => {
    setEditingEmployee(employee);
    setEditPermissions([...employee.permissions]);
  };

  const savePermissions = () => {
    if (!editingEmployee) return;
    if (editPermissions.length === 0) {
      showToast("Выберите хотя бы один раздел", "error");
      return;
    }

    updateOrganizerEmployee(editingEmployee.id, { permissions: editPermissions });
    setEditingEmployee(null);
    showToast("Права доступа обновлены");
  };

  const handleDelegateAdmin = (employee: OrganizerEmployee) => {
    delegateOrganizerAdmin(organizerId, employee.id);
    showToast(`Права администратора переданы: ${employee.fullName}`);
  };

  const handleRemoveEmployee = (employee: OrganizerEmployee) => {
    if (employee.isAdmin) {
      showToast("Нельзя удалить администратора кабинета", "error");
      return;
    }
    removeOrganizerEmployee(employee.id);
    showToast("Сотрудник удалён из кабинета");
  };

  const copyInviteLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast("Ссылка приглашения скопирована");
    } catch {
      showToast("Не удалось скопировать ссылку", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="space-y-4">
        <div>
          <CardTitle>Личные настройки</CardTitle>
          <CardDescription>Email и быстрый вход текущего пользователя</CardDescription>
        </div>
        <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <PinLoginSettings />
        <Button onClick={() => showToast("Настройки сохранены")}>Сохранить</Button>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle>Доступ сотрудников</CardTitle>
          <CardDescription>
            Первый зарегистрировавшийся пользователь назначается администратором. Для
            подтверждения полномочий используется ЭДО.
          </CardDescription>
        </div>

        <div className="border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
          <p className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            Администратор может приглашать сотрудников, назначать доступ к разделам кабинета и
            делегировать права администратора.
          </p>
          <p>
            После перехода по ссылке сотрудник регистрируется, подтверждает полномочия через ЭДО и
            получает доступ только к выбранным разделам.
          </p>
          {currentAdmin && (
            <p className="text-xs text-gray-600">
              Текущий администратор: <strong>{currentAdmin.fullName}</strong>
            </p>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Пригласить сотрудника
          </CardTitle>
          <CardDescription>
            Укажите рабочий email, ФИО и телефон — сотруднику будет отправлена ссылка-приглашение
          </CardDescription>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="ФИО"
            value={inviteFullName}
            onChange={(event) => setInviteFullName(event.target.value)}
            placeholder="Иванов Иван Иванович"
          />
          <Input
            label="Рабочий email"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="employee@company.ru"
          />
          <Input
            label="Телефон"
            value={invitePhone}
            onChange={(event) => setInvitePhone(event.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="sm:col-span-2"
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Доступ к разделам кабинета</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {PERMISSION_SECTIONS.map((section) => (
              <label
                key={section.id}
                className="flex items-center gap-2 text-sm cursor-pointer border border-gray-200 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={invitePermissions.includes(section.id)}
                  onChange={() => toggleInvitePermission(section.id)}
                />
                {section.label}
              </label>
            ))}
          </div>
        </div>

        <Button onClick={handleInvite}>Отправить приглашение</Button>

        {lastInviteLink && (
          <div className="border border-dashed border-gray-300 p-3 text-sm space-y-2">
            <p className="text-gray-600">Демо-ссылка приглашения:</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-xs break-all">{lastInviteLink}</code>
              <Button size="sm" variant="outline" onClick={() => copyInviteLink(lastInviteLink)}>
                <Copy className="h-3.5 w-3.5" />
                Копировать
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Сотрудники ({employees.length})</h3>

        {employees.map((employee) => {
          const inviteLink =
            employee.status === "invited"
              ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?invite=${employee.id}&organizer=${organizerId}`
              : null;

          return (
            <Card key={employee.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <CardTitle className="text-base">{employee.fullName}</CardTitle>
                    {employee.isAdmin && <Badge variant="solid">Администратор</Badge>}
                    <Badge variant="outline">{EMPLOYEE_STATUS_LABELS[employee.status]}</Badge>
                    {employee.edoVerified && <Badge variant="outline">ЭДО подтверждено</Badge>}
                  </div>
                  <CardDescription>
                    {employee.email} · {employee.phone}
                  </CardDescription>
                  <p className="text-xs text-gray-500 mt-1">
                    {employee.joinedAt
                      ? `В системе с ${formatDate(employee.joinedAt)}`
                      : employee.invitedAt
                        ? `Приглашён ${formatDate(employee.invitedAt)}`
                        : null}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!employee.isAdmin && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => openPermissionsModal(employee)}>
                        Права доступа
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelegateAdmin(employee)}>
                        Назначить администратором
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveEmployee(employee)}>
                        Удалить
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(employee.isAdmin ? ALL_PERMISSIONS : employee.permissions).map((section) => {
                  const label = PERMISSION_SECTIONS.find((item) => item.id === section)?.label;
                  return (
                    <Badge key={section} variant="outline">
                      {label ?? section}
                    </Badge>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-3 text-sm">
                <p className="font-medium mb-1">Настройки входа сотрудника</p>
                <p className="text-gray-600">
                  PIN-код: {employee.pinLoginEnabled ? "настроен индивидуально" : "не включён"}
                </p>
                {employee.status === "invited" && inviteLink && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Ссылка-приглашение:</span>
                    <Button size="sm" variant="outline" onClick={() => copyInviteLink(inviteLink)}>
                      <Copy className="h-3.5 w-3.5" />
                      Копировать
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        title={`Права доступа: ${editingEmployee?.fullName ?? ""}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Выберите разделы кабинета, к которым сотрудник будет иметь доступ.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {PERMISSION_SECTIONS.map((section) => (
              <label
                key={section.id}
                className="flex items-center gap-2 text-sm cursor-pointer border border-gray-200 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={editPermissions.includes(section.id)}
                  onChange={() => toggleEditPermission(section.id)}
                />
                {section.label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={savePermissions}>Сохранить</Button>
            <Button variant="outline" onClick={() => setEditingEmployee(null)}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
