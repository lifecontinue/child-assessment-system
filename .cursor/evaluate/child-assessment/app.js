// 应用状态管理
const AppState = {
    user: null, // 当前登录用户
    student: null,
    indicators: [],
    assessments: [],
    dailyRecords: [], // 日常记录
    currentAssessment: null,
    chatAssessment: {
        currentIndicatorIndex: -1,
        completedIndicators: [],
        remainingIndicators: [],
        currentIndicator: null,
        isActive: false,
        results: []
    },
    currentDailyRecord: {
        activity: '',
        matchedIndicators: [],
        results: []
    },
    navigationHistory: [] // 页面导航历史
};

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 移除浏览器扩展注入的元素（延迟执行，确保页面内容已加载）
        setTimeout(() => {
            // 移除 glmos 相关元素
            const glmosElements = document.querySelectorAll('#glmos-main-content');
            glmosElements.forEach(el => {
                // 确保不是应用本身的元素
                if (!el.closest('.main-content') && 
                    !el.closest('.screen') &&
                    !el.closest('main') &&
                    !el.closest('nav')) {
                    el.remove();
                }
            });
        }, 1000);
        
        // 使用 MutationObserver 监听 DOM 变化，移除动态添加的扩展元素
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.id === 'glmos-main-content') {
                        // 只移除 glmos-main-content，确保不是应用本身的元素
                        if (!node.closest('.main-content') && 
                            !node.closest('.screen') &&
                            !node.closest('main') &&
                            !node.closest('nav')) {
                            node.remove();
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: false  // 只监听直接子元素，避免影响应用内容
        });
        
        // 初始化 Supabase
        if (!initSupabase()) {
            console.warn('Supabase 未配置，将使用本地存储模式');
        }
        
        // 检查用户登录状态
        await checkAuthStatus();
        console.log('用户状态检查完成，用户:', AppState.user ? '已登录' : '未登录');
        
        setupEventListeners();
        console.log('事件监听器设置完成');
        
        // 初始化动态背景
        initDynamicBackground();
        console.log('动态背景初始化完成');
        
        // 如果未登录，显示登录页面
        if (!AppState.user) {
            console.log('显示登录页面');
            showScreen('authScreen', false);
        } else {
            // 已登录，加载数据并显示主页面
            await loadUserData();
            console.log('用户数据加载完成');
            
            // 检查是否是首次登录（没有学生信息）
            if (!AppState.student) {
                // 首次登录，显示欢迎页面
                console.log('显示欢迎页面');
                showScreen('welcomeScreen', false);
            } else {
                // 已有学生信息，直接进入日常记录页面
                console.log('显示日常记录页面');
                showScreen('dailyRecordScreen', false);
                initDailyRecordScreen();
                updateHomeScreen();
            }
        }
        
        // 清空导航历史
        AppState.navigationHistory = [];
        
        // 确保至少有一个屏幕显示
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) {
            console.warn('没有活动的屏幕，显示登录页面');
            showScreen('authScreen', false);
        }
        
        console.log('页面初始化完成');
    } catch (error) {
        console.error('页面初始化错误:', error);
        // 确保至少显示登录页面
        const authScreen = document.getElementById('authScreen');
        if (authScreen) {
            authScreen.classList.add('active');
        }
    }
});

// ==================== 认证相关函数 ====================

// 检查认证状态
async function checkAuthStatus() {
    if (!supabase) return false;
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            // 如果是认证错误，清除会话
            if (error.message && error.message.includes('sign in')) {
                console.warn('会话已过期，需要重新登录');
                await supabase.auth.signOut();
                AppState.user = null;
                return false;
            }
            throw error;
        }
        
        if (session && session.user) {
            AppState.user = session.user;
            // 加载用户配置文件
            await loadUserProfile();
            return true;
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        // 如果认证失败，清除会话
        if (supabase) {
            try {
                await supabase.auth.signOut();
            } catch (e) {
                // 忽略登出错误
            }
        }
        AppState.user = null;
    }
    return false;
}

// 加载用户配置文件
async function loadUserProfile() {
    if (!supabase || !AppState.user) return;
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', AppState.user.id)
            .single();
        
        if (error) {
            // 如果是认证错误，清除会话
            if (error.message && (error.message.includes('Please sign in again') || 
                                  error.message.includes('JWT') ||
                                  error.message.includes('sign in'))) {
                console.warn('认证已过期，清除会话');
                await supabase.auth.signOut();
                AppState.user = null;
                if (document.querySelector('.screen.active')?.id !== 'authScreen') {
                    showScreen('authScreen', false);
                    showToast('会话已过期，请重新登录');
                }
                return;
            }
            // 其他错误（如记录不存在）可以忽略
            if (error.code !== 'PGRST116') {
                console.error('加载用户配置文件失败:', error);
            }
        } else if (data) {
            // 将用户配置文件信息合并到 user 对象
            AppState.user.profile = convertDbToApp(data);
        }
    } catch (error) {
        console.error('加载用户配置文件失败:', error);
        // 如果是认证相关错误，清除会话
        if (error.message && (error.message.includes('Please sign in again') || 
                              error.message.includes('JWT') ||
                              error.message.includes('sign in'))) {
            if (supabase) {
                try {
                    await supabase.auth.signOut();
                    AppState.user = null;
                    if (document.querySelector('.screen.active')?.id !== 'authScreen') {
                        showScreen('authScreen', false);
                        showToast('会话已过期，请重新登录');
                    }
                } catch (e) {
                    // 忽略登出错误
                }
            }
        }
    }
}

// 更新用户配置文件
async function updateUserProfile(updates) {
    if (!supabase || !AppState.user) return false;
    
    try {
        const dbUpdates = convertAppToDb({
            ...updates,
            updated_at: new Date().toISOString()
        });
        
        const { data, error } = await supabase
            .from('user_profiles')
            .update(dbUpdates)
            .eq('id', AppState.user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (data) {
            AppState.user.profile = convertDbToApp(data);
            return true;
        }
    } catch (error) {
        console.error('更新用户配置文件失败:', error);
        return false;
    }
    return false;
}

// 处理登录
async function handleLogin() {
    console.log('handleLogin 被调用'); // 调试日志
    
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginLoading = document.getElementById('loginBtnLoading');
    const errorMsg = document.getElementById('loginErrorMsg');
    
    // 隐藏错误消息
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
    
    if (!email || !password) {
        const msg = '请填写邮箱和密码';
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
        }
        showToast(msg);
        return;
    }
    
    if (!supabase) {
        const msg = '系统未配置，无法登录';
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.display = 'block';
        }
        showToast(msg);
        return;
    }
    
    // 禁用按钮并显示加载状态
    if (loginBtn) {
        loginBtn.disabled = true;
    }
    if (loginBtnText) {
        loginBtnText.style.display = 'none';
    }
    if (loginLoading) {
        loginLoading.style.display = 'inline-block';
    }
    
    try {
        console.log('正在尝试登录...', email); // 调试日志
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('登录错误:', error); // 调试日志
            throw error;
        }
        
        if (data.user) {
            AppState.user = data.user;
            // 加载用户配置文件
            await loadUserProfile();
            showToast('登录成功');
            await loadUserData();
            
            // 检查是否是首次登录（没有学生信息）
            if (!AppState.student) {
                // 首次登录，显示欢迎页面
                showScreen('welcomeScreen', false);
            } else {
                // 已有学生信息，直接进入日常记录页面
                showScreen('dailyRecordScreen', false);
                initDailyRecordScreen();
                updateHomeScreen();
            }
        }
    } catch (error) {
        console.error('登录失败:', error);
        const errorMessage = error.message || '登录失败，请检查邮箱和密码';
        
        // 显示错误消息
        if (errorMsg) {
            errorMsg.textContent = errorMessage;
            errorMsg.style.display = 'block';
        }
        showToast(errorMessage);
    } finally {
        // 恢复按钮状态
        if (loginBtn) {
            loginBtn.disabled = false;
        }
        if (loginBtnText) {
            loginBtnText.style.display = 'inline';
        }
        if (loginLoading) {
            loginLoading.style.display = 'none';
        }
    }
}
// 确保可被内联 onclick 调用
window.handleLogin = handleLogin;

// 处理注册
async function handleRegister() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const registerBtn = document.getElementById('registerBtnText');
    const registerLoading = document.getElementById('registerBtnLoading');
    
    if (!email || !password) {
        showToast('请填写邮箱和密码');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码至少需要6位');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToast('两次输入的密码不一致');
        return;
    }
    
    if (!supabase) {
        showToast('系统未配置，无法注册');
        return;
    }
    
    registerBtn.style.display = 'none';
    registerLoading.style.display = 'inline-block';
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        if (data.user) {
            showToast('注册成功！请检查邮箱验证链接（如已启用邮箱验证）');
            // 自动登录
            AppState.user = data.user;
            // 加载用户配置文件（触发器会自动创建）
            await loadUserProfile();
            await loadUserData();
            showScreen('dailyRecordScreen', false);
            initDailyRecordScreen();
            updateHomeScreen();
        }
    } catch (error) {
        console.error('注册失败:', error);
        showToast(error.message || '注册失败，请稍后重试');
    } finally {
        registerBtn.style.display = 'inline';
        registerLoading.style.display = 'none';
    }
}

// GitHub OAuth 登录
async function handleGitHubLogin() {
    if (!supabase) {
        showToast('系统未配置，无法使用 GitHub 登录');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
    } catch (error) {
        console.error('GitHub 登录失败:', error);
        showToast(error.message || 'GitHub 登录失败');
    }
}

// 处理登出
async function handleLogout() {
    if (!supabase) {
        // 本地模式，清除本地数据
        localStorage.clear();
        AppState.user = null;
        AppState.student = null;
        AppState.assessments = [];
        AppState.dailyRecords = [];
        showScreen('authScreen', false);
        showToast('已退出登录');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        AppState.user = null;
        AppState.student = null;
        AppState.assessments = [];
        AppState.dailyRecords = [];
        
        showScreen('authScreen', false);
        showToast('已退出登录');
    } catch (error) {
        console.error('登出失败:', error);
        showToast('登出失败');
    }
}

// 切换登录/注册表单
function switchToRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// 加载用户数据
async function loadUserData() {
    await Promise.all([
        loadStudentInfo(),
        loadAssessments(),
        loadDailyRecords(),
        loadIndicators()
    ]);
}

