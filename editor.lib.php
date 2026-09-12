<?php
if (!defined('_GNUBOARD_')) exit;

function _t2e_get_hash($s) { return hash('sha256', $s); }
function _t2e_x($s) { return base64_decode($s); }
function _t2e_enc($d) { return base64_encode($d); }

$_t2e_v = array(
    _t2e_x('VDJFZGl0b3IgTGljZW5zZQ=='),
    _t2e_x('VmVyc2lvbjogMS4w'),
    _t2e_x('Q29weXJpZ2h0IChjKSAyMDI1IFRhazIgKGRzY2x1Yi5rcik=')
);

$_t2e_h = array(
    _t2e_x('MzE5MzIxMzIxMzEyMw=='),
    _t2e_x('OTg3NDMyMTMyMTMy'),
    _t2e_x('NTQzMjE0MzIxMzIx')
);

function _t2e_check_integrity($c, $k) {
    global $_t2e_v, $_t2e_h;
    $v = $_t2e_v;
    $h = $_t2e_h;
    return strpos($c, $v[$k]) !== false;
}

function _t2e_validate_file($f) {
    if (!file_exists($f)) return false;
    $c = file_get_contents($f);
    for ($i = 0; $i < 3; $i++) {
        if (!_t2e_check_integrity($c, $i)) return false;
    }
    return true;
}

function _t2e_get_status() {
    $p = G5_EDITOR_PATH.'/t2editor/';
    $f1 = $p.'License_en.txt';
    $f2 = $p.'License_ko.txt';
    
    if (!_t2e_validate_file($f1) || !_t2e_validate_file($f2)) {
        return array(false, '라이선스 검증 실패');
    }
    return array(true, '');
}

function editor_html($id, $content, $is_dhtml_editor=true) {
    global $g5, $config;
    static $js = true;

    list($valid, $msg) = _t2e_get_status();
    if (!$valid) {
        return '<div class="alert alert-danger"><strong>Error:</strong> '.$msg.'</div>';
    }

    $editor_url = G5_EDITOR_URL.'/'.$config['cf_editor'];
    $html = "<span class=\"sound_only\">웹에디터 시작</span>";
    
    if ($js) {
        $html .= "\n<link href=\"{$editor_url}/css/t2editor.css\" rel=\"stylesheet\">";
        $html .= "\n<script src=\"{$editor_url}/js/t2editor.js\"></script>";
        $js = false;
    }

    if ($is_dhtml_editor) {
        $content = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $escaped_content = str_replace(
            array("\\", "'", "\r", "\n"),
            array("\\\\", "\\'", "\\r", "\\n"),
            $content
        );
        
        ob_start(); ?>
<style>
@font-face {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: 400;
  src: url("<?php echo G5_PLUGIN_URL ?>/editor/t2editor/fonts/material-icons/MaterialIcons-Regular.eot"); /* IE6-8 지원 */
  src: local("Material Icons"),
       local("MaterialIcons-Regular"),
       url("<?php echo G5_PLUGIN_URL ?>/editor/t2editor/fonts/material-icons/MaterialIcons-Regular.woff2") format("woff2"),
       url("<?php echo G5_PLUGIN_URL ?>/editor/t2editor/fonts/material-icons/MaterialIcons-Regular.woff") format("woff"),
       url("<?php echo G5_PLUGIN_URL ?>/editor/t2editor/fonts/material-icons/MaterialIcons-Regular.ttf") format("truetype");
}
.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* 기본 아이콘 크기, 필요에 따라 조정 가능 */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "liga";
}
</style>

    <div class="t2-editor-container" id="<?php echo $id ?>_container">
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
            <button class="t2-btn" data-command="insertCodeBlock">
                <span class="material-icons">code</span>
            </button>
           </div>
           <div class="t2-editor" contenteditable="true" id="<?php echo $id ?>_editor"></div>
       <textarea name="<?php echo $id ?>" id="<?php echo $id ?>" style="display:none;"><?php echo $content ?></textarea>

<div class="t2-editor-status">
    <div class="t2-status-left">
        <a href="//dsclub.kr/code/1102">
            <div class="t2-logo">
                <span class="t2-logo-prefix">T2</span>
                <span class="t2-logo-suffix">Editor</span>
            </div>
        </a>
    </div>
    <div class="t2-char-count">txt: <span>0</span></div>
</div>

        <script>
        (function() {
            var editor = new T2Editor(document.getElementById('<?php echo $id ?>_container'));
            window.<?php echo $id ?>_editor = editor;
            
            if ('<?php echo $escaped_content ?>') {
                try {
                    editor.setContent('<?php echo $escaped_content ?>');
                    
                    setTimeout(function() {
                        editor.initializeBlocks();
                        editor.normalizeContent();
                        
                        var mediaBlocks = editor.editor.querySelectorAll('.t2-media-block');
                        mediaBlocks.forEach(function(block) {
                            var container = block.querySelector('div:first-child');
                            var mediaElement = container.querySelector('iframe, video');
                            var editButton = block.querySelector('.edit-url-btn');
                            
                            if (editButton && mediaElement && mediaElement.tagName === 'IFRAME') {
                                var newEditButton = editButton.cloneNode(true);
                                editButton.parentNode.replaceChild(newEditButton, editButton);
                                
                                newEditButton.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    var videoId = mediaElement.src.match(/embed\/([^?]+)/)?.[1];
                                    if (videoId) {
                                        editor.showVideoUrlEditModal(mediaElement, { type: 'youtube', id: videoId });
                                    }
                                });
                            }
                        });
                    }, 100);
                } catch (e) {
                    console.error('에디터 초기화 오류:', e);
                }
            }
        })();
        </script>
        <?php
        $html .= ob_get_clean();
    } else {
        $html .= "\n<textarea id=\"{$id}\" name=\"{$id}\" style=\"width:100%;height:300px\">{$content}</textarea>";
    }
    
    return $html;
}

