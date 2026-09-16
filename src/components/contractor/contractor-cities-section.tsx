"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { FEDERAL_DISTRICT_OPTIONS, getCitiesByDistrict } from "@/constants/categories";
import type { CompanyProfile } from "@/data/types";
import { useAuthStore } from "@/lib/store";

interface Props {
  user: CompanyProfile | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function ContractorCitiesSection({ user, showToast }: Props) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [district, setDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const availableCities = useMemo(() => getCitiesByDistrict(district), [district]);

  const handleAddCity = () => {
    if (!selectedCity || !user) return;
    if (user.cities.includes(selectedCity)) {
      showToast("Город уже добавлен", "info");
      return;
    }
    updateUser({ cities: [...user.cities, selectedCity] });
    showToast("Город добавлен");
    setSelectedCity("");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm mb-1">Города оказания услуг:</p>
      <div className="flex flex-wrap gap-2">
        {user?.cities.map((city) => (
          <Badge key={city}>{city}</Badge>
        ))}
      </div>

      <Select
        label="Федеральный округ"
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setSelectedCity("");
        }}
        options={[
          { value: "", label: "Все федеральные округа" },
          ...FEDERAL_DISTRICT_OPTIONS.map((item) => ({ value: item, label: item })),
        ]}
      />

      <Select
        label="Добавить город"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        options={[
          { value: "", label: availableCities.length ? "Выберите город" : "Города не найдены" },
          ...availableCities.map((city) => ({ value: city, label: city })),
        ]}
      />

      <Button size="sm" onClick={handleAddCity} disabled={!selectedCity}>
        Добавить
      </Button>
    </div>
  );
}
