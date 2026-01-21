import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ColourLabel = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

interface ColourLabelPickerProps {
  value?: ColourLabel;
  onChange: (colour: ColourLabel | undefined) => void;
  size?: 'sm' | 'md' | 'lg';
}

const colours: { id: ColourLabel; bg: string; ring: string }[] = [
  { id: 'red', bg: 'bg-red-500', ring: 'ring-red-500' },
  { id: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'yellow', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
  { id: 'green', bg: 'bg-green-500', ring: 'ring-green-500' },
  { id: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
];

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const ColourLabelPicker = ({ value, onChange, size = 'md' }: ColourLabelPickerProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {colours.map((colour) => (
        <button
          key={colour.id}
          onClick={() => onChange(value === colour.id ? undefined : colour.id)}
          className={cn(
            'rounded-full transition-all flex items-center justify-center',
            colour.bg,
            sizeClasses[size],
            value === colour.id 
              ? `ring-2 ${colour.ring} ring-offset-2 ring-offset-background` 
              : 'hover:scale-110'
          )}
          title={colour.id.charAt(0).toUpperCase() + colour.id.slice(1)}
        >
          {value === colour.id && (
            <Check className={cn(
              'text-white',
              size === 'sm' ? 'h-2.5 w-2.5' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )} />
          )}
        </button>
      ))}
      
      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange(undefined)}
          className="text-xs text-muted-foreground hover:text-foreground ml-1"
        >
          Clear
        </button>
      )}
    </div>
  );
};

// Display component for showing colour labels in thumbnails etc.
export const ColourLabelDot = ({ colour, size = 'sm' }: { colour: ColourLabel; size?: 'sm' | 'md' }) => {
  const colourClasses: Record<ColourLabel, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <span 
      className={cn(
        'rounded-full shrink-0',
        colourClasses[colour],
        size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
      )}
      title={colour.charAt(0).toUpperCase() + colour.slice(1)}
    />
  );
};
