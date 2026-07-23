import { useCallback, useMemo } from "react";
import type { Direction } from "@/localization/types";

const LTR_TO_TEMP: readonly [string, string][] = [
  ["-translate-x-", "%%NEG_TRANS%%"],
  ["translate-x-", "%%TRANS%%"],
  ["flex-row-reverse", "%%FR_REV%%"],
  ["flex-row", "%%FR%%"],
  ["border-l", "%%BRL%%"],
  ["border-r", "%%BRR%%"],
  ["text-left", "%%TL%%"],
  ["text-right", "%%TR%%"],
  ["md:ml-auto", "%%MDMLA%%"],
  ["md:mr-auto", "%%MDMRA%%"],
  ["pl-", "%%PL%%"],
  ["pr-", "%%PR%%"],
  ["ml-", "%%ML%%"],
  ["mr-", "%%MR%%"],
  ["left", "%%L%%"],
  ["right", "%%R%%"],
];

const TEMP_TO_RTL: readonly [string, string][] = [
  ["%%NEG_TRANS%%", "translate-x-"],
  ["%%TRANS%%", "-translate-x-"],
  ["%%FR_REV%%", "flex-row"],
  ["%%FR%%", "flex-row-reverse"],
  ["%%BRL%%", "border-r"],
  ["%%BRR%%", "border-l"],
  ["%%TL%%", "text-right"],
  ["%%TR%%", "text-left"],
  ["%%MDMLA%%", "md:mr-auto"],
  ["%%MDMRA%%", "md:ml-auto"],
  ["%%PL%%", "pr-"],
  ["%%PR%%", "pl-"],
  ["%%ML%%", "mr-"],
  ["%%MR%%", "ml-"],
  ["%%L%%", "right"],
  ["%%R%%", "left"],
];

export function useRTL(direction: Direction) {
  const isRTL = direction === "rtl";

  const mirrorValue = useCallback(
    <T,>(ltr: T, rtl: T): T => (isRTL ? rtl : ltr),
    [isRTL],
  );

  const getTextAlign = useCallback(
    (): "right" | "left" => (isRTL ? "right" : "left"),
    [isRTL],
  );

  const getFlexDirection = useCallback(
    (): "row-reverse" | "row" => (isRTL ? "row-reverse" : "row"),
    [isRTL],
  );

  const getPaddingStart = useCallback(
    (value: string) => (isRTL ? `pr-${value}` : `pl-${value}`),
    [isRTL],
  );

  const getPaddingEnd = useCallback(
    (value: string) => (isRTL ? `pl-${value}` : `pr-${value}`),
    [isRTL],
  );

  const getMarginStart = useCallback(
    (value: string) => (isRTL ? `mr-${value}` : `ml-${value}`),
    [isRTL],
  );

  const getMarginEnd = useCallback(
    (value: string) => (isRTL ? `ml-${value}` : `mr-${value}`),
    [isRTL],
  );

  const getBorderStart = useCallback(
    (): "border-r" | "border-l" => (isRTL ? "border-r" : "border-l"),
    [isRTL],
  );

  const getBorderEnd = useCallback(
    (): "border-l" | "border-r" => (isRTL ? "border-l" : "border-r"),
    [isRTL],
  );

  const getTranslateStart = useCallback(
    (value: string) => (isRTL ? `-translate-x-${value}` : `translate-x-${value}`),
    [isRTL],
  );

  const getTranslateEnd = useCallback(
    (value: string) => (isRTL ? `translate-x-${value}` : `-translate-x-${value}`),
    [isRTL],
  );

  return {
    isRTL,
    direction,
    mirrorValue,
    getTextAlign,
    getFlexDirection,
    getPaddingStart,
    getPaddingEnd,
    getMarginStart,
    getMarginEnd,
    getBorderStart,
    getBorderEnd,
    getTranslateStart,
    getTranslateEnd,
  };
}

function applyTransform(input: string, mappings: readonly [string, string][]): string {
  let result = input;
  for (const [key, val] of mappings) {
    if (result.includes(key)) {
      result = result.replace(key, val);
    }
  }
  return result;
}

export function cnRTL(isRTL: boolean, ...classes: (string | false | null | undefined)[]): string {
  if (!isRTL) {
    return classes.filter(Boolean).join(" ");
  }
  return classes
    .filter(Boolean)
    .map((c) => {
      const cls = c as string;
      if (cls.startsWith("space-x-") && cls !== "space-x-reverse") {
        return `space-x-reverse ${cls}`;
      }
      if (cls === "space-x-reverse") {
        return "";
      }
      const tempMarked = applyTransform(cls, LTR_TO_TEMP);
      return applyTransform(tempMarked, TEMP_TO_RTL);
    })
    .join(" ");
}
