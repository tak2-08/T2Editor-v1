<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>T2Editor</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        .t2-editor-container {
            max-width: 800px;
            margin: 20px auto;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .t2-toolbar {
            padding: 10px;
            border-bottom: 1px solid #ccc;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .t2-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .t2-btn:disabled:hover {
            background: #f5f5f5;
            box-shadow: none;
        }
        
        .t2-btn {
            border: none;
            background: #f5f5f5;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background-color 0.2s, box-shadow 0.2s;
        }

        .t2-btn:hover {
            background: #e0e0e0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .t2-btn.active {
            background: #2196F3;
            color: white;
        }

        .t2-editor {
            min-height: 300px;
            padding: 15px;
            outline: none;
            overflow-y: auto;
            line-height: 1.5;
            font-size: 16px;
            background: #ffffff;
            position: relative;
        }

        .t2-editor p {
            margin: 0;
            padding: 0;
            min-height: 1.5em;
        }

        .t2-editor br {
            display: block;
            content: "";
            margin-top: 0.5em;
        }

.t2-color-palette {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

        .t2-color-option {
            width: 25px;
            height: 25px;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #ddd;
        }

.t2-font-size-list {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    min-width: 120px;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.t2-font-size-option {
    padding: 5px 15px;
    cursor: pointer;
    background-color: transparent;
    transition: background-color 0.1s ease;
}

        .t2-font-size-option:hover {
            background: #f5f5f5;
        }

        .t2-media-block {
            position: relative;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #fff;
        }

        .t2-media-controls {
            position: absolute;
            top: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.9);
            padding: 5px;
            border-radius: 4px;
            display: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            pointer-events: all;
            z-index: 10;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .t2-media-block:hover .t2-media-controls {
            display: flex;
            gap: 5px;
        }

.t2-code-block {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    position: relative;
    margin: 10px 0;
}

.t2-code-block-copy {
    position: absolute;
    top: 5px;
    right: 5px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px 5px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    z-index: 10;
}

.t2-code-block .code-placeholder {
    color: #888;
    cursor: text;
}

.t2-code-block pre {
    margin: 0;
    white-space: pre-wrap;
}

.t2-code-block code {
    outline: none;
    display: block;
    min-height: 1em;
    font-family: 'Consolas', 'Monaco', monospace;
    line-height: 1.5;
}

        .t2-bullet-block {
            margin-left: 20px;
            padding-left: 10px;
            border-left: 2px solid #ccc;
        }

        .t2-link-preview {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
            display: flex;
            gap: 10px;
            background: #fff;
        }

        .t2-link-preview img {
            max-width: 100px;
            height: auto;
        }

/* 이미지 에디터 모달 스타일 */
.t2-image-editor-modal {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    padding: 24px;
    width: 480px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui;
}

.t2-image-editor-modal h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 20px 0;
}

.t2-image-editor-modal .t2-image-upload-area {
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    padding: 32px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 20px;
    position: relative;
}

.t2-image-editor-modal .t2-image-upload-area:hover {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.05);
}

.t2-image-editor-modal .t2-image-upload-area .material-icons {
    font-size: 48px;
    color: #6b7280;
    margin-bottom: 12px;
}

.t2-image-editor-modal .t2-image-upload-text {
    font-size: 15px;
    color: #4b5563;
    margin-bottom: 4px;
}

.t2-image-editor-modal .t2-image-upload-hint {
    font-size: 13px;
    color: #6b7280;
}

.t2-image-editor-modal input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.t2-image-editor-modal .t2-btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
}

.t2-image-editor-modal .t2-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
}

.t2-image-editor-modal .t2-btn[data-action="cancel"] {
    color: #4b5563;
    background: #f3f4f6;
}

.t2-image-editor-modal .t2-btn[data-action="cancel"]:hover {
    background: #e5e7eb;
}

.t2-image-editor-modal .t2-btn[data-action="upload"] {
    color: #ffffff;
    background: #2563eb;
}

.t2-image-editor-modal .t2-btn[data-action="upload"]:hover {
    background: #1d4ed8;
}

.t2-image-editor-modal .t2-btn[data-action="upload"]:disabled {
    background: #93c5fd;
    cursor: not-allowed;
}

/* 선택된 이미지 프리뷰 영역 */
.t2-image-editor-modal .t2-image-preview {
    max-height: 200px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 20px;
    display: none;
}

.t2-image-editor-modal .t2-image-preview img {
border-radius: 10px;
}

.t2-image-editor-modal .t2-image-preview.active {
    display: block;
}

.t2-image-editor-modal .t2-image-preview img {
    width: 100%;
    height: auto;
    object-fit: cover;
}

        /* 텍스트 선택 스타일 */
        .t2-editor ::selection {
            background: #b3d4fc;
            text-shadow: none;
        }
        
.t2-video-editor-modal {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    padding: 24px;
    width: 480px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui;
}

.t2-video-editor-modal h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 20px 0;
}

