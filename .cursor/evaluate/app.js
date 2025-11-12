// 应用状态管理
const AppState = {
    currentStudent: null,
    students: [],
    assessments: {
        chinese: [],
        math: [],
        english: [],
        morality: [],
        health: [],
        aesthetic: [],
        labor: []
    },
    reports: [],
    currentScreen: 'dashboard',
    semester: {
        name: '2024-2025上学期',
        startWeek: 1,
        currentWeek: 1
    }
};

// 评价标准数据
const AssessmentCriteria = {
    chinese: {
        name: '语文',
        icon: '📖',
        weight: 0.35,
        indicators: [
            {
                category: '识字与写字',
                weight: 0.35,
                items: [
                    { name: '识字量', target: '450字', node: '每单元后', source: '单元测试+课堂听写' },
                    { name: '书写质量', target: '250字，笔顺准确率≥80%', node: '每周作业', source: '习字册评分' },
                    { name: '查字典能力', target: '能查10个生字', node: '第8周', source: '查字典实操测试' }
                ]
            },
            {
                category: '阅读理解',
                weight: 0.35,
                items: [
                    { name: '朗读', target: '正确流利，70字/分钟', node: '每课', source: '课堂朗读打分' },
                    { name: '复述故事', target: '能复述主要内容（3要素）', node: '第4、12、18周', source: '口语表达评价' },
                    { name: '课外阅读', target: '≥5本绘本（每月1本）', node: '每月末', source: '阅读记录卡' }
                ]
            },
            {
                category: '表达与写作',
                weight: 0.30,
                items: [
                    { name: '看图写话', target: '50字左右（含标点）', node: '第10周起', source: '看图写话作业' },
                    { name: '造句', target: '能用"像"等句式', node: '每周', source: '课堂练习' },
                    { name: '写信', target: '能表达感谢', node: '第14周', source: '写信作业' }
                ]
            }
        ]
    },
    math: {
        name: '数学',
        icon: '🔢',
        weight: 0.35,
        indicators: [
            {
                category: '数与运算',
                weight: 0.40,
                items: [
                    { name: '口算', target: '100以内加减法，正确率≥85%', node: '每日', source: '每日一练记录' },
                    { name: '竖式计算', target: '能正确列竖式', node: '第7-9周', source: '单元测试' },
                    { name: '乘法口诀', target: '背诵2-6口诀并应用', node: '第12-16周', source: '口诀闯关测试' }
                ]
            },
            {
                category: '图形与空间',
                weight: 0.25,
                items: [
                    { name: '角的认识', target: '能辨认锐角、直角、钝角', node: '第5周', source: '动手操作评价' },
                    { name: '七巧板', target: '能拼出指定图案', node: '第11周', source: '实操作品展示' }
                ]
            },
            {
                category: '测量与数据',
                weight: 0.20,
                items: [
                    { name: '长度测量', target: '用米尺测量，误差≤2cm', node: '第3周', source: '实测操作' },
                    { name: '统计图表', target: '能读懂简单统计表和条形图', node: '第17周', source: '图表阅读测试' }
                ]
            },
            {
                category: '问题解决',
                weight: 0.15,
                items: [
                    { name: '信息提取', target: '能从情境图提取数学信息', node: '每单元', source: '应用题评分' },
                    { name: '解题方法', target: '能用画图、列表等方法', node: '第6、14周', source: '过程性评价' }
                ]
            }
        ]
    },
    english: {
        name: '英语',
        icon: '🔤',
        weight: 0.30,
        indicators: [
            {
                category: '听说能力',
                weight: 0.50,
                items: [
                    { name: '单词认读', target: '认读40个单词', node: '每单元', source: '单词认读测试' },
                    { name: '简单对话', target: '能用简单句型对话', node: '每2周', source: '口语情景对话' }
                ]
            },
            {
                category: '模仿与表演',
                weight: 0.30,
                items: [
                    { name: '英文儿歌', target: '能跟唱3首（含动作）', node: '第5、10、15周', source: '课堂展示评分' },
                    { name: '对话表演', target: '能表演课文对话', node: '每单元', source: '小组表演评价' }
                ]
            },
            {
                category: '学习兴趣',
                weight: 0.20,
                items: [
                    { name: '课堂参与', target: '每周主动举手≥3次', node: '每周', source: '教师观察记录' },
                    { name: '配音作业', target: '在家长协助下完成', node: '每月', source: '作业上传记录' }
                ]
            }
        ]
    },
    morality: {
        name: '品德发展',
        icon: '🌟',
        weight: 0.20,
        indicators: [
            {
                category: '行为规范',
                scene: '晨读/课间/路队',
                items: [
                    { name: '守时', desc: '能按时到校，主动交作业' },
                    { name: '课间纪律', desc: '课间不追逐打闹' },
                    { name: '路队纪律', desc: '路队整齐，不离队' }
                ]
            },
            {
                category: '责任意识',
                scene: '值日/小组任务',
                items: [
                    { name: '完成值日', desc: '主动完成值日任务' },
                    { name: '物品管理', desc: '能保管好自己的物品' },
                    { name: '借还物品', desc: '借同学物品能归还' }
                ]
            },
            {
                category: '友善合作',
                scene: '小组讨论/游戏',
                items: [
                    { name: '倾听', desc: '能倾听他人发言' },
                    { name: '帮助他人', desc: '愿意帮助学习困难的同学' },
                    { name: '和解', desc: '与同学矛盾能主动和解' }
                ]
            },
            {
                category: '诚实守信',
                scene: '考试/日常交往',
                items: [
                    { name: '考试诚信', desc: '考试不偷看答案' },
                    { name: '承认错误', desc: '做错事能主动承认' },
                    { name: '守承诺', desc: '说到做到' }
                ]
            }
        ]
    },
    health: {
        name: '身心健康',
        icon: '💪',
        weight: 0.15,
        indicators: [
            {
                category: '体质健康',
                items: [
                    { name: '50米跑', standard: '≤12秒(男)/12.5秒(女)', method: '国家体质健康测试' },
                    { name: '坐位体前屈', standard: '≥0cm', method: '国家体质健康测试' },
                    { name: '1分钟跳绳', standard: '≥60次', method: '国家体质健康测试' }
                ]
            },
            {
                category: '运动兴趣',
                items: [
                    { name: '体育活动', standard: '每周参加≥3次', method: '体育课表现' },
                    { name: '球类游戏', standard: '能掌握1项', method: '体育课表现' },
                    { name: '大课间', standard: '积极参与', method: '课间观察' }
                ]
            },
            {
                category: '心理适应',
                items: [
                    { name: '主动交流', standard: '能主动与老师/同学交流', method: '教师观察+家长反馈' },
                    { name: '寻求帮助', standard: '遇到困难能寻求帮助', method: '教师观察+家长反馈' },
                    { name: '情绪稳定', standard: '情绪稳定，不频繁哭闹', method: '教师观察+家长反馈' }
                ]
            }
        ]
    },
    aesthetic: {
        name: '审美素养',
        icon: '🎨',
        weight: 0.10,
        indicators: [
            {
                category: '艺术感知',
                items: [
                    { name: '音乐感知', desc: '能说出音乐的快慢、强弱', form: '艺术课堂观察' },
                    { name: '美术感知', desc: '能分辨冷色调和暖色调', form: '艺术课堂观察' },
                    { name: '作品欣赏', desc: '能欣赏简单的美术作品', form: '艺术课堂观察' }
                ]
            },
            {
                category: '表达创作',
                items: [
                    { name: '主题画', desc: '能用颜料完成主题画', form: '作品集' },
                    { name: '动作表演', desc: '能跟随节奏做动作', form: '表演展示' },
                    { name: '彩泥创作', desc: '能用彩泥捏出立体作品', form: '作品集' }
                ]
            },
            {
                category: '审美体验',
                items: [
                    { name: '个人仪表', desc: '能保持衣着整洁', form: '日常观察' },
                    { name: '环境整理', desc: '能整理自己的书桌', form: '日常观察' },
                    { name: '发现美', desc: '能发现生活中的美', form: '照片记录' }
                ]
            }
        ]
    },
    labor: {
        name: '劳动实践',
        icon: '🔨',
        weight: 0.05,
        indicators: [
            {
                category: '日常生活劳动',
                items: [
                    { name: '整理书包', task: '整理书包和文具盒', standard: '每天独立完成' },
                    { name: '收拾餐具', task: '饭后收拾餐具', standard: '无需家长提醒' },
                    { name: '洗袜子', task: '洗自己的袜子', standard: '完成质量达标' }
                ]
            },
            {
                category: '集体劳动',
                items: [
                    { name: '教室值日', task: '扫地/擦黑板', standard: '主动参与' },
                    { name: '种植植物', task: '种植班级植物', standard: '与同学配合' },
                    { name: '整理图书', task: '整理图书角', standard: '坚持到底' }
                ]
            }
        ]
    }
};