// 设置事件监听器
function setupEventListeners() {
    // 欢迎页面
    document.getElementById('startBtn')?.addEventListener('click', () => {
        showScreen('studentInfoScreen');
    });
    
    // 监听认证状态变化
    if (supabase) {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                AppState.user = session.user;
                // 加载用户配置文件
                await loadUserProfile();
                await loadUserData();
                if (document.querySelector('.screen.active')?.id === 'authScreen') {
                    // 检查是否是首次登录（没有学生信息）
                    if (!AppState.student) {
                        // 首次登录，显示欢迎页面
                        showScreen('welcomeScreen', false);
                    } else {
                        // 已有学生信息，直接进入日常记录页面
                        showScreen('dailyRecordScreen', false);
                        initDailyRecordScreen();
                        updateHomeScreen();
                    }
                }
            } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                if (event === 'SIGNED_OUT') {
                    AppState.user = null;
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    // 令牌刷新成功，更新用户信息
                    AppState.user = session.user;
                }
            }
        });
        
        // 监听认证错误
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && 
                (event.reason.message.includes('Please sign in again') || 
                 event.reason.message.includes('sign in'))) {
                console.warn('检测到认证错误，清除会话');
                event.preventDefault();
                if (supabase) {
                    supabase.auth.signOut().then(() => {
                        AppState.user = null;
                        if (document.querySelector('.screen.active')?.id !== 'authScreen') {
                            showScreen('authScreen', false);
                            showToast('会话已过期，请重新登录');
                        }
                    }).catch(() => {
                        // 忽略错误
                    });
                }
            }
        });
    }
    
    // 学生信息表单
    document.getElementById('studentForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveStudentInfo();
    });
    
    // 开始测评按钮（使用类选择器，因为可能有多个按钮）
    document.querySelectorAll('.start-assessment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 检查学生信息
            if (!AppState.student) {
                showToast('请先填写学生信息');
                // 记录当前页面到历史
                const currentScreen = document.querySelector('.screen.active');
                if (currentScreen) {
                    AppState.navigationHistory.push(currentScreen.id);
                }
                showScreen('studentInfoScreen');
                return;
            }
            
            // 加载指标并开始测评
            if (AppState.indicators.length === 0) {
                showToast('正在加载测评数据...');
                loadIndicators().then(() => {
                    startChatAssessment();
                }).catch(() => {
                    showToast('加载测评数据失败，请刷新页面重试');
                });
            } else {
                startChatAssessment();
            }
        });
    });
    
    // 推荐按钮（日常记录页面）
    document.getElementById('recommendationBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showRecommendations();
    });
    
    // 评估记录按钮（日常记录页面）
    document.getElementById('assessmentRecordsBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showAssessmentRecords();
    });
    
    // 趋势分析按钮（日常记录页面）
    document.getElementById('multiAnalysisBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showMultiAssessmentAnalysis();
    });
    
    // 聊天输入框事件
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 自动调整高度
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    }
    
    // 配置文件按钮（已在HTML中直接绑定onclick）
    
    // 活动描述输入框监听
    const activityInput = document.getElementById('activityDescription');
    if (activityInput) {
        activityInput.addEventListener('input', function() {
            const hasContent = this.value.trim().length > 0;
            const summaryBtn = document.getElementById('summaryBtn');
            if (summaryBtn) {
                summaryBtn.style.display = hasContent ? 'block' : 'none';
            }
        });
    }
}

// 屏幕切换
function showScreen(screenId, addToHistory = true) {
    const currentScreen = document.querySelector('.screen.active');
    const currentScreenId = currentScreen ? currentScreen.id : null;
    
    // 隐藏所有屏幕
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 显示目标屏幕
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('屏幕已切换:', screenId, '显示状态:', window.getComputedStyle(targetScreen).display);
        
        // 添加到历史记录（如果需要）
        if (addToHistory && currentScreenId && currentScreenId !== screenId) {
            AppState.navigationHistory.push(currentScreenId);
            // 限制历史记录长度
            if (AppState.navigationHistory.length > 10) {
                AppState.navigationHistory.shift();
            }
        }
    } else {
        console.error('找不到屏幕元素:', screenId);
    }
}

// 返回上一页
function goBack() {
    if (AppState.navigationHistory.length > 0) {
        const previousScreen = AppState.navigationHistory.pop();
        showScreen(previousScreen, false);
    } else {
        // 如果没有历史记录，返回默认页面
        showScreen('dailyRecordScreen', false);
    }
}

// 获取默认返回页面
function getDefaultBackScreen() {
    // 根据当前页面决定返回哪里
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return 'dailyRecordScreen';
    
    const screenId = currentScreen.id;
    
    // 特殊页面的返回逻辑
    if (screenId === 'studentInfoScreen') {
        // 从设置进入的，返回日常记录页面
        return 'dailyRecordScreen';
    }
    
    if (screenId === 'resultScreen') {
        // 结果页面可能从多个地方进入，检查历史
        if (AppState.navigationHistory.length > 0) {
            return AppState.navigationHistory[AppState.navigationHistory.length - 1];
        }
        return 'assessmentRecordsScreen';
    }
    
    // 默认返回日常记录页面
    return 'dailyRecordScreen';
}

// 字段名转换：数据库下划线命名 -> 代码驼峰命名
function convertDbToApp(data) {
    if (!data) return data;
    if (Array.isArray(data)) {
        return data.map(convertDbToApp);
    }
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
        // 转换下划线命名到驼峰命名
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        converted[camelKey] = value;
    }
    return converted;
}

// 字段名转换：代码驼峰命名 -> 数据库下划线命名
function convertAppToDb(data) {
    if (!data) return data;
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
        // 如果已经是下划线格式（如 user_id），直接使用
        if (key.includes('_')) {
            converted[key] = value;
        } else {
            // 转换驼峰命名到下划线命名
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            converted[snakeKey] = value;
        }
    }
    return converted;
}

// 加载学生信息
async function loadStudentInfo() {
    if (supabase && AppState.user) {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', AppState.user.id)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116' && error.status !== 406) { // 忽略无行返回
                console.error('加载学生信息失败:', error);
            } 
            if (data) {
                // 转换数据库字段名到应用字段名
                AppState.student = convertDbToApp(data);
                updateStudentForm();
                return;
            }
        } catch (error) {
            console.error('加载学生信息失败:', error);
        }
    }
    
    // 后备：使用 localStorage
    const saved = localStorage.getItem('studentInfo');
    if (saved) {
        AppState.student = JSON.parse(saved);
        updateStudentForm();
    }
}

// 保存学生信息
async function saveStudentInfo() {
    const student = {
        name: document.getElementById('studentName').value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        birthDate: document.getElementById('birthDate').value,
        height: parseFloat(document.getElementById('height').value) || null,
        weight: parseFloat(document.getElementById('weight').value) || null,
        notes: document.getElementById('studentNotes').value,
        updatedAt: new Date().toISOString()
    };
    
    if (supabase && AppState.user) {
        try {
            // 检查是否已存在
            const { data: existing } = await supabase
                .from('students')
                .select('id')
                .eq('user_id', AppState.user.id)
                .single();
            
            // 转换字段名为数据库格式
            const dbStudent = convertAppToDb({
                ...student,
                user_id: AppState.user.id
            });
            
            if (existing) {
                // 更新
                const { error } = await supabase
                    .from('students')
                    .update({ 
                        ...dbStudent, 
                        updated_at: new Date().toISOString() 
                    })
                    .eq('user_id', AppState.user.id);
                
                if (error) throw error;
            } else {
                // 创建
                const { error } = await supabase
                    .from('students')
                    .insert({
                        ...dbStudent,
                        created_at: new Date().toISOString()
                    });
                
                if (error) throw error;
            }
            
            AppState.student = { ...student, user_id: AppState.user.id };
        } catch (error) {
            console.error('保存学生信息失败:', error);
            showToast('保存失败，已使用本地存储');
            // 后备：使用 localStorage
            AppState.student = { ...student, createdAt: new Date().toISOString() };
            localStorage.setItem('studentInfo', JSON.stringify(AppState.student));
        }
    } else {
        // 后备：使用 localStorage
        AppState.student = { ...student, createdAt: new Date().toISOString() };
        localStorage.setItem('studentInfo', JSON.stringify(AppState.student));
    }
    
    updateHomeScreen();
    // 保存信息后返回日常记录页面
    showScreen('dailyRecordScreen');
    
    // 显示成功提示
    showToast('学生信息已保存');
}

// 更新学生信息表单
function updateStudentForm() {
    if (!AppState.student) return;
    
    const s = AppState.student;
    document.getElementById('studentName').value = s.name || '';
    // 处理字段名：支持 birthDate 和 birth_date
    document.getElementById('birthDate').value = s.birthDate || s.birth_date || '';
    document.getElementById('height').value = s.height || '';
    document.getElementById('weight').value = s.weight || '';
    document.getElementById('studentNotes').value = s.notes || '';
    
    if (s.gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${s.gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
        }
    }
}

// 更新主页
function updateHomeScreen() {
    updateStudentCardMini();
    
    // 更新所有"完整测评"按钮的状态
    const startBtns = document.querySelectorAll('.start-assessment-btn');
    if (!AppState.student) {
        startBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        return;
    }
    
    startBtns.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    });
    
    // 更新推荐
    updateRecommendations();
    
    // 更新最近日常记录（如有）
    updateRecentDailyRecords();
}

