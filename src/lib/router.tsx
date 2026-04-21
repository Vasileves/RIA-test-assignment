"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ScreenId = "home";

type RouterCtx = {
  screen: ScreenId;
  history: ScreenId[];
  push: (s: ScreenId) => void;
  back: () => void;
  direction: 1 | -1;
};

const Ctx = createContext<RouterCtx | null>(null);

export function ScreenRouter({
  initial,
  children,
}: {
  initial: ScreenId;
  children: (screen: ScreenId) => ReactNode;
}) {
  const [history, setHistory] = useState<ScreenId[]>([initial]);
  const [direction, setDirection] = useState<1 | -1>(1);

  const push = useCallback((s: ScreenId) => {
    setDirection(1);
    setHistory((h) => [...h, s]);
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const value = useMemo(
    () => ({ screen: history[history.length - 1], history, push, back, direction }),
    [history, push, back, direction],
  );

  return <Ctx.Provider value={value}>{children(value.screen)}</Ctx.Provider>;
}

export function useRouter() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRouter outside provider");
  return v;
}