.t2-video-editor-modal .t2-youtube-url {
    box-sizing: border-box;
    width:100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;
    margin-bottom: 8px;
}

.t2-video-editor-modal .t2-youtube-url:focus {
    border-color: #2563eb;
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.t2-video-editor-modal .t2-video-type-info {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
}

.t2-video-editor-modal .t2-btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.t2-video-editor-modal .t2-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
}

.t2-video-editor-modal .t2-btn[data-action="cancel"] {
    color: #4b5563;
    background: #f3f4f6;
    border: none;
}

.t2-video-editor-modal .t2-btn[data-action="cancel"]:hover {
    background: #e5e7eb;
}

.t2-video-editor-modal .t2-btn[data-action="insert"] {
    color: #ffffff;
    background: #2563eb;
    border: none;
}

.t2-video-editor-modal .t2-btn[data-action="insert"]:hover {
    background: #1d4ed8;
}

.t2-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
    </style>
</head>
<body>
    <div class="t2-editor-container">
        <div class="t2-toolbar">
            <!-- Undo/Redo 버튼 추가 -->
            <button class="t2-btn" data-command="undo" disabled>
                <span class="material-icons">undo</span>
            </button>
            <button class="t2-btn" data-command="redo" disabled>
                <span class="material-icons">redo</span>
            </button>
            <button class="t2-btn" data-command="fontSize">
                <span class="material-icons">format_size</span>
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
            <button class="t2-btn" data-command="insertYouTube">
                <span class="material-icons">smart_display</span>
            </button>
            <button class="t2-btn" data-command="insertCodeBlock">
                <span class="material-icons">code</span>
            </button>
            <button class="t2-btn" data-command="insertImage">
                <span class="material-icons">image</span>
            </button>
        </div>
        <div class="t2-editor" contenteditable="true"></div>
    </div>

    <script>
        class T2Editor {
            constructor(container) {
                this.container = container;
                this.editor = container.querySelector('.t2-editor');
                this.toolbar = container.querySelector('.t2-toolbar');
                this.setupEditor();
                this.setupEventListeners();
                this.loadAutoSave();
                this.setupBeforeUnload();
                this.alignmentState = 'left';
                this.bulletState = { active: false, type: null, count: 1 };
                this.undoStack = [];
                this.redoStack = [];
                this.lastCheckpoint = null;
                this.undoBtn = container.querySelector('[data-command="undo"]');
                this.redoBtn = container.querySelector('[data-command="redo"]');
                this.updateUndoRedoButtons();
            }

            setupEditor() {
                // 에디터 초기화
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                this.editor.appendChild(p);

                // 기본 스타일 설정
                this.editor.style.whiteSpace = 'pre-wrap';
                this.editor.style.wordBreak = 'break-word';
            }

            updateUndoRedoButtons() {
                this.undoBtn.disabled = this.undoStack.length === 0;
                this.redoBtn.disabled = this.redoStack.length === 0;
            }
            
            // 이벤트 리스너 설정
            setupEventListeners() {
                this.toolbar.addEventListener('click', (e) => {
                    const button = e.target.closest('.t2-btn');
                    if (!button) return;
                    e.stopPropagation();
                    const command = button.dataset.command;
                    this.handleCommand(command, button);
                });

                // 입력 이벤트 처리
                this.editor.addEventListener('input', (e) => {
                    this.handleInput(e);
                });

                // 키보드 이벤트 처리
                this.editor.addEventListener('keydown', (e) => {
                    this.handleKeyDown(e);
                });

                // 붙여넣기 이벤트 처리
                this.editor.addEventListener('paste', (e) => {
                    e.preventDefault();
                    this.handlePaste(e.clipboardData);
                });

                // 노드 변경 감지
                this.editor.addEventListener('DOMNodeInserted', (e) => {
                    this.handleNodeInserted(e);
                });
            }

            handleInput(e) {
                this.autoSave();
                this.handleBulletPoints();
                this.normalizeContent();
                this.createUndoPoint();
            }

            // 수정된 키보드 이벤트 처리
            handleKeyDown(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleEnterKey();
                } else if (e.key === 'Backspace') {
                    this.handleBackspace(e);
                }
            }

            // 개선된 Enter 키 처리