// 显示推荐测评
function showRecommendations() {
    if (!AppState.student) {
        showToast('请先填写学生信息');
        // 记录当前页面到历史，然后跳转到学生信息页面
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            AppState.navigationHistory.push(currentScreen.id);
        }
        showScreen('studentInfoScreen');
        return;
    }
    
    // 生成推荐内容
    const age = AppState.student.birthDate ? calculateAge(AppState.student.birthDate) : 0;
    const lastAssessment = getLastAssessment();
    const daysSinceLastAssessment = lastAssessment 
        ? Math.floor((new Date() - new Date(lastAssessment.date)) / (1000 * 60 * 60 * 24))
        : Infinity;
    
    const recommendations = [];
    
    // 根据时间推荐
    if (daysSinceLastAssessment > 90 || !lastAssessment) {
        recommendations.push({
            title: '全面测评',
            description: daysSinceLastAssessment > 90 
                ? `距离上次测评已过去${daysSinceLastAssessment}天，建议进行全面测评`
                : '建议进行首次全面测评，了解孩子当前发展水平'
        });
    } else if (daysSinceLastAssessment > 30) {
        recommendations.push({
            title: '定期测评',
            description: `距离上次测评已过去${daysSinceLastAssessment}天，建议进行定期测评`
        });
    }
    
    // 根据年龄推荐领域
    const recommendedDomains = getRecommendedDomains(age);
    if (recommendedDomains.length > 0) {
        recommendations.push({
            title: '重点领域',
            description: `建议重点关注：${recommendedDomains.join('、')}`
        });
    }
    
    let recommendationsHTML = '';
    if (recommendations.length === 0) {
        recommendationsHTML = '<p class="empty-state">暂无推荐</p>';
    } else {
        recommendationsHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
            </div>
        `).join('');
    }
    
    // 显示在结果页面
    document.getElementById('resultContainer').innerHTML = `
        <div class="recommendation-card" style="margin: 0;">
            <div class="card-header">
                <h3>📋 推荐测评活动</h3>
            </div>
            <div class="recommendation-content">
                ${recommendationsHTML}
            </div>
            <button class="btn-primary" onclick="startChatAssessment()">
                开始测评
            </button>
        </div>
    `;
    showScreen('resultScreen'); // 会自动记录历史
}

// 显示评估记录列表
function showAssessmentRecords() {
    // 记录当前页面到历史
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id !== 'assessmentRecordsScreen') {
        AppState.navigationHistory.push(currentScreen.id);
    }
    
    const container = document.getElementById('recordsContainer');
    const assessments = AppState.assessments;
    
    if (assessments.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 60px 20px; text-align: center;">暂无评估记录</div>';
        showScreen('assessmentRecordsScreen');
        return;
    }
    
    container.innerHTML = `
        <div class="records-list-full">
            ${assessments.map(assessment => {
                const date = new Date(assessment.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const totalIndicators = assessment.results.length;
                const passedIndicators = assessment.results.filter(r => r.status === '符合').length;
                const score = totalIndicators > 0 ? Math.round((passedIndicators / totalIndicators) * 100) : 0;
                
                return `
                    <div class="record-item-full" onclick="viewAssessmentResult('${assessment.id}')">
                        <div class="record-header-full">
                            <div class="record-date-full">${date}</div>
                            <div class="record-score-full">${score}%</div>
                        </div>
                        <div class="record-summary-full">
                            完成 ${totalIndicators} 项指标，通过 ${passedIndicators} 项
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    showScreen('assessmentRecordsScreen');
}

// 显示多次评估分析
function showMultiAssessmentAnalysis() {
    // 记录当前页面到历史
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen && currentScreen.id !== 'multiAnalysisScreen') {
        AppState.navigationHistory.push(currentScreen.id);
    }
    
    const container = document.getElementById('analysisContainer');
    const assessments = AppState.assessments;
    
    if (assessments.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 60px 20px; text-align: center;">暂无评估记录，无法进行分析</div>';
        showScreen('multiAnalysisScreen');
        return;
    }
    
    if (assessments.length < 2) {
        container.innerHTML = '<div class="empty-state" style="padding: 60px 20px; text-align: center;">至少需要2次评估记录才能进行趋势分析</div>';
        showScreen('multiAnalysisScreen');
        return;
    }
    
    // 确保指标数据已加载
    if (AppState.indicators.length === 0) {
        loadIndicators().then(() => {
            generateMultiAnalysis(container);
        });
    } else {
        generateMultiAnalysis(container);
    }
}

// 生成多次评估分析
function generateMultiAnalysis(container) {
    const assessments = AppState.assessments;
    
    // 计算总体统计
    const totalAssessments = assessments.length;
    const latestAssessment = assessments[0];
    const oldestAssessment = assessments[assessments.length - 1];
    
    const latestTotal = latestAssessment.results.length;
    const latestPassed = latestAssessment.results.filter(r => r.status === '符合').length;
    const latestScore = latestTotal > 0 ? Math.round((latestPassed / latestTotal) * 100) : 0;
    
    const oldestTotal = oldestAssessment.results.length;
    const oldestPassed = oldestAssessment.results.filter(r => r.status === '符合').length;
    const oldestScore = oldestTotal > 0 ? Math.round((oldestPassed / oldestTotal) * 100) : 0;
    
    const scoreChange = latestScore - oldestScore;
    const scoreChangeText = scoreChange > 0 ? `+${scoreChange}%` : `${scoreChange}%`;
    const trend = scoreChange > 0 ? '上升' : scoreChange < 0 ? '下降' : '持平';
    
    // 按领域分析趋势
    const domainTrends = {};
    const allDomains = [...new Set(AppState.indicators.map(i => i.domain))];
    
    allDomains.forEach(domain => {
        const trendData = assessments.map(assessment => {
            const domainResults = assessment.results.filter(r => {
                const indicator = AppState.indicators.find(i => i.name === r.indicatorId);
                return indicator && indicator.domain === domain;
            });
            
            if (domainResults.length === 0) return null;
            
            const passed = domainResults.filter(r => r.status === '符合').length;
            const score = Math.round((passed / domainResults.length) * 100);
            
            return {
                date: new Date(assessment.date),
                score: score,
                total: domainResults.length,
                passed: passed
            };
        }).filter(d => d !== null);
        
        if (trendData.length > 0) {
            domainTrends[domain] = trendData;
        }
    });
    
    container.innerHTML = `
        <div class="analysis-summary-card">
            <h3>📊 总体趋势</h3>
            <div class="analysis-stats">
                <div class="analysis-stat-item">
                    <div class="analysis-stat-value">${totalAssessments}</div>
                    <div class="analysis-stat-label">评估次数</div>
                </div>
                <div class="analysis-stat-item">
                    <div class="analysis-stat-value">${latestScore}%</div>
                    <div class="analysis-stat-label">最新得分</div>
                </div>
                <div class="analysis-stat-item">
                    <div class="analysis-stat-value" style="color: ${scoreChange > 0 ? 'var(--success-color)' : scoreChange < 0 ? 'var(--danger-color)' : 'var(--text-secondary)'};">${scoreChangeText}</div>
                    <div class="analysis-stat-label">变化趋势</div>
                </div>
                <div class="analysis-stat-item">
                    <div class="analysis-stat-value">${trend}</div>
                    <div class="analysis-stat-label">整体${trend}</div>
                </div>
            </div>
        </div>
        
        ${Object.entries(domainTrends).map(([domain, trendData]) => {
            const firstScore = trendData[trendData.length - 1].score;
            const lastScore = trendData[0].score;
            const domainChange = lastScore - firstScore;
            const domainChangeText = domainChange > 0 ? `+${domainChange}%` : `${domainChange}%`;
            
            return `
                <div class="domain-trend-card">
                    <div class="domain-trend-header">
                        <h4>${domain}</h4>
                        <span style="font-size: 14px; color: ${domainChange > 0 ? 'var(--success-color)' : domainChange < 0 ? 'var(--danger-color)' : 'var(--text-secondary)'};">
                            ${domainChangeText}
                        </span>
                    </div>
                    <div class="trend-indicators">
                        ${trendData.reverse().map((data, index) => {
                            const dateStr = data.date.toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric'
                            });
                            return `
                                <div class="trend-item">
                                    <span class="trend-date">${dateStr}</span>
                                    <span class="trend-score">${data.score}% (${data.passed}/${data.total})</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;
    
    showScreen('multiAnalysisScreen');
}

// 更新简化的学生信息卡片
function updateStudentCardMini() {
    const nameEl = document.getElementById('displayName');
    const ageEl = document.getElementById('displayAge');
    
    if (!AppState.student) {
        if (nameEl) nameEl.textContent = '未设置';
        if (ageEl) ageEl.textContent = '请先填写学生信息';
        return;
    }
    
    const student = AppState.student;
    if (nameEl) nameEl.textContent = student.name || '未设置';
    
    // 计算年龄
    if (ageEl) {
        if (student.birthDate) {
            const age = calculateAge(student.birthDate);
            ageEl.textContent = `${age}岁`;
        } else {
            ageEl.textContent = student.gender || '';
        }
    }
}

// 计算年龄
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

// 更新推荐
function updateRecommendations() {
    const container = document.getElementById('recommendationContent');
    if (!container) return;
    if (!AppState.student || !AppState.student.birthDate) {
        container.innerHTML = '<p class="empty-state">请先填写学生信息</p>';
        return;
    }
    
    const age = calculateAge(AppState.student.birthDate);
    const lastAssessment = getLastAssessment();
    const daysSinceLastAssessment = lastAssessment 
        ? Math.floor((new Date() - new Date(lastAssessment.date)) / (1000 * 60 * 60 * 24))
        : Infinity;
    
    const recommendations = [];
    
    // 根据时间推荐
    if (daysSinceLastAssessment > 90 || !lastAssessment) {
        recommendations.push({
            title: '全面测评',
            description: daysSinceLastAssessment > 90 
                ? `距离上次测评已过去${daysSinceLastAssessment}天，建议进行全面测评`
                : '建议进行首次全面测评，了解孩子当前发展水平'
        });
    } else if (daysSinceLastAssessment > 30) {
        recommendations.push({
            title: '定期测评',
            description: `距离上次测评已过去${daysSinceLastAssessment}天，建议进行定期测评`
        });
    }
    
    // 根据年龄推荐领域
    const recommendedDomains = getRecommendedDomains(age);
    if (recommendedDomains.length > 0) {
        recommendations.push({
            title: '重点领域',
            description: `建议重点关注：${recommendedDomains.join('、')}`
        });
    }
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无推荐</p>';
        return;
    }
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
        </div>
    `).join('');
}

// 获取推荐领域
function getRecommendedDomains(age) {
    const domainMap = {
        3: ['健康与体能', '语言与交流'],
        4: ['健康与体能', '语言与交流', '社会与情感'],
        5: ['健康与体能', '语言与交流', '社会与情感', '探索与认知'],
        6: ['健康与体能', '语言与交流', '社会与情感', '探索与认知', '艺术与创造']
    };
    
    return domainMap[age] || domainMap[6] || [];
}

// 已移除：更新最近记录（评估）函数，使用日常记录的更新替代（如需要）

// 加载指标数据
async function loadIndicators() {
    try {
        const response = await fetch('indicators.json');
        AppState.indicators = await response.json();
        return Promise.resolve();
    } catch (error) {
        console.error('加载指标数据失败:', error);
        return Promise.reject(error);
    }
}

// ==================== 对话式测评功能 ====================

// 进度消息状态
let lastProgressMessage = 0;

// 开始对话式测评
function startChatAssessment() {
    if (!AppState.student) {
        showToast('请先填写学生信息');
        return;
    }
    
    // 初始化测评状态
    AppState.chatAssessment = {
        currentIndicatorIndex: -1,
        completedIndicators: [],
        remainingIndicators: [...AppState.indicators],
        currentIndicator: null,
        isActive: true,
        results: [],
        milestones: {} // 记录已显示的里程碑
    };
    
    // 重置进度消息
    lastProgressMessage = 0;
    
    // 清空聊天记录
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    // 显示测评页面
    showScreen('assessmentScreen');
    
    // 显示欢迎消息
    const studentName = AppState.student.name || '小朋友';
    const welcomeMessage = `
        <div class="chat-message ai">
            <div class="message-avatar ai">🤖</div>
            <div class="message-content">
                <div class="message-text">
                    您好！我是AI测评助手，很高兴为您服务。让我们开始为${studentName}进行发展测评吧！
                </div>
                <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
                    我会逐步引导您完成各项指标的评估，您只需要根据实际情况选择"符合"、"部分符合"或"不符合"即可。
                </div>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', welcomeMessage);
    scrollToBottom();
    
    // 清空快速操作按钮（等待第一个指标）
    document.getElementById('quickActions').innerHTML = '';
    
    // 更新进度显示
    const total = AppState.indicators.length;
    document.getElementById('progressText').textContent = `0/${total}`;
    
    // 初始化流程显示
    initializeProcessDisplay();
    
    // 智能选择第一个指标并开始对话
    setTimeout(() => {
        selectNextIndicator();
    }, 1500);
}

// AI智能选择下一个指标
function selectNextIndicator() {
    const chat = AppState.chatAssessment;
    
    if (chat.remainingIndicators.length === 0) {
        completeAssessment();
        return;
    }
    
    // 智能选择策略：优先选择重要领域，然后按顺序
    let nextIndicator = null;
    
    // 1. 如果有未完成的领域，优先选择该领域的指标
    const completedDomains = new Set(chat.completedIndicators.map(i => i.domain));
    const incompleteDomains = chat.remainingIndicators
        .filter(i => !completedDomains.has(i.domain))
        .map(i => i.domain);
    
    if (incompleteDomains.length > 0) {
        const targetDomain = incompleteDomains[0];
        nextIndicator = chat.remainingIndicators.find(i => i.domain === targetDomain);
    }
    
    // 2. 如果没有未完成的领域，按顺序选择
    if (!nextIndicator) {
        nextIndicator = chat.remainingIndicators[0];
    }
    
    // 3. 如果学生年龄较小，优先测评基础领域
    if (AppState.student && AppState.student.birthDate) {
        const age = calculateAge(AppState.student.birthDate);
        if (age <= 4) {
            const basicDomains = ['健康与体能', '语言与交流'];
            const basicIndicator = chat.remainingIndicators.find(i => 
                basicDomains.includes(i.domain)
            );
            if (basicIndicator) {
                nextIndicator = basicIndicator;
            }
        }
    }
    
    chat.currentIndicator = nextIndicator;
    chat.currentIndicatorIndex = chat.remainingIndicators.indexOf(nextIndicator);
    
    // 检查是否完成了一个领域
    checkDomainCompletion();
    
    // 更新流程显示
    updateProcessDisplay(nextIndicator);
    
    // 显示AI消息
    showAIMessage(nextIndicator);
    updateProgress();
    updateQuickActions();
}

// 显示AI消息
function showAIMessage(indicator) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // 生成友好的问候语
    const greetings = [
        '让我来了解一下',
        '接下来我们看看',
        '现在来评估一下',
        '让我们检查一下',
        '现在了解一下',
        '接下来评估一下'
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const messageHTML = `
        <div class="chat-message ai">
            <div class="message-avatar ai">🤖</div>
            <div class="message-content">
                <div class="message-text">
                    ${greeting} <strong>${indicator.name}</strong> 的情况吧。
                </div>
                <div class="message-indicator">
                    <div class="message-indicator-name">${indicator.name}</div>
                    <div class="message-indicator-desc">${indicator.description}</div>
                </div>
                <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
                    <strong>领域：</strong>${indicator.domain} · ${indicator.subdomain}
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();
}

// 处理用户回答
function handleUserAnswer(status, notes = '') {
    const chat = AppState.chatAssessment;
    const indicator = chat.currentIndicator;
    
    if (!indicator) return;
    
    // 保存结果
    chat.results.push({
        indicatorId: indicator.name,
        indicator: indicator,
        status: status,
        notes: notes,
        timestamp: new Date().toISOString()
    });
    
    // 标记为已完成
    chat.completedIndicators.push(indicator);
    chat.remainingIndicators = chat.remainingIndicators.filter(i => i.name !== indicator.name);
    
    // 显示用户回答
    showUserMessage(status, notes);
    
    // 延迟后选择下一个指标
    setTimeout(() => {
        selectNextIndicator();
    }, 800);
}

// 显示用户消息
function showUserMessage(status, notes = '') {
    const messagesContainer = document.getElementById('chatMessages');
    
    const statusText = {
        '符合': '✓ 符合',
        '部分符合': '~ 部分符合',
        '不符合': '✗ 不符合'
    };
    
    const statusClass = {
        '符合': 'success',
        '部分符合': 'partial',
        '不符合': 'fail'
    };
    
    let messageHTML = `
        <div class="chat-message user">
            <div class="message-avatar user">👤</div>
            <div class="message-content">
                <div class="message-text">${statusText[status]}</div>
    `;
    
    if (notes) {
        messageHTML += `<div style="margin-top: 5px; font-size: 13px; opacity: 0.9;">${notes}</div>`;
    }
    
    messageHTML += `</div></div>`;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();
    
    // 清空输入框
    document.getElementById('chatInput').value = '';
    document.getElementById('chatInput').style.height = 'auto';
}

// 更新快速操作按钮
function updateQuickActions() {
    const quickActions = document.getElementById('quickActions');
    
    quickActions.innerHTML = `
        <button class="quick-action-btn success" onclick="handleQuickAnswer('符合')">
            ✓ 符合
        </button>
        <button class="quick-action-btn partial" onclick="handleQuickAnswer('部分符合')">
            ~ 部分符合
        </button>
        <button class="quick-action-btn fail" onclick="handleQuickAnswer('不符合')">
            ✗ 不符合
        </button>
    `;
}

// 处理快速回答
function handleQuickAnswer(status) {
    const notes = document.getElementById('chatInput').value.trim();
    handleUserAnswer(status, notes);
}

// 发送消息（用于备注）
function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const chat = AppState.chatAssessment;
    
    // 如果当前有正在测评的指标，将文本作为备注
    if (chat.currentIndicator && chat.results.length > 0) {
        const lastResult = chat.results[chat.results.length - 1];
        if (lastResult && lastResult.indicatorId === chat.currentIndicator.name) {
            // 如果当前指标已有回答，添加备注
            lastResult.notes = (lastResult.notes ? lastResult.notes + ' ' : '') + text;
            showUserMessage(lastResult.status, text);
            input.value = '';
            input.style.height = 'auto';
            return;
        }
    }
    
    // 如果没有当前指标或没有回答，先回答"符合"并添加备注
    if (chat.currentIndicator) {
        handleUserAnswer('符合', text);
    }
    
    input.value = '';
    input.style.height = 'auto';
}

// 初始化流程显示
function initializeProcessDisplay() {
    // 获取所有领域
    const allDomains = [...new Set(AppState.indicators.map(i => i.domain))];
    
    // 生成领域徽章
    const domainProgress = document.getElementById('domainProgress');
    domainProgress.innerHTML = allDomains.map(domain => 
        `<span class="domain-badge" data-domain="${domain}">${domain}</span>`
    ).join('');
    
    // 更新进度条
    updateProgressBar(0);
}

// 更新流程显示
function updateProcessDisplay(indicator) {
    if (!indicator) return;
    
    // 更新当前阶段
    document.getElementById('stageValue').textContent = indicator.domain;
    
    // 更新领域徽章状态
    updateDomainBadges(indicator.domain);
    
    // 更新进度条
    const chat = AppState.chatAssessment;
    const total = AppState.indicators.length;
    const completed = chat.completedIndicators.length;
    const progress = (completed / total) * 100;
    updateProgressBar(progress);
}

// 更新进度条
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBarFill');
    if (progressBar) {
        progressBar.style.width = `${Math.min(percentage, 100)}%`;
    }
}

// 更新领域徽章
function updateDomainBadges(currentDomain) {
    const chat = AppState.chatAssessment;
    const completedDomains = new Set(chat.completedIndicators.map(i => i.domain));
    
    document.querySelectorAll('.domain-badge').forEach(badge => {
        const domain = badge.getAttribute('data-domain');
        badge.classList.remove('active', 'completed');
        
        if (completedDomains.has(domain)) {
            badge.classList.add('completed');
        } else if (domain === currentDomain) {
            badge.classList.add('active');
        }
    });
}

// 检查领域完成情况
function checkDomainCompletion() {
    const chat = AppState.chatAssessment;
    const completedDomains = new Set(chat.completedIndicators.map(i => i.domain));
    const allDomains = [...new Set(AppState.indicators.map(i => i.domain))];
    
    // 检查每个领域是否完成
    allDomains.forEach(domain => {
        const domainIndicators = AppState.indicators.filter(i => i.domain === domain);
        const completedDomainIndicators = chat.completedIndicators.filter(i => i.domain === domain);
        
        // 如果领域的所有指标都完成了，且之前没有显示过里程碑
        if (domainIndicators.length === completedDomainIndicators.length && 
            completedDomainIndicators.length > 0) {
            // 检查是否已经显示过这个领域的里程碑
            if (!chat.milestones[domain]) {
                chat.milestones[domain] = true;
                showDomainMilestone(domain);
            }
        }
    });
}

// 显示领域完成里程碑
function showDomainMilestone(domain) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const milestoneHTML = `
        <div class="chat-message ai">
            <div class="message-avatar ai">🎉</div>
            <div class="message-content">
                <div class="milestone-message">
                    <div class="milestone-title">✨ 完成 ${domain} 领域</div>
                    <div class="milestone-text">太棒了！${domain}领域的测评已完成，让我们继续下一个领域吧！</div>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', milestoneHTML);
    scrollToBottom();
}

// 更新进度
function updateProgress() {
    const chat = AppState.chatAssessment;
    const total = AppState.indicators.length;
    const completed = chat.completedIndicators.length;
    const remaining = chat.remainingIndicators.length;
    
    document.getElementById('progressText').textContent = `${completed}/${total}`;
    
    // 更新进度条
    const progress = (completed / total) * 100;
    updateProgressBar(progress);
    
    // 显示阶段性提示
    if (completed > 0 && completed % 10 === 0 && completed !== lastProgressMessage) {
        lastProgressMessage = completed;
        const percentage = Math.round((completed / total) * 100);
        setTimeout(() => {
            showAITypingMessage(`进展顺利！已完成 ${percentage}%，继续加油！`);
        }, 1000);
    }
    
    // 如果接近完成，显示完成提示（避免重复显示）
    if (remaining <= 5 && remaining > 0 && remaining !== lastProgressMessage) {
        lastProgressMessage = remaining;
        setTimeout(() => {
            showAITypingMessage(`很好！还有 ${remaining} 个指标就完成了，加油！`);
        }, 1000);
    }
}

// 显示AI输入中消息
function showAITypingMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageHTML = `
        <div class="chat-message ai">
            <div class="message-avatar ai">🤖</div>
            <div class="message-content">
                <div class="message-text" style="color: var(--text-secondary); font-style: italic;">
                    ${text}
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();
}

// 完成测评
function completeAssessment() {
    const chat = AppState.chatAssessment;
    
    // 更新进度条到100%
    updateProgressBar(100);
    
    // 更新所有领域徽章为完成状态
    document.querySelectorAll('.domain-badge').forEach(badge => {
        badge.classList.remove('active');
        badge.classList.add('completed');
    });
    
    // 显示完成里程碑
    const messagesContainer = document.getElementById('chatMessages');
    const milestoneHTML = `
        <div class="chat-message ai">
            <div class="message-avatar ai">🎊</div>
            <div class="message-content">
                <div class="milestone-message">
                    <div class="milestone-title">🎉 测评全部完成！</div>
                    <div class="milestone-text">恭喜！所有领域的测评都已完成，让我为您生成详细的评估报告...</div>
                </div>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', milestoneHTML);
    scrollToBottom();
    
    // 更新阶段显示
    document.getElementById('stageValue').textContent = '生成报告中...';
    
    // 保存测评结果
    setTimeout(async () => {
        const assessment = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            studentId: AppState.student.name,
            results: chat.results.map(r => ({
                indicatorId: r.indicatorId,
                status: r.status,
                notes: r.notes
            }))
        };
        
        // 保存到 Supabase 或 localStorage
        await saveAssessmentToDB(assessment);
        AppState.assessments.unshift(assessment);
        
        // 重置状态
        AppState.chatAssessment.isActive = false;
        
        // 更新主页（如需要）
        updateRecentDailyRecords();
        
        // 记录当前页面到历史
        AppState.navigationHistory.push('assessmentScreen');
        
        // 显示结果
        showAssessmentResult(assessment.id);
    }, 2000);
}

// 退出测评
async function exitAssessment() {
    const chat = AppState.chatAssessment;
    if (chat.isActive && chat.results.length > 0) {
        if (confirm('测评尚未完成，是否保存当前进度？')) {
            const assessment = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                studentId: AppState.student.name,
                results: chat.results.map(r => ({
                    indicatorId: r.indicatorId,
                    status: r.status,
                    notes: r.notes
                }))
            };
            
            await saveAssessmentToDB(assessment);
            AppState.assessments.unshift(assessment);
            updateRecentDailyRecords();
        }
    }
    
    AppState.chatAssessment.isActive = false;
    // 返回日常记录页面
    goBack();
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// 保存测评
async function saveAssessment() {
    if (!AppState.currentAssessment || !AppState.student) {
        showToast('请先填写学生信息');
        return;
    }
    
    const assessment = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        studentId: AppState.student.name,
        results: AppState.currentAssessment.results.filter(r => r.status !== null)
    };
    
    if (assessment.results.length === 0) {
        showToast('请至少完成一项指标的测评');
        return;
    }
    
    await saveAssessmentToDB(assessment);
    AppState.assessments.unshift(assessment);
    
    // 重置当前测评状态
    AppState.currentAssessment = null;
    
    // 更新主页的最近日常记录（如有）
    updateRecentDailyRecords();
    
    showToast('测评结果已保存');
    showAssessmentResult(assessment.id);
}

// 保存测评到数据库（Supabase 或 localStorage）
async function saveAssessmentToDB(assessment) {
    if (supabase && AppState.user) {
        try {
            const dbAssessment = convertAppToDb(assessment);
            const { error } = await supabase
                .from('assessments')
                .insert({
                    ...dbAssessment,
                    user_id: AppState.user.id
                });
            
            if (error) throw error;
        } catch (error) {
            console.error('保存测评失败:', error);
            // 后备：使用 localStorage
            const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
            saved.unshift(assessment);
            localStorage.setItem('assessments', JSON.stringify(saved));
        }
    } else {
        // 后备：使用 localStorage
        const saved = JSON.parse(localStorage.getItem('assessments') || '[]');
        saved.unshift(assessment);
        localStorage.setItem('assessments', JSON.stringify(saved));
    }
}

// 加载测评记录
async function loadAssessments() {
    if (supabase && AppState.user) {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('user_id', AppState.user.id)
                .order('date', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
                AppState.assessments = data;
                return;
            }
        } catch (error) {
            console.error('加载测评记录失败:', error);
        }
    }
    
    // 后备：使用 localStorage
    const saved = localStorage.getItem('assessments');
    if (saved) {
        AppState.assessments = JSON.parse(saved);
    }
}

// 加载日常记录
async function loadDailyRecords() {
    if (supabase && AppState.user) {
        try {
            const { data, error } = await supabase
                .from('daily_records')
                .select('*')
                .eq('user_id', AppState.user.id)
                .order('date', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
                AppState.dailyRecords = data;
                return;
            }
        } catch (error) {
            console.error('加载日常记录失败:', error);
        }
    }
    
    // 后备：使用 localStorage
    const saved = localStorage.getItem('dailyRecords');
    if (saved) {
        AppState.dailyRecords = JSON.parse(saved);
    }
}

// 保存日常记录
async function saveDailyRecords() {
    if (supabase && AppState.user) {
        // Supabase 模式下，记录会在保存时单独插入
        return;
    }
    
    // 后备：使用 localStorage
    localStorage.setItem('dailyRecords', JSON.stringify(AppState.dailyRecords));
}

// 初始化日常记录页面
function initDailyRecordScreen() {
    updateRecentDailyRecords();
    initQuickActivityOptions();
}

// 初始化快速活动选项（按一天时间顺序）
function initQuickActivityOptions() {
    const track = document.getElementById('activitySliderTrack');
    const indicators = document.getElementById('sliderIndicators');
    if (!track || !indicators) return;
    
    // 按一天的时间顺序排列活动（扩展版 - 适合幼儿发展）
    const dailyActivities = [
        // 早上活动
        { text: '起床', icon: '🌅', time: '早上', timeLabel: '7:00' },
        { text: '洗漱', icon: '🚿', time: '早上', timeLabel: '7:30' },
        { text: '早餐', icon: '🥣', time: '早上', timeLabel: '8:00' },
        { text: '穿衣', icon: '👕', time: '早上', timeLabel: '8:30' },
        { text: '自己穿鞋', icon: '👟', time: '早上', timeLabel: '8:40' },
        
        // 上午活动 - 大运动和认知
        { text: '上学', icon: '🎒', time: '上午', timeLabel: '9:00' },
        { text: '户外活动', icon: '🌳', time: '上午', timeLabel: '9:30' },
        { text: '爬行', icon: '🐛', time: '上午', timeLabel: '10:00' },
        { text: '跳跃', icon: '🦘', time: '上午', timeLabel: '10:10' },
        { text: '平衡', icon: '⚖️', time: '上午', timeLabel: '10:20' },
        { text: '游戏', icon: '🎮', time: '上午', timeLabel: '10:30' },
        { text: '运动', icon: '🏃', time: '上午', timeLabel: '10:40' },
        { text: '投掷', icon: '⚾', time: '上午', timeLabel: '10:50' },
        { text: '画画', icon: '🎨', time: '上午', timeLabel: '11:00' },
        { text: '涂鸦', icon: '✏️', time: '上午', timeLabel: '11:10' },
        { text: '串珠', icon: '📿', time: '上午', timeLabel: '11:20' },
        { text: '撕纸', icon: '📄', time: '上午', timeLabel: '11:30' },
        
        // 中午活动
        { text: '午餐', icon: '🍽️', time: '中午', timeLabel: '12:00' },
        { text: '自己吃饭', icon: '🥄', time: '中午', timeLabel: '12:30' },
        { text: '午睡', icon: '😴', time: '中午', timeLabel: '13:00' },
        
        // 下午活动 - 精细动作和认知
        { text: '阅读', icon: '📚', time: '下午', timeLabel: '14:30' },
        { text: '听故事', icon: '👂', time: '下午', timeLabel: '14:40' },
        { text: '积木', icon: '🧱', time: '下午', timeLabel: '15:00' },
        { text: '拼图', icon: '🧩', time: '下午', timeLabel: '15:10' },
        { text: '捏泥', icon: '🫖', time: '下午', timeLabel: '15:20' },
        { text: '分类', icon: '📦', time: '下午', timeLabel: '15:30' },
        { text: '配对', icon: '🔗', time: '下午', timeLabel: '15:40' },
        { text: '数数', icon: '🔢', time: '下午', timeLabel: '15:50' },
        { text: '观察', icon: '🔍', time: '下午', timeLabel: '16:00' },
        { text: '分享', icon: '🤝', time: '下午', timeLabel: '16:10' },
        { text: '合作游戏', icon: '👥', time: '下午', timeLabel: '16:20' },
        { text: '排队', icon: '👫', time: '下午', timeLabel: '16:30' },
        { text: '唱歌', icon: '🎵', time: '下午', timeLabel: '16:40' },
        { text: '跳舞', icon: '💃', time: '下午', timeLabel: '16:50' },
        { text: '模仿', icon: '🎭', time: '下午', timeLabel: '17:00' },
        { text: '整理玩具', icon: '🧸', time: '下午', timeLabel: '17:10' },
        
        // 晚上活动
        { text: '晚餐', icon: '🍜', time: '晚上', timeLabel: '18:00' },
        { text: '洗手', icon: '🧼', time: '晚上', timeLabel: '18:30' },
        { text: '洗澡', icon: '🛁', time: '晚上', timeLabel: '19:00' },
        { text: '睡前故事', icon: '📖', time: '晚上', timeLabel: '20:00' },
        { text: '说话', icon: '💬', time: '晚上', timeLabel: '20:10' },
        { text: '睡觉', icon: '🌙', time: '晚上', timeLabel: '21:00' }
    ];
    
    // 按时间段分组
    const timeGroups = {
        '早上': [],
        '上午': [],
        '中午': [],
        '下午': [],
        '晚上': []
    };
    
    dailyActivities.forEach(activity => {
        timeGroups[activity.time].push(activity);
    });
    
    // 生成HTML
    track.innerHTML = dailyActivities.map(activity => `
        <div class="activity-option-card" data-time="${activity.time}" onclick="selectQuickActivity('${activity.text}', '${activity.icon}')">
            <span class="activity-option-icon">${activity.icon}</span>
            <span class="activity-option-label">${activity.text}</span>
            <span class="activity-option-time">${activity.timeLabel}</span>
        </div>
    `).join('');
    
    // 生成指示器
    const timeGroupsArray = Object.keys(timeGroups);
    indicators.innerHTML = timeGroupsArray.map((time, index) => `
        <div class="slider-indicator ${index === 0 ? 'active' : ''}" data-time="${time}"></div>
    `).join('');
    
    // 添加滑动监听
    const container = track.parentElement;
    let currentTimeGroup = '早上';
    let scrollTimeout;
    
    container.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateTimeDisplay(container, track, indicators);
        }, 100);
    });
    
    // 初始化时间显示（设置初始时间段类名）
    updateTimeDisplay(container, track, indicators);
    
    // 平滑滚动到当前时间段
    scrollToCurrentTime(container, track);
    
    // 初始化时也更新时间显示
    setTimeout(() => {
        updateTimeDisplay(container, track, indicators);
    }, 100);
}

