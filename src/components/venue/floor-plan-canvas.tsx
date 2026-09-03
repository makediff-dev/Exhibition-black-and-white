"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  FloorPlanPlot,
  FloorPlanPlotStatus,
  HallGridConfig,
  HallGridFeature,
} from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";

const PLOT_STYLES: Record<
  FloorPlanPlotStatus,
  { label: string; className: string; textClass: string }
> = {
  available: {
    label: "Свободно",
    className: "bg-emerald-100 border-emerald-500 hover:bg-emerald-200",
    textClass: "text-emerald-900",
  },
  reserved: {
    label: "Забронировано",
    className: "bg-yellow-200 border-yellow-500 hover:bg-yellow-100",
    textClass: "text-yellow-900",
  },
  paid: {
    label: "Оплачено",
    className: "bg-blue-500 border-blue-700 hover:bg-blue-600",
    textClass: "text-white",
  },
  unavailable: {
    label: "Недоступно",
    className: "bg-gray-100 border-dashed border-gray-400 opacity-70",
    textClass: "text-gray-500",
  },
};

const FEATURE_STYLES: Record<
  HallGridFeature["type"],
  { className: string; label: string }
> = {
  column: { className: "bg-gray-700", label: "Колонна" },
  entrance: { className: "bg-gray-900/80 text-white text-[10px]", label: "Вход" },
  exit: { className: "bg-gray-900/80 text-white text-[10px]", label: "Выход" },
  zone: { className: "border border-dashed border-gray-500 bg-gray-50/80 text-[10px] text-gray-700", label: "Зона" },
};

interface Props {
  config: HallGridConfig;
  features?: HallGridFeature[];
  plots?: FloorPlanPlot[];
  showGrid?: boolean;
  showRulers?: boolean;
  showFeatures?: boolean;
  onPlotClick?: (plot: FloorPlanPlot) => void;
}

