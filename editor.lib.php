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
        return array(false, 'License verification failure');
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
        $html .= "\n<link href=\"https://fonts.googleapis.com/icon?family=Material+Icons\" rel=\"stylesheet\">";
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
    <a href="//dsclub.kr">
        <div class="t2-logo">
            <span class="t2-logo-prefix">T2</span>
            <span class="t2-logo-suffix">Editor</span>
        </div>
    </a>
        <div class="t2-char-count">txt: <span>0</span></div>
    </div>
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
                
                tempDiv.querySelectorAll('p').forEach(function(p) {
                    if (!p.textContent.trim() && !p.querySelector('img, iframe, video')) {
                        if (!p.querySelector('br')) {
                            p.innerHTML = '<br>';
                        }
                    }
                });

                var cssLink = '<link href=\"". G5_PLUGIN_URL ."/editor/t2editor/css/t2content.css\" rel=\"stylesheet\">';
                var customStyle = '<style>.t2-media-block img, .t2-media-block iframe, .t2-media-block video {border-radius: 15px !important; border: none !important; margin: 0 auto !important;}</style>';
                var finalContent = tempDiv.innerHTML;
                
                if (finalContent.indexOf('t2content.css') === -1) {
                    finalContent += cssLink;
                }
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