handleEnterKey() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    // 현재 캐럿이 위치한 블록 찾기
    let currentBlock = this.getClosestBlock(range.startContainer);
    
    // 블록이 없으면 새로 생성
    if (!currentBlock || currentBlock === this.editor) {
        currentBlock = document.createElement('p');
        currentBlock.innerHTML = '<br>';
        this.editor.appendChild(currentBlock);
        this.setCaretToStart(currentBlock);
        return;
    }
    
    // 새로운 블록 생성
    const newBlock = document.createElement('p');
    
    // 현재 블록의 내용 분할
    if (range.collapsed) {
        const beforeRange = document.createRange();
        beforeRange.selectNodeContents(currentBlock);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const afterRange = document.createRange();
        afterRange.selectNodeContents(currentBlock);
        afterRange.setStart(range.startContainer, range.startOffset);
        
        const beforeContent = beforeRange.cloneContents();
        const afterContent = afterRange.cloneContents();
        
        // 이전 내용 설정
        if (beforeContent.textContent.trim()) {
            currentBlock.innerHTML = '';
            currentBlock.appendChild(beforeContent);
        } else {
            currentBlock.innerHTML = '<br>';
        }
        
        // 이후 내용 설정
        if (afterContent.textContent.trim()) {
            newBlock.appendChild(afterContent);
        } else {
            newBlock.innerHTML = '<br>';
        }
    } else {
        newBlock.innerHTML = '<br>';
    }
    
    // 새 블록 삽입
    currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);
    
    // 커서를 새 블록의 시작점으로 이동
    this.setCaretToStart(newBlock);
    
    this.normalizeContent();
    this.createUndoPoint();
    this.autoSave();
}

// 2. setCaretToStart 메서드를 찾아 교체 (없다면 추가)
setCaretToStart(element) {
    const range = document.createRange();
    const selection = window.getSelection();
    
    // 첫 번째 텍스트 노드나 BR 태그 찾기
    let target = element.firstChild;
    while (target && target.nodeType === Node.ELEMENT_NODE && target.tagName !== 'BR') {
        target = target.firstChild;
    }
    
    if (!target) {
        // 내용이 없는 경우
        range.setStart(element, 0);
    } else if (target.nodeType === Node.TEXT_NODE) {
        // 텍스트 노드인 경우
        range.setStart(target, 0);
    } else {
        // BR 태그인 경우
        range.setStartBefore(target);
    }
    
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

// 3. normalizeContent 메서드를 찾아 교체
normalizeContent() {
    let lastBlock = null;
    const blocks = Array.from(this.editor.childNodes);
    
    blocks.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // 텍스트 노드를 p 태그로 감싸기
            const p = document.createElement('p');
            node.parentNode.insertBefore(p, node);
            p.appendChild(node);
            lastBlock = p;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 빈 블록 처리 개선
            if (!node.textContent.trim() && !node.querySelector('br')) {
                node.innerHTML = '<br>';
            }
            // 블록의 마지막이 br이 아닌 경우 br 추가
            const lastChild = node.lastChild;
            if (lastChild && lastChild.nodeType === Node.TEXT_NODE && !lastChild.textContent.trim()) {
                node.appendChild(document.createElement('br'));
            }
            lastBlock = node;
        }
    });
    
    // 에디터가 비어있으면 기본 블록 추가
    if (!this.editor.firstChild) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        this.editor.appendChild(p);
    }
}

            // 블록 요소 분할
            splitBlock(block, range) {
                const newBlock = block.cloneNode(false);
                const after = range.extractContents();
                
                if (after.textContent.trim() === '') {
                    newBlock.innerHTML = '<br>';
                } else {
                    newBlock.appendChild(after);
                }

                block.parentNode.insertBefore(newBlock, block.nextSibling);
                return newBlock;
            }

            // 가장 가까운 블록 레벨 요소 찾기
getClosestBlock(node) {
    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE'];
    while (node && node !== this.editor) {
        if (blockTags.includes(node.nodeName)) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}

// 백스페이스 키 처리
handleBackspace(e) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    // 에디터가 비어있거나 마지막 블록인 경우 기본 동작 방지
    if (this.editor.childNodes.length <= 1) {
        const onlyBlock = this.editor.firstElementChild;
        if (!onlyBlock || onlyBlock.textContent.trim() === '') {
            e.preventDefault();
            if (!onlyBlock || onlyBlock.tagName !== 'P') {
                this.resetEditor();
            }
            return;
        }
    }
    
    // 캐럿이 블록의 시작점에 있는 경우
    if (range.collapsed && this.isAtBlockStart(range)) {
        e.preventDefault();
        
        const currentBlock = this.getClosestBlock(range.startContainer);
        if (!currentBlock || currentBlock === this.editor) return;
        
        const previousBlock = currentBlock.previousElementSibling;
        if (!previousBlock) return;
        
        // 이전 블록과 병합
        this.mergeBlocks(previousBlock, currentBlock);
        this.createUndoPoint();
    }
    
    // 백스페이스 후 내용 정규화
    setTimeout(() => this.normalizeContent(), 0);
}

// 블록 병합
mergeBlocks(target, source) {
    const caretPosition = target.textContent.length;
    
    // 빈 <br> 제거
    if (target.innerHTML === '<br>') {
        target.innerHTML = '';
    }
    if (source.innerHTML === '<br>') {
        source.innerHTML = '';
    }
    
    // 내용 병합
    while (source.firstChild) {
        target.appendChild(source.firstChild);
    }
    source.remove();
    
    // 캐럿 위치 설정
    this.setCaretPosition(target, caretPosition);
    this.normalizeContent();
}