// 更新时间显示和指示器
function updateTimeDisplay(container, track, indicators) {
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const centerX = scrollLeft + containerWidth / 2;
    
    // 找到中心位置的活动卡片
    const cards = track.querySelectorAll('.activity-option-card');
    let currentCard = null;
    let minDistance = Infinity;
    
    cards.forEach(card => {
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const cardCenter = cardLeft + cardWidth / 2;
        const distance = Math.abs(cardCenter - centerX);
        
        if (distance < minDistance) {
            minDistance = distance;
            currentCard = card;
        }
    });
    
    if (currentCard) {
        const time = currentCard.getAttribute('data-time');
        const timeDisplay = document.getElementById('currentTimeDisplay');
        const sliderContainer = document.getElementById('quickActivitySlider');
        
        if (timeDisplay) {
            timeDisplay.textContent = time;
        }
        
        // 更新滑动容器的类名，触发背景渐变和动画效果
        if (sliderContainer) {
            // 移除所有时间段类名
            sliderContainer.classList.remove('time-morning', 'time-noon', 'time-afternoon', 'time-evening', 'time-night');
            
            // 根据时间段添加对应的类名
            const timeClassMap = {
                '早上': 'time-morning',
                '上午': 'time-morning',
                '中午': 'time-noon',
                '下午': 'time-afternoon',
                '晚上': 'time-evening'
            };
            
            const timeClass = timeClassMap[time] || 'time-morning';
            sliderContainer.classList.add(timeClass);
            
            // 如果是晚上，添加夜晚类名（用于月亮动画）
            if (time === '晚上') {
                sliderContainer.classList.add('time-night');
            }
        }
        
        // 更新指示器
        indicators.querySelectorAll('.slider-indicator').forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.getAttribute('data-time') === time) {
                indicator.classList.add('active');
            }
        });
    }
}

// 滚动到当前时间段
function scrollToCurrentTime(container, track) {
    const now = new Date();
    const hour = now.getHours();
    
    let targetTime = '早上';
    if (hour >= 9 && hour < 12) targetTime = '上午';
    else if (hour >= 12 && hour < 14) targetTime = '中午';
    else if (hour >= 14 && hour < 18) targetTime = '下午';
    else if (hour >= 18) targetTime = '晚上';
    
    // 找到第一个该时间段的卡片
    const cards = track.querySelectorAll('.activity-option-card');
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].getAttribute('data-time') === targetTime) {
            const cardLeft = cards[i].offsetLeft;
            const containerWidth = container.clientWidth;
            const scrollTo = cardLeft - (containerWidth / 2) + (cards[i].offsetWidth / 2);
            container.scrollTo({ left: scrollTo, behavior: 'smooth' });
            
            // 等待滚动完成后更新时间显示
            setTimeout(() => {
                const indicators = document.getElementById('sliderIndicators');
                if (indicators) {
                    updateTimeDisplay(container, track, indicators);
                }
            }, 500);
            break;
        }
    }
}

// 选择快速活动
function selectQuickActivity(activity, icon) {
    const input = document.getElementById('activityDescription');
    const currentText = input.value.trim();
    
    // 如果输入框为空，直接填入；否则追加
    if (currentText === '') {
        input.value = `今天${activity}，`;
    } else {
        input.value = currentText + ` ${activity}，`;
    }
    
    // 聚焦到输入框
    input.focus();
    
    // 滚动到输入区域
    setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// 清空活动输入
function clearActivityInput() {
    const input = document.getElementById('activityDescription');
    input.value = '';
    input.focus();
    
    // 隐藏总结按钮
    const summaryBtn = document.getElementById('summaryBtn');
    if (summaryBtn) {
        summaryBtn.style.display = 'none';
    }
}

// 生成总结故事
function generateSummary() {
    const input = document.getElementById('activityDescription');
    const activityText = input.value.trim();
    
    if (!activityText) {
        showToast('请输入活动描述');
        return;
    }
    
    const record = AppState.currentDailyRecord;
    const results = record.results.filter(r => r.status !== null);
    
    // 如果没有分析过指标，直接基于输入内容生成简单总结
    if (results.length === 0 || !record.matchedIndicators || record.matchedIndicators.length === 0) {
        generateSimpleSummary(activityText);
        return;
    }
    
    // 构建故事
    let story = record.activity.trim();
    if (!story.endsWith('。') && !story.endsWith('，') && !story.endsWith('.')) {
        story += '。';
    }
    
    // 按状态分组
    const passed = results.filter(r => r.status === '符合');
    const partial = results.filter(r => r.status === '部分符合');
    const failed = results.filter(r => r.status === '不符合');
    
    // 获取指标详情
    const getIndicatorDetails = (indicatorId) => {
        return record.matchedIndicators.find(i => i.name === indicatorId);
    };
    
    // 生成符合的描述
    if (passed.length > 0) {
        story += '\n\n在以下方面表现良好：';
        passed.forEach((result, index) => {
            const indicator = getIndicatorDetails(result.indicatorId);
            if (indicator) {
                story += `\n• ${indicator.name}：${indicator.description}`;
            }
        });
    }
    
    // 生成部分符合的描述
    if (partial.length > 0) {
        story += '\n\n在以下方面有进步空间：';
        partial.forEach((result, index) => {
            const indicator = getIndicatorDetails(result.indicatorId);
            if (indicator) {
                story += `\n• ${indicator.name}：部分达到要求，${indicator.description}`;
            }
        });
    }
    
    // 生成不符合的描述
    if (failed.length > 0) {
        story += '\n\n需要继续努力的方面：';
        failed.forEach((result, index) => {
            const indicator = getIndicatorDetails(result.indicatorId);
            if (indicator) {
                story += `\n• ${indicator.name}：还需要加强，${indicator.description}`;
            }
        });
    }
    
    // 添加总结
    const totalCount = results.length;
    const passedCount = passed.length;
    const progressRate = Math.round((passedCount / totalCount) * 100);
    
    story += `\n\n总体评价：在${totalCount}个相关指标中，有${passedCount}个完全符合，整体表现${progressRate >= 70 ? '优秀' : progressRate >= 50 ? '良好' : '有待提升'}。`;
    
    // 填入输入框（重用已声明的 input 变量）
    input.value = story;
    
    // 自动调整高度
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 300) + 'px';
    
    // 聚焦并滚动
    input.focus();
    setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    showToast('总结已生成');
    
    // 将“总结”按钮变为“分析”按钮
    const summaryBtnEl = document.getElementById('summaryBtn');
    const analyzeBtnEl = document.getElementById('analyzeActivityBtn');
    if (summaryBtnEl) {
        // 隐藏原“分析”按钮，避免重复
        if (analyzeBtnEl) {
            analyzeBtnEl.style.display = 'none';
        }
        // 修改按钮外观与行为为“分析”
        summaryBtnEl.textContent = '分析';
        summaryBtnEl.classList.remove('btn-secondary');
        summaryBtnEl.classList.add('btn-primary');
        summaryBtnEl.onclick = function() {
            analyzeActivity();
        };
    }
}

