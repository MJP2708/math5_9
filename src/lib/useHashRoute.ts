import { useEffect, useState } from "react";

export type Route = "home" | "math-logic" | "dev-story";

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "math-logic") return "math-logic";
  if (hash === "dev-story") return "dev-story";
  return "home";
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}