// 评价等级
const RatingLevels = {
    excellent: { stars: 3, name: '优秀', symbol: '★★★', color: '#28a745' },
    good: { stars: 2, name: '良好', symbol: '★★☆', color: '#17a2b8' },
    pass: { stars: 1, name: '合格', symbol: '★☆☆', color: '#ffc107' },
    improve: { stars: 0, name: '待提高', symbol: '☆☆☆', color: '#dc3545' }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    loadLocalStorage();
    renderDashboard();
});

function initApp() {
    console.log('初始化评价系统...');
    // 设置当前周次
    calculateCurrentWeek();
}

function setupEventListeners() {
    // 导航事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.getAttribute('data-screen');
            navigateTo(screen);
        });
    });

    // 标签页事件
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const parent = tab.parentElement;
            parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.hasAttribute('data-subject')) {
                loadSubjectAssessment(tab.getAttribute('data-subject'));
            } else if (tab.hasAttribute('data-domain')) {
                loadComprehensiveAssessment(tab.getAttribute('data-domain'));
            }
        });
    });

    // 移动端菜单
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

function navigateTo(screen, param) {
    // 隐藏所有屏幕
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // 显示目标屏幕
    const targetScreen = document.getElementById(screen);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screen;
        
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-screen') === screen) {
                item.classList.add('active');
            }
        });
        
        // 更新标题和面包屑
        updateHeader(screen);
        
        // 加载对应内容
        loadScreenContent(screen, param);
    }
}

