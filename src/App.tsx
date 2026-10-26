/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { MenuPage, RestaurantConfig } from './types';
import { DEFAULT_MENU_PAGES, DEFAULT_RESTAURANT_CONFIG } from './data/defaultMenu';
import { CustomerViewer } from './components/CustomerViewer';
import { AdminPanel } from './components/AdminPanel';
import { PinModal } from './components/PinModal';
import { LineShareModal } from './components/LineShareModal';
import { GitHubDeployGuide } from './components/GitHubDeployGuide';
import { ErrorBoundary } from './components/ErrorBoundary';

const STORAGE_KEY_PAGES = 'LINE_MENU_PAGES_V1';
const STORAGE_KEY_CONFIG = 'LINE_RESTAURANT_CONFIG_V1';

export default function App() {
  const [pages, setPages] = useState<MenuPage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PAGES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load menu pages from localStorage:', e);
    }
    return DEFAULT_MENU_PAGES;
  });

  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        return { ...DEFAULT_RESTAURANT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load config from localStorage:', e);
    }
    return DEFAULT_RESTAURANT_CONFIG;
  });

  // Mode state: 'admin' by default so the owner can immediately edit name, logo, and menu.
  // When customers open the shared LINE link with ?view=customer or ?view=menu, they see the clean viewer.
  const [currentMode, setCurrentMode] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (searchParams.get('view') === 'customer' || searchParams.get('view') === 'menu' || hash === '#/menu') {
        return 'customer';
      }
      if (searchParams.get('admin') === 'true' || searchParams.get('mode') === 'admin' || hash === '#/admin') {
        return 'admin';
      }
    }
    return 'admin';
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isLineShareOpen, setIsLineShareOpen] = useState(false);
  const [isGitHubGuideOpen, setIsGitHubGuideOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
    } catch (e) {
      console.error('Failed to save pages to localStorage:', e);
    }
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage:', e);
    }
  }, [config]);

  // Handle URL change detection
  useEffect(() => {
    const handleUrlChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (searchParams.get('admin') === 'true' || hash === '#/admin') {
        setIsAdminUnlocked(true);
        setCurrentMode('admin');
      } else if (searchParams.get('view') === 'customer' || searchParams.get('mode') === 'customer' || hash === '#/menu') {
        setCurrentMode('customer');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // When owner clicks gear/admin button in Customer View
  const handleOpenAdmin = () => {
    setCurrentMode('admin');
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setCurrentMode('admin');
  };

  const handleOpenCustomerView = () => {
    setCurrentMode('customer');
  };

  // Generate Customer URL that is clean and safe to share on LINE
  const getCustomerShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?view=menu`;
  };

  return (
    <ErrorBoundary>
      {currentMode === 'customer' ? (
        <CustomerViewer
          pages={pages}
          config={config}
          onOpenAdmin={handleOpenAdmin}
          onSwitchToAdmin={() => setCurrentMode('admin')}
        />
      ) : (
        <AdminPanel
          pages={pages}
          config={config}
          onUpdatePages={setPages}
          onUpdateConfig={setConfig}
          onOpenCustomerView={handleOpenCustomerView}
          onOpenLineShare={() => setIsLineShareOpen(true)}
          onOpenGitHubGuide={() => setIsGitHubGuideOpen(true)}
        />
      )}

      {/* Admin Unlock PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        correctPin={config.adminPin || '1234'}
      />

      {/* LINE Share & QR Code Modal */}
      <LineShareModal
        isOpen={isLineShareOpen}
        onClose={() => setIsLineShareOpen(false)}
        restaurantName={config.restaurantName}
        customerUrl={getCustomerShareUrl()}
      />

      {/* GitHub & Google AI Studio Guide Modal */}
      <GitHubDeployGuide
        isOpen={isGitHubGuideOpen}
        onClose={() => setIsGitHubGuideOpen(false)}
      />
    </ErrorBoundary>
  );
}