// 캐럿이 블록의 시작점에 있는지 확인
isAtBlockStart(range) {
    const block = this.getClosestBlock(range.startContainer);
    if (!block) return false;
    
    const blockRange = document.createRange();
    blockRange.selectNodeContents(block);
    blockRange.collapse(true);
    
    return range.compareBoundaryPoints(Range.START_TO_START, blockRange) === 0;
}

// 캐럿 위치 설정
setCaretPosition(element, offset) {
    const range = document.createRange();
    const selection = window.getSelection();
    
    // 텍스트 노드 찾기
    let targetNode = element.firstChild;
    while (targetNode && targetNode.nodeType !== Node.TEXT_NODE) {
        targetNode = targetNode.firstChild;
    }
    
    if (!targetNode) {
        targetNode = element;
        offset = 0;
    }
    
    range.setStart(targetNode, Math.min(offset, targetNode.length));
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
}

// 실행 취소 지점 생성
            createUndoPoint() {
                const currentContent = this.editor.innerHTML;
                if (currentContent === this.lastCheckpoint) return;
                
                this.undoStack.push(this.lastCheckpoint);
                this.lastCheckpoint = currentContent;
                this.redoStack = [];
                
                // 스택 크기 제한
                if (this.undoStack.length > 100) {
                    this.undoStack.shift();
                }
                
                this.updateUndoRedoButtons();
            }

            // 실행 취소
            undo() {
                if (this.undoStack.length === 0) return;
                
                const currentContent = this.editor.innerHTML;
                this.redoStack.push(currentContent);
                
                const previousContent = this.undoStack.pop();
                this.lastCheckpoint = previousContent;
                this.editor.innerHTML = previousContent;
                
                this.updateUndoRedoButtons();
            }

            // 다시 실행
            redo() {
                if (this.redoStack.length === 0) return;
                
                const currentContent = this.editor.innerHTML;
                this.undoStack.push(currentContent);
                
                const nextContent = this.redoStack.pop();
                this.lastCheckpoint = nextContent;
                this.editor.innerHTML = nextContent;
                
                this.updateUndoRedoButtons();
            }

// 노드 삽입 처리
handleNodeInserted(e) {
    if (e.target.nodeType === Node.TEXT_NODE && e.target.parentNode === this.editor) {
        const p = document.createElement('p');
        e.target.parentNode.insertBefore(p, e.target);
        p.appendChild(e.target);
        this.normalizeContent();
    }
}

// 요소를 현재 커서 위치에 삽입
insertAtCursor(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    
    // 블록 레벨 요소 처리
    if (this.isBlockElement(element)) {
        const currentBlock = this.getClosestBlock(range.startContainer);
        if (currentBlock && currentBlock !== this.editor) {
            currentBlock.parentNode.insertBefore(element, currentBlock.nextSibling);
        } else {
            this.editor.appendChild(element);
        }
    } else {
        range.insertNode(element);
    }
    
    // 캐럿 위치 업데이트
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    this.normalizeContent();
    this.createUndoPoint();
}

// 블록 레벨 요소인지 확인
isBlockElement(element) {
    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE'];
    return blockTags.includes(element.tagName);
}

// 명령어 처리
handleCommand(command, button) {
    switch(command) {
                    case 'undo':
                        this.undo();
                        break;
                    case 'redo':
                        this.redo();
                        break;
        case 'fontSize':
            this.showFontSizeList(button);
            break;
        case 'justifyContent':
            this.toggleAlignment(button);
            break;
        case 'foreColor':
        case 'backColor':
            // 색상 선택 전에 현재 선택 영역 저장
            this.saveSelection();
            this.showColorPalette(command, button);
            break;
        case 'insertYouTube':
            this.insertYouTube();
            break;
        case 'insertCodeBlock':
            this.insertCodeBlock();
            break;
        case 'insertImage':
            this.showImageUploadModal();
            break;
        default:
            // 기본 명령어 처리
            this.execCommand(command);
            // 토글 버튼 상태 업데이트
            if (['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
                button.classList.toggle('active');
            }
    }
    
    this.createUndoPoint();
}

// 선택 영역 저장/복원 메서드 추가
saveSelection() {
    if (window.getSelection) {
        this.savedSelection = window.getSelection().getRangeAt(0).cloneRange();
    }
}

restoreSelection() {
    if (this.savedSelection) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this.savedSelection);
    }
}

execCommand(command, value = null) {
    document.execCommand('styleWithCSS', false, true);
    
    switch(command) {
        case 'foreColor':
            document.execCommand('foreColor', false, value);
            break;
        case 'backColor':
            document.execCommand('hiliteColor', false, value);
            break;
        case 'fontSize':
            document.execCommand('fontSize', false, value);
            break;
        case 'justifyContent':
            const alignments = {
                'left': 'justifyLeft',
                'center': 'justifyCenter',
                'right': 'justifyRight'
            };
            document.execCommand(alignments[value] || 'justifyLeft', false, null);
            break;
        default:
            document.execCommand(command, false, value);
    }
    
    this.normalizeContent();
}

