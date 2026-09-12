<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>T2Editor Demo</title>
  <!-- Material Icons CDN -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
  <link href="css/t2editor.css" rel="stylesheet">
  <script src="js/t2editor.js" defer></script>
  <style>
a:link,
a:visited,
a:hover,
a:active {
  text-decoration: none;
  color: inherit;
}
textarea {
min-height: 260px !important;
max-height: 260px !important;
}
</style>
</head>
<?php
if (isset($_SERVER['HTTP_USER_AGENT']) && stripos($_SERVER['HTTP_USER_AGENT'], 'Android') !== false) {
    // 안드로이드 환경일 경우, CDN으로 로드, 애플애서만 자체 호스팅 아이콘 보이는 문제 발생
    echo '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">' . "\n";
    echo '<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">' . "\n";
}
?>
<?php
function get_readme_version() {
    $readme_path = __DIR__ . '/readme.txt';
    if (file_exists($readme_path)) {
        $content = file_get_contents($readme_path);
        if (preg_match('/ver_([0-9.]+)/', $content, $matches)) {
            return $matches[1];
        }
    }
    return 'readme.txt 오류! 재설치 해주세요.';
}
?>
<body>
  <div class="t2-editor-container">
        <div class="t2-toolbar">
            <button class="t2-btn" data-command="undo" disabled>
                <span class="material-icons">undo</span>
            </button>
            <button class="t2-btn" data-command="redo" disabled>
                <span class="material-icons">redo</span>
            </button>
            <button class="t2-btn" data-command="fontSize">
                <span class="material-icons">format_size</span>
            </button>
            <button class="t2-btn" data-command="bold">
                <span class="material-icons">format_bold</span>
            </button>
            <button class="t2-btn" data-command="italic">
                <span class="material-icons">format_italic</span>
            </button>
            <button class="t2-btn" data-command="underline">
                <span class="material-icons">format_underlined</span>
            </button>
            <button class="t2-btn" data-command="strikeThrough">
                <span class="material-icons">format_strikethrough</span>
            </button>
            <button class="t2-btn" data-command="justifyContent">
                <span class="material-icons">format_align_left</span>
            </button>
            <button class="t2-btn" data-command="foreColor">
                <span class="material-icons">format_color_text</span>
            </button>
            <button class="t2-btn" data-command="backColor">
                <span class="material-icons">format_color_fill</span>
            </button>
            <button class="t2-btn" data-command="insertImage">
                <span class="material-icons">image</span>
            </button>
            <button class="t2-btn" data-command="insertYouTube" style="color:#f04f48">
                <span class="material-icons">smart_display</span>
            </button>
    <button class="t2-btn" data-command="attachFile">
        <span class="material-icons">attach_file</span>
    </button>
            <button class="t2-btn" data-command="createLink">
                <span class="material-icons">link</span>
            </button>
<button class="t2-btn" data-command="insertTable">
    <span class="material-icons-outlined">table_chart</span>
</button>
            <button class="t2-btn" data-command="insertCodeBlock">
                <span class="material-icons">code</span>
            </button>
    <button class="t2-btn" data-command="exportHTML">
        <span class="material-icons-outlined">ios_share</span>
    </button>
           </div>
    <div class="t2-editor" contenteditable="true">
    </div>
 <div class="t2-editor-status">
    <div class="t2-status-left">
        <a href="//dsclub.kr/service/editor">
            <div class="t2-logo">
                <span class="t2-logo-prefix">T2</span>
                <span class="t2-logo-suffix">Editor</span>
            </div>
        </a>
    </div>
    <div class="t2-char-count">
    txt: <span>0</span>
    </div>
  </div>
  <span style="color: #999; position: absolute; right: 5px; margin:5px 0; font-size: 11px; font-weight: 500; display: flex; align-items: center;">
  <i class="material-icons-outlined" style="margin-right: 4px; font-size: 14px">info</i>
  <?php echo (strpos($v = get_readme_version(), '오류') !== false) ? $v : "T2Editor Ver $v C"; ?>
</span>
</body>
</html>