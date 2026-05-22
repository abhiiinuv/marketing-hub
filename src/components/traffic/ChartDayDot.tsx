"use client";

import { EVENT_TYPE_COLORS } from "@/lib/types";
import type { ChartPointWithEvents } from "@/lib/chartData";

const TRAFFIC_RADIUS = 3;
const TRAFFIC_ACTIVE_RADIUS = 5;
const EVENT_RADIUS = 4;
const EVENT_STACK_GAP = 10;

type ChartDayDotProps = {
  cx?: number;
  cy?: number;
  payload?: ChartPointWithEvents;
  active?: boolean;
  onSelect: (point: ChartPointWithEvents) => void;
};

export function ChartDayDot({ cx, cy, payload, active, onSelect }: ChartDayDotProps) {
  if (cx == null || cy == null || !payload) return null;

  const hasTraffic = payload.value != null;
  const events = payload.events ?? [];
  if (!hasTraffic && events.length === 0) return null;

  const trafficR = active ? TRAFFIC_ACTIVE_RADIUS : TRAFFIC_RADIUS;
  const baseY = hasTraffic ? cy : cy;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(payload);
  };

  return (
    <g style={{ cursor: "pointer" }} onClick={handleClick}>
      {hasTraffic && (
        <circle
          cx={cx}
          cy={baseY}
          r={trafficR}
          fill={active ? "#fbbf24" : "#f59e0b"}
          stroke={active ? "#ffffff" : "#f59e0b"}
          strokeWidth={active ? 2 : 1}
        />
      )}
      {events.map((event, index) => {
        const offsetFromTraffic = hasTraffic ? trafficR + EVENT_STACK_GAP : 0;
        const eventY = baseY - offsetFromTraffic - index * EVENT_STACK_GAP;
        return (
          <circle
            key={event.id}
            cx={cx}
            cy={eventY}
            r={EVENT_RADIUS}
            fill={EVENT_TYPE_COLORS[event.eventType]}
            stroke="#18181b"
            strokeWidth={1.5}
          />
        );
      })}
    </g>
  );
}

export const CHART_TOP_MARGIN = 36;
