"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface QueueItem {
    id: string;
    headline: string;
    subtext?: string;
    detailTitle: string;
    detailContent: string;
}

interface IntelligenceQueueProps {
    items: QueueItem[];
}

export function IntelligenceQueue({ items }: IntelligenceQueueProps) {
    const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Create infinite loop by tripling the items array
    const infiniteItems = [...items, ...items, ...items];

    useEffect(() => {
        // Start at the middle set of items for infinite scroll effect
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = 700; // width + gap
            container.scrollLeft = itemWidth * items.length;
        }
    }, [items.length]);

    // Handle infinite scroll loop
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const itemWidth = 700;
            const maxScroll = itemWidth * items.length * 2;
            const minScroll = itemWidth * items.length;

            if (container.scrollLeft >= maxScroll) {
                // Loop back to middle
                container.scrollLeft = minScroll;
            } else if (container.scrollLeft <= 0) {
                // Loop forward to middle
                container.scrollLeft = minScroll;
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [items.length]);

    // Navigate to previous item
    const handlePrevious = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -700,
                behavior: 'smooth'
            });
        }
    };

    // Navigate to next item
    const handleNext = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 700,
                behavior: 'smooth'
            });
        }
    };

    // Handle item click
    const handleItemClick = (item: QueueItem) => {
        setSelectedItem(item);
    };

    return (
        <div id="intelligence-queue" className="relative w-full bg-[#0F0F0F] py-32 border-y border-[#C9A24D]/15 shadow-[0_0_60px_rgba(201,162,77,0.12)] overflow-hidden z-20">
            {/* Subtle gold glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,77,0.08),transparent_70%)] pointer-events-none" />

            {/* Full Width Horizontal Scrolling Queue - Centered, Larger Boxes */}
            <div className="relative w-full z-10">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-[calc(50vw-350px)]"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {infiniteItems.map((item, index) => {
                        const centerOffset = Math.abs((index % items.length) - Math.floor(items.length / 2));
                        const scale = centerOffset === 0 ? 1.05 : 1;

                        return (
                            <button
                                key={`${item.id}-${index}`}
                                onClick={() => handleItemClick(item)}
                                className="flex-shrink-0 w-[680px] snap-center group transition-transform duration-300"
                                style={{ transform: `scale(${scale})` }}
                            >
                                <div className="p-8 bg-gradient-to-br from-[#161616]/90 to-[#1C1C1C]/60 border border-[#C9A24D]/12 rounded-2xl hover:border-[#C9A24D] hover:shadow-[0_8px_32px_rgba(201,162,77,0.2)] transition-all duration-300 hover:-translate-y-1 text-left h-[180px] flex flex-col justify-center backdrop-blur-sm">
                                    <h3 className="text-xl font-bold text-[#F5F5F5] mb-2 group-hover:text-[#E6C97A] transition-colors">
                                        {item.headline}
                                    </h3>
                                    {item.subtext && (
                                        <p className="text-sm text-[#CFCFCF] leading-relaxed">
                                            {item.subtext}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Controls - Gold Accents */}
            <div className="flex items-center justify-center gap-4 mt-8 z-10 relative">
                <button
                    onClick={handlePrevious}
                    className="p-3 text-[#CFCFCF] hover:text-[#E6C97A] bg-[#161616]/70 hover:bg-[#161616] border border-[#C9A24D]/12 hover:border-[#C9A24D] rounded-xl transition-all duration-200 hover:scale-110"
                    aria-label="Previous item"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={handleNext}
                    className="p-3 text-[#CFCFCF] hover:text-[#E6C97A] bg-[#161616]/70 hover:bg-[#161616] border border-[#C9A24D]/12 hover:border-[#C9A24D] rounded-xl transition-all duration-200 hover:scale-110"
                    aria-label="Next item"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="fixed inset-0 bg-[#0F0F0F]/92 backdrop-blur-sm z-50"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        >
                            <div className="relative max-w-3xl w-full bg-[#0F0F0F] border border-[#C9A24D]/20 rounded-2xl p-10 shadow-2xl backdrop-blur-sm">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 p-2 text-[#CFCFCF] hover:text-[#E6C97A] bg-[#161616]/70 hover:bg-[#161616] rounded-lg transition-all duration-200"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Content */}
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-bold text-[#F5F5F5] pr-12">
                                        {selectedItem.detailTitle}
                                    </h3>
                                    <p className="text-[#CFCFCF] leading-relaxed text-lg">
                                        {selectedItem.detailContent}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}
