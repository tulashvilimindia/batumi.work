/**
 * NotFoundPage - Adjarian Folk Edition
 * 404 error page with traditional Georgian hospitality
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib';
import { MapPin, Home, Mountain } from 'lucide-react';

export function NotFoundPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'min-h-[60vh] text-center py-12 px-4'
      )}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #8B2635 1px, transparent 1px),
            linear-gradient(-45deg, #8B2635 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Mountain silhouette decoration */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2"
        style={{ color: '#D4A574', opacity: 0.3 }}
      >
        <Mountain size={80} />
      </div>

      {/* Traditional 404 */}
      <div className="relative mb-6">
        <div
          className="text-[100px] md:text-[150px] font-bold leading-none"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#8B2635',
            textShadow: '4px 4px 0 #D4A574',
          }}
        >
          404
        </div>

        {/* Decorative diamond */}
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rotate-45"
          style={{
            background: '#2D5A3D',
            border: '2px solid #D4A574',
          }}
        />
      </div>

      {/* Lost icon */}
      <div
        className="mb-4 p-4 rounded-lg"
        style={{
          background: 'rgba(139, 38, 53, 0.1)',
          border: '2px solid rgba(139, 38, 53, 0.3)',
        }}
      >
        <MapPin size={32} style={{ color: '#8B2635' }} />
      </div>

      {/* Title - Georgian */}
      <h1
        className="text-2xl md:text-3xl font-bold mb-2"
        style={{
          fontFamily: 'Playfair Display, serif',
          color: '#3D2914',
        }}
      >
        გზა დაიკარგა
      </h1>

      {/* Title - English */}
      <h2
        className="text-lg md:text-xl mb-4"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#6B4423',
        }}
      >
        Path Not Found
      </h2>

      {/* Description */}
      <p
        className="text-base max-w-md mb-8 leading-relaxed"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#8B6B4B',
        }}
      >
        როგორც აჭარის მთებში, გზა ზოგჯერ იკარგება. მაგრამ არ ინერვიულოთ - სტუმართმოყვარეობა გელოდებათ მთავარ გვერდზე!
      </p>

      <p
        className="text-sm max-w-md mb-8 italic"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#8B6B4B',
        }}
      >
        Like in the mountains of Adjara, paths sometimes get lost. But don't worry - hospitality awaits you on the main page!
      </p>

      {/* Back to Home Button */}
      <Link
        to="/"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative inline-flex items-center gap-3',
          'px-8 py-4 rounded-lg',
          'font-semibold tracking-wide',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#D4A574]'
        )}
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          fontSize: '14px',
          background: isHovered
            ? 'linear-gradient(135deg, #A83C4B, #8B2635)'
            : 'linear-gradient(135deg, #8B2635, #A83C4B)',
          border: '2px solid #D4A574',
          color: '#F5E6D3',
          boxShadow: isHovered
            ? '4px 4px 0 #3D2914'
            : '3px 3px 0 #3D2914',
          transform: isHovered ? 'translate(-1px, -1px)' : 'translate(0, 0)',
        }}
      >
        <Home size={18} />
        {/* Georgian text */}
        <span>მთავარ გვერდზე დაბრუნება</span>
      </Link>

      {/* Georgian proverb */}
      <div
        className="mt-12 pt-6"
        style={{ borderTop: '1px solid rgba(212, 165, 116, 0.3)' }}
      >
        <p
          className="text-sm italic"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#8B6B4B',
          }}
        >
          "სტუმარი ღვთისგან მოვლინებულია"
        </p>
        <p
          className="text-xs mt-1"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#A08060',
          }}
        >
          A guest is sent by God — Georgian Proverb
        </p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute bottom-10 left-10 w-12 h-12 hidden md:block">
        <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#D4A574]" />
        <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-[#D4A574]" />
        <div className="absolute bottom-3 left-3 w-2 h-2 rotate-45 bg-[#8B2635]" />
      </div>
      <div className="absolute bottom-10 right-10 w-12 h-12 hidden md:block">
        <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-[#D4A574]" />
        <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-[#D4A574]" />
        <div className="absolute bottom-3 right-3 w-2 h-2 rotate-45 bg-[#2D5A3D]" />
      </div>
    </div>
  );
}