// toggleAlignment 메서드 추가
toggleAlignment(button) {
    const alignments = ['left', 'center', 'right'];
    const icons = ['format_align_left', 'format_align_center', 'format_align_right'];
    
    let currentIndex = alignments.indexOf(this.alignmentState);
    currentIndex = (currentIndex + 1) % alignments.length;
    
    this.alignmentState = alignments[currentIndex];
    button.querySelector('.material-icons').textContent = icons[currentIndex];
    
    this.execCommand('justifyContent', this.alignmentState);
}

// 글꼴 크기 목록 표시
// showFontSizeList 메서드 수정
showFontSizeList(button) {
    const sizes = ['12', '14', '16', '18', '20', '24', '28', '32', '36'];
    const list = document.createElement('div');
    list.className = 't2-font-size-list';
    
    let touchStartY = 0;
    list.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    sizes.forEach(size => {
        const option = document.createElement('div');
        option.className = 't2-font-size-option';
        option.textContent = `${size}px`;
        option.style.fontSize = '14px';
        option.style.userSelect = 'none';
        option.style.transition = 'background-color 0.1s ease';
        
        // 호버 효과를 JavaScript로 처리
        option.addEventListener('mouseenter', () => {
            option.style.backgroundColor = '#f5f5f5';
        });
        
        option.addEventListener('mouseleave', () => {
            option.style.backgroundColor = 'transparent';
        });
        
        const handleSelection = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.type === 'touchend') {
                const touchEndY = e.changedTouches[0].clientY;
                if (Math.abs(touchEndY - touchStartY) > 5) return;
            }
            
            option.style.backgroundColor = '#e5e7eb';
            
            setTimeout(() => {
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.fontSize = `${size}px`;
                
                if (range.collapsed) {
                    span.appendChild(document.createTextNode('\u200B'));
                    range.insertNode(span);
                    range.collapse(false);
                } else {
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);
                }
                
                list.remove();
                this.normalizeContent();
                this.createUndoPoint();
            }, 50);
        };
        
        option.addEventListener('click', handleSelection);
        option.addEventListener('touchend', handleSelection);
        list.appendChild(option);
    });
    
    this.showDropdown(list, button);
}

// 드롭다운 표시 헬퍼 메서드
showDropdown(element, button) {
    const rect = button.getBoundingClientRect();
    element.style.position = 'fixed';
    element.style.top = `${rect.bottom + window.scrollY}px`;
    element.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(element);
    
    const closeHandler = (e) => {
        if (!element.contains(e.target) && e.target !== button) {
            element.remove();
            document.removeEventListener('click', closeHandler);
            document.removeEventListener('touchend', closeHandler);
        }
    };
    
    document.addEventListener('click', closeHandler);
    document.addEventListener('touchend', closeHandler);
}

// 색상 팔레트 표시
showColorPalette(command, button) {
    const colors = [
        '#000000', '#434343', '#666666', '#999999',
        '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
        '#f3f3f3', '#ffffff', '#980000', '#ff0000',
        '#ff9900', '#ffff00', '#00ff00', '#00ffff',
        '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'
    ];
    
    const palette = document.createElement('div');
    palette.className = 't2-color-palette';
    
    colors.forEach(color => {
        const option = document.createElement('div');
        option.className = 't2-color-option';
        option.style.backgroundColor = color;
        
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 저장된 선택 영역 복원
            this.restoreSelection();
            
            // 명령어 실행
            if (command === 'foreColor') {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('foreColor', false, color);
            } else if (command === 'backColor') {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand('hiliteColor', false, color);
            }
            
            // 팔레트 제거
            palette.remove();
            
            // 변경 이력 저장
            this.createUndoPoint();
        });
        
        palette.appendChild(option);
    });
    
    // 드롭다운 표시
    const rect = button.getBoundingClientRect();
    palette.style.position = 'fixed';
    palette.style.top = `${rect.bottom + window.scrollY}px`;
    palette.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(palette);
    
    // 팔레트 외부 클릭 시 닫기
    const closeHandler = (e) => {
        if (!palette.contains(e.target) && e.target !== button) {
            palette.remove();
            document.removeEventListener('click', closeHandler);
        }
    };
    
    document.addEventListener('click', closeHandler);
}

// YouTube 영상 ID 추출 및 동영상 URL 검증
getVideoType(url) {
    // YouTube URL 패턴
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const youtubeMatch = url.match(youtubeRegExp);
    
    if (youtubeMatch && youtubeMatch[2].length === 11) {
        return { type: 'youtube', id: youtubeMatch[2] };
    }
    
    // 직접 비디오 URL 패턴
    const videoRegExp = /\.(mp4|webm|ogg)$/i;
    const videoMatch = url.match(videoRegExp);
    
    if (videoMatch) {
        return { type: 'video', url: url };
    }
    
    return null;
}

