// 学生评估系统应用逻辑

// 应用状态
const AppState = {
    currentStudent: null,
    students: [],
    currentScreen: 'dashboard',
    currentSubject: null,
    currentDomain: null
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSidebar();
    loadStudents();
});

// 初始化导航
function initNavigation() {
    // 侧边栏导航项点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const screen = item.dataset.screen;
            navigateTo(screen);
        });
    });

    // 移动端菜单按钮
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// 初始化侧边栏
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// 导航到指定页面
function navigateTo(screen, param = null) {
    // 隐藏所有页面
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });

    // 显示目标页面
    const targetScreen = document.getElementById(screen);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screen;

        // 更新标题
        updateScreenTitle(screen);

        // 更新导航项状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screen) {
                item.classList.add('active');
            }
        });

        // 根据页面类型加载内容
        if (screen === 'subject-assessment' && param) {
            AppState.currentSubject = param;
            loadSubjectAssessment(param);
        } else if (screen === 'comprehensive-assessment' && param) {
            AppState.currentDomain = param;
            loadComprehensiveAssessment(param);
        } else if (screen === 'dashboard') {
            loadDashboard();
        } else if (screen === 'students') {
            loadStudentsList();
        } else if (screen === 'reports') {
            loadReports();
        } else if (screen === 'tools') {
            loadTools();
        } else if (screen === 'data-viz') {
            loadDataVisualization();
        }
    }
}

// 更新页面标题
function updateScreenTitle(screen) {
    const titles = {
        'dashboard': '首页',
        'subject-assessment': '学科评价',
        'comprehensive-assessment': '综合素质',
        'tools': '评价工具',
        'reports': '评价报告',
        'data-viz': '数据分析',
        'students': '学生管理'
    };

    const titleElement = document.getElementById('screenTitle');
    if (titleElement) {
        titleElement.textContent = titles[screen] || '评价系统';
    }
}

// 显示屏幕（兼容函数）
function showScreen(screen) {
    navigateTo(screen);
}

// 加载学生列表
function loadStudents() {
    // 从本地存储或服务器加载学生数据
    const stored = localStorage.getItem('students');
    if (stored) {
        AppState.students = JSON.parse(stored);
        updateStudentSelector();
    }
}

// 更新学生选择器
function updateStudentSelector() {
    const selector = document.getElementById('currentStudentSelect');
    if (!selector) return;

    selector.innerHTML = '<option value="">选择学生</option>';
    AppState.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        selector.appendChild(option);
    });
}

// 切换学生
function switchStudent() {
    const selector = document.getElementById('currentStudentSelect');
    if (!selector) return;

    const studentId = selector.value;
    AppState.currentStudent = AppState.students.find(s => s.id === studentId) || null;
    
    if (AppState.currentScreen === 'dashboard') {
        loadDashboard();
    }
}

// 添加学生
function addStudent() {
    const name = prompt('请输入学生姓名：');
    if (!name) return;

    const student = {
        id: Date.now().toString(),
        name: name,
        createdAt: new Date().toISOString()
    };

    AppState.students.push(student);
    localStorage.setItem('students', JSON.stringify(AppState.students));
    updateStudentSelector();
    loadStudentsList();
}

// 加载学生列表页面
function loadStudentsList() {
    const content = document.getElementById('studentsContent');
    if (!content) return;

    if (AppState.students.length === 0) {
        content.innerHTML = '<p class="empty-state">暂无学生，请添加学生</p>';
        return;
    }

    content.innerHTML = AppState.students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <h4>${student.name}</h4>
                <p>添加时间：${new Date(student.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="student-actions">
                <button class="btn-secondary" onclick="selectStudent('${student.id}')">选择</button>
                <button class="btn-danger" onclick="deleteStudent('${student.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 选择学生
function selectStudent(studentId) {
    AppState.currentStudent = AppState.students.find(s => s.id === studentId) || null;
    const selector = document.getElementById('currentStudentSelect');
    if (selector) {
        selector.value = studentId;
    }
    navigateTo('dashboard');
}

// 删除学生
function deleteStudent(studentId) {
    if (confirm('确定要删除这个学生吗？')) {
        AppState.students = AppState.students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(AppState.students));
        if (AppState.currentStudent && AppState.currentStudent.id === studentId) {
            AppState.currentStudent = null;
        }
        updateStudentSelector();
        loadStudentsList();
    }
}

// 加载首页
function loadDashboard() {
    // 更新学生概况
    const overviewContent = document.getElementById('studentOverviewContent');
    if (overviewContent) {
        if (AppState.currentStudent) {
            overviewContent.innerHTML = `
                <div class="student-info-card">
                    <h4>${AppState.currentStudent.name}</h4>
                    <p>当前学生</p>
                </div>
            `;
        } else {
            overviewContent.innerHTML = '<p class="empty-state">请先添加学生信息</p>';
        }
    }
}

// 加载学科评价
function loadSubjectAssessment(subject) {
    const content = document.getElementById('subjectAssessmentContent');
    if (!content) return;

    const subjects = {
        'chinese': '语文',
        'math': '数学',
        'english': '英语'
    };

    content.innerHTML = `
        <div class="assessment-section">
            <h3>${subjects[subject]}评价</h3>
            <p>学科评价内容将在这里显示</p>
        </div>
    `;
}

// 加载综合素质评价
function loadComprehensiveAssessment(domain) {
    const content = document.getElementById('comprehensiveAssessmentContent');
    if (!content) return;

    const domains = {
        'morality': '品德发展',
        'health': '身心健康',
        'aesthetic': '审美素养',
        'labor': '劳动实践'
    };

    content.innerHTML = `
        <div class="assessment-section">
            <h3>${domains[domain]}评价</h3>
            <p>综合素质评价内容将在这里显示</p>
        </div>
    `;
}

// 加载报告
function loadReports() {
    // 报告加载逻辑
    console.log('Loading reports...');
}

// 加载工具
function loadTools() {
    // 工具加载逻辑
    console.log('Loading tools...');
}

// 加载数据可视化
function loadDataVisualization() {
    // 数据可视化加载逻辑
    console.log('Loading data visualization...');
}

// 快速评价
function quickAssessment(subject) {
    navigateTo('subject-assessment', subject);
}

// 打开工具
function openTool(toolName) {
    showModal('工具', `打开工具：${toolName}`);
}

// 显示模态框
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.style.display = 'flex';
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示帮助
function showHelp() {
    showModal('使用帮助', '<p>这里是使用帮助内容</p>');
}

// 显示通知
function showNotifications() {
    showModal('通知', '<p>暂无新通知</p>');
}

// 显示设置
function showSettings() {
    showModal('设置', '<p>系统设置</p>');
}

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});

