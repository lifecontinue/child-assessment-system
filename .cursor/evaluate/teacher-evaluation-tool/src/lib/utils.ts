import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 计算星级
export function calculateStarRating(
  indicatorCode: string,
  rawData: Record<string, any>
): number {
  // 根据指标代码和原始数据计算星级
  // 这里可以根据实际需求扩展逻辑
  return 1; // 默认返回1星，实际应该调用Edge Function
}