// 비디오 블록 생성
createVideoBlock(videoInfo) {
    const defaultWidth = 464;
    const defaultHeight = 261;

    const wrapper = document.createElement('div');
    wrapper.className = 't2-media-block';
    
    const videoContainer = document.createElement('div');
    videoContainer.style.width = defaultWidth + 'px';
    videoContainer.style.height = defaultHeight + 'px';
    videoContainer.style.maxWidth = '100%';
    videoContainer.style.margin = '0 auto';
    
    let videoElement;
    
    if (videoInfo.type === 'youtube') {
        videoElement = document.createElement('iframe');
        videoElement.src = `https://www.youtube.com/embed/${videoInfo.id}`;
        videoElement.frameBorder = "0";
        videoElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        videoElement.allowFullscreen = true;
    } else {
        videoElement = document.createElement('video');
        videoElement.src = videoInfo.url;
        videoElement.controls = true;
        videoElement.style.backgroundColor = '#000';
    }
    
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    
    videoContainer.appendChild(videoElement);

    // 컨트롤 생성 및 이벤트 핸들러 설정
    const controls = this.createVideoControls(videoContainer, videoElement, videoInfo, defaultWidth, defaultHeight);
    
    wrapper.appendChild(videoContainer);
    wrapper.appendChild(controls);
    
    return wrapper;
}

// 비디오 컨트롤 생성
createVideoControls(container, videoElement, videoInfo, defaultWidth, defaultHeight) {
    const controls = document.createElement('div');
    controls.className = 't2-media-controls';
    controls.contentEditable = false;

    controls.innerHTML = `
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
        <button class="t2-btn edit-url-btn">
            <span class="material-icons">edit</span>
        </button>
        <input type="range" min="30" max="200" value="100" style="width: 100px;">
    `;

    // 크기 조절 이벤트
    const rangeInput = controls.querySelector('input[type="range"]');
    rangeInput.addEventListener('input', (e) => {
        const percentage = e.target.value;
        container.style.width = (defaultWidth * percentage / 100) + 'px';
        container.style.height = (defaultHeight * percentage / 100) + 'px';
    });

    // URL 편집 이벤트
    const editUrlBtn = controls.querySelector('.edit-url-btn');
    editUrlBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showVideoUrlEditModal(videoElement, videoInfo);
    });

    return controls;
}

// 비디오 URL 편집 모달
showVideoUrlEditModal(videoElement, currentVideoInfo) {
    const currentUrl = currentVideoInfo.type === 'youtube' 
        ? `https://youtube.com/watch?v=${currentVideoInfo.id}`
        : currentVideoInfo.url;
    
    const modal = document.createElement('div');
    modal.className = 't2-modal-overlay';
    
    modal.innerHTML = `
        <div class="t2-video-editor-modal">
            <h3>비디오 URL 수정</h3>
            <input type="text" placeholder="동영상 링크 삽입" class="t2-youtube-url" value="${currentUrl}">
            <div class="t2-video-type-info">
                지원 동영상 유형: 유튜브, 비디오 파일(.mp4, .webm, .ogg) 링크
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">수정</button>
            </div>
        </div>
    `;

    const updateVideo = () => {
        const url = modal.querySelector('.t2-youtube-url').value;
        const videoInfo = this.getVideoType(url);
        
        if (!videoInfo) {
            alert('올바른 비디오 URL을 입력해주세요.');
            return;
        }

        if (videoInfo.type === 'youtube') {
            videoElement.src = `https://www.youtube.com/embed/${videoInfo.id}`;
        } else {
            const newVideo = document.createElement('video');
            newVideo.src = videoInfo.url;
            newVideo.controls = true;
            newVideo.style = videoElement.style;
            videoElement.parentNode.replaceChild(newVideo, videoElement);
        }

        modal.remove();
        this.createUndoPoint();
        this.autoSave();
    };

    modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();
    modal.querySelector('[data-action="insert"]').onclick = updateVideo;
    
    modal.querySelector('.t2-youtube-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateVideo();
        }
    });

    document.body.appendChild(modal);
    modal.querySelector('.t2-youtube-url').focus();
}

