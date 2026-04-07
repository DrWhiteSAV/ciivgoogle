import React, { useMemo, useCallback } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis
} from 'recharts';
import { Habitat } from '../config/constants';

const CustomTick = React.memo(({ x, y, payload, chartData, color, onStatClick, onStatHide }: any) => {
  const item = chartData.find((d: any) => d.subject === payload.value);
  
  return (
    <g 
      transform={`translate(${x},${y})`} 
      className="group cursor-pointer"
      style={{ pointerEvents: 'all' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStatClick?.(e as any, item?.subject || '', item?.desc || '');
      }}
      onPointerUp={() => onStatHide?.()}
      onPointerLeave={() => onStatHide?.()}
      onClick={(e) => e.stopPropagation()}
    >
      <text x={0} y={0} dy={-10} textAnchor="middle" fill="#ffffff60" fontSize={10} className="uppercase">
        {payload.value}
      </text>
      <text x={0} y={10} textAnchor="middle" fill={color} fontSize={10} fontWeight="bold" className="font-mono">
        {item?.A}
      </text>
    </g>
  );
});

export const HabitatChart = React.memo(({ data, color, onStatClick, onStatHide }: { 
  data: Habitat, 
  color: string, 
  onStatClick?: (e: React.MouseEvent, title: string, desc: string) => void,
  onStatHide?: () => void
}) => {
  const chartData = useMemo(() => [
    { subject: 'Темп', A: data.temp, fullMark: 100, desc: 'Температура среды' },
    { subject: 'Грав', A: data.grav, fullMark: 100, desc: 'Сила гравитации' },
    { subject: 'Атмо', A: data.atmo, fullMark: 100, desc: 'Плотность атмосферы' },
    { subject: 'Рад', A: data.rad, fullMark: 100, desc: 'Уровень радиации' },
    { subject: 'Влаж', A: data.humi, fullMark: 100, desc: 'Влажность воздуха' },
    { subject: 'Рес', A: data.res, fullMark: 100, desc: 'Доступность ресурсов' },
  ], [data]);

  const renderTick = useCallback((props: any) => (
    <CustomTick {...props} chartData={chartData} color={color} onStatClick={onStatClick} onStatHide={onStatHide} />
  ), [chartData, color, onStatClick, onStatHide]);

  const renderDot = useCallback((props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={color}
        fillOpacity={0.8}
        className="cursor-pointer"
        style={{ pointerEvents: 'all' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onStatClick?.(e as any, payload.subject, payload.desc);
        }}
        onPointerUp={() => onStatHide?.()}
        onPointerLeave={() => onStatHide?.()}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }, [color, onStatClick, onStatHide]);

  return (
    <div className="w-full flex flex-col items-center min-w-0 py-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="w-full h-[200px] min-w-0 relative overflow-hidden flex items-center justify-center">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" width={300} height={200} data={chartData}>
          <PolarGrid stroke="#ffffff20" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={renderTick}
          />
          <Radar
            name="Habitat"
            dataKey="A"
            stroke={color}
            fill={color}
            fillOpacity={0.5}
            isAnimationActive={false}
            dot={renderDot}
          />
        </RadarChart>
      </div>
    </div>
  );
});
