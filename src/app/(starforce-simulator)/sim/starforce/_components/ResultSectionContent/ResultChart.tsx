import { semanticColors } from "@heroui/react";
import type Highcharts from "highcharts";
import { type Atom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { putUnit } from "~/shared/number";
import { primary, secondary } from "~/shared/style/colors";

interface Props {
  dataAtom: Atom<number[]>; // Sorted Data Atom
  type: "cost" | "destroyedCount";
}

export const ResultChart = ({ dataAtom, type }: Props) => {
  const chartContainerId = `starforce-result-chart-container-${type}`;

  const rawData = useAtomValue(dataAtom);
  const simulationCount = rawData.length;

  const options: Highcharts.Options = useMemo(() => {
    const isDataUniform = rawData[0] === rawData.at(-1);

    const data = isDataUniform
      ? rawData
      : rawData.slice(0, Math.round(simulationCount * 0.999));
    let binsNumber = 30;
    let binWidth = isDataUniform
      ? 1
      : Math.ceil((data[data.length - 1] - data[0]) / binsNumber);
    const digit = String(binWidth).length;
    binWidth = Math.round(binWidth / 10 ** (digit - 1)) * 10 ** (digit - 1);

    // CDF 계산 - 히스토그램 binWidth의 1/5 단위로 집계
    const cdfBinWidth = binWidth / 5;
    const cdfDigit =
      cdfBinWidth >= 1 ? String(Math.round(cdfBinWidth)).length : 0;
    const cdfData: [number, number][] = [];
    if (data.length > 0) {
      const firstEdge = Math.ceil(data[0] / cdfBinWidth) * cdfBinWidth;
      const lastValue = data[data.length - 1];
      const numBins = Math.ceil((lastValue - firstEdge) / cdfBinWidth);

      let dataIdx = 0;
      for (let b = 0; b <= numBins; b++) {
        const edge = firstEdge + b * cdfBinWidth;
        while (dataIdx < data.length && data[dataIdx] <= edge) {
          dataIdx++;
        }
        const pct = (dataIdx / rawData.length) * 100;
        cdfData.push([edge, pct]);
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(data[i] / binWidth) * binWidth;
    }
    binsNumber = data[data.length - 1] / binWidth + 1;

    if (binsNumber > 1) {
      // 마지막 바가 A 이상 ~ B 이하를 모두 포함하는 Highcharts의 문제를 해결
      for (let i = data.length - 2; i >= 0; i--) {
        if (data[i] < data[data.length - 1]) break;
        data[i] += binWidth;
      }
      data[data.length - 1] += binWidth;
    }

    return {
      title: {
        text: "",
      },

      credits: {
        enabled: false,
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
          tickColor: semanticColors.light.default[300],
          lineColor: semanticColors.light.default[300],
          labels: {
            formatter() {
              let value;
              if (typeof this.value === "string")
                value = parseInt(this.value, 10);
              else value = this.value;

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
          labels: {
            style: {
              color: semanticColors.light.default[500],
            },
          },
        },
        {
          title: {
            text: "누적확률",
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
          color: type === "cost" ? primary[300] : secondary[300],
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
          if (this.series.name === "누적확률") {
            const label =
              cdfBinWidth <= 1
                ? putUnit(this.x)
                : `${putUnit(this.x)} ~ ${putUnit(this.x + cdfBinWidth - Number(cdfDigit < 4))}`;
            return `${label} : <b>${this.y?.toFixed(1)}%</b>`;
          }
          return `${
            binWidth === 1
              ? putUnit(this.x)
              : `${putUnit(this.x)} ~ ${putUnit(this.x + binWidth - Number(digit < 4))}`
          } : <b x=8 y=40>${this.y}회</b>`;
        },
      },

      series: [
        {
          name: "소모 비용",
          type: "histogram",
          baseSeries: "s1",
          xAxis: 1,
          yAxis: 1,
          binsNumber,
          binWidth: binsNumber === 1 ? undefined : binWidth,
          showInLegend: false,
        },
        {
          name: "Data",
          type: "scatter",
          data,
          id: "s1",
          marker: {
            radius: 1.5,
          },
          visible: false,
          showInLegend: false,
        },
        {
          name: "누적확률",
          type: "spline",
          xAxis: 1,
          yAxis: 2,
          data: cdfData,
          color: type === "cost" ? primary[600] : secondary[600],
          marker: { enabled: false },
          lineWidth: 2,
          showInLegend: true,
        },
      ],
    };
  }, [rawData, simulationCount, type]);

  useEffect(() => {
    if (rawData.length > 0) {
      window.Highcharts.chart(chartContainerId, options);
    }
  }, [chartContainerId, options, rawData.length]);

  return <div className="h-[400px]" id={chartContainerId}></div>;
};
