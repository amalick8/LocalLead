import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Scroll to top on route change (unless there's a hash)
    if (!hash) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname]);

  useEffect(() => {
    // Handle hash navigation with navbar offset
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = 80; // h-20 = 80px
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;
        
        // Small delay to ensure page has rendered
        setTimeout(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [hash]);

  return null;
}
