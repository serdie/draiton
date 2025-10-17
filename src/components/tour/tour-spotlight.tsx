
'use client';

import { useTour } from '@/context/tour-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function TourSpotlight() {
  const { isActive, stepData, nextStep, prevStep, stopTour, currentStep } = useTour();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element: HTMLElement | null = null;
    if (isActive && stepData) {
      element = document.getElementById(stepData.id);
      if (element) {
        element.style.position = 'relative';
        element.style.zIndex = '101';
      }
      setTargetElement(element);
    }
    
    // Cleanup function
    return () => {
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
      }
    };
  }, [isActive, stepData]);

  if (!isActive || !stepData || !targetElement) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/50" onClick={stopTour} />

      {/* Popover attached to the element */}
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div
            className="fixed rounded-md transition-all duration-300"
            style={{
              left: `${targetElement.getBoundingClientRect().left}px`,
              top: `${targetElement.getBoundingClientRect().top}px`,
              width: `${targetElement.getBoundingClientRect().width}px`,
              height: `${targetElement.getBoundingClientRect().height}px`,
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          side={stepData.side || 'bottom'}
          align={stepData.align || 'center'}
          className="z-[102] w-72"
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevents focus stealing
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{stepData.title}</h3>
            <p className="text-sm text-muted-foreground">{stepData.content}</p>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={stopTour}>
                Finalizar
              </Button>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    Anterior
                  </Button>
                )}
                <Button size="sm" onClick={nextStep}>
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
