import { useLayoutEffect, useRef } from "react";
import { Task } from "../types/commonTypes";

type Id = Task['id'];

const SLIDE = 'transform 200ms ease';
// While dragged a row is drawn under the pointer at once; only a change of level slides.
const FOLLOW = 'padding-left 200ms ease';

const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// How far a row is drawn from its place: while sliding it isn't there yet.
const drawnOffset = (el: HTMLElement) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42;

// The rows of a task list slide instead of jumping (FLIP): one that changes place, after a
// drag, a status change or a reload, slides there from where it's drawn, also halfway through
// another slide. While dragging, the dragged rows stay under the pointer and the others slide
// out of their way; on release they slide into their place. Rows are placed by offsetTop, not
// getBoundingClientRect, so neither page scroll nor a slide under way looks like a move: the
// list must be positioned, for offsetTop to be the place in it. A new `listKey` (another
// task's detail) has nothing to slide from.
export const useSlidingRows = (listKey?: unknown) => {
    const rowRefs = useRef(new Map<Id, HTMLLIElement>());
    // The dragged rows: where each one was laid out when the drag started, and how far the
    // pointer has gone since.
    const drag = useRef<{ tops: Map<Id, number>; deltaY: number } | null>(null);
    const last = useRef({ listKey, tops: new Map<Id, number>() });

    const followPointer = () => {
        const current = drag.current;
        current?.tops.forEach((top, id) => {
            const el = rowRefs.current.get(id);
            if (!el) return;
            el.style.transition = FOLLOW;
            el.style.transform = `translateY(${current.deltaY - (el.offsetTop - top)}px)`;
        });
    };

    useLayoutEffect(() => {
        const animate = !reducedMotion() && last.current.listKey === listKey;
        const tops = new Map<Id, number>();
        rowRefs.current.forEach((el, id) => {
            tops.set(id, el.offsetTop);
            const prev = last.current.tops.get(id);
            if (!animate || prev === undefined || prev === el.offsetTop || drag.current?.tops.has(id)) return;
            const from = prev + drawnOffset(el) - el.offsetTop;
            el.style.transition = 'none';
            el.style.transform = `translateY(${from}px)`;
            void el.offsetHeight;
            el.style.transition = SLIDE;
            el.style.transform = '';
        });
        last.current = { listKey, tops };
        followPointer();
    });

    return {
        rowRefs,
        rowRef: (id: Id) => (el: HTMLLIElement | null) => {
            if (el) rowRefs.current.set(id, el); else rowRefs.current.delete(id);
        },
        // Whether the pointer is above the middle of a row, where the row is laid out: the list
        // doesn't flicker between two places while the rows slide.
        isAbove: (id: Id, clientY: number) => {
            const el = rowRefs.current.get(id);
            const list = el?.parentElement;
            if (!el || !list) return false;
            return clientY < list.getBoundingClientRect().top + list.clientTop + el.offsetTop + el.offsetHeight / 2;
        },
        startFollowing: (ids: Id[]) => {
            drag.current = { tops: new Map(ids.map(id => [id, rowRefs.current.get(id)?.offsetTop ?? 0])), deltaY: 0 };
        },
        follow: (deltaY: number) => {
            if (!drag.current) return;
            drag.current.deltaY = deltaY;
            followPointer();
        },
        stopFollowing: () => {
            const ended = drag.current;
            drag.current = null;
            ended?.tops.forEach((_, id) => {
                const el = rowRefs.current.get(id);
                if (!el) return;
                el.style.transition = reducedMotion() ? 'none' : SLIDE;
                el.style.transform = '';
            });
        },
    };
};
