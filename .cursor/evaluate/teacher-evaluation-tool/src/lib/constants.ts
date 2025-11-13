// 评价指标常量
export const EVALUATION_INDICATORS = {
  语文: ['识字量', '朗读流利度', '阅读理解', '看图写话'],
  数学: ['口算速度', '乘法口诀', '应用题', '图形认知'],
  品德: ['规则意识', '诚实守信', '责任担当', '文明有礼'],
  身心健康: ['运动能力', '情绪管理', '生活习惯'],
  审美素养: ['音乐感知', '美术创作', '文学欣赏'],
  劳动实践: ['值日劳动', '手工制作', '种植活动']
};

// 星级评价标准
export const STAR_CRITERIA: Record<string, { [key: number]: number }> = {
  '语文_识字量': {
    3: 800, // ★★★ 需要800字
    2: 600  // ★★ 需要600字
  },
  '数学_口算速度': {
    3: 20, // ★★★ 20题/分钟
    2: 15  // ★★ 15题/分钟
  },
  '数学_乘法口诀': {
    3: 81, // ★★★ 全部掌握
    2: 60  // ★★ 掌握60句
  }
};

// 五大评价领域
export const EVALUATION_DOMAINS = [
  { code: '学科素养', name: '学科素养', weight: 50, icon: '📚' },
  { code: '品德发展', name: '品德发展', weight: 20, icon: '🌟' },
  { code: '身心健康', name: '身心健康', weight: 15, icon: '💪' },
  { code: '审美素养', name: '审美素养', weight: 10, icon: '🎨' },
  { code: '劳动实践', name: '劳动实践', weight: 5, icon: '🔨' }
];

// 学科列表
export const SUBJECTS = [
  { code: 'chinese', name: '语文', icon: '📖' },
  { code: 'math', name: '数学', icon: '🔢' },
  { code: 'english', name: '英语', icon: '🔤' }
];


