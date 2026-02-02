'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info as InfoIcon,
  Bell,
  ChevronDown,
  Layers,
  Move,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ToastProvider,
  Toaster,
  useToastContext,
  toast,
  type ToastPosition,
  type ToastType,
} from '@/components/toast';

const positions: { value: ToastPosition; label: string }[] = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

const toastTypes: { type: ToastType; label: string; icon: typeof CheckCircle }[] = [
  { type: 'default', label: 'Default', icon: Bell },
  { type: 'success', label: 'Success', icon: CheckCircle },
  { type: 'error', label: 'Error', icon: XCircle },
  { type: 'warning', label: 'Warning', icon: AlertTriangle },
  { type: 'info', label: 'Info', icon: InfoIcon },
];

function ToastControls() {
  const { position, setPosition, dismissAll } = useToastContext();
  const [selectedType, setSelectedType] = useState<ToastType>('default');

  const handleShowToast = () => {
    const messages: Record<ToastType, { title: string; description?: string }> = {
      default: { title: 'Event has been created', description: 'Monday, January 3rd at 6:00 PM' },
      success: { title: 'Successfully saved!', description: 'Your changes have been saved.' },
      error: { title: 'Something went wrong', description: 'There was an error with your request.' },
      warning: { title: 'Please review', description: 'Some fields need your attention.' },
      info: { title: 'Did you know?', description: 'You can customize toast positions.' },
    };

    const message = messages[selectedType];

    switch (selectedType) {
      case 'success':
        toast.success(message.title, { description: message.description });
        break;
      case 'error':
        toast.error(message.title, { description: message.description });
        break;
      case 'warning':
        toast.warning(message.title, { description: message.description });
        break;
      case 'info':
        toast.info(message.title, { description: message.description });
        break;
      default:
        toast(message.title, { description: message.description });
    }
  };

  const handleBurst = () => {
    toast.success('File uploaded', { description: 'document.pdf was uploaded successfully' });
    setTimeout(() => toast.info('Processing...', { description: 'Analyzing your document' }), 200);
    setTimeout(() => toast.success('Complete!', { description: 'Your document is ready' }), 400);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Position Selector */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Move className="h-4 w-4" />
          Toast Position
        </label>
        <div className="relative">
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as ToastPosition)}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {positions.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Type Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Toast Type
        </label>
        <div className="grid grid-cols-5 gap-2">
          {toastTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                selectedType === type
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-400'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleShowToast}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
        >
          <Bell className="h-4 w-4" />
          Show Toast
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleBurst}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Sparkles className="h-4 w-4" />
            Burst (3x)
          </button>
          <button
            type="button"
            onClick={dismissAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2.5 dark:bg-blue-500/20">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-1.5 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function ToastDemoContent() {
  return (
    <div className="flex min-h-full flex-col overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="px-8 pb-8 pt-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Toast Notifications
        </h1>
        <p className="mx-auto max-w-xl leading-relaxed text-gray-500 dark:text-gray-400">
          A toast implementation using the Popover API for top-layer rendering,
          CSS positioning, and View Transitions for smooth animations.
          Inspired by{' '}
          <a
            href="https://github.com/emilkowalski/sonner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Sonner
          </a>
          .
        </p>
      </header>

      {/* Demo Section */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Try it out
            </h2>
            <ToastControls />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            Implementation Details
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Top Layer (Popover API)"
              description="Toasts render in the browser's top layer using the Popover API, ensuring they always appear above other content."
            />
            <FeatureCard
              icon={Move}
              title="CSS Positioning"
              description="Six position options using CSS fixed positioning. Toasts stack automatically with smooth transitions."
            />
            <FeatureCard
              icon={Sparkles}
              title="View Transitions"
              description="Entry and exit animations powered by the View Transitions API for buttery-smooth state changes."
            />
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              API Usage
            </h2>
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <code className="text-gray-800 dark:text-gray-200">
                  <span className="text-blue-600 dark:text-blue-400">toast</span>
                  (<span className="text-green-600 dark:text-green-400">'Event created'</span>)
                </code>
              </div>
              <ul className="space-y-2">
                {[
                  { method: 'toast(message)', desc: 'Default toast' },
                  { method: 'toast.success(message)', desc: 'Success variant with icon' },
                  { method: 'toast.error(message)', desc: 'Error variant with icon' },
                  { method: 'toast.warning(message)', desc: 'Warning variant with icon' },
                  { method: 'toast.info(message)', desc: 'Info variant with icon' },
                ].map((item) => (
                  <li key={item.method} className="flex gap-2 text-gray-600 dark:text-gray-400">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span>
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {item.method}
                      </code>{' '}
                      — {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Toaster />
    </div>
  );
}

export default function ToastDemoPage() {
  return (
    <ToastProvider defaultPosition="bottom-right">
      <ToastDemoContent />
    </ToastProvider>
  );
}
