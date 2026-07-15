import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component scrolls the window to top whenever the route path changes.
 * It provides a smooth scrolling experience as requested.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // We only scroll to top if there's no hash in the URL.
    // Hash navigation (like #roles) is handled by the page components themselves.
    if (!hash) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
