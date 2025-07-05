import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
    overscan?: number;
    onScroll?: (scrollTop: number) => void;
    getItemId?: (item: T, index: number) => string | number;
}

export const VirtualList = memo(<T,>({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    className,
    overscan = 5,
    onScroll,
    getItemId,
}: VirtualListProps<T>) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalHeight = items.length * itemHeight;

    const visibleRange = useMemo(() => {
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
            start + Math.ceil(containerHeight / itemHeight),
            items.length - 1
        );

        return {
            start: Math.max(0, start - overscan),
            end: Math.min(items.length - 1, end + overscan),
        };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
        const result = [];
        for (let i = visibleRange.start; i <= visibleRange.end; i++) {
            result.push({
                index: i,
                item: items[i],
                top: i * itemHeight,
            });
        }
        return result;
    }, [items, visibleRange, itemHeight]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const newScrollTop = e.currentTarget.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(newScrollTop);
    }, [onScroll]);

    // Scroll to item
    const scrollToItem = useCallback((index: number) => {
        if (containerRef.current) {
            const top = index * itemHeight;
            containerRef.current.scrollTop = top;
        }
    }, [itemHeight]);

    // Expose scroll methods
    useEffect(() => {
        if (containerRef.current) {
            (containerRef.current as any).scrollToItem = scrollToItem;
        }
    }, [scrollToItem]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'overflow-auto',
                className
            )}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div
                style={{
                    height: totalHeight,
                    position: 'relative',
                }}
            >
                {visibleItems.map(({ index, item, top }) => (
                    <div
                        key={getItemId ? getItemId(item, index) : index}
                        style={{
                            position: 'absolute',
                            top,
                            left: 0,
                            right: 0,
                            height: itemHeight,
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        </div>
    );
}) as <T>(props: VirtualListProps<T>) => JSX.Element;

// Hook for using virtual list
export function useVirtualList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan = 5
) {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleRange = useMemo(() => {
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
            start + Math.ceil(containerHeight / itemHeight),
            items.length - 1
        );

        return {
            start: Math.max(0, start - overscan),
            end: Math.min(items.length - 1, end + overscan),
        };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.start, visibleRange.end + 1).map((item, idx) => ({
            index: visibleRange.start + idx,
            item,
            top: (visibleRange.start + idx) * itemHeight,
        }));
    }, [items, visibleRange, itemHeight]);

    const totalHeight = items.length * itemHeight;

    return {
        visibleItems,
        totalHeight,
        scrollTop,
        setScrollTop,
        visibleRange,
    };
} 