function updateHeader(screen) {
    const titles = {
        'dashboard': '首页',
        'subject-assessment': '学科评价',
        'comprehensive-assessment': '综合素质评价',
        'tools': '评价工具',
        'reports': '评价报告',
        'data-viz': '数据分析',
        'students': '学生管理'
    };
    
    document.getElementById('screenTitle').textContent = titles[screen] || '评价系统';
    document.getElementById('breadcrumb').textContent = `评价系统 > ${titles[screen] || ''}`;
}

function loadScreenContent(screen, param) {
    switch (screen) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'subject-assessment':
            renderSubjectAssessment(param || 'chinese');
            break;
        case 'comprehensive-assessment':
            renderComprehensiveAssessment(param || 'morality');
            break;
        case 'tools':
            renderTools();
            break;
        case 'reports':
            renderReports();
            break;
        case 'data-viz':
            renderDataVisualization();
            break;
        case 'students':
            renderStudents();
            break;
    }
}

// 渲染首页
function renderDashboard() {
    // 渲染学生概况
    renderStudentOverview();
    
    // 渲染最近评价
    renderRecentAssessments();
    
    // 渲染进度概览
    renderProgressOverview();
}

function renderStudentOverview() {
    const container = document.getElementById('studentOverviewContent');
    const student = AppState.currentStudent;
    
    if (!student) {
        container.innerHTML = '<p class="empty-state">请先添加学生信息</p>';
        return;
    }
    
    const age = calculateAge(student.birthDate);
    container.innerHTML = `
        <div class="student-info-item">
            <div class="student-info-label">姓名</div>
            <div class="student-info-value">${student.name}</div>
        </div>
        <div class="student-info-item">
            <div class="student-info-label">性别</div>
            <div class="student-info-value">${student.gender}</div>
        </div>
        <div class="student-info-item">
            <div class="student-info-label">年龄</div>
            <div class="student-info-value">${age}岁</div>
        </div>
        <div class="student-info-item">
            <div class="student-info-label">班级</div>
            <div class="student-info-value">${student.grade || '二年级'}</div>
        </div>
    `;
}

function renderRecentAssessments() {
    const container = document.getElementById('recentAssessmentsList');
    const allAssessments = [];
    
    // 收集所有评价记录
    Object.keys(AppState.assessments).forEach(key => {
        allAssessments.push(...AppState.assessments[key]);
    });
    
    // 按日期排序，取最近5条
    allAssessments.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = allAssessments.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无评价记录</p>';
        return;
    }
    
    container.innerHTML = recent.map(assessment => `
        <div class="recent-item" onclick="viewAssessment('${assessment.id}')">
            <div class="recent-item-header">
                <span class="recent-item-title">${assessment.title}</span>
                <span class="recent-item-date">${formatDate(assessment.date)}</span>
            </div>
            <div class="recent-item-desc">${assessment.summary || '点击查看详情'}</div>
        </div>
    `).join('');
}

function renderProgressOverview() {
    // 这里可以根据实际评价数据计算进度
    const progress = calculateProgress();
    
    document.getElementById('initialProgress').textContent = progress.initial + '%';
    document.getElementById('initialProgressBar').style.width = progress.initial + '%';
    
    document.getElementById('midProgress').textContent = progress.mid + '%';
    document.getElementById('midProgressBar').style.width = progress.mid + '%';
    
    document.getElementById('finalProgress').textContent = progress.final + '%';
    document.getElementById('finalProgressBar').style.width = progress.final + '%';
}

function calculateProgress() {
    // 简化计算，实际应根据评价记录计算
    return {
        initial: 60,
        mid: 30,
        final: 10
    };
}

