// 自动更新 Supabase 数据库脚本
// 使用 Supabase Management API 执行 SQL

const fs = require('fs');
const path = require('path');
const https = require('https');

// 从环境变量或配置文件读取
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nmkjzhqonmdyghydvdyy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

// 从 URL 提取项目引用
function getProjectRef(url) {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
}

// 执行 SQL 查询
async function executeSQL(sql, accessToken) {
    const projectRef = getProjectRef(SUPABASE_URL);
    if (!projectRef) {
        throw new Error('无法从 SUPABASE_URL 提取项目引用');
    }

    const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Authorization': `Bearer ${accessToken}`,
                'apikey': accessToken
            }
        };

        const req = https.request(apiUrl, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const result = JSON.parse(responseData);
                        resolve(result);
                    } catch (e) {
                        resolve(responseData);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// 使用 Supabase REST API (PostgREST) 执行 SQL
async function executeSQLViaREST(sql) {
    // 注意：PostgREST 不支持直接执行任意 SQL
    // 需要使用 Supabase Management API 或 CLI
    console.warn('REST API 不支持直接执行 SQL，请使用 Supabase CLI 或 Management API');
    return null;
}

// 主函数
async function main() {
    console.log('=== 自动更新 Supabase 数据库 ===\n');

    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, 'supabase-setup.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('错误: 找不到 supabase-setup.sql 文件');
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✓ 已读取 SQL 文件\n');

    // 检查访问令牌
    if (!SUPABASE_ACCESS_TOKEN && !SUPABASE_SERVICE_KEY) {
        console.error('错误: 需要设置 SUPABASE_ACCESS_TOKEN 或 SUPABASE_SERVICE_KEY 环境变量');
        console.log('\n获取访问令牌的方法:');
        console.log('1. 使用 Supabase CLI: supabase projects list');
        console.log('2. 在 Supabase Dashboard > Settings > API 中获取 service_role key');
        console.log('3. 使用 Supabase Management API token');
        console.log('\n设置环境变量:');
        console.log('  Windows: $env:SUPABASE_SERVICE_KEY="your-key"');
        console.log('  Linux/Mac: export SUPABASE_SERVICE_KEY="your-key"');
        process.exit(1);
    }

    const accessToken = SUPABASE_SERVICE_KEY || SUPABASE_ACCESS_TOKEN;

    try {
        console.log('正在执行 SQL 更新...\n');
        
        // 如果使用 Management API，需要不同的端点
        // 这里提供一个使用 Supabase CLI 的替代方案提示
        console.log('提示: 此脚本需要 Supabase Management API 访问权限');
        console.log('推荐使用 Supabase CLI 方式（见 update-supabase.sh 或 update-supabase.ps1）\n');
        
        // 尝试执行（如果配置正确）
        if (SUPABASE_SERVICE_KEY) {
            console.log('使用 service_role key 执行 SQL...');
            // 注意：service_role key 应该通过 Supabase REST API 使用
            // 但直接执行 SQL 需要 Management API
            console.log('请使用 Supabase CLI 或直接在 Dashboard 中执行 SQL');
        }

    } catch (error) {
        console.error('执行失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { executeSQL, getProjectRef };

