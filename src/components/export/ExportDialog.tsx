import { useState } from 'react';
import { Download, Settings2, HardDrive, Image, FileType } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';

interface ExportSettings {
  format: 'jpeg' | 'png' | 'webp' | 'tiff' | 'original';
  quality: number;
  resizeMode: 'original' | 'percentage' | 'maxWidth' | 'maxHeight' | 'maxDimension';
  resizeValue: number;
  stripMetadata: boolean;
  stripLocation: boolean;
  preserveColorProfile: boolean;
  namingPattern: string;
  includeSequence: boolean;
  outputFolder: string;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onExport: (settings: ExportSettings) => void;
}

const FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos, smaller size' },
  { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format, great compression' },
  { value: 'tiff', label: 'TIFF', description: 'Archival quality, large files' },
  { value: 'original', label: 'Original', description: 'Keep original format' },
];

const RESIZE_OPTIONS = [
  { value: 'original', label: 'Original Size' },
  { value: 'percentage', label: 'Scale by %' },
  { value: 'maxWidth', label: 'Max Width' },
  { value: 'maxHeight', label: 'Max Height' },
  { value: 'maxDimension', label: 'Fit within' },
];

const NAMING_PRESETS = [
  { value: '{filename}', label: 'Original filename' },
  { value: '{filename}_export', label: 'Filename + suffix' },
  { value: '{date}_{filename}', label: 'Date + filename' },
  { value: 'export_{sequence}', label: 'Numbered sequence' },
];

export const ExportDialog = ({
  isOpen,
  onClose,
  assets,
  onExport,
}: ExportDialogProps) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'jpeg',
    quality: 90,
    resizeMode: 'original',
    resizeValue: 100,
    stripMetadata: false,
    stripLocation: true,
    preserveColorProfile: true,
    namingPattern: '{filename}',
    includeSequence: false,
    outputFolder: 'exports',
  });

  const updateSettings = (updates: Partial<ExportSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleExport = () => {
    onExport(settings);
    onClose();
  };

  const estimatedSize = () => {
    // Mock estimation based on format and quality
    const baseSize = assets.reduce((sum, a) => sum + a.fileSize, 0);
    let multiplier = 1;
    
    if (settings.format === 'jpeg') {
      multiplier = settings.quality / 100 * 0.3;
    } else if (settings.format === 'webp') {
      multiplier = settings.quality / 100 * 0.25;
    } else if (settings.format === 'png') {
      multiplier = 1.2;
    } else if (settings.format === 'tiff') {
      multiplier = 3;
    }
    
    if (settings.resizeMode === 'percentage') {
      multiplier *= (settings.resizeValue / 100) ** 2;
    }
    
    const bytes = baseSize * multiplier;
    if (bytes < 1024 * 1024) return `~${(bytes / 1024).toFixed(0)} KB`;
    return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {assets.length} Asset{assets.length !== 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileType className="h-4 w-4 text-white/60" />
              Output Format
            </Label>
            <RadioGroup
              value={settings.format}
              onValueChange={(value) => updateSettings({ format: value as ExportSettings['format'] })}
              className="grid grid-cols-5 gap-2"
            >
              {FORMAT_OPTIONS.map(({ value, label, description }) => (
                <div key={value}>
                  <RadioGroupItem value={value} id={value} className="peer sr-only" />
                  <Label
                    htmlFor={value}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all',
                      'hover:bg-white/[0.02]',
                      settings.format === value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/[0.08]'
                    )}
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-[10px] text-white/40 text-center mt-1 leading-tight">
                      {description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Quality Slider (for lossy formats) */}
          {['jpeg', 'webp'].includes(settings.format) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Quality</Label>
                <span className="text-sm text-white/60">{settings.quality}%</span>
              </div>
              <Slider
                value={[settings.quality]}
                onValueChange={([value]) => updateSettings({ quality: value })}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}

          <Separator className="bg-white/[0.06]" />

          {/* Resize Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4 text-white/60" />
              Size
            </Label>
            <div className="flex gap-2">
              <Select
                value={settings.resizeMode}
                onValueChange={(value) => updateSettings({ resizeMode: value as ExportSettings['resizeMode'] })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESIZE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {settings.resizeMode !== 'original' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.resizeValue}
                    onChange={(e) => updateSettings({ resizeValue: parseInt(e.target.value) || 100 })}
                    className="w-24"
                  />
                  <span className="text-sm text-white/60">
                    {settings.resizeMode === 'percentage' ? '%' : 'px'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Advanced Options */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="metadata" className="border-white/[0.06]">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Settings2 className="h-4 w-4 text-white/60" />
                  Metadata Options
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Strip all metadata</Label>
                    <p className="text-xs text-white/40">Remove EXIF, IPTC, and XMP data</p>
                  </div>
                  <Switch
                    checked={settings.stripMetadata}
                    onCheckedChange={(checked) => updateSettings({ stripMetadata: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Strip location data only</Label>
                    <p className="text-xs text-white/40">Remove GPS coordinates for privacy</p>
                  </div>
                  <Switch
                    checked={settings.stripLocation}
                    onCheckedChange={(checked) => updateSettings({ stripLocation: checked })}
                    disabled={settings.stripMetadata}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Preserve color profile</Label>
                    <p className="text-xs text-white/40">Keep ICC profile embedded</p>
                  </div>
                  <Switch
                    checked={settings.preserveColorProfile}
                    onCheckedChange={(checked) => updateSettings({ preserveColorProfile: checked })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="naming" className="border-white/[0.06]">
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="h-4 w-4 text-white/60" />
                  File Naming
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm">Naming Pattern</Label>
                  <Select
                    value={settings.namingPattern}
                    onValueChange={(value) => updateSettings({ namingPattern: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMING_PRESETS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Custom Pattern</Label>
                  <Input
                    value={settings.namingPattern}
                    onChange={(e) => updateSettings({ namingPattern: e.target.value })}
                    placeholder="{filename}_{date}_{sequence}"
                  />
                  <p className="text-xs text-white/40">
                    Variables: {'{filename}'}, {'{date}'}, {'{sequence}'}, {'{width}'}, {'{height}'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Add sequence numbers</Label>
                  <Switch
                    checked={settings.includeSequence}
                    onCheckedChange={(checked) => updateSettings({ includeSequence: checked })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <HardDrive className="h-4 w-4" />
            Estimated size: <Badge variant="secondary">{estimatedSize()}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