export function FloorPlanCanvas({
  config,
  features = [],
  plots = [],
  showGrid = false,
  showRulers = false,
  showFeatures = true,
  onPlotClick,
}: Props) {
  const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);

  const aspectRatio = config.widthMeters / config.heightMeters;

  const hoveredPlot = useMemo(
    () => plots.find((plot) => plot.id === hoveredPlotId),
    [plots, hoveredPlotId]
  );

  const toPercent = (value: number, axis: "x" | "y" | "w" | "h") => {
    if (axis === "x" || axis === "w") {
      return (value / config.widthMeters) * 100;
    }
    return (value / config.heightMeters) * 100;
  };

  const xTicks = useMemo(
    () => Array.from({ length: config.widthMeters + 1 }, (_, index) => index),
    [config.widthMeters]
  );

  const yTicks = useMemo(
    () => Array.from({ length: config.heightMeters + 1 }, (_, index) => index),
    [config.heightMeters]
  );

  const gridBackground = showGrid
    ? {
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to right, rgba(0,0,0,0.14) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.14) 1px, transparent 1px)
        `,
        backgroundSize: `
          ${100 / config.widthMeters}% ${100 / config.heightMeters}%,
          ${100 / config.widthMeters}% ${100 / config.heightMeters}%,
          ${(100 / config.widthMeters) * 5}% ${(100 / config.heightMeters) * 5}%,
          ${(100 / config.widthMeters) * 5}% ${(100 / config.heightMeters) * 5}%
        `,
      }
    : undefined;

  const buildTooltip = (plot: FloorPlanPlot) => {
    const total = plot.area * plot.pricePerSqm;

    if (plot.status === "unavailable") {
      return `${plot.label} · Недоступно`;
    }

    if (plot.status === "reserved") {
      return `${plot.label} · Забронировано · ${formatPrice(total)}`;
    }

    if (plot.status === "paid") {
      return `${plot.label} · ${plot.companyName ?? "Участник"} · ${formatPrice(total)}`;
    }

    return `${plot.label} · ${formatPrice(total)} · Нажмите для деталей`;
  };

  const planBody = (
    <div
      className="relative w-full h-full overflow-hidden bg-white"
      style={gridBackground}
    >
      {showFeatures
        ? features.map((feature) => {
            const style = FEATURE_STYLES[feature.type];
            return (
              <div
                key={feature.id}
                className={cn(
                  "absolute flex items-center justify-center pointer-events-none",
                  style.className
                )}
                style={{
                  left: `${toPercent(feature.x, "x")}%`,
                  top: `${toPercent(feature.y, "y")}%`,
                  width: `${toPercent(feature.width, "w")}%`,
                  height: `${toPercent(feature.height, "h")}%`,
                }}
                title={feature.label ?? style.label}
              >
                {feature.label ? (
                  <span className="text-[10px] font-medium px-1 text-center leading-tight">
                    {feature.label}
                  </span>
                ) : null}
              </div>
            );
          })
        : null}

      {plots.map((plot) => {
        const style = PLOT_STYLES[plot.status];
        const showCompany = plot.status === "paid" && plot.companyName;
        const clickable = Boolean(onPlotClick);

        return (
          <button
            key={plot.id}
            type="button"
            className={cn(
              "absolute border flex flex-col items-center justify-center p-1 text-center transition-colors z-10",
              style.className,
              clickable && "cursor-pointer"
            )}
            style={{
              left: `${toPercent(plot.x, "x")}%`,
              top: `${toPercent(plot.y, "y")}%`,
              width: `${toPercent(plot.width, "w")}%`,
              height: `${toPercent(plot.height, "h")}%`,
            }}
            title={buildTooltip(plot)}
            onClick={() => onPlotClick?.(plot)}
            onMouseEnter={() => setHoveredPlotId(plot.id)}
            onMouseLeave={() => setHoveredPlotId(null)}
          >
            <span className={cn("text-xs font-semibold leading-tight", style.textClass)}>
              {plot.label}
            </span>
            <span className={cn("text-[10px] leading-tight mt-0.5", style.textClass, "opacity-80")}>
              {style.label}
            </span>
            {showCompany ? (
              <span className={cn("text-[9px] leading-tight mt-0.5 line-clamp-2", style.textClass)}>
                {plot.companyName}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className={cn(showRulers && "min-w-[480px]")}>
          {showRulers ? (
            <div className="border border-gray-300 bg-gray-50 inline-block w-full">
              <div className="flex w-full">
                <div className="w-11 shrink-0 flex flex-col">
                  <div className="h-7 border-b border-r border-gray-300 flex items-end justify-center pb-0.5 text-[10px] text-gray-500">
                    м
                  </div>
                  <div className="relative flex-1 border-r border-gray-300">
                    {yTicks.map((meter) => (
                      <div
                        key={`ruler-y-${meter}`}
                        className="absolute right-0 flex items-center"
                        style={{
                          top: `${(meter / config.heightMeters) * 100}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <span className="text-[9px] text-gray-600 leading-none mr-0.5 w-5 text-right">
                          {meter}
                        </span>
                        <span
                          className={cn(
                            "block h-px bg-gray-400",
                            meter % 5 === 0 ? "w-2.5" : "w-1.5"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="h-7 border-b border-gray-300 relative shrink-0">
                    {xTicks.map((meter) => (
                      <div
                        key={`ruler-x-${meter}`}
                        className="absolute bottom-0 flex flex-col items-center"
                        style={{
                          left: `${(meter / config.widthMeters) * 100}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        <span className="text-[9px] text-gray-600 leading-none mb-0.5">
                          {meter}
                        </span>
                        <span
                          className={cn(
                            "block w-px bg-gray-400",
                            meter % 5 === 0 ? "h-2.5" : "h-1.5"
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative w-full" style={{ aspectRatio }}>
                    {planBody}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full overflow-hidden border border-gray-300 bg-white max-w-3xl"
              style={{ aspectRatio }}
            >
              {planBody}
            </div>
          )}
        </div>
      </div>

      {showGrid ? (
        <p className="text-xs text-gray-500">
          Миллиметровка: {config.widthMeters}×{config.heightMeters} м, шаг {config.gridStepMeters} м
        </p>
      ) : null}

      {hoveredPlot && onPlotClick ? (
        <p className="text-sm text-gray-600">
          {buildTooltip(hoveredPlot)} · нажмите, чтобы открыть детали
        </p>
      ) : null}
    </div>
  );
}

export function getPlotDetailFeatures(plot: FloorPlanPlot): HallGridFeature[] {
  const hallFeatures = plot.label === "B2"
    ? [{ id: "plot-col", type: "column" as const, x: 5, y: 3, width: 1, height: 1, label: undefined }]
    : [
        { id: "plot-stand", type: "zone" as const, x: 1, y: 1, width: 4, height: 3, label: "Стенд" },
        { id: "plot-storage", type: "zone" as const, x: 1, y: 5, width: 2, height: 2, label: "Склад" },
        { id: "plot-col", type: "column" as const, x: 6, y: 6, width: 1, height: 1, label: undefined },
      ];

  return hallFeatures.map((feature) => ({
    ...feature,
    hallId: plot.hallId,
    id: `${plot.id}-${feature.id}`,
  }));
}

export function getPlotDetailConfig(plot: FloorPlanPlot): HallGridConfig {
  return {
    hallId: plot.hallId,
    widthMeters: plot.width,
    heightMeters: plot.height,
    gridStepMeters: 1,
  };
}

function intersectsPlot(feature: HallGridFeature, plot: FloorPlanPlot) {
  return (
    feature.x < plot.x + plot.width &&
    feature.x + feature.width > plot.x &&
    feature.y < plot.y + plot.height &&
    feature.y + feature.height > plot.y
  );
}

export function getHallFeaturesForPlot(
  features: HallGridFeature[],
  plot: FloorPlanPlot
): HallGridFeature[] {
  return features
    .filter((feature) => intersectsPlot(feature, plot))
    .map((feature) => ({
      ...feature,
      x: Math.max(0, feature.x - plot.x),
      y: Math.max(0, feature.y - plot.y),
      width: Math.min(feature.x + feature.width, plot.x + plot.width) - Math.max(feature.x, plot.x),
      height: Math.min(feature.y + feature.height, plot.y + plot.height) - Math.max(feature.y, plot.y),
    }));
}