// 生成简单总结（基于输入内容，无需分析指标）
function generateSimpleSummary(activityText) {
    const input = document.getElementById('activityDescription');
    let story = activityText.trim();
    
    // 确保以句号结尾
    if (!story.endsWith('。') && !story.endsWith('，') && !story.endsWith('.') && !story.endsWith('！') && !story.endsWith('？')) {
        story += '。';
    }
    
    // 添加总结性描述
    story += '\n\n这是一次有意义的活动记录。';
    
    // 尝试从描述中提取关键信息
    const text = activityText.toLowerCase();
    const observations = [];
    
    // 检测积极词汇
    if (text.includes('能够') || text.includes('可以') || text.includes('会') || text.includes('独立')) {
        observations.push('孩子展现了良好的能力');
    }
    if (text.includes('协调') || text.includes('灵活') || text.includes('熟练')) {
        observations.push('动作协调性良好');
    }
    if (text.includes('专注') || text.includes('认真') || text.includes('投入')) {
        observations.push('注意力集中');
    }
    if (text.includes('分享') || text.includes('合作') || text.includes('交流')) {
        observations.push('社交能力有所体现');
    }
    if (text.includes('创造') || text.includes('想象') || text.includes('创新')) {
        observations.push('展现了创造力');
    }
    if (text.includes('情绪') || text.includes('开心') || text.includes('愉快')) {
        observations.push('情绪状态良好');
    }
    if (text.includes('语言') || text.includes('表达') || text.includes('说话')) {
        observations.push('语言表达能力有所体现');
    }
    
    if (observations.length > 0) {
        story += '\n\n观察要点：';
        observations.forEach(obs => {
            story += `\n• ${obs}`;
        });
    }
    
    story += '\n\n建议继续观察和记录孩子的表现，以便更好地了解其发展状况。';
    
    // 填入输入框
    input.value = story;
    
    // 自动调整高度
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 300) + 'px';
    
    // 聚焦并滚动
    input.focus();
    setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    showToast('总结已生成');
}

// 切换折叠
function toggleCollapse(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById('collapseIcon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
        icon.style.transform = 'rotate(0deg)';
    }
}