// 渲染学科评价
function renderSubjectAssessment(subject) {
    const container = document.getElementById('subjectAssessmentContent');
    const criteria = AssessmentCriteria[subject];
    
    if (!criteria) return;
    
    let html = `
        <div class="assessment-header">
            <h2>${criteria.icon} ${criteria.name}学科评价</h2>
            <p class="weight-info">权重：${(criteria.weight * 100).toFixed(0)}%</p>
        </div>
        <div class="assessment-sections">
    `;
    
    criteria.indicators.forEach((indicator, index) => {
        html += `
            <div class="assessment-section">
                <div class="section-header">
                    <h3>${indicator.category}</h3>
                    <span class="section-weight">权重：${(indicator.weight * 100).toFixed(0)}%</span>
                </div>
                <div class="indicators-table">
                    <table>
                        <thead>
                            <tr>
                                <th>评价指标</th>
                                <th>目标</th>
                                <th>评价节点</th>
                                <th>数据来源</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        indicator.items.forEach((item, itemIndex) => {
            html += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.target}</td>
                    <td>${item.node}</td>
                    <td>${item.source}</td>
                    <td>
                        <button class="btn-link" onclick="assessIndicator('${subject}', ${index}, ${itemIndex})">
                            评价
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="assessment-actions">
            <button class="btn-primary" onclick="completeSubjectAssessment('${subject}')">
                完成${criteria.name}评价
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// 渲染综合素质评价
function renderComprehensiveAssessment(domain) {
    const container = document.getElementById('comprehensiveAssessmentContent');
    const criteria = AssessmentCriteria[domain];
    
    if (!criteria) return;
    
    let html = `
        <div class="assessment-header">
            <h2>${criteria.icon} ${criteria.name}</h2>
            <p class="weight-info">权重：${(criteria.weight * 100).toFixed(0)}%</p>
        </div>
        <div class="assessment-sections">
    `;
    
    criteria.indicators.forEach((indicator, index) => {
        html += `
            <div class="assessment-section">
                <div class="section-header">
                    <h3>${indicator.category}</h3>
                    ${indicator.scene ? `<span class="scene-tag">场景：${indicator.scene}</span>` : ''}
                </div>
                <div class="indicators-list">
        `;
        
        indicator.items.forEach((item, itemIndex) => {
            const descField = item.desc || item.task || item.standard || '';
            const extraField = item.form || item.method || item.standard || '';
            
            html += `
                <div class="indicator-item">
                    <div class="indicator-name">${item.name}</div>
                    <div class="indicator-desc">${descField}</div>
                    ${extraField ? `<div class="indicator-extra">${extraField}</div>` : ''}
                    <button class="btn-link" onclick="assessIndicator('${domain}', ${index}, ${itemIndex})">
                        评价
                    </button>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="assessment-actions">
            <button class="btn-primary" onclick="completeComprehensiveAssessment('${domain}')">
                完成${criteria.name}评价
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

// 评价单个指标
function assessIndicator(domain, categoryIndex, itemIndex) {
    if (!AppState.currentStudent) {
        alert('请先选择学生');
        return;
    }
    
    const criteria = AssessmentCriteria[domain];
    const category = criteria.indicators[categoryIndex];
    const item = category.items[itemIndex];
    
    showModal({
        title: `评价：${item.name}`,
        body: `
            <div class="assessment-form">
                <div class="form-group">
                    <label>评价等级</label>
                    <div class="rating-options">
                        <label class="rating-option">
                            <input type="radio" name="rating" value="excellent" checked>
                            <span>${RatingLevels.excellent.symbol} ${RatingLevels.excellent.name}</span>
                        </label>
                        <label class="rating-option">
                            <input type="radio" name="rating" value="good">
                            <span>${RatingLevels.good.symbol} ${RatingLevels.good.name}</span>
                        </label>
                        <label class="rating-option">
                            <input type="radio" name="rating" value="pass">
                            <span>${RatingLevels.pass.symbol} ${RatingLevels.pass.name}</span>
                        </label>
                        <label class="rating-option">
                            <input type="radio" name="rating" value="improve">
                            <span>${RatingLevels.improve.symbol} ${RatingLevels.improve.name}</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label>具体表现</label>
                    <textarea id="performanceNote" rows="4" placeholder="请描述具体表现..."></textarea>
                </div>
                <div class="form-group">
                    <label>评价日期</label>
                    <input type="date" id="assessmentDate" value="${getTodayDate()}">
                </div>
            </div>
        `,
        buttons: [
            {
                text: '取消',
                class: 'btn-secondary',
                onClick: closeModal
            },
            {
                text: '保存',
                class: 'btn-primary',
                onClick: () => saveAssessment(domain, categoryIndex, itemIndex)
            }
        ]
    });
}

function saveAssessment(domain, categoryIndex, itemIndex) {
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const note = document.getElementById('performanceNote').value;
    const date = document.getElementById('assessmentDate').value;
    
    const criteria = AssessmentCriteria[domain];
    const category = criteria.indicators[categoryIndex];
    const item = category.items[itemIndex];
    
    const assessment = {
        id: generateId(),
        studentId: AppState.currentStudent.id,
        domain: domain,
        domainName: criteria.name,
        category: category.category,
        itemName: item.name,
        rating: rating,
        ratingLevel: RatingLevels[rating],
        note: note,
        date: date,
        title: `${criteria.name} - ${item.name}`,
        summary: `评级：${RatingLevels[rating].name}`
    };
    
    AppState.assessments[domain].push(assessment);
    saveLocalStorage();
    closeModal();
    
    showNotification('评价已保存', 'success');
}

// 工具相关函数
function openTool(toolId) {
    const toolModals = {
        'class-heatmap': {
            title: '📊 课堂发言热力图',
            content: `
                <p><strong>工具说明：</strong>使用磁性白板贴，每个学生一个磁性姓名贴</p>
                <p><strong>使用方法：</strong>每发言1次移动1格，周冠军获"金话筒"徽章</p>
                <div class="tool-placeholder">
                    <p>🎯 此工具为实体教具，请准备：</p>
                    <ul>
                        <li>磁性白板（可在教室墙上使用）</li>
                        <li>学生姓名磁贴</li>
                        <li>"金话筒"奖章</li>
                    </ul>
                </div>
            `
        },
        'homework-microscope': {
            title: '🔍 作业显微镜评价表',
            content: `
                <p><strong>工具说明：</strong>3倍放大尺检查书写</p>
                <p><strong>符号系统：</strong></p>
                <ul>
                    <li>○ 书写优秀</li>
                    <li>△ 有进步</li>
                    <li>× 需努力</li>
                </ul>
            `
        },
        'group-contribution': {
            title: '👥 小组合作贡献值',
            content: `
                <p><strong>记录人：</strong>组长每日记录</p>
                <p><strong>评分项：</strong></p>
                <ul>
                    <li>提供点子（1分）</li>
                    <li>帮助他人（1分）</li>
                    <li>认真倾听（1分）</li>
                </ul>
                <p><strong>奖励：</strong>周满15分获"最佳搭档"</p>
            `
        },
        'home-habits': {
            title: '📝 家庭学习习惯观察表',
            content: `
                <p><strong>聚焦3项：</strong></p>
                <ul>
                    <li>作业前准备（书本、文具摆放整齐）</li>
                    <li>专注时长（30分钟不玩手机/玩具）</li>
                    <li>睡前复习（回顾当天学习内容5分钟）</li>
                </ul>
                <p><strong>奖励：</strong>打勾记录，周达标5天可获"家庭学习习惯之星"</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="downloadTemplate('home-habits')">
                    下载记录表
                </button>
            `
        },
        'reading-card': {
            title: '📚 亲子阅读记录卡',
            content: `
                <p><strong>记录内容：</strong></p>
                <ul>
                    <li>书名</li>
                    <li>阅读时长</li>
                    <li>孩子提问</li>
                    <li>家长回应</li>
                </ul>
                <p><strong>奖励：</strong>积累10张可兑换"阅读小博士"证书</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="downloadTemplate('reading-card')">
                    下载记录卡
                </button>
            `
        },
        'emotion-meter': {
            title: '🌡️ 情绪温度计量表',
            content: `
                <p><strong>使用方法：</strong>每日放学用1-5分评价心情</p>
                <ul>
                    <li>5分 - 非常开心 😄</li>
                    <li>4分 - 比较开心 🙂</li>
                    <li>3分 - 一般 😐</li>
                    <li>2分 - 有点难过 😟</li>
                    <li>1分 - 很难过 😢</li>
                </ul>
                <p><strong>预警机制：</strong>连续3天≤2分触发"师生沟通机制"</p>
                <button class="btn-primary" style="margin-top: 15px;" onclick="downloadTemplate('emotion-meter')">
                    下载量表
                </button>
            `
        },
        'growth-tree': {
            title: '🌳 "我能行"成长树',
            content: `
                <p><strong>设计：</strong>每个学生有自己的成长树海报</p>
                <p><strong>使用方法：</strong></p>
                <ul>
                    <li>每达成一个小目标贴1片叶子</li>
                    <li>学期末长成茂密大树</li>
                    <li>叶子颜色代表不同领域：
                        <ul>
                            <li>🟢 绿色 = 学科</li>
                            <li>🔴 红色 = 品德</li>
                            <li>🔵 蓝色 = 体育</li>
                            <li>🟡 黄色 = 艺术</li>
                        </ul>
                    </li>
                </ul>
                <button class="btn-primary" style="margin-top: 15px;" onclick="downloadTemplate('growth-tree')">
                    下载海报模板
                </button>
            `
        },
        'mistake-train': {
            title: '🚂 错题追踪小火车',
            content: `
                <p><strong>设计：</strong>每道错题是1节车厢，订正后"开走"</p>
                <p><strong>目标：</strong>保持轨道畅通（无积压错题）</p>
                <p><strong>使用方法：</strong></p>
                <ul>
                    <li>发现错题，在轨道上添加一节车厢</li>
                    <li>写上题目和错误原因</li>
                    <li>订正后，移除该车厢</li>
                    <li>保持0车厢状态，获得"学习小能手"称号</li>
                </ul>
                <button class="btn-primary" style="margin-top: 15px;" onclick="downloadTemplate('mistake-train')">
                    下载追踪表
                </button>
            `
        }
    };
    
    const toolData = toolModals[toolId];
    if (toolData) {
        showModal({
            title: toolData.title,
            body: toolData.content,
            buttons: [
                {
                    text: '关闭',
                    class: 'btn-secondary',
                    onClick: closeModal
                }
            ]
        });
    }
}

function downloadTemplate(templateId) {
    // 实际应该生成并下载PDF/Excel文件
    showNotification('模板下载功能开发中...', 'info');
}

// 生成报告
function generateReport() {
    if (!AppState.currentStudent) {
        alert('请先选择学生');
        return;
    }
    
    showModal({
        title: '📄 生成评价报告',
        body: `
            <div class="report-form">
                <div class="form-group">
                    <label>报告类型</label>
                    <select id="reportType">
                        <option value="initial">学期初诊断报告（第3周）</option>
                        <option value="mid">学期中发展报告（第12周）</option>
                        <option value="final">学期末总结报告（第20周）</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>报告日期</label>
                    <input type="date" id="reportDate" value="${getTodayDate()}">
                </div>
            </div>
        `,
        buttons: [
            {
                text: '取消',
                class: 'btn-secondary',
                onClick: closeModal
            },
            {
                text: '生成报告',
                class: 'btn-primary',
                onClick: createReport
            }
        ]
    });
}

function createReport() {
    const reportType = document.getElementById('reportType').value;
    const reportDate = document.getElementById('reportDate').value;
    
    closeModal();
    
    // 显示报告填写表单
    showModal({
        title: `📝 填写${getReportTypeName(reportType)}`,
        body: generateReportForm(reportType),
        buttons: [
            {
                text: '取消',
                class: 'btn-secondary',
                onClick: closeModal
            },
            {
                text: '生成报告',
                class: 'btn-primary',
                onClick: () => saveReport(reportType, reportDate)
            }
        ]
    });
}

function gatherReportData(reportType) {
    // 根据报告类型收集相应数据
    const data = {
        student: AppState.currentStudent,
        assessments: AppState.assessments,
        period: reportType
    };
    
    return data;
}

function saveReport(reportType, reportDate) {
    const form = document.getElementById('reportForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const reportData = {
        student: AppState.currentStudent,
        date: reportDate,
        semester: AppState.semester.name,
        domains: {},
        items: {},
        comments: {}
    };
    
    // 收集表单数据
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('domain_')) {
            const domain = key.replace('domain_', '');
            reportData.domains[domain] = { rating: value };
        } else if (key.startsWith('item_')) {
            reportData.items[key] = value;
        } else if (key.startsWith('comment_')) {
            const commentKey = key.replace('comment_', '');
            reportData.comments[commentKey] = value;
        }
    }
    
    const report = {
        id: generateId(),
        studentId: AppState.currentStudent.id,
        type: reportType,
        date: reportDate,
        data: reportData,
        html: generateReportHTML(reportType, reportData)
    };
    
    AppState.reports.push(report);
    saveLocalStorage();
    closeModal();
    
    showNotification('报告已生成', 'success');
    navigateTo('reports');
}

function viewReport(reportId) {
    const report = AppState.reports.find(r => r.id === reportId);
    if (!report) return;
    
    showModal({
        title: `📄 ${getReportTypeName(report.type)}`,
        body: report.html || '<p>报告内容加载失败</p>',
        buttons: [
            {
                text: '打印',
                class: 'btn-secondary',
                onClick: () => exportReportToPDF(report.html)
            },
            {
                text: '关闭',
                class: 'btn-primary',
                onClick: closeModal
            }
        ]
    });
}

// 学生管理
function addStudent() {
    showModal({
        title: '➕ 添加学生',
        body: `
            <div class="student-form">
                <div class="form-group">
                    <label>姓名 *</label>
                    <input type="text" id="studentName" placeholder="请输入学生姓名" required>
                </div>
                <div class="form-group">
                    <label>性别 *</label>
                    <select id="studentGender">
                        <option value="男">男</option>
                        <option value="女">女</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>出生日期 *</label>
                    <input type="date" id="studentBirthDate" required>
                </div>
                <div class="form-group">
                    <label>年级</label>
                    <select id="studentGrade">
                        <option value="一年级">一年级</option>
                        <option value="二年级" selected>二年级</option>
                        <option value="三年级">三年级</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>班级</label>
                    <input type="text" id="studentClass" placeholder="例如：2班">
                </div>
            </div>
        `,
        buttons: [
            {
                text: '取消',
                class: 'btn-secondary',
                onClick: closeModal
            },
            {
                text: '保存',
                class: 'btn-primary',
                onClick: saveStudent
            }
        ]
    });
}

function saveStudent() {
    const name = document.getElementById('studentName').value.trim();
    const gender = document.getElementById('studentGender').value;
    const birthDate = document.getElementById('studentBirthDate').value;
    const grade = document.getElementById('studentGrade').value;
    const classNum = document.getElementById('studentClass').value;
    
    if (!name || !birthDate) {
        alert('请填写必填项');
        return;
    }
    
    const student = {
        id: generateId(),
        name: name,
        gender: gender,
        birthDate: birthDate,
        grade: grade,
        class: classNum,
        createdAt: new Date().toISOString()
    };
    
    AppState.students.push(student);
    
    // 如果是第一个学生，自动设为当前学生
    if (AppState.students.length === 1) {
        AppState.currentStudent = student;
    }
    
    saveLocalStorage();
    updateStudentSelector();
    closeModal();
    renderDashboard();
    
    showNotification('学生信息已保存', 'success');
}

function switchStudent() {
    const select = document.getElementById('currentStudentSelect');
    const studentId = select.value;
    
    if (studentId) {
        AppState.currentStudent = AppState.students.find(s => s.id === studentId);
        renderDashboard();
    }
}

function updateStudentSelector() {
    const select = document.getElementById('currentStudentSelect');
    select.innerHTML = '<option value="">选择学生</option>';
    
    AppState.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        if (AppState.currentStudent && AppState.currentStudent.id === student.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function renderStudents() {
    const container = document.getElementById('studentsContent');
    
    if (AppState.students.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无学生信息，请点击"添加学生"按钮</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="students-grid">
            ${AppState.students.map(student => `
                <div class="student-card">
                    <div class="student-card-header">
                        <h3>${student.name}</h3>
                        <div class="student-card-actions">
                            <button class="btn-link" onclick="editStudent('${student.id}')">编辑</button>
                            <button class="btn-link" style="color: var(--danger-color);" onclick="deleteStudent('${student.id}')">删除</button>
                        </div>
                    </div>
                    <div class="student-card-body">
                        <div class="student-detail">性别：${student.gender}</div>
                        <div class="student-detail">年龄：${calculateAge(student.birthDate)}岁</div>
                        <div class="student-detail">年级：${student.grade || '二年级'}</div>
                        ${student.class ? `<div class="student-detail">班级：${student.class}</div>` : ''}
                    </div>
                    <div class="student-card-footer">
                        <button class="btn-primary" onclick="selectStudent('${student.id}')">
                            ${AppState.currentStudent && AppState.currentStudent.id === student.id ? '当前学生' : '切换到该学生'}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function selectStudent(studentId) {
    AppState.currentStudent = AppState.students.find(s => s.id === studentId);
    saveLocalStorage();
    updateStudentSelector();
    renderDashboard();
    navigateTo('dashboard');
}

// 模态对话框
function showModal({ title, body, buttons }) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    
    const footer = document.getElementById('modalFooter');
    footer.innerHTML = '';
    
    if (buttons) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.class;
            button.textContent = btn.text;
            button.onclick = btn.onClick;
            footer.appendChild(button);
        });
    }
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// 数据可视化
function renderDataVisualization() {
    if (!AppState.currentStudent) {
        document.querySelector('#data-viz .viz-grid').innerHTML = '<p class="empty-state">请先选择学生</p>';
        return;
    }
    
    // 绘制雷达图
    renderRadarChart();
    
    // 绘制趋势图
    renderTrendChart();
}

function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁旧图表
    if (window.radarChartInstance) {
        window.radarChartInstance.destroy();
    }
    
    // 计算各领域得分
    const scores = calculateDomainScores();
    
    window.radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['学科素养', '品德发展', '身心健康', '审美素养', '劳动实践'],
            datasets: [{
                label: AppState.currentStudent.name,
                data: [
                    scores.subject || 0,
                    scores.morality || 0,
                    scores.health || 0,
                    scores.aesthetic || 0,
                    scores.labor || 0
                ],
                fill: true,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgb(102, 126, 234)',
                pointBackgroundColor: 'rgb(102, 126, 234)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(102, 126, 234)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '五维能力雷达图',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function renderTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁旧图表
    if (window.trendChartInstance) {
        window.trendChartInstance.destroy();
    }
    
    // 获取历史数据
    const trendData = getTrendData();
    
    window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [
                {
                    label: '语文',
                    data: trendData.chinese,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.3
                },
                {
                    label: '数学',
                    data: trendData.math,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.3
                },
                {
                    label: '英语',
                    data: trendData.english,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '得分'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: '学科发展趋势',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function calculateDomainScores() {
    const scores = {
        subject: 0,
        morality: 0,
        health: 0,
        aesthetic: 0,
        labor: 0
    };
    
    // 计算学科素养得分（语文、数学、英语平均）
    const subjectAssessments = [
        ...AppState.assessments.chinese,
        ...AppState.assessments.math,
        ...AppState.assessments.english
    ];
    
    if (subjectAssessments.length > 0) {
        const subjectScore = subjectAssessments.reduce((sum, assessment) => {
            return sum + ratingToScore(assessment.rating);
        }, 0) / subjectAssessments.length;
        scores.subject = subjectScore;
    }
    
    // 计算其他领域得分
    const domains = ['morality', 'health', 'aesthetic', 'labor'];
    domains.forEach(domain => {
        const assessments = AppState.assessments[domain];
        if (assessments && assessments.length > 0) {
            const domainScore = assessments.reduce((sum, assessment) => {
                return sum + ratingToScore(assessment.rating);
            }, 0) / assessments.length;
            scores[domain] = domainScore;
        }
    });
    
    return scores;
}

function ratingToScore(rating) {
    const scoreMap = {
        'excellent': 95,
        'good': 80,
        'pass': 65,
        'improve': 40
    };
    return scoreMap[rating] || 0;
}

function getTrendData() {
    // 获取最近6次评价的数据
    const labels = [];
    const chinese = [];
    const math = [];
    const english = [];
    
    // 按时间排序
    const chineseAssessments = AppState.assessments.chinese.sort((a, b) => new Date(a.date) - new Date(b.date));
    const mathAssessments = AppState.assessments.math.sort((a, b) => new Date(a.date) - new Date(b.date));
    const englishAssessments = AppState.assessments.english.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 取最多6个数据点
    const maxPoints = 6;
    const startIndex = Math.max(0, chineseAssessments.length - maxPoints);
    
    for (let i = 0; i < maxPoints; i++) {
        labels.push(`第${i + 1}次`);
        
        const chineseIndex = startIndex + i;
        const mathIndex = Math.min(startIndex + i, mathAssessments.length - 1);
        const englishIndex = Math.min(startIndex + i, englishAssessments.length - 1);
        
        chinese.push(chineseIndex < chineseAssessments.length ? ratingToScore(chineseAssessments[chineseIndex].rating) : 0);
        math.push(mathIndex >= 0 && mathIndex < mathAssessments.length ? ratingToScore(mathAssessments[mathIndex].rating) : 0);
        english.push(englishIndex >= 0 && englishIndex < englishAssessments.length ? ratingToScore(englishAssessments[englishIndex].rating) : 0);
    }
    
    return { labels, chinese, math, english };
}

// 报告列表
function renderReports() {
    const container = document.getElementById('reportsContent');
    
    if (AppState.reports.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无报告，请点击"生成新报告"按钮</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="reports-grid">
            ${AppState.reports.map(report => `
                <div class="report-card">
                    <div class="report-card-header">
                        <h3>${getReportTypeName(report.type)}</h3>
                        <span class="report-date">${formatDate(report.date)}</span>
                    </div>
                    <div class="report-card-body">
                        <p>学生：${report.data.student.name}</p>
                        <p>生成时间：${formatDateTime(report.date)}</p>
                    </div>
                    <div class="report-card-footer">
                        <button class="btn-primary" onclick="viewReport('${report.id}')">查看报告</button>
                        <button class="btn-link" onclick="downloadReport('${report.id}')">下载</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getReportTypeName(type) {
    const names = {
        'initial': '学期初诊断报告',
        'mid': '学期中发展报告',
        'final': '学期末总结报告'
    };
    return names[type] || '评价报告';
}

// 工具函数
function renderTools() {
    // 工具页面已在HTML中定义，这里无需额外处理
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function calculateCurrentWeek() {
    // 简化计算，实际应根据学期开始日期计算
    AppState.semester.currentWeek = 8;
    document.getElementById('currentWeek').textContent = `第${AppState.semester.currentWeek}周`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
    // 简单的通知实现
    alert(message);
}

function showNotifications() {
    showNotification('暂无新通知', 'info');
}

function showSettings() {
    showNotification('设置功能开发中...', 'info');
}

function showHelp() {
    showModal({
        title: '❓ 使用帮助',
        body: `
            <div class="help-content">
                <h4>欢迎使用小学二年级综合评价系统！</h4>
                <p>本系统基于2022版新课程标准，为二年级学生提供科学、全面的综合素质评价。</p>
                
                <h4>主要功能：</h4>
                <ul>
                    <li><strong>首页：</strong>查看学生概况和评价进度</li>
                    <li><strong>学科评价：</strong>对语文、数学、英语进行详细评价</li>
                    <li><strong>综合素质：</strong>评价品德、健康、审美、劳动表现</li>
                    <li><strong>评价工具：</strong>使用各种评价工具记录学生表现</li>
                    <li><strong>评价报告：</strong>生成学期初、中、末三阶段报告</li>
                    <li><strong>数据分析：</strong>通过图表查看学生发展趋势</li>
                    <li><strong>学生管理：</strong>添加和管理学生信息</li>
                </ul>
                
                <h4>使用流程：</h4>
                <ol>
                    <li>在"学生管理"中添加学生信息</li>
                    <li>选择当前要评价的学生</li>
                    <li>在"学科评价"或"综合素质"中进行评价</li>
                    <li>定期生成评价报告</li>
                    <li>通过"数据分析"查看发展趋势</li>
                </ol>
            </div>
        `,
        buttons: [
            {
                text: '我知道了',
                class: 'btn-primary',
                onClick: closeModal
            }
        ]
    });
}

// 快速评价
function quickAssessment(subject) {
    navigateTo('subject-assessment', subject);
}

function completeSubjectAssessment(subject) {
    showNotification(`${AssessmentCriteria[subject].name}评价已完成`, 'success');
}

function completeComprehensiveAssessment(domain) {
    showNotification(`${AssessmentCriteria[domain].name}评价已完成`, 'success');
}

// 本地存储
function saveLocalStorage() {
    const data = {
        students: AppState.students,
        currentStudent: AppState.currentStudent,
        assessments: AppState.assessments,
        reports: AppState.reports
    };
    localStorage.setItem('evaluationSystem', JSON.stringify(data));
}

function loadLocalStorage() {
    const dataStr = localStorage.getItem('evaluationSystem');
    if (dataStr) {
        try {
            const data = JSON.parse(dataStr);
            AppState.students = data.students || [];
            AppState.currentStudent = data.currentStudent || null;
            AppState.assessments = data.assessments || {
                chinese: [], math: [], english: [],
                morality: [], health: [], aesthetic: [], labor: []
            };
            AppState.reports = data.reports || [];
            updateStudentSelector();
        } catch (error) {
            console.error('加载本地数据失败:', error);
        }
    }
}

function viewAssessment(id) {
    showNotification('查看评价详情功能开发中...', 'info');
}

function editStudent(id) {
    showNotification('编辑学生功能开发中...', 'info');
}

function deleteStudent(id) {
    if (confirm('确定要删除该学生信息吗？')) {
        AppState.students = AppState.students.filter(s => s.id !== id);
        if (AppState.currentStudent && AppState.currentStudent.id === id) {
            AppState.currentStudent = null;
        }
        saveLocalStorage();
        updateStudentSelector();
        renderStudents();
        renderDashboard();
        showNotification('学生信息已删除', 'success');
    }
}

function downloadReport(id) {
    showNotification('下载报告功能开发中...', 'info');
}

