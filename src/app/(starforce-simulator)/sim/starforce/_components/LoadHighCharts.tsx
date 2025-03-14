"use client";

import { useMolecule } from "bunshi/react";
import { useSetAtom } from "jotai";
import Script from "next/script";
import { useEffect, useState } from "react";

import { StarforceSimulatorMolecule } from "~/app/(starforce-simulator)/sim/starforce/_lib/molecule";

export const LoadHighCharts = () => {
  const { isHighchartsLoadedAtom } = useMolecule(StarforceSimulatorMolecule);
  const setIsHighChartsLoaded = useSetAtom(isHighchartsLoadedAtom);

  const [isHighChartsBaseLoaded, setIsHighChartsBaseLoaded] = useState(false);
  const [isHistogramBellcurveLoaded, setIsHistogramBellcurveLoaded] =
    useState(false);

  useEffect(() => {
    if (isHighChartsBaseLoaded && isHistogramBellcurveLoaded) {
      // eslint-disable-next-line no-console
      console.log("Highcharts loaded");
      setIsHighChartsLoaded(true);
    }
  }, [
    isHighChartsBaseLoaded,
    isHistogramBellcurveLoaded,
    setIsHighChartsLoaded,
  ]);

  return (
    <>
      <Script
        src="https://code.highcharts.com/12.1.2/highcharts.js"
        onReady={() => {
          // eslint-disable-next-line no-console
          console.log("Highcharts base loaded");
          setIsHighChartsBaseLoaded(true);
        }}
      />
      {isHighChartsBaseLoaded && (
        <Script
          src="https://code.highcharts.com/12.1.2/modules/histogram-bellcurve.js"
          onReady={() => {
            // eslint-disable-next-line no-console
            console.log("Highcharts histogram bellcurve loaded");
            setIsHistogramBellcurveLoaded(true);
          }}
        />
      )}
    </>
  );
};
