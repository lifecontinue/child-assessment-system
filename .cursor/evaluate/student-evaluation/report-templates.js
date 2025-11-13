// 评价报告模板

const ReportTemplates = {
    // 学期初诊断报告
    initial: {
        title: '学期初诊断报告',
        week: 3,
        sections: [
            {
                id: 'baseline',
                title: '学习能力基线',
                icon: '📊',
                items: [
                    { name: '识字量测试', type: 'number', unit: '字', target: 450 },
                    { name: '计算速度测试', type: 'number', unit: '题/分钟', target: 10 },
                    { name: '英语单词认读', type: 'number', unit: '个', target: 40 }
                ]
            },
            {
                id: 'habits',
                title: '习惯现状扫描',
                icon: '🔍',
                items: [
                    { name: '作业前准备', type: 'rating', options: ['优秀', '良好', '一般', '需改进'] },
                    { name: '专注时长', type: 'number', unit: '分钟', target: 30 },
                    { name: '睡前复习', type: 'rating', options: ['每天', '大部分', '偶尔', '从不'] }
                ]
            },
            {
                id: 'interests',
                title: '兴趣倾向发现',
                icon: '🎯',
                items: [
                    { name: '最喜欢的科目', type: 'select', options: ['语文', '数学', '英语', '体育', '美术', '音乐'] },
                    { name: '最喜欢的活动', type: 'text' },
                    { name: '特长爱好', type: 'text' }
                ]
            },
            {
                id: 'suggestions',
                title: '发展建议',
                icon: '💡',
                items: [
                    { name: '提升方向1', type: 'textarea' },
                    { name: '提升方向2', type: 'textarea' },
                    { name: '提升方向3', type: 'textarea' }
                ]
            }
        ]
    },
    
    // 学期中发展报告
    mid: {
        title: '学期中发展报告',
        week: 12,
        sections: [
            {
                id: 'progress',
                title: '进步雷达图',
                icon: '📈',
                description: '五大领域对比学期初',
                domains: ['学科素养', '品德发展', '身心健康', '审美素养', '劳动实践']
            },
            {
                id: 'highlights',
                title: '高光时刻',
                icon: '⭐',
                items: [
                    { name: '高光时刻1', type: 'textarea', placeholder: '描述具体事件和表现' },
                    { name: '高光时刻2', type: 'textarea', placeholder: '描述具体事件和表现' },
                    { name: '高光时刻3', type: 'textarea', placeholder: '描述具体事件和表现' }
                ]
            },
            {
                id: 'warnings',
                title: '挑战预警',
                icon: '⚠️',
                items: [
                    { name: '需关注指标1', type: 'select', options: [] },
                    { name: '需关注指标2', type: 'select', options: [] },
                    { name: '改进建议', type: 'textarea' }
                ]
            },
            {
                id: 'cooperation',
                title: '家校共育计划',
                icon: '🤝',
                items: [
                    { name: '家长配合事项1', type: 'textarea' },
                    { name: '家长配合事项2', type: 'textarea' },
                    { name: '家长配合事项3', type: 'textarea' }
                ]
            }
        ]
    },
    
    // 学期末总结报告
    final: {
        title: '学期末总结报告',
        week: 20,
        sections: [
            {
                id: 'achievement',
                title: '成长树',
                icon: '🌳',
                description: '各指标最终等级',
                domains: ['学科素养', '品德发展', '身心健康', '审美素养', '劳动实践']
            },
            {
                id: 'works',
                title: '典型作品',
                icon: '🎨',
                items: [
                    { name: '学科作品1', type: 'file', description: '语文/数学/英语' },
                    { name: '学科作品2', type: 'file', description: '语文/数学/英语' },
                    { name: '艺术作品', type: 'file', description: '美术/音乐' }
                ]
            },
            {
                id: 'physical',
                title: '体质健康曲线',
                icon: '💪',
                items: [
                    { name: '50米跑', type: 'number', unit: '秒', trend: [] },
                    { name: '坐位体前屈', type: 'number', unit: 'cm', trend: [] },
                    { name: '1分钟跳绳', type: 'number', unit: '次', trend: [] }
                ]
            },
            {
                id: 'readiness',
                title: '下年级准备度',
                icon: '✅',
                items: [
                    { name: '能独立抄写黑板作业', type: 'checkbox' },
                    { name: '能用字典查10个生字', type: 'checkbox' },
                    { name: '能口算100以内连加连减', type: 'checkbox' },
                    { name: '能安静阅读20分钟', type: 'checkbox' },
                    { name: '能整理自己的书包文具', type: 'checkbox' },
                    { name: '能与同学合作完成小任务', type: 'checkbox' },
                    { name: '能说出自己的3个优点', type: 'checkbox' }
                ]
            },
            {
                id: 'comments',
                title: '教师综合评语',
                icon: '✍️',
                structure: {
                    impression: { label: '总体印象（70字）', maxLength: 70, placeholder: '用1个具体场景开头，点出孩子最突出的1个特质' },
                    strengths: { label: '学科亮点（100字）', maxLength: 100, placeholder: '用数据+事例说明2-3个学科突出表现' },
                    suggestions: { label: '成长建议（80字）', maxLength: 80, placeholder: '指出1-2个需要改进的地方，给出具体方法' },
                    expectations: { label: '期待寄语（50字）', maxLength: 50, placeholder: '以鼓励的语气结束，展望下学期' }
                }
            }
        ]
    }
};

