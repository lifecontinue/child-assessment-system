// 创建 Supabase 测试账号脚本

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nmkjzhqonmdyghydvdyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2p6aHFvbm1keWdoeWR2ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NDE1NzYsImV4cCI6MjA3ODUxNzU3Nn0.HKcwvEzCjocdGl-jAF0imGCwhDtjh1iqR2N5tNrvubY';

// 注意：需要使用 @supabase/supabase-js 库
// 如果未安装，请运行: npm install @supabase/supabase-js

async function createTestUser() {
    console.log('=== 创建 Supabase 测试账号 ===\n');
    
    // 检查是否安装了 supabase-js
    let createClient;
    try {
        const supabaseModule = require('@supabase/supabase-js');
        createClient = supabaseModule.createClient;
    } catch (error) {
        console.error('错误: 未安装 @supabase/supabase-js');
        console.log('\n请先安装依赖:');
        console.log('  npm install @supabase/supabase-js\n');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 测试账号信息
    const testEmail = 'haidagy@gmail.com';
    const testPassword = '1112crimsonGY';

    console.log(`账号: ${testEmail}`);
    console.log(`密码: ${testPassword}\n`);

    try {
        // 尝试注册新用户
        console.log('正在创建测试账号...');
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: undefined // 禁用邮箱验证重定向
            }
        });

        if (error) {
            // 如果用户已存在，尝试登录
            if (error.message.includes('already registered') || error.code === 'user_already_registered') {
                console.log('账号已存在，尝试登录...\n');
                
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                });

                if (loginError) {
                    console.error('登录失败:', loginError.message);
                    console.log('\n可能的原因:');
                    console.log('1. 密码不正确');
                    console.log('2. 账号需要邮箱验证');
                    console.log('3. 账号已被禁用\n');
                    return;
                }

                console.log('✓ 登录成功！');
                console.log(`用户 ID: ${loginData.user.id}`);
                console.log(`邮箱: ${loginData.user.email}\n`);
                console.log('测试账号已就绪，可以在应用中使用。\n');
            } else {
                console.error('创建失败:', error.message);
                console.log('\n提示:');
                console.log('1. 检查 Supabase 项目配置');
                console.log('2. 确认邮箱验证设置');
                console.log('3. 查看 Supabase Dashboard 中的错误日志\n');
            }
        } else {
            console.log('✓ 账号创建成功！');
            console.log(`用户 ID: ${data.user.id}`);
            console.log(`邮箱: ${data.user.email}`);
            
            if (data.user.email_confirmed_at) {
                console.log('✓ 邮箱已验证\n');
            } else {
                console.log('⚠ 需要邮箱验证');
                console.log('提示: 在 Supabase Dashboard > Authentication > Users 中可以手动验证邮箱\n');
            }
            
            console.log('测试账号已就绪，可以在应用中使用。\n');
        }
    } catch (error) {
        console.error('发生错误:', error.message);
        console.log('\n请检查:');
        console.log('1. Supabase URL 和 Key 是否正确');
        console.log('2. 网络连接是否正常');
        console.log('3. Supabase 项目是否正常运行\n');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    createTestUser().catch(console.error);
}

module.exports = { createTestUser };

