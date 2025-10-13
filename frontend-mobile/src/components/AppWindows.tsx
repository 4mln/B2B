import { AnimatedWindow } from '@/components/ui/AnimatedWindow';
import { useWindowManager } from '@/context/WindowManagerContext';
import { PortalHost } from '@tamagui/portal';
import React from 'react';

export const AppWindows: React.FC = () => {
  const { windows, closeWindow } = useWindowManager();

  return (
    <PortalHost>
      {windows.map((window) => (
        <AnimatedWindow
          key={window.id}
          {...window}
          visible={true}
          onClose={() => closeWindow(window.id)}
        />
      ))}
    </PortalHost>
  );
};
