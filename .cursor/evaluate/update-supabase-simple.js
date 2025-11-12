// 简化版：通过 Supabase REST API 执行 SQL
// 注意：Supabase REST API 不支持直接执行任意 SQL
// 此脚本主要用于验证连接和提供手动执行指导

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('=== Supabase 数据库更新助手 ===\n');
    
    const sqlPath = path.join(__dirname, 'supabase-setup.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('错误: 找不到 supabase-setup.sql 文件');
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('✓ 已读取 SQL 文件\n');
    console.log('由于 Supabase REST API 的限制，无法直接通过 API 执行 SQL。');
    console.log('请选择以下方式之一更新数据库：\n');
    
    console.log('方式 1: 使用 Supabase Dashboard（推荐）');
    console.log('  1. 打开 https://supabase.com/dashboard');
    console.log('  2. 选择你的项目');
    console.log('  3. 进入 SQL Editor');
    console.log('  4. 复制并粘贴以下 SQL 内容：\n');
    console.log('─'.repeat(60));
    console.log(sql);
    console.log('─'.repeat(60));
    console.log('\n');
    
    console.log('方式 2: 使用 Supabase CLI');
    console.log('  运行: ./update-supabase.sh (Linux/Mac)');
    console.log('  或: .\\update-supabase.ps1 (Windows)\n');
    
    console.log('方式 3: 使用 Supabase Management API');
    console.log('  需要设置 SUPABASE_ACCESS_TOKEN 环境变量');
    console.log('  然后使用 Supabase CLI 或 API 客户端\n');
    
    const answer = await question('是否打开 Supabase Dashboard? (y/n): ');
    if (answer.toLowerCase() === 'y') {
        const { exec } = require('child_process');
        const url = 'https://supabase.com/dashboard';
        
        const platform = process.platform;
        let command;
        
        if (platform === 'win32') {
            command = `start ${url}`;
        } else if (platform === 'darwin') {
            command = `open ${url}`;
        } else {
            command = `xdg-open ${url}`;
        }
        
        exec(command, (error) => {
            if (error) {
                console.log(`请手动访问: ${url}`);
            }
        });
    }
    
    rl.close();
}

main().catch(console.error);

