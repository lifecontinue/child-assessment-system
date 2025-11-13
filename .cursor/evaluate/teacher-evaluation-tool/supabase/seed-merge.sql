-- 预置教学进度数据（二年级上册，20周）
-- 合并版本使用，兼容现有的 students 表结构

-- 清空现有数据（可选，如果不想重复插入）
-- DELETE FROM teaching_progress;

-- 插入教学进度数据
INSERT INTO teaching_progress (week_number, subject, chapter, key_points, evaluation_type, is_node, semester) VALUES
-- 语文节点
(2, '语文', '识字1-4课', '认识常用汉字200个', '识字量', true, 1),
(4, '语文', '识字5-8课', '认识常用汉字400个', '识字量', true, 1),
(6, '语文', '课文1-3课', '朗读流利，理解课文内容', '朗读流利度', true, 1),
(8, '语文', '期中复习', '综合复习前8周内容', '阅读理解', true, 1),
(10, '语文', '课文4-6课', '理解课文主旨，回答问题', '阅读理解', true, 1),
(12, '语文', '看图写话', '观察图片，写一段话', '看图写话', true, 1),
(14, '语文', '课文7-9课', '朗读有感情，理解人物形象', '朗读流利度', true, 1),
(16, '语文', '识字9-12课', '认识常用汉字800个', '识字量', true, 1),
(18, '语文', '期末复习', '综合复习全学期内容', '综合能力', true, 1),

-- 数学节点
(3, '数学', '100以内加法', '掌握100以内加法运算', '口算速度', true, 1),
(5, '数学', '100以内减法', '掌握100以内减法运算', '口算速度', true, 1),
(7, '数学', '表内乘法（一）', '掌握2-5的乘法口诀', '乘法口诀', true, 1),
(9, '数学', '表内乘法（二）', '掌握6-9的乘法口诀', '乘法口诀', true, 1),
(11, '数学', '应用题', '解决简单的两步应用题', '应用题', true, 1),
(13, '数学', '图形认知', '认识长方形、正方形、三角形', '图形认知', true, 1),
(15, '数学', '长度单位', '认识厘米和米', '测量', true, 1),
(17, '数学', '期末复习', '综合复习全学期内容', '综合能力', true, 1),

-- 品德节点
(6, '品德', '规则意识', '遵守课堂纪律，排队有序', '规则意识', true, 1),
(10, '品德', '诚实守信', '不说谎，答应的事要做到', '诚实守信', true, 1),
(14, '品德', '责任担当', '完成值日任务，帮助同学', '责任担当', true, 1),
(18, '品德', '文明有礼', '使用礼貌用语，尊重他人', '文明有礼', true, 1)
ON CONFLICT DO NOTHING;  -- 如果数据已存在则跳过

-- 创建或替换获取预警学生的函数（兼容 BIGINT student_id）
CREATE OR REPLACE FUNCTION get_risk_students()
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    class TEXT,
    risk_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        COALESCE(s.class, '未分班') as class,
        COUNT(*) as risk_count
    FROM students s
    INNER JOIN evaluation_records er ON er.student_id = s.id
    WHERE er.star_rating = 1
    GROUP BY s.id, s.name, s.class
    HAVING COUNT(*) >= 3
    ORDER BY risk_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