// 分析活动，匹配相关指标
function analyzeActivity() {
    const activityText = document.getElementById('activityDescription').value.trim();
    
    if (!activityText) {
        showToast('请输入活动描述');
        return;
    }
    
    if (!AppState.student) {
        showToast('请先填写学生信息');
        return;
    }
    
    // 显示加载状态
    const analyzeBtn = document.getElementById('analyzeActivityBtn');
    const analyzeBtnText = document.getElementById('analyzeBtnText');
    const analyzeBtnLoading = document.getElementById('analyzeBtnLoading');
    
    analyzeBtn.disabled = true;
    analyzeBtnText.style.display = 'none';
    analyzeBtnLoading.style.display = 'inline-block';
    
    // 模拟分析延迟（实际应该是即时分析）
    setTimeout(() => {
        // 智能匹配指标
        const matchedIndicators = matchIndicatorsByActivity(activityText);
        
        // 保存当前记录
        AppState.currentDailyRecord = {
            activity: activityText,
            matchedIndicators: matchedIndicators,
            results: []
        };
        
        // 显示匹配结果
        displayMatchedIndicators(matchedIndicators);
        
        // 显示加载中的总结视图
        showSummaryView('正在生成 AI 总结，请稍候...', true);
        
        // 调用 DeepSeek API 生成 AI 总结
        generateSummaryWithDeepSeek(activityText, matchedIndicators).then(summaryText => {
            showSummaryView(summaryText, false);
        }).catch(error => {
            console.error('生成 AI 总结失败:', error);
            // 如果 API 调用失败，使用简单的文本生成作为后备
            const summaryText = buildSimpleSummaryText(activityText);
            showSummaryView(summaryText, false);
            showToast('AI 总结生成失败，已使用简单总结');
        });
        
        // 恢复按钮状态
        analyzeBtn.disabled = false;
        analyzeBtnText.style.display = 'inline';
        analyzeBtnLoading.style.display = 'none';
    }, 800);
}

// 使用 DeepSeek API 生成总结
async function generateSummaryWithDeepSeek(activityText, matchedIndicators = []) {
    const config = window.DEEPSEEK_CONFIG;
    
    // 检查 API key 是否配置
    if (!config || !config.apiKey) {
        console.warn('DeepSeek API key 未配置，使用简单总结');
        return buildSimpleSummaryText(activityText);
    }
    
    // 构建提示词
    let prompt = `请根据以下儿童活动描述，生成一份专业、温暖、有教育意义的总结。总结应该：
1. 简洁明了地概括活动内容
2. 突出孩子的表现和进步
3. 指出可能涉及的发展领域
4. 给出积极的观察建议
5. 语言要温暖、鼓励，适合家长阅读

活动描述：${activityText}`;

    // 如果有匹配的指标，添加到提示词中
    if (matchedIndicators && matchedIndicators.length > 0) {
        prompt += `\n\n相关发展指标：\n`;
        matchedIndicators.slice(0, 5).forEach((indicator, index) => {
            prompt += `${index + 1}. ${indicator.name}（${indicator.domain}）：${indicator.description}\n`;
        });
    }
    
    prompt += `\n\n请生成一份200-300字的总结，使用中文，语言要自然流畅。`;
    
    try {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一位专业的儿童发展评估专家，擅长根据活动描述生成温暖、专业、有教育意义的总结。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('API 返回格式异常');
        }
    } catch (error) {
        console.error('DeepSeek API 调用失败:', error);
        // 如果 API 调用失败，返回简单总结
        return buildSimpleSummaryText(activityText);
    }
}

// 仅构建总结文本（不改动输入框）
function buildSimpleSummaryText(activityText) {
    let story = activityText.trim();
    if (!story) return '';
    if (!story.endsWith('。') && !story.endsWith('，') && !story.endsWith('.') && !story.endsWith('！') && !story.endsWith('？')) {
        story += '。';
    }
    story += '\n\n这是一次有意义的活动记录。';
    const text = activityText.toLowerCase();
    const observations = [];
    if (text.includes('能够') || text.includes('可以') || text.includes('会') || text.includes('独立')) {
        observations.push('孩子展现了良好的能力');
    }
    if (text.includes('协调') || text.includes('灵活') || text.includes('熟练')) {
        observations.push('动作协调性良好');
    }
    if (text.includes('专注') || text.includes('认真') || text.includes('投入')) {
        observations.push('注意力集中');
    }
    if (text.includes('分享') || text.includes('合作') || text.includes('交流')) {
        observations.push('社交能力有所体现');
    }
    if (text.includes('创造') || text.includes('想象') || text.includes('创新')) {
        observations.push('展现了创造力');
    }
    if (text.includes('情绪') || text.includes('开心') || text.includes('愉快')) {
        observations.push('情绪状态良好');
    }
    if (text.includes('语言') || text.includes('表达') || text.includes('说话')) {
        observations.push('语言表达能力有所体现');
    }
    if (observations.length > 0) {
        story += '\n\n观察要点：';
        observations.forEach(obs => {
            story += `\n• ${obs}`;
        });
    }
    story += '\n\n建议继续观察和记录孩子的表现，以便更好地了解其发展状况。';
    return story;
}

// 展示 AI 总结视图，替换输入区域，可关闭恢复
function showSummaryView(summaryText, isLoading = false) {
    const section = document.getElementById('activityInputSection');
    if (!section) return;
    // 仅首次保存原始内容
    if (!section.dataset.originalHtml) {
        section.dataset.originalHtml = section.innerHTML;
    }
    
    const contentClass = isLoading ? 'summary-content loading' : 'summary-content';
    const content = isLoading 
        ? `<div style="text-align: center; padding: 20px;"><div class="loading-spinner" style="display: inline-block; margin-right: 10px;">⏳</div>${escapeHtml(summaryText)}</div>`
        : escapeHtml(summaryText).replace(/\n/g, '<br>');
    
    section.innerHTML = `
        <div class="summary-card">
            <div class="summary-card-header">
                <div class="summary-card-title">🤖 AI 总结</div>
                <button class="summary-close-btn" onclick="closeSummaryView()">关闭</button>
            </div>
            <div class="${contentClass}">${content}</div>
        </div>
    `;
}

// 关闭总结视图，恢复原始输入区域
function closeSummaryView() {
    const section = document.getElementById('activityInputSection');
    if (!section) return;
    if (section.dataset.originalHtml) {
        section.innerHTML = section.dataset.originalHtml;
        section.dataset.originalHtml = '';
    }
}

// 简单转义，防止意外的 HTML 注入
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 根据活动描述匹配指标
function matchIndicatorsByActivity(activityText) {
    if (AppState.indicators.length === 0) return [];
    
    const text = activityText.toLowerCase();
    const matched = [];
    
    // 关键词匹配规则
    const keywordMap = {
        // 动作相关
        '滑梯': ['平稳行走', '动作协调', '平衡能力', '运动感兴趣'],
        '跑步': ['平稳行走', '动作协调', '运动感兴趣', '平衡能力'],
        '跳跃': ['平衡能力', '动作协调', '平稳行走'],
        '攀爬': ['平衡能力', '动作协调', '运动感兴趣'],
        '球': ['动作协调', '运动感兴趣', '手眼协调'],
        '画画': ['艺术创造', '精细动作', '手眼协调', '表达表现'],
        '涂色': ['精细动作', '艺术创造', '手眼协调'],
        '剪纸': ['精细动作', '手眼协调'],
        '拼图': ['精细动作', '手眼协调', '认知能力', '专注'],
        '积木': ['精细动作', '认知能力', '创造', '专注'],
        '说话': ['语言表达', '语言理解', '交流'],
        '唱歌': ['语言表达', '艺术表现', '表达表现'],
        '阅读': ['语言理解', '认知能力', '专注'],
        '分享': ['社会交往', '合作', '情感表达'],
        '合作': ['社会交往', '合作', '交流'],
        '排队': ['规则意识', '社会适应', '自控'],
        '独立': ['自理能力', '独立性', '适应能力'],
        '情绪': ['情绪管理', '情感表达', '适应能力'],
        '专注': ['专注力', '认知能力', '学习品质'],
        '解决问题': ['认知能力', '思维', '学习品质']
    };
    
    // 领域关键词
    const domainKeywords = {
        '健康与体能': ['运动', '身体', '健康', '体能', '动作', '协调', '平衡', '跑', '跳', '爬', '走'],
        '语言与交流': ['说话', '语言', '表达', '交流', '阅读', '理解', '沟通', '词汇'],
        '社会与情感': ['分享', '合作', '情绪', '情感', '交往', '朋友', '规则', '适应'],
        '探索与认知': ['认知', '思维', '学习', '探索', '发现', '解决问题', '专注', '观察'],
        '艺术与创造': ['画画', '涂色', '创造', '艺术', '音乐', '表现', '表达'],
        '习惯与生活': ['自理', '独立', '习惯', '生活', '整理', '清洁']
    };
    
    // 匹配指标
    AppState.indicators.forEach(indicator => {
        let score = 0;
        
        // 检查关键词匹配
        for (const [keyword, indicatorNames] of Object.entries(keywordMap)) {
            if (text.includes(keyword)) {
                if (indicatorNames.some(name => indicator.name.includes(name) || indicator.description.includes(name))) {
                    score += 3;
                }
            }
        }
        
        // 检查领域关键词
        const domainKeywordsList = domainKeywords[indicator.domain] || [];
        domainKeywordsList.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 1;
            }
        });
        
        // 检查指标名称和描述中的关键词
        const indicatorText = (indicator.name + ' ' + indicator.description).toLowerCase();
        const activityWords = text.split(/[\s，。、；：]/).filter(w => w.length > 1);
        activityWords.forEach(word => {
            if (indicatorText.includes(word)) {
                score += 2;
            }
        });
        
        if (score > 0) {
            matched.push({
                indicator: indicator,
                score: score,
                relevance: score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low'
            });
        }
    });
    
    // 按相关性排序，取前10个
    matched.sort((a, b) => b.score - a.score);
    return matched.slice(0, 10).map(m => ({
        ...m.indicator,
        matchScore: m.score,
        relevance: m.relevance
    }));
}

