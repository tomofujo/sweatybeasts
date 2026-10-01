import { useEffect, useState, type ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);
  // No transform once visible: a lingering transform would trap position:fixed
  // modals inside the page (centring them mid-page instead of on screen).
  return (
    <div className={`transition-all duration-200 ${visible ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
}
