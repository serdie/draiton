
'use client';

import { useTour } from '@/context/tour-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function TourSpotlight() {
  const { isActive, stepData, nextStep, prevStep, stopTour, currentStep } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (isActive && stepData) {
      const element = document.getElementById(stepData.id);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
        setTargetRect(null);
    }
  }, [isActive, stepData, currentStep]);

  if (!isActive || !stepData || !targetRect) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/50" 
        onClick={stopTour}
       />

      {/* Popover attached to the highlighted element */}
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div
            className="fixed rounded-md transition-all duration-300 z-[101] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
            style={{
              left: `${targetRect.left}px`,
              top: `${targetRect.top}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              boxShadow: 'inset 0 0 0 5px white, 0 0 0 9999px rgba(0,0,0,0.5)',
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          side={stepData.side || 'bottom'}
          align={stepData.align || 'center'}
          className="z-[102] w-72"
          onOpenAutoFocus={(e) => e.preventDefault()}
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