// 비디오 삽입 메서드 
insertYouTube() {
    const modal = document.createElement('div');
    modal.className = 't2-modal-overlay';
    
    modal.innerHTML = `
<div class="t2-video-editor-modal">
    <h3>비디오 삽입</h3>
    <input type="text" placeholder="동영상 링크 삽입" class="t2-youtube-url">
    <div class="t2-video-type-info">
        지원 동영상 유형: 유튜브, 비디오 파일(.mp4, .webm, .ogg) 링크
    </div>
    <div class="t2-btn-group">
        <button class="t2-btn" data-action="cancel">취소</button>
        <button class="t2-btn" data-action="insert">삽입</button>
    </div>
</div>
    `;

    const insertVideo = () => {
        const url = modal.querySelector('.t2-youtube-url').value;
        const videoInfo = this.getVideoType(url);
        
        if (!videoInfo) {
            alert('올바른 비디오 URL을 입력해주세요.');
            return;
        }

        const videoBlock = this.createVideoBlock(videoInfo);
        
        // 현재 선택 위치에 삽입
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const p = document.createElement('p');
            p.appendChild(videoBlock);
            range.insertNode(p);
            
            range.setStartAfter(p);
            range.setEndAfter(p);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            const p = document.createElement('p');
            p.appendChild(videoBlock);
            this.editor.appendChild(p);
        }

        this.normalizeContent();
        this.createUndoPoint();
        this.autoSave();
        modal.remove();
    };

    modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();
    modal.querySelector('[data-action="insert"]').onclick = insertVideo;
    
    modal.querySelector('.t2-youtube-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            insertVideo();
        }
    });

    document.body.appendChild(modal);
    modal.querySelector('.t2-youtube-url').focus();
}

// 코드 블록 삽입
// 코드 블록 삽입
insertCodeBlock() {
    const code = document.createElement('div');
    code.className = 't2-code-block';
    
    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.textContent = '코드를 입력하세요';
    codeElement.classList.add('code-placeholder');
    codeElement.setAttribute('contenteditable', 'true');  // 명시적으로 편집 가능하도록 설정
    pre.appendChild(codeElement);
    
    const copyButton = document.createElement('button');
    copyButton.className = 't2-code-block-copy';
    copyButton.innerHTML = '<span class="material-icons">content_copy</span>';
    copyButton.contentEditable = 'false';
    
    copyButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // placeholder 텍스트가 아닌 실제 내용만 복사
        const content = codeElement.classList.contains('code-placeholder') ? '' : codeElement.textContent;
        navigator.clipboard.writeText(content);
        alert('코드가 클립보드에 복사되었습니다.');
    });
    
    // 코드 블록 클릭 이벤트
    codeElement.addEventListener('click', function(e) {
        if (this.classList.contains('code-placeholder')) {
            this.textContent = '';
            this.classList.remove('code-placeholder');
            // 커서 위치를 처음으로 설정
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(this, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    // 코드 블록 포커스 이벤트
    codeElement.addEventListener('focus', function(e) {
        if (this.classList.contains('code-placeholder')) {
            this.textContent = '';
            this.classList.remove('code-placeholder');
        }
    });

    // 코드 블록 블러 이벤트
    codeElement.addEventListener('blur', function() {
        if (this.textContent.trim() === '') {
            this.textContent = '코드를 입력하세요';
            this.classList.add('code-placeholder');
        }
    });

    // 키보드 이벤트 추가
    codeElement.addEventListener('keydown', function(e) {
        // Tab 키 처리
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    '); // 4칸 들여쓰기
        }
    });
    
    code.appendChild(copyButton);
    code.appendChild(pre);
    this.insertAtCursor(code);
}

// 이미지 업로드 모달 표시
showImageUploadModal() {
    const modal = document.createElement('div');
    modal.className = 't2-modal-overlay';
    
    modal.innerHTML = `
        <div class="t2-image-editor-modal">
            <h3>이미지 업로드</h3>
            <div class="t2-image-preview">
                <img src="" alt="이미지 미리보기">
            </div>
            <div class="t2-image-upload-area">
                <span class="material-icons">cloud_upload</span>
                <div class="t2-image-upload-text">클릭하여 이미지 선택</div>
                <div class="t2-image-upload-hint">또는 이미지를 여기로 드래그하세요</div>
                <input type="file" accept="image/*">
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="upload" disabled>업로드</button>
            </div>
        </div>
    `;
    
    const fileInput = modal.querySelector('input[type="file"]');
    const uploadBtn = modal.querySelector('[data-action="upload"]');
    const previewArea = modal.querySelector('.t2-image-preview');
    const previewImg = previewArea.querySelector('img');
    const uploadArea = modal.querySelector('.t2-image-upload-area');
    
    // 파일 선택 처리
    const handleFileSelect = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewArea.classList.add('active');
            uploadBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    };

    // 파일 입력 이벤트
    fileInput.onchange = (e) => handleFileSelect(e.target.files[0]);

    // 드래그 앤 드롭 이벤트
    uploadArea.ondragover = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#2563eb';
        uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
    };

    uploadArea.ondragleave = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = 'transparent';
    };

    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e5e7eb';
        uploadArea.style.background = 'transparent';
        
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    // 버튼 이벤트
    modal.querySelector('[data-action="cancel"]').onclick = () => modal.remove();
    modal.querySelector('[data-action="upload"]').onclick = () => {
        const file = fileInput.files[0];
        if (file) {
            this.handleImageUpload(file);
            modal.remove();
        }
    };

    document.body.appendChild(modal);
}