// 生成报告HTML
function generateReportHTML(reportType, data) {
    const template = ReportTemplates[reportType];
    if (!template) return '';
    
    let html = `
        <div class="report-document">
            <div class="report-header">
                <h1>${template.title}</h1>
                <div class="report-meta">
                    <div class="meta-item">
                        <span class="meta-label">学生姓名：</span>
                        <span class="meta-value">${data.student.name}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">性别：</span>
                        <span class="meta-value">${data.student.gender}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">年龄：</span>
                        <span class="meta-value">${calculateAge(data.student.birthDate)}岁</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">报告日期：</span>
                        <span class="meta-value">${formatDate(data.date)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">学期：</span>
                        <span class="meta-value">${data.semester || '2024-2025上学期'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">周次：</span>
                        <span class="meta-value">第${template.week}周</span>
                    </div>
                </div>
            </div>
            
            <div class="report-content">
    `;
    
    template.sections.forEach(section => {
        html += `
            <div class="report-section">
                <div class="section-title">
                    <span class="section-icon">${section.icon}</span>
                    <span class="section-name">${section.title}</span>
                </div>
        `;
        
        if (section.description) {
            html += `<p class="section-description">${section.description}</p>`;
        }
        
        if (section.domains) {
            // 雷达图或成长树
            html += `
                <div class="domains-summary">
                    ${section.domains.map(domain => {
                        const domainData = data.domains && data.domains[domain];
                        return `
                            <div class="domain-summary-item">
                                <span class="domain-summary-name">${domain}</span>
                                <span class="domain-summary-rating">${domainData ? domainData.rating : '待评价'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }
        
        if (section.items) {
            html += '<div class="section-items">';
            section.items.forEach(item => {
                const value = data.items && data.items[item.name] || '';
                html += `
                    <div class="report-item">
                        <div class="item-label">${item.name}${item.unit ? ` (${item.unit})` : ''}</div>
                        <div class="item-value">${value || '-'}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (section.structure) {
            // 教师评语
            html += '<div class="comments-structure">';
            Object.keys(section.structure).forEach(key => {
                const field = section.structure[key];
                const value = data.comments && data.comments[key] || '';
                html += `
                    <div class="comment-section">
                        <div class="comment-label">${field.label}</div>
                        <div class="comment-content">${value || '-'}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    html += `
            </div>
            
            <div class="report-footer">
                <div class="footer-item">
                    <span class="footer-label">评价人：</span>
                    <span class="footer-value">_______________</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">家长签字：</span>
                    <span class="footer-value">_______________</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">日期：</span>
                    <span class="footer-value">${formatDate(new Date())}</span>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// 生成报告表单
function generateReportForm(reportType) {
    const template = ReportTemplates[reportType];
    if (!template) return '';
    
    let html = `
        <div class="report-form-container">
            <h3>${template.title}</h3>
            <p class="form-description">请填写以下内容，完成后将生成完整的评价报告</p>
            <form id="reportForm" class="report-form">
    `;
    
    template.sections.forEach((section, sectionIndex) => {
        html += `
            <div class="form-section">
                <h4>${section.icon} ${section.title}</h4>
                ${section.description ? `<p class="section-desc">${section.description}</p>` : ''}
        `;
        
        if (section.domains) {
            html += '<div class="domains-input">';
            section.domains.forEach(domain => {
                html += `
                    <div class="form-group">
                        <label>${domain}</label>
                        <select name="domain_${domain}" class="form-control">
                            <option value="">请选择等级</option>
                            <option value="excellent">★★★ 优秀</option>
                            <option value="good">★★☆ 良好</option>
                            <option value="pass">★☆☆ 合格</option>
                            <option value="improve">☆☆☆ 待提高</option>
                        </select>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (section.items) {
            section.items.forEach((item, itemIndex) => {
                html += '<div class="form-group">';
                html += `<label>${item.name}${item.unit ? ` (${item.unit})` : ''}</label>`;
                
                switch (item.type) {
                    case 'number':
                        html += `<input type="number" name="item_${sectionIndex}_${itemIndex}" class="form-control" placeholder="${item.target ? '目标：' + item.target : ''}">`;
                        break;
                    case 'text':
                        html += `<input type="text" name="item_${sectionIndex}_${itemIndex}" class="form-control" placeholder="${item.placeholder || ''}">`;
                        break;
                    case 'textarea':
                        html += `<textarea name="item_${sectionIndex}_${itemIndex}" class="form-control" rows="3" placeholder="${item.placeholder || ''}"></textarea>`;
                        break;
                    case 'select':
                        html += `<select name="item_${sectionIndex}_${itemIndex}" class="form-control">
                            <option value="">请选择</option>
                            ${item.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>`;
                        break;
                    case 'rating':
                        html += `<select name="item_${sectionIndex}_${itemIndex}" class="form-control">
                            <option value="">请选择</option>
                            ${item.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>`;
                        break;
                    case 'checkbox':
                        html += `<label class="checkbox-label">
                            <input type="checkbox" name="item_${sectionIndex}_${itemIndex}" value="1">
                            <span>已达成</span>
                        </label>`;
                        break;
                    case 'file':
                        html += `<input type="file" name="item_${sectionIndex}_${itemIndex}" class="form-control" accept="image/*,.pdf">
                            <small class="form-text">${item.description || ''}</small>`;
                        break;
                }
                
                html += '</div>';
            });
        }
        
        if (section.structure) {
            Object.keys(section.structure).forEach(key => {
                const field = section.structure[key];
                html += `
                    <div class="form-group">
                        <label>${field.label}</label>
                        <textarea 
                            name="comment_${key}" 
                            class="form-control" 
                            rows="3" 
                            maxlength="${field.maxLength}"
                            placeholder="${field.placeholder}"></textarea>
                        <small class="form-text">字数限制：${field.maxLength}字</small>
                    </div>
                `;
            });
        }
        
        html += '</div>';
    });
    
    html += `
            </form>
        </div>
    `;
    
    return html;
}

// 导出报告为PDF (简化版，实际需要使用jsPDF等库)
function exportReportToPDF(reportHTML) {
    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>评价报告</title>
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; }
                .report-document { max-width: 800px; margin: 0 auto; }
                .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .report-header h1 { margin: 0 0 20px 0; }
                .report-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: left; }
                .meta-label { font-weight: 600; }
                .report-section { margin-bottom: 30px; break-inside: avoid; }
                .section-title { font-size: 1.3em; font-weight: 600; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
                .section-items { display: flex; flex-direction: column; gap: 12px; }
                .report-item { padding: 10px; background: #f5f5f5; border-radius: 5px; }
                .item-label { font-weight: 600; margin-bottom: 5px; }
                .domains-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 15px; }
                .domain-summary-item { padding: 15px; background: #f5f5f5; text-align: center; border-radius: 5px; }
                .comment-section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 3px solid #667eea; }
                .comment-label { font-weight: 600; margin-bottom: 10px; }
                .report-footer { margin-top: 50px; display: flex; justify-content: space-around; border-top: 2px solid #333; padding-top: 20px; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            ${reportHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    
    // 等待内容加载后打印
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// 辅助函数
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

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('zh-CN');
}