// 显示匹配的指标
function displayMatchedIndicators(indicators) {
    if (indicators.length === 0) {
        showToast('未找到相关指标，请尝试更详细的描述');
        return;
    }
    
    const section = document.getElementById('matchedIndicatorsSection');
    const list = document.getElementById('matchedIndicatorsList');
    const count = document.getElementById('matchedCount');
    const saveBtn = document.getElementById('saveDailyRecordBtn');
    
    // 检查必要元素是否存在
    if (!section || !list || !count) {
        console.error('无法找到匹配指标显示区域');
        return;
    }
    
    // 显示区域
    section.style.display = 'block';
    count.textContent = `${indicators.length} 个指标`;
    
    // 生成指标列表
    list.innerHTML = indicators.map((indicator, index) => {
        return `
            <div class="matched-indicator-item" data-indicator="${indicator.name}">
                <div class="matched-indicator-header">
                    <div class="matched-indicator-name">${indicator.name}</div>
                    <div class="matched-indicator-domain">${indicator.domain}</div>
                </div>
                <div class="matched-indicator-desc">${indicator.description}</div>
                <div class="matched-indicator-actions">
                    <button class="matched-status-btn status-success" 
                            onclick="setDailyIndicatorStatus('${indicator.name}', '符合')">
                        ✓ 符合
                    </button>
                    <button class="matched-status-btn status-partial" 
                            onclick="setDailyIndicatorStatus('${indicator.name}', '部分符合')">
                        ~ 部分符合
                    </button>
                    <button class="matched-status-btn status-fail" 
                            onclick="setDailyIndicatorStatus('${indicator.name}', '不符合')">
                        ✗ 不符合
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // 显示保存按钮和总结按钮
    if (saveBtn) {
        saveBtn.style.display = 'block';
    }
    const summaryBtn = document.getElementById('summaryBtn');
    if (summaryBtn) {
        summaryBtn.style.display = 'block';
    }
    
    // 滚动到匹配区域
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 设置日常记录中的指标状态
function setDailyIndicatorStatus(indicatorName, status) {
    const record = AppState.currentDailyRecord;
    
    // 找到对应的指标
    const indicator = record.matchedIndicators.find(i => i.name === indicatorName);
    if (!indicator) return;
    
    // 更新或添加结果
    let result = record.results.find(r => r.indicatorId === indicatorName);
    if (!result) {
        result = {
            indicatorId: indicatorName,
            status: null,
            notes: ''
        };
        record.results.push(result);
    }
    
    result.status = status;
    
    // 更新UI
    const item = document.querySelector(`[data-indicator="${indicatorName}"]`);
    if (item) {
        // 更新按钮状态
        item.querySelectorAll('.matched-status-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const statusBtn = item.querySelector(`.matched-status-btn[onclick*="'${status}'"]`);
        if (statusBtn) {
            statusBtn.classList.add('active');
        }
        
        // 高亮已选择的项
        item.classList.add('active');
    }
}

// 保存日常记录
async function saveDailyRecord() {
    const record = AppState.currentDailyRecord;
    
    if (!record.activity || record.matchedIndicators.length === 0) {
        showToast('请先分析活动');
        return;
    }
    
    const results = record.results.filter(r => r.status !== null);
    if (results.length === 0) {
        showToast('请至少记录一个指标的状态');
        return;
    }
    
    // 创建日常记录
    const dailyRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        activity: record.activity,
        indicators: record.matchedIndicators.map(i => i.name),
        results: results,
        studentId: AppState.student.name
    };
    
    // 保存到 Supabase 或 localStorage
    await saveDailyRecordToDB(dailyRecord);
    AppState.dailyRecords.unshift(dailyRecord);
    
    // 同时合并到测评记录中（可选）
    mergeDailyRecordToAssessment(dailyRecord);
    
    // 重置
    AppState.currentDailyRecord = {
        activity: '',
        matchedIndicators: [],
        results: []
    };
    
    // 清空输入
    const activityInput = document.getElementById('activityDescription');
    if (activityInput) {
        activityInput.value = '';
    }
    const matchedSection = document.getElementById('matchedIndicatorsSection');
    if (matchedSection) {
        matchedSection.style.display = 'none';
    }
    const saveBtn = document.getElementById('saveDailyRecordBtn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
    const summaryBtn = document.getElementById('summaryBtn');
    if (summaryBtn) {
        summaryBtn.style.display = 'none';
    }
    
    // 更新显示
    updateRecentDailyRecords();
    
    showToast('记录已保存！');
}

// 保存日常记录到数据库（Supabase 或 localStorage）
async function saveDailyRecordToDB(dailyRecord) {
    if (supabase && AppState.user) {
        try {
            const dbDailyRecord = convertAppToDb(dailyRecord);
            const { error } = await supabase
                .from('daily_records')
                .insert({
                    ...dbDailyRecord,
                    user_id: AppState.user.id
                });
            
            if (error) throw error;
        } catch (error) {
            console.error('保存日常记录失败:', error);
            // 后备：使用 localStorage
            const saved = JSON.parse(localStorage.getItem('dailyRecords') || '[]');
            saved.unshift(dailyRecord);
            localStorage.setItem('dailyRecords', JSON.stringify(saved));
        }
    } else {
        // 后备：使用 localStorage
        const saved = JSON.parse(localStorage.getItem('dailyRecords') || '[]');
        saved.unshift(dailyRecord);
        localStorage.setItem('dailyRecords', JSON.stringify(saved));
    }
}

// 将日常记录合并到测评记录
async function mergeDailyRecordToAssessment(dailyRecord) {
    // 查找最近的测评记录，如果没有则创建一个
    let latestAssessment = AppState.assessments.find(a => 
        a.studentId === AppState.student.name
    );
    
    if (!latestAssessment) {
        latestAssessment = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            studentId: AppState.student.name,
            results: [],
            source: 'daily'
        };
        AppState.assessments.unshift(latestAssessment);
        await saveAssessmentToDB(latestAssessment);
    }
    
    // 合并结果（避免重复）
    dailyRecord.results.forEach(result => {
        const existing = latestAssessment.results.find(r => 
            r.indicatorId === result.indicatorId
        );
        if (!existing) {
            latestAssessment.results.push(result);
        } else {
            // 更新为最新的记录
            existing.status = result.status;
            existing.notes = result.notes || existing.notes;
        }
    });
    
    // 更新到数据库
    if (supabase && AppState.user) {
        try {
            const { error } = await supabase
                .from('assessments')
                .update({ results: latestAssessment.results })
                .eq('id', latestAssessment.id);
            
            if (error) throw error;
        } catch (error) {
            console.error('更新测评记录失败:', error);
            // 后备：使用 localStorage
            localStorage.setItem('assessments', JSON.stringify(AppState.assessments));
        }
    } else {
        localStorage.setItem('assessments', JSON.stringify(AppState.assessments));
    }
}

// 更新最近日常记录显示
function updateRecentDailyRecords() {
    const container = document.getElementById('recentDailyRecordsList');
    const recent = AppState.dailyRecords.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">暂无日常记录</p>';
        return;
    }
    
    container.innerHTML = recent.map(record => {
        const date = new Date(record.date).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const completedCount = record.results.filter(r => r.status !== null).length;
        
        return `
            <div class="daily-record-item">
                <div class="daily-record-header">
                    <span class="daily-record-date">${date}</span>
                    <span class="daily-record-indicators">${completedCount}/${record.indicators.length} 项</span>
                </div>
                <div class="daily-record-activity">${record.activity}</div>
                <div class="daily-record-summary">
                    <span>涉及 ${record.indicators.length} 个指标</span>
                </div>
            </div>
        `;
    }).join('');
}

// 查看测评结果
function viewAssessmentResult(assessmentId) {
    // 记录当前页面到历史
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        AppState.navigationHistory.push(currentScreen.id);
    }
    showAssessmentResult(assessmentId);
}

// 显示测评结果
async function showAssessmentResult(assessmentId) {
    const assessment = AppState.assessments.find(a => a.id === assessmentId);
    if (!assessment) return;
    
    // 确保指标数据已加载
    if (AppState.indicators.length === 0) {
        await loadIndicators();
    }
    
    // 切换到结果页面
    showScreen('resultScreen');
    
    const container = document.getElementById('resultContainer');
    
    // 计算统计数据
    const total = assessment.results.length;
    const passed = assessment.results.filter(r => r.status === '符合').length;
    const partial = assessment.results.filter(r => r.status === '部分符合').length;
    const failed = assessment.results.filter(r => r.status === '不符合').length;
    
    // 按领域统计
    const domainStats = {};
    assessment.results.forEach(result => {
        const indicator = AppState.indicators.find(i => i.name === result.indicatorId);
        if (indicator) {
            if (!domainStats[indicator.domain]) {
                domainStats[indicator.domain] = { total: 0, passed: 0, partial: 0, failed: 0 };
            }
            domainStats[indicator.domain].total++;
            if (result.status === '符合') domainStats[indicator.domain].passed++;
            else if (result.status === '部分符合') domainStats[indicator.domain].partial++;
            else if (result.status === '不符合') domainStats[indicator.domain].failed++;
        }
    });
    
    const date = new Date(assessment.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    container.innerHTML = `
        <div class="result-summary">
            <h3>测评概览</h3>
            <p style="color: var(--text-secondary); margin-bottom: 15px;">测评日期：${date}</p>
            <div class="result-stats">
                <div class="stat-item">
                    <div class="stat-value">${total}</div>
                    <div class="stat-label">总指标数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: var(--success-color);">${passed}</div>
                    <div class="stat-label">符合</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: var(--warning-color);">${partial}</div>
                    <div class="stat-label">部分符合</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: var(--danger-color);">${failed}</div>
                    <div class="stat-label">不符合</div>
                </div>
            </div>
        </div>
        
        ${Object.entries(domainStats).map(([domain, stats]) => {
            const score = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(0) : 0;
            return `
                <div class="domain-result">
                    <div class="domain-result-header">
                        <h4>${domain}</h4>
                        <div class="domain-score">${score}%</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${score}%"></div>
                    </div>
                    <div style="display: flex; gap: 15px; margin-top: 10px; font-size: 14px; color: var(--text-secondary);">
                        <span>符合: ${stats.passed}</span>
                        <span>部分符合: ${stats.partial}</span>
                        <span>不符合: ${stats.failed}</span>
                        <span>总计: ${stats.total}</span>
                    </div>
                </div>
            `;
        }).join('')}
    `;
    
    showScreen('resultScreen');
}

// 获取最后一次测评
function getLastAssessment() {
    return AppState.assessments.length > 0 ? AppState.assessments[0] : null;
}

// 初始化动态背景
function initDynamicBackground() {
    // 检查是否已存在背景
    if (document.querySelector('.dynamic-background')) {
        return;
    }
    
    const bg = document.createElement('div');
    bg.className = 'dynamic-background';
    
    // 创建背景层
    const layer = document.createElement('div');
    layer.className = 'background-layer';
    
    // 创建渐变层
    const gradient = document.createElement('div');
    gradient.className = 'background-gradient';
    
    bg.appendChild(layer);
    bg.appendChild(gradient);
    document.body.insertBefore(bg, document.body.firstChild);
}

// 显示提示消息
function showToast(message) {
    // 简单的提示实现
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 12px 24px;
        border-radius: 16px;
        z-index: 1000;
        font-size: 14px;
        animation: fadeIn 0.3s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

