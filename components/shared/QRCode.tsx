"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeSVGProps {
  value: string;
  size?: number;
}

export function QRCodeSVG({ value, size = 80 }: QRCodeSVGProps) {
  const [svgString, setSvgString] = useState<string>('');

  useEffect(() => {
    QRCode.toString(value, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    }).then(setSvgString);
  }, [value, size]);

  if (!svgString) {
    return (
      <div
        className="rounded-lg bg-gray-100 animate-pulse"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