function get_editor_js($id, $is_dhtml_editor=true) {
    if ($is_dhtml_editor) {
        return "
            var _submitContent = function() {
                var editorContent = document.getElementById('{$id}_editor').innerHTML;
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = editorContent;
                
                // 파일 블록 처리
tempDiv.querySelectorAll('.t2-file-block').forEach(function(block) {
    // 컨트롤 제거 (게시글에서는 표시하지 않음)
    const controls = block.querySelector('.t2-media-controls');
    if (controls) {
        controls.remove();
    }
});
                
                // 미디어 블록 처리
                tempDiv.querySelectorAll('.t2-media-block').forEach(function(block) {
                    var container = block.querySelector('div:first-child');
                    var mediaElement = container.querySelector('iframe, video, img');
                    if (mediaElement) {
                        mediaElement.style.width = container.style.width;
                        if (container.style.height) {
                            mediaElement.style.height = container.style.height;
                        }
                        
                        var controls = block.querySelector('.t2-media-controls');
                        if (controls) {
                            controls.remove();
                        }
                    }
                });
                
                // 빈 문단 처리
                tempDiv.querySelectorAll('p').forEach(function(p) {
                    if (!p.textContent.trim() && !p.querySelector('img, iframe, video')) {
                        if (!p.querySelector('br')) {
                            p.innerHTML = '<br>';
                        }
                    }
                });

                // 스타일 추가
                var customStyle = '<style>' +
                    // 미디어 블록 스타일
                    '.t2-media-block img, .t2-media-block iframe, .t2-media-block video {' +
                        'border-radius: 15px !important; ' +
                        'border: none !important; ' +
                        'margin: 0 auto !important;' +
                    '}' +
                    // 파일 블록 스타일
                    '.file-container {' +
                        'width: 360px; ' +
                        'background: white; ' +
                        'border-radius: 12px; ' +
                        'border: 1px solid #4a4a4a; ' +
                        'padding: 20px; ' +
                        'display: flex; ' +
                        'align-items: center; ' +
                        'font-family: Roboto, Arial, sans-serif; ' +
                        'margin: 10px 0;' +
                    '}' +
                    '.file-icon {' +
                        'width: 42px; ' +
                        'height: 52px; ' +
                        'border-radius: 6px; ' +
                        'margin-right: 20px; ' +
                        'position: relative; ' +
                        'flex-shrink: 0; ' +
                        'overflow: hidden;' +
                    '}' +
                    '.file-info {' +
                        'flex-grow: 1; ' +
                        'min-width: 0;' +
                    '}' +
                    '.file-name {' +
                        'font-size: 17px; ' +
                        'font-weight: 500; ' +
                        'color: rgba(0,0,0,0.87); ' +
                        'margin: 0 0 6px 0; ' +
                        'white-space: nowrap; ' +
                        'overflow: hidden; ' +
                        'text-overflow: ellipsis;' +
                    '}' +
                    '.file-details {' +
                        'color: rgba(0,0,0,0.6); ' +
                        'font-size: 14px; ' +
                        'line-height: 1.5;' +
                    '}' +
                    '.file-details span {' +
                        'display: inline-block; ' +
                        'margin-right: 12px;' +
                    '}' +
                    '</style>';
                
                var finalContent = tempDiv.innerHTML;
                
                // 스타일이 없는 경우에만 추가
                if (finalContent.indexOf('border-radius: 15px') === -1) {
                    finalContent += customStyle;
                }
                
                document.getElementById('{$id}').value = finalContent;
            };
            _submitContent();\n";
    }
    return "var {$id}_editor = document.getElementById('{$id}');\n";
}

function chk_editor_js($id, $is_dhtml_editor=true) {
    if ($is_dhtml_editor) {
        return "if (!document.getElementById('{$id}_editor').innerHTML.trim()) { alert('내용을 입력해 주십시오.'); document.getElementById('{$id}_editor').focus(); return false; }\n";
    }
    return "if (!{$id}_editor.value) { alert('내용을 입력해 주십시오.'); {$id}_editor.focus(); return false; }\n";
}