'use client';

import { useEffect } from 'react';

export function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Dynamically import AOS to avoid SSR issues
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out-cubic',
        once: false,
        offset: 120,
        delay: 0,
        anchorPlacement: 'top-bottom'
      });

      // Refresh AOS on window resize
      const handleResize = () => AOS.refresh();
      window.addEventListener('resize', handleResize);

      // Refresh AOS when new content is loaded
      const observer = new MutationObserver(() => {
        AOS.refresh();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    };

    initAOS();
  }, []);

  return <>{children}</>;
}
