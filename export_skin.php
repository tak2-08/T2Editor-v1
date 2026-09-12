<?php
// export_skin.php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 방지

// POST로 전달된 콘텐츠 받기
$content = isset($_POST['content']) ? $_POST['content'] : '';

// 기본 스타일 정의 (필요 시 별도 CSS 파일로 분리 가능)
$styles = '
<style>
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    margin: 20px;
}
h1 {
    color: #333;
    border-bottom: 2px solid #0187fe;
    padding-bottom: 10px;
}
.t2-media-block img, .t2-media-block iframe, .t2-media-block video {
    border-radius: 15px;
    border: none;
    margin: 0 auto;
    display: block;
}
.file-container {
    width: 360px;
    background: white;
    border-radius: 12px;
    border: 1px solid #4a4a4a;
    padding: 20px;
    display: flex;
    align-items: center;
    font-family: Roboto, Arial, sans-serif;
    margin: 10px 0;
}
.file-icon {
    width: 42px;
    height: 52px;
    border-radius: 6px;
    margin-right: 20px;
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #E8B56F;
}
.file-info {
    flex-grow: 1;
    min-width: 0;
}
.file-name {
    font-size: 17px;
    font-weight: 500;
    color: rgba(0,0,0,0.87);
    margin: 0 0 6px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.file-details {
    color: rgba(0,0,0,0.6);
    font-size: 14px;
    line-height: 1.5;
}
.table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1rem;
}
.t2-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
}
.t2-table th, .t2-table td {
    border: 1px solid #ccc;
    padding: 8px;
    vertical-align: top;
}
.t2-table th {
    background-color: #f5f5f5;
    font-weight: 500;
}
.t2-table.t2-table-large {
    min-width: 800px;
}
</style>
';

// HTML 구조 생성
$html = <<<HTML
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>T2Editor 내보내기 - {$g5['title']}</title>
    {$styles}
</head>
<body>
    <h1>T2Editor 내보내기 문서</h1>
    <div class="content">
        {$content}
    </div>
</body>
</html>
HTML;

// 출력
echo $html;
?>