// 이미지 업로드 처리
handleImageUpload(file) {
   const reader = new FileReader();
   reader.onload = (e) => {
       const img = document.createElement('div');
       img.className = 't2-media-block';
       
       const imageElement = document.createElement('img');
       imageElement.src = e.target.result;
       imageElement.style.maxWidth = '100%';
       
       const controls = document.createElement('div');
       controls.className = 't2-media-controls';
       controls.contentEditable = false;
       
       let rotation = 0;
       let flipped = false;
       
       controls.innerHTML = `
           <button class="t2-btn" onclick="this.closest('.t2-media-block').remove()">
               <span class="material-icons">delete</span>
           </button>
           <button class="t2-btn" data-action="rotate">
               <span class="material-icons">rotate_right</span>
           </button>
           <button class="t2-btn" data-action="flip">
               <span class="material-icons">flip</span>
           </button>
           <input type="range" min="10" max="200" value="100">
       `;
       
       // 이미지 크기 조절
       const rangeInput = controls.querySelector('input[type="range"]');
       rangeInput.addEventListener('input', (e) => {
           imageElement.style.width = `${e.target.value}%`;
       });
       
       // 이미지 회전
       controls.querySelector('[data-action="rotate"]').onclick = () => {
           rotation = (rotation + 90) % 360;
           this.updateImageTransform(imageElement, rotation, flipped);
       };
       
       // 이미지 좌우 반전
       controls.querySelector('[data-action="flip"]').onclick = () => {
           flipped = !flipped;
           this.updateImageTransform(imageElement, rotation, flipped);
       };
       
       img.appendChild(imageElement);
       img.appendChild(controls);
       this.insertAtCursor(img);
   };
   reader.readAsDataURL(file);
}

// 이미지 변형 업데이트
updateImageTransform(image, rotation, flipped) {
   image.style.transform = `
       rotate(${rotation}deg)
       scaleX(${flipped ? -1 : 1})
   `;
}

// 붙여넣기 처리
handlePaste(clipboardData) {
   let content = clipboardData.getData('text/html') || clipboardData.getData('text');
   
   // URL 패턴 매칭
   const urlRegex = /(https?:\/\/[^\s]+)/g;
   const urls = content.match(urlRegex);
   
   if (urls) {
       urls.forEach(async url => {
           if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
               await this.insertImageFromUrl(url);
           } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
               const videoId = this.getYouTubeVideoId(url);
               if (videoId) {
                   this.insertYouTube(url);
               }
           } else {
               await this.insertLinkPreview(url);
           }
       });
   } else {
       // 일반 텍스트 붙여넣기
       const textContent = clipboardData.getData('text/plain');
       const lines = textContent.split(/\r?\n/);
       
       lines.forEach((line, index) => {
           if (index > 0) {
               const p = document.createElement('p');
               p.textContent = line || '\u200B'; // 빈 줄인 경우 제로윗스 공백 사용
               this.insertAtCursor(p);
           } else {
               document.execCommand('insertText', false, line);
           }
       });
   }
   
   this.normalizeContent();
   this.createUndoPoint();
}

// URL에서 이미지 삽입
async insertImageFromUrl(url) {
   try {
       const response = await fetch(url);
       const blob = await response.blob();
       
       const reader = new FileReader();
       reader.onload = (e) => {
           const img = document.createElement('img');
           img.src = e.target.result;
           img.style.maxWidth = '100%';
           
           const wrapper = document.createElement('div');
           wrapper.className = 't2-media-block';
           wrapper.appendChild(img);
           
           this.insertAtCursor(wrapper);
       };
       reader.readAsDataURL(blob);
   } catch (error) {
       console.error('이미지 로드 실패:', error);
   }
}

// 링크 프리뷰 삽입
async insertLinkPreview(url) {
   const preview = document.createElement('div');
   preview.className = 't2-link-preview';
   preview.innerHTML = `
       <div class="t2-link-preview-content">
           <a href="${url}" target="_blank">${url}</a>
       </div>
   `;
   
   this.insertAtCursor(preview);
}

// 자동 저장
autoSave() {
    const content = this.editor.innerHTML;
    // 모든 빈 p 태그를 <p><br></p>로 정규화
    const normalizedContent = content.replace(/<p>\s*<\/p>/g, '<p><br></p>');
    localStorage.setItem('t2editor-autosave', normalizedContent);
}

// 자동 저장 데이터 로드
loadAutoSave() {
    const saved = localStorage.getItem('t2editor-autosave');
    if (saved) {
        this.editor.innerHTML = saved;
        // 저장된 내용 로드 후 정규화
        this.normalizeContent();
    }
}

// 페이지 이탈 시 처리
setupBeforeUnload() {
   window.addEventListener('beforeunload', () => {
       this.autoSave();
   });
}

// 자동 저장 데이터 삭제
clearAutoSave() {
   localStorage.removeItem('t2editor-autosave');
}
}

// 에디터 초기화
const editor = new T2Editor(document.querySelector('.t2-editor-container'));
</script>
</html>