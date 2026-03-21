import { semanticColors } from "@heroui/react";
import type Highcharts from "highcharts";
import { type Atom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { putUnit } from "~/shared/number";
import { primary, secondary } from "~/shared/style/colors";

interface Props {
  dataAtom: Atom<number[]>; // Sorted Data Atom (1st simulation)
  overlayDataAtom: Atom<number[]>; // Sorted Data Atom (2nd simulation)
  type: "cost" | "destroyedCount";
}

const DISPLAY_DATA_RATIO = 0.999;
const HISTOGRAM_BINS = 30;
const CDF_BIN_DIVIDER = 5;
const PRIMARY_FALLBACK = "#FF8009";
const SECONDARY_FALLBACK = "#FFC32C";

const pickColor = (color: string | undefined, fallback: string) =>
  color ?? fallback;

const withOpacity = (hexColor: string, opacity: number) => {
  const normalizedHex = hexColor.replace("#", "");
  const r = parseInt(normalizedHex.slice(0, 2), 16);
  const g = parseInt(normalizedHex.slice(2, 4), 16);
  const b = parseInt(normalizedHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getDisplayData = (rawData: number[]) => {
  if (rawData.length === 0) return [];
  if (rawData[0] === rawData.at(-1)) return [...rawData];
  return rawData.slice(
    0,
    Math.max(1, Math.round(rawData.length * DISPLAY_DATA_RATIO)),
  );
};

const getBinWidth = (data: number[]) => {
  if (data.length === 0 || data[0] === data.at(-1)) {
    return 1;
  }

  const roughWidth = Math.ceil(
    (data[data.length - 1] - data[0]) / HISTOGRAM_BINS,
  );
  const safeWidth = Math.max(1, roughWidth);
  const digit = String(safeWidth).length;

  return Math.max(
    1,
    Math.round(safeWidth / 10 ** (digit - 1)) * 10 ** (digit - 1),
  );
};

const toHistogramScatterData = (data: number[], binWidth: number) => {
  const result = [...data];

  for (let i = 0; i < result.length; i++) {
    result[i] = Math.floor(result[i] / binWidth) * binWidth;
  }

  if (result.length > 1) {
    // 기존 스타일의 마지막 bin 경계 처리 유지
    for (let i = result.length - 2; i >= 0; i--) {
      if (result[i] < result[result.length - 1]) break;
      result[i] += binWidth;
    }
    result[result.length - 1] += binWidth;
  }

  return result;
};

const getCdfData = ({
  displayData,
  denominator,
  start,
  end,
  width,
}: {
  displayData: number[];
  denominator: number;
  start: number;
  end: number;
  width: number;
}) => {
  if (displayData.length === 0 || denominator === 0) {
    return [] as [number, number][];
  }

  const cdfData: [number, number][] = [];
  const firstEdge = Math.ceil(start / width) * width;
  const edgeCount = Math.max(0, Math.ceil((end - firstEdge) / width));
  let dataIndex = 0;

  for (let edgeIndex = 0; edgeIndex <= edgeCount; edgeIndex++) {
    const edge = firstEdge + edgeIndex * width;
    while (dataIndex < displayData.length && displayData[dataIndex] <= edge) {
      dataIndex++;
    }
    cdfData.push([edge, (dataIndex / denominator) * 100]);
  }

  return cdfData;
};

const getHistogramMaxCount = ({
  data,
  binStart,
  binWidth,
  binsNumber,
}: {
  data: number[];
  binStart: number;
  binWidth: number;
  binsNumber: number;
}) => {
  const counts = Array.from({ length: binsNumber }, () => 0);

  data.forEach((value) => {
    const rawIndex = Math.floor((value - binStart) / binWidth);
    if (rawIndex < 0) return;
    const index = Math.min(binsNumber - 1, rawIndex);
    if (index >= binsNumber) return;
    counts[index] += 1;
  });

  return Math.max(0, ...counts);
};

export const ResultChart = ({ dataAtom, overlayDataAtom, type }: Props) => {
  const chartContainerId = `starforce-result-chart-container-${type}`;

  const baseRawData = useAtomValue(dataAtom);
  const overlayRawData = useAtomValue(overlayDataAtom);

  const options: Highcharts.Options = useMemo(() => {
    const baseDisplayData = getDisplayData(baseRawData);
    const overlayDisplayData = getDisplayData(overlayRawData);

    const binWidth = getBinWidth(baseDisplayData);
    const binDigit = String(Math.round(binWidth)).length;
    const cdfBinWidth = binWidth / CDF_BIN_DIVIDER;
    const cdfDigit =
      cdfBinWidth >= 1 ? String(Math.round(cdfBinWidth)).length : 0;

    const binStart = Math.floor(baseDisplayData[0] / binWidth) * binWidth;
    const binsNumber = Math.max(
      1,
      Math.ceil(
        (baseDisplayData[baseDisplayData.length - 1] - binStart) / binWidth,
      ) + 1,
    );
    const xAxisMax = binStart + binsNumber * binWidth;

    const baseHistogramScatterData = toHistogramScatterData(
      baseDisplayData,
      binWidth,
    );
    const overlayHistogramScatterData = toHistogramScatterData(
      overlayDisplayData,
      binWidth,
    );

    const baseHistogramYMax = getHistogramMaxCount({
      data: baseDisplayData,
      binStart,
      binWidth,
      binsNumber,
    });
    const overlayHistogramYMax = getHistogramMaxCount({
      data: overlayDisplayData,
      binStart,
      binWidth,
      binsNumber,
    });
    const histogramYMax = Math.max(baseHistogramYMax, overlayHistogramYMax);

    const baseCdfData = getCdfData({
      displayData: baseDisplayData,
      denominator: baseRawData.length,
      start: binStart,
      end: xAxisMax,
      width: cdfBinWidth,
    });
    const overlayCdfData =
      overlayDisplayData.length > 0
        ? getCdfData({
            displayData: overlayDisplayData,
            denominator: overlayRawData.length,
            start: binStart,
            end: xAxisMax,
            width: cdfBinWidth,
          })
        : null;
    const hasOptimizedOverlay =
      overlayDisplayData.length > 0 && overlayCdfData !== null;

    const baseHistogramColor = pickColor(
      type === "cost" ? primary[300] : secondary[300],
      type === "cost" ? PRIMARY_FALLBACK : SECONDARY_FALLBACK,
    );
    const baseCdfColor = pickColor(
      type === "cost" ? primary[600] : secondary[600],
      type === "cost" ? PRIMARY_FALLBACK : SECONDARY_FALLBACK,
    );
    const overlayHistogramColor = withOpacity(
      pickColor(
        type === "cost" ? primary[600] : secondary[600],
        type === "cost" ? PRIMARY_FALLBACK : SECONDARY_FALLBACK,
      ),
      1,
    );
    const overlayCdfColor = pickColor(
      type === "cost" ? primary[800] : secondary[800],
      type === "cost" ? PRIMARY_FALLBACK : SECONDARY_FALLBACK,
    );

    return {
      title: {
        text: "",
      },
      credits: {
        enabled: false,
      },
      legend: hasOptimizedOverlay
        ? {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            alignColumns: false,
            itemWidth: 170,
            width: 340,
          }
        : {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            alignColumns: false,
          },
      xAxis: [
        {
          title: { text: "Data" },
          alignTicks: false,
          visible: false,
        },
        {
          title: { text: type === "cost" ? "메소" : "파괴 횟수" },
          alignTicks: false,
          min: binStart,
          max: xAxisMax,
          tickColor: semanticColors.light.default[300],
          lineColor: semanticColors.light.default[300],
          labels: {
            formatter() {
              const value =
                typeof this.value === "string"
                  ? parseInt(this.value, 10)
                  : this.value;
              return `${putUnit(value)}`;
            },
            style: {
              color: semanticColors.light.default[500],
            },
          },
        },
      ],
      yAxis: [
        {
          title: { text: "Data" },
          visible: false,
        },
        {
          title: {
            text: "횟수",
            style: {
              color: semanticColors.light.default[500],
            },
          },
          min: 0,
          max: histogramYMax,
          labels: {
            style: {
              color: semanticColors.light.default[500],
            },
          },
        },
        {
          title: {
            text: "누적분포",
            style: {
              color: semanticColors.light.default[500],
            },
          },
          opposite: true,
          min: 0,
          max: 100,
          labels: {
            format: "{value}%",
            style: {
              color: semanticColors.light.default[500],
            },
          },
        },
      ],
      plotOptions: {
        scatter: {
          turboThreshold: 1000,
        },
        histogram: {
          accessibility: {
            point: {
              valueDescriptionFormat:
                "{index}. {point.x:.3f} to {point.x2:.3f}, {point.y}.",
            },
          },
          color: baseHistogramColor,
        },
      },
      tooltip: {
        shadow: false,
        borderWidth: 0,
        borderRadius: 20,
        padding: 10,
        style: {
          color: "white",
        },
        backgroundColor: type === "cost" ? primary[600] : secondary[600],
        formatter() {
          if (this.series.type === "spline") {
            const label =
              cdfBinWidth <= 1
                ? putUnit(this.x)
                : `${putUnit(this.x)} ~ ${putUnit(this.x + cdfBinWidth - Number(cdfDigit < 4))}`;
            return `${label} : <b>${this.y?.toFixed(1)}%</b>`;
          }

          return `${
            binWidth === 1
              ? putUnit(this.x)
              : `${putUnit(this.x)} ~ ${putUnit(this.x + binWidth - Number(binDigit < 4))}`
          } : <b>${this.y}회</b>`;
        },
      },
      series: [
        {
          name: "기본",
          type: "histogram",
          baseSeries: "s1",
          xAxis: 1,
          yAxis: 1,
          binsNumber,
          binWidth: binsNumber === 1 ? undefined : binWidth,
          color: baseHistogramColor,
          zIndex: 3,
          showInLegend: hasOptimizedOverlay,
          legendIndex: 0,
        },
        {
          name: "Data",
          type: "scatter",
          data: baseHistogramScatterData,
          id: "s1",
          marker: {
            radius: 1.5,
          },
          visible: false,
          showInLegend: false,
        },
        {
          name: "기본 누적분포",
          type: "spline",
          xAxis: 1,
          yAxis: 2,
          data: baseCdfData,
          color: baseCdfColor,
          marker: { enabled: false },
          lineWidth: 2,
          zIndex: 5,
          showInLegend: true,
          legendIndex: 1,
          ...(hasOptimizedOverlay ? {} : { name: "누적분포" }),
        },
        ...(hasOptimizedOverlay
          ? [
              {
                name: "흔적 복구 최적화",
                type: "histogram",
                baseSeries: "s2",
                xAxis: 1,
                yAxis: 1,
                binsNumber,
                binWidth: binsNumber === 1 ? undefined : binWidth,
                color: overlayHistogramColor,
                zIndex: 2,
                showInLegend: true,
                legendIndex: 2,
              } as const,
              {
                name: "Data(최적화)",
                type: "scatter",
                data: overlayHistogramScatterData,
                id: "s2",
                marker: {
                  radius: 1.5,
                },
                visible: false,
                showInLegend: false,
              } as const,
              {
                name: "흔적 복구 최적화 누적분포",
                type: "spline",
                xAxis: 1,
                yAxis: 2,
                data: overlayCdfData,
                color: overlayCdfColor,
                marker: { enabled: false },
                dashStyle: "ShortDash",
                lineWidth: 2,
                zIndex: 4,
                showInLegend: true,
                legendIndex: 3,
              } as const,
            ]
          : []),
      ],
    };
  }, [baseRawData, overlayRawData, type]);

  useEffect(() => {
    if (baseRawData.length > 0) {
      window.Highcharts.chart(chartContainerId, options);
    }
  }, [baseRawData.length, chartContainerId, options]);

  return <div className="h-[400px]" id={chartContainerId}></div>;
};
