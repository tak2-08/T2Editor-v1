class T2Editor{constructor(e){this.container=e,this.editor=e.querySelector(".t2-editor"),this.toolbar=e.querySelector(".t2-toolbar"),this.isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1,this.isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),this.autoSaveEnabled="false"!==localStorage.getItem("t2editor-autosave-enabled"),this.setupEditor(),this.setupEventListeners(),this.loadAutoSave(),this.setupAutoSaveToggle(),this.autoSaveEnabled&&this.loadAutoSave(),this.setupBeforeUnload(),this.alignmentState="left",this.bulletState={active:!1,type:null,count:1},this.undoStack=[],this.redoStack=[],this.lastCheckpoint=null,this.undoBtn=e.querySelector('[data-command="undo"]'),this.redoBtn=e.querySelector('[data-command="redo"]'),this.updateUndoRedoButtons(),this.charCount=e.querySelector(".t2-char-count span"),this.updateCharCount(),this.editor.addEventListener("input",()=>{this.updateCharCount()})}setupEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.appendChild(e),this.editor.style.whiteSpace="pre-wrap",this.editor.style.wordBreak="break-word"}updateUndoRedoButtons(){this.undoBtn.disabled=0===this.undoStack.length,this.redoBtn.disabled=0===this.redoStack.length}setupEventListeners(){this.toolbar.addEventListener("click",e=>{let t=e.target.closest(".t2-btn");if(!t)return;e.preventDefault(),e.stopPropagation();let a=t.dataset.command;this.handleCommand(a,t)}),this.isIOS||this.isSafari?this.editor.addEventListener("keydown",e=>{"Backspace"===e.key&&this.handleBackspace(e)}):this.editor.addEventListener("keydown",e=>{"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}),this.editor.addEventListener("input",e=>{this.handleInput(e)}),this.editor.addEventListener("paste",e=>{e.preventDefault(),this.handlePaste(e.clipboardData)}),this.editor.addEventListener("DOMNodeInserted",e=>{this.handleNodeInserted(e)})}handleInput(e){this.autoSave(),this.handleBulletPoints(),this.isIOS||this.isSafari?requestAnimationFrame(()=>{this.normalizeContent()}):this.normalizeContent(),this.createUndoPoint()}handleKeyDown(e){"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}handleEnterKey(){let e=window.getSelection(),t=e.getRangeAt(0),a=this.getClosestBlock(t.startContainer);if(!a||a===this.editor){(a=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(a),this.setCaretToStart(a);return}let l=document.createElement("p");if(t.collapsed){let i=document.createRange();i.selectNodeContents(a),i.setEnd(t.startContainer,t.startOffset);let n=document.createRange();n.selectNodeContents(a),n.setStart(t.startContainer,t.startOffset);let r=i.cloneContents(),o=n.cloneContents();r.textContent.trim()?(a.innerHTML="",a.appendChild(r)):a.innerHTML="<br>",o.textContent.trim()?l.appendChild(o):l.innerHTML="<br>"}else l.innerHTML="<br>";a.parentNode.insertBefore(l,a.nextSibling),this.setCaretToStart(l),this.normalizeContent(),this.createUndoPoint(),this.autoSave()}setCaretToStart(e){let t=document.createRange(),a=window.getSelection(),l=e.firstChild;for(;l&&l.nodeType===Node.ELEMENT_NODE&&"BR"!==l.tagName;)l=l.firstChild;l?l.nodeType===Node.TEXT_NODE?t.setStart(l,0):t.setStartBefore(l):t.setStart(e,0),t.collapse(!0),a.removeAllRanges(),a.addRange(t)}normalizeContent(){let e=null,t=Array.from(this.editor.childNodes);if(t.forEach((t,a)=>{if(t.nodeType===Node.TEXT_NODE){let l=document.createElement("p");t.parentNode.insertBefore(l,t),l.appendChild(t),e=l}else if(t.nodeType===Node.ELEMENT_NODE){if(t.classList?.contains("t2-media-block")){let i=t.previousElementSibling,n=t.nextElementSibling;i&&"P"===i.tagName&&!i.textContent.trim()&&i.querySelector("br")&&i.remove(),n&&"P"===n.tagName&&!n.textContent.trim()&&n.querySelector("br")&&n.remove()}t.textContent.trim()||t.querySelector("br")||t.classList?.contains("t2-media-block")||(this.isIOS||this.isSafari?t.innerHTML="<br>":t.innerHTML="​<br>"),e=t}}),!this.editor.firstChild){let a=document.createElement("p");this.isIOS||this.isSafari?a.innerHTML="<br>":a.innerHTML="​<br>",this.editor.appendChild(a)}}splitBlock(e,t){let a=e.cloneNode(!1),l=t.extractContents();return""===l.textContent.trim()?a.innerHTML="<br>":a.appendChild(l),e.parentNode.insertBefore(a,e.nextSibling),a}getClosestBlock(e){let t=["P","DIV","H1","H2","H3","H4","H5","H6","PRE"];for(;e&&e!==this.editor;){if(t.includes(e.nodeName))return e;e=e.parentNode}return null}handleBackspace(e){let t=window.getSelection(),a=t.getRangeAt(0);if(this.editor.childNodes.length<=1){let l=this.editor.firstElementChild;if(!l||""===l.textContent.trim()){e.preventDefault(),l&&"P"===l.tagName||this.resetEditor();return}}if(a.collapsed&&this.isAtBlockStart(a)){e.preventDefault();let i=this.getClosestBlock(a.startContainer);if(!i||i===this.editor)return;let n=i.previousElementSibling;if(!n)return;this.mergeBlocks(n,i),this.createUndoPoint()}setTimeout(()=>this.normalizeContent(),0)}mergeBlocks(e,t){let a=e.textContent.length;for("<br>"===e.innerHTML&&(e.innerHTML=""),"<br>"===t.innerHTML&&(t.innerHTML="");t.firstChild;)e.appendChild(t.firstChild);t.remove(),this.setCaretPosition(e,a),this.normalizeContent()}isAtBlockStart(e){let t=this.getClosestBlock(e.startContainer);if(!t)return!1;let a=document.createRange();return a.selectNodeContents(t),a.collapse(!0),0===e.compareBoundaryPoints(Range.START_TO_START,a)}setCaretPosition(e,t){let a=document.createRange(),l=window.getSelection(),i=e.firstChild;for(;i&&i.nodeType!==Node.TEXT_NODE;)i=i.firstChild;i||(i=e,t=0),a.setStart(i,Math.min(t,i.length)),a.collapse(!0),l.removeAllRanges(),l.addRange(a)}createUndoPoint(){let e=this.editor.innerHTML;e!==this.lastCheckpoint&&(this.undoStack.push(this.lastCheckpoint),this.lastCheckpoint=e,this.redoStack=[],this.undoStack.length>100&&this.undoStack.shift(),this.updateUndoRedoButtons())}undo(){if(0===this.undoStack.length)return;let e=this.editor.innerHTML;this.redoStack.push(e);let t=this.undoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}redo(){if(0===this.redoStack.length)return;let e=this.editor.innerHTML;this.undoStack.push(e);let t=this.redoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}handleNodeInserted(e){if(e.target.nodeType===Node.TEXT_NODE&&e.target.parentNode===this.editor){let t=document.createElement("p");e.target.parentNode.insertBefore(t,e.target),t.appendChild(e.target),this.normalizeContent()}}insertAtCursor(e){let t=window.getSelection();if(!t.rangeCount)return;let a=t.getRangeAt(0),l=this.getClosestBlock(a.startContainer);if(l&&l!==this.editor){let i=document.createElement("p");i.appendChild(e);let n=l.nextElementSibling;n&&("P"!==n.tagName||n.textContent.trim()||n.querySelector("br"))?l.parentNode.insertBefore(i,n):l.parentNode.insertBefore(i,l.nextSibling);let r=document.createRange();r.setStartAfter(i),r.collapse(!0),t.removeAllRanges(),t.addRange(r)}else{let o=document.createElement("p");o.appendChild(e),this.editor.appendChild(o);let s=document.createRange();s.setStartAfter(o),s.collapse(!0),t.removeAllRanges(),t.addRange(s)}this.normalizeContent(),this.createUndoPoint()}isBlockElement(e){return["P","DIV","H1","H2","H3","H4","H5","H6","PRE"].includes(e.tagName)}handleCommand(e,t){switch(e){case"undo":this.undo();break;case"redo":this.redo();break;case"fontSize":this.showFontSizeList(t);break;case"justifyContent":this.toggleAlignment(t);break;case"foreColor":case"backColor":this.saveSelection(),this.showColorPalette(e,t);break;case"insertYouTube":this.insertYouTube();break;case"insertCodeBlock":this.insertCodeBlock();break;case"insertImage":this.showImageUploadModal();break;case"createLink":this.showLinkModal();break;case"attachFile":this.handleAttachFile();break;case"insertTable":this.showTableModal();break;case"exportHTML":this.exportToHTML();break;default:this.execCommand(e),["bold","italic","underline","strikeThrough"].includes(e)&&t.classList.toggle("active")}this.createUndoPoint()}saveSelection(){window.getSelection&&(this.savedSelection=window.getSelection().getRangeAt(0).cloneRange())}restoreSelection(){if(this.savedSelection){let e=window.getSelection();e.removeAllRanges(),e.addRange(this.savedSelection)}}execCommand(e,t=null){if(document.execCommand("styleWithCSS",!1,!0),"fontSize"===e){let a=window.getSelection(),l=a.getRangeAt(0),i=document.createElement("span");i.style.fontSize=t+"px";let n=l.commonAncestorContainer.parentElement;n&&n.style.fontSize?n.style.fontSize=t+"px":l.surroundContents(i)}else document.execCommand(e,!1,t);this.normalizeContent()}toggleAlignment(e){let t=["left","center","right"],a=t.indexOf(this.alignmentState);a=(a+1)%t.length,this.alignmentState=t[a],e.querySelector(".material-icons").textContent=["format_align_left","format_align_center","format_align_right"][a];let l=window.getSelection(),i=l.getRangeAt(0),n=this.getClosestBlock(i.commonAncestorContainer);n&&(n.style.textAlign=this.alignmentState),this.execCommand(["justifyLeft","justifyCenter","justifyRight"][a]),this.createUndoPoint()}showFontSizeList(e){let t=document.createElement("div");t.className="t2-font-size-list",t.style.cssText=`
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 120px;
    `,["11","13","15","16","19","24","30","34","38"].forEach(e=>{let a=document.createElement("div");a.className="t2-font-size-option",a.textContent=`${e}px`,a.style.cssText=`
            padding: 5px 15px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.1s ease;
        `,a.addEventListener("mouseenter",()=>{a.style.backgroundColor="#f5f5f5"}),a.addEventListener("mouseleave",()=>{a.style.backgroundColor="transparent"}),a.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.execCommand("fontSize",e),t.parentElement.remove(),this.createUndoPoint()}),t.appendChild(a)}),this.showDropdown(t,e)}showDropdown(e,t){let a=t.getBoundingClientRect(),l=this.toolbar.getBoundingClientRect(),i=document.createElement("div");i.style.cssText=`
        position: absolute;
        top: ${a.bottom-l.top}px;
        left: ${a.left-l.left}px;
        z-index: 10000;
    `,i.appendChild(e),this.toolbar.appendChild(i);let n=e.getBoundingClientRect(),r=window.innerWidth;if(n.right>r){let o=n.right-r;i.style.left=`${parseInt(i.style.left)-o-10}px`}let s=a=>{e.contains(a.target)||a.target===t||(i.remove(),document.removeEventListener("mousedown",s))};requestAnimationFrame(()=>{document.addEventListener("mousedown",s)})}showColorPalette(e,t){let a=document.createElement("div");a.className="t2-color-palette",a.style.cssText=`
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 4px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 120px;
    `,["#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#f3f3f3","#ffffff","#ed2f27","#ff8d3f","#eeea7e","#acbc8a","#56bf56","#588c7e","#5ed0fe","#0187fe","#3c55dc","#7d4afe","#f2a5d8"].forEach(t=>{let l=document.createElement("div");l.className="t2-color-option",l.style.cssText=`
            width: 25px;
            height: 25px;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #ddd;
            background-color: ${t};
        `,l.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.restoreSelection(),this.execCommand(e,t),a.parentElement.remove(),this.createUndoPoint()}),a.appendChild(l)});let l=document.createElement("div");l.style.cssText=`
        grid-column: span 4;
        display: flex;
        gap: 5px;
        margin-top: 10px;
    `;let i=document.createElement("div");i.className="t2-color-input-container";let n=document.createElement("span");n.textContent="#",n.className="t2-color-hash";let r=document.createElement("input");r.type="text",r.className="t2-color-input",r.maxLength=6,i.appendChild(n),i.appendChild(r);let o=document.createElement("button");o.textContent="적용",o.className="t2-color-apply-btn";let s=e=>3===e.length?e.split("").map(e=>e+e).join(""):e,d=()=>{let t=r.value.trim();if(/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(t)){let l="#"+s(t);this.restoreSelection(),this.execCommand(e,l),a.parentElement.remove(),this.createUndoPoint()}else alert("올바른 색상 코드를 입력해주세요. (예: FF0000 또는 F00)")};o.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),d()}),r.addEventListener("input",e=>{let t=e.target.value.replace(/[^0-9A-Fa-f]/gi,"");t.length>6&&(t=t.slice(0,6)),e.target.value=t}),r.addEventListener("keypress",e=>{if(r.value.length>=6&&r.selectionStart===r.selectionEnd||!/[0-9A-Fa-f]/i.test(e.key)){e.preventDefault();return}"Enter"===e.key&&(e.preventDefault(),d())}),r.addEventListener("paste",e=>{e.preventDefault();let t=(e.clipboardData||window.clipboardData).getData("text");t.startsWith("#")&&(t=t.substring(1)),t=(t=(t=t.replace(/#/g,"")).replace(/[^0-9A-Fa-f]/gi,"")).slice(0,6);let a=r.selectionStart,l=r.selectionEnd,i=r.value,n=i.slice(0,a),o=i.slice(l),s=(n+t+o).slice(0,6);r.value=s}),l.appendChild(i),l.appendChild(o),a.appendChild(l),this.showDropdown(a,t),r.focus()}getVideoType(e){let t=e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);if(t&&11===t[2].length)return{type:"youtube",id:t[2]};let a=e.match(/\.(mp4|webm|ogg)$/i);return a?{type:"video",url:e}:null}createVideoBlock(e){let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width="320px",a.style.height="180px",a.style.maxWidth="100%",a.style.margin="0 auto",a.dataset.width=320,a.dataset.height=180;let l;"youtube"===e.type?((l=document.createElement("iframe")).src=`https://www.youtube.com/embed/${e.id}`,l.frameBorder="0",l.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",l.allowFullscreen=!0):((l=document.createElement("video")).src=e.url,l.controls=!0,l.style.backgroundColor="#000"),l.style.width="100%",l.style.height="100%",a.appendChild(l);let i=this.createVideoControls(a,l,e,320,180);return t.appendChild(a),t.appendChild(i),t}createVideoControls(e,t,a,l,i){let n=document.createElement("div");n.className="t2-media-controls",n.contentEditable=!1,n.innerHTML=`
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
        <button class="t2-btn edit-url-btn">
            <span class="material-icons">edit</span>
        </button>
        <input type="range" min="30" max="200" value="100" style="width: 100px;">
    `;let r=n.querySelector('input[type="range"]');r.addEventListener("input",t=>{let a=t.target.value;e.style.width=l*a/100+"px",e.style.height=i*a/100+"px"});let o=n.querySelector(".edit-url-btn");return o.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.showVideoUrlEditModal(t,a)}),n}showVideoUrlEditModal(e,t){let a="youtube"===t.type?`https://youtube.com/watch?v=${t.id}`:t.url,l=document.createElement("div");l.className="t2-modal-overlay",l.innerHTML=`
        <div class="t2-video-editor-modal">
            <h3>비디오 URL 수정</h3>
            <input type="text" placeholder="동영상 링크 삽입" class="t2-youtube-url" value="${a}">
            <div class="t2-video-type-info">
                지원 동영상 유형: 유튜브, 비디오 파일(.mp4, .webm, .ogg) 링크
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">수정</button>
            </div>
        </div>
    `;let i=()=>{let t=l.querySelector(".t2-youtube-url").value,a=this.getVideoType(t);if(!a){alert("올바른 비디오 URL을 입력해주세요.");return}if("youtube"===a.type)e.src=`https://www.youtube.com/embed/${a.id}`;else{let i=document.createElement("video");i.src=a.url,i.controls=!0,i.style=e.style,e.parentNode.replaceChild(i,e)}l.remove(),this.createUndoPoint(),this.autoSave()};l.querySelector('[data-action="cancel"]').onclick=()=>l.remove(),l.querySelector('[data-action="insert"]').onclick=i,l.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),i())}),document.body.appendChild(l),l.querySelector(".t2-youtube-url").focus()}insertYouTube(){let e=window.getSelection(),t=e.getRangeAt(0),a=t.cloneRange(),l=document.createElement("div");l.className="t2-modal-overlay",l.innerHTML=`
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
    `;let i=()=>{let t=l.querySelector(".t2-youtube-url").value,i=this.getVideoType(t);if(!i){alert("올바른 비디오 URL을 입력해주세요.");return}let n=this.createVideoBlock(i);e.removeAllRanges(),e.addRange(a);let r=this.getClosestBlock(a.startContainer);if(r&&r!==this.editor){let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling);let s=document.createElement("p");s.appendChild(n),o.parentNode.insertBefore(s,o.nextSibling);let d=document.createElement("p");d.innerHTML="<br>",s.parentNode.insertBefore(d,s.nextSibling);let c=document.createRange();c.setStartAfter(d),c.collapse(!0),e.removeAllRanges(),e.addRange(c)}this.normalizeContent(),this.createUndoPoint(),this.autoSave(),l.remove()};l.querySelector('[data-action="cancel"]').onclick=()=>l.remove(),l.querySelector('[data-action="insert"]').onclick=i,l.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),i())}),document.body.appendChild(l),l.querySelector(".t2-youtube-url").focus()}insertCodeBlock(){let e=document.createElement("div");e.className="t2-code-block";let t=document.createElement("pre"),a=document.createElement("code");a.textContent="코드를 입력하세요",a.classList.add("code-placeholder"),a.setAttribute("contenteditable","true"),t.appendChild(a),a.addEventListener("click",function(e){if(this.classList.contains("code-placeholder")){this.textContent="",this.classList.remove("code-placeholder");let t=document.createRange(),a=window.getSelection();t.setStart(this,0),t.collapse(!0),a.removeAllRanges(),a.addRange(t)}}),a.addEventListener("focus",function(e){this.classList.contains("code-placeholder")&&(this.textContent="",this.classList.remove("code-placeholder"))}),a.addEventListener("blur",function(){""===this.textContent.trim()&&(this.textContent="코드를 입력하세요",this.classList.add("code-placeholder"))}),a.addEventListener("keydown",function(e){"Tab"===e.key&&(e.preventDefault(),document.execCommand("insertText",!1,"    "))}),e.appendChild(t),this.insertAtCursor(e)}resetEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.innerHTML="",this.editor.appendChild(e),this.setCaretToStart(e)}showImageUploadModal(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
        <div class="t2-image-editor-modal">
            <h3>이미지 추가</h3>
            <div class="t2-image-tabs">
                <button class="t2-tab active" data-tab="upload">파일 업로드</button>
                <button class="t2-tab" data-tab="url">이미지 URL</button>
            </div>
            <div class="t2-tab-content">
                <div class="t2-tab-pane active" data-pane="upload">
                    <div class="t2-image-preview-grid"></div>
                    <form enctype="multipart/form-data" method="post" class="t2-image-upload-form">
                        <div class="t2-image-upload-area">
                            <span class="material-icons">cloud_upload</span>
                            <div class="t2-image-upload-text">클릭하여 이미지 선택</div>
                            <div class="t2-image-upload-hint">또는 이미지를 여기로 드래그하세요</div>
                            <input type="file" name="bf_file[]" accept="image/*" multiple>
                            <input type="hidden" name="uid" value="${this.generateUid()}">
                        </div>
                    </form>
                </div>
                <div class="t2-tab-pane" data-pane="url">
                    <div class="t2-url-input-container">
                        <input type="text" class="t2-image-url-input" placeholder="이미지 URL을 입력하세요">
                        <div class="t2-url-preview"></div>
                    </div>
                </div>
            </div>
            <div class="t2-btn-group">
                <button type="button" class="t2-btn" data-action="cancel">취소</button>
                <button type="button" class="t2-btn" data-action="upload" disabled>추가</button>
            </div>
        </div>
    `;let t=e.querySelector(".t2-image-preview-grid"),a=e.querySelector('input[type="file"]'),l=e.querySelector('[data-action="upload"]'),i=e.querySelector(".t2-image-upload-area"),n=e.querySelector(".t2-image-upload-form"),r=e.querySelector(".t2-image-url-input"),o=e.querySelector(".t2-url-preview"),s=new Map,d="";e.querySelectorAll(".t2-tab").forEach(t=>{t.addEventListener("click",()=>{e.querySelectorAll(".t2-tab").forEach(e=>e.classList.remove("active")),t.classList.add("active");let a=t.dataset.tab;e.querySelectorAll(".t2-tab-pane").forEach(e=>{e.classList.remove("active"),e.dataset.pane===a&&e.classList.add("active")}),"upload"===a?l.disabled=0===s.size:l.disabled=!d})});let c;r.addEventListener("input",e=>{let t=e.target.value.trim();clearTimeout(c),c=setTimeout(()=>{if(t){let e=new Image;e.onload=()=>{d=t,o.innerHTML=`
                        <div class="t2-url-preview-image">
                            <img src="${t}" alt="URL Preview">
                        </div>
                    `,l.disabled=!1},e.onerror=()=>{d="",o.innerHTML=`
                        <div class="t2-url-preview-error">
                            올바른 이미지 URL이 아닙니다
                        </div>
                    `,l.disabled=!0},e.src=t}else d="",o.innerHTML="",l.disabled=!0},300)});let p=e=>{Array.from(e).forEach(e=>{if(!e.type.startsWith("image/")){alert("이미지 파일만 업로드 가능합니다.");return}let a=new FileReader;a.onload=a=>{let i=document.createElement("div");i.className="t2-preview-item",i.innerHTML=`
                    <img src="${a.target.result}" alt="Preview">
                    <button type="button" class="t2-preview-remove">
                        <span class="material-icons">close</span>
                    </button>
                `;let n=i.querySelector(".t2-preview-remove");n.onclick=()=>{s.delete(e),i.remove(),l.disabled=0===s.size},s.set(e,i),t.appendChild(i),l.disabled=!1},a.readAsDataURL(e)})};a.onchange=e=>p(e.target.files),i.ondragover=e=>{e.preventDefault(),i.classList.add("drag-over")},i.ondragleave=e=>{e.preventDefault(),i.classList.remove("drag-over")},i.ondrop=e=>{e.preventDefault(),i.classList.remove("drag-over"),p(e.dataTransfer.files)},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=()=>{let t=e.querySelector(".t2-tab.active").dataset.tab;"upload"===t?s.size>0&&this.handleMultipleImageUpload(n,Array.from(s.keys())):"url"===t&&d&&this.handleUrlImageUpload(d),e.remove()},document.body.appendChild(e)}async handleUrlImageUpload(e){try{let t=async e=>{let t=async(e,t)=>new Promise((a,l)=>{let i=new Image,n=document.createElement("div");n.style.cssText="position: fixed; left: -9999px; top: -9999px; visibility: hidden;",document.body.appendChild(n);let r=()=>{n.parentNode&&n.parentNode.removeChild(n),URL.revokeObjectURL(i.src)};switch(i.onload=()=>{try{let e=document.createElement("canvas"),t=e.getContext("2d"),n=i.naturalWidth,o=i.naturalHeight;if(n>2e3||o>2e3){let s=Math.min(2e3/n,2e3/o);n=Math.floor(n*s),o=Math.floor(o*s)}e.width=n,e.height=o,t.fillStyle="#FFFFFF",t.fillRect(0,0,n,o),t.drawImage(i,0,0,n,o),e.toBlob(e=>{r(),e&&e.size>0?a({blob:e,width:n,height:o}):l(Error("빈 이미지"))},"image/jpeg",.92)}catch(d){r(),l(d)}},i.onerror=()=>{r(),l(Error(`로드 실패 (${t})`))},t){case"crossOrigin":i.crossOrigin="anonymous",i.src=e;break;case"direct":i.removeAttribute("crossOrigin"),i.src=e;break;case"blob":fetch(e,{mode:"cors",credentials:"omit"}).then(e=>e.blob()).then(e=>{i.src=URL.createObjectURL(e)}).catch(()=>{r(),l(Error("Blob fetch 실패"))});break;default:r(),l(Error("알 수 없는 방법"))}n.appendChild(i),setTimeout(()=>{r(),l(Error("시간 초과"))},1e4)}),a=["crossOrigin","direct","blob"],l=null;for(let i of[e=>e,e=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(e)}`,e=>`https://corsproxy.io/?${encodeURIComponent(e)}`,e=>`https://api.allorigins.win/raw?url=${encodeURIComponent(e)}`,e=>`https://proxy.cors.sh/${e}`,e=>`https://cors-anywhere.herokuapp.com/${e}`])for(let n of a)try{alert(`이미지 다운로드 시도... (${n})`);let r=await t(i(e),n);if(r)return r}catch(o){l=o,console.log(`시도 실패 (${n}):`,o.message);continue}throw l||Error("모든 다운로드 시도 실패")},{blob:a,width:l,height:i}=await t(e),n=`image_${Date.now()}.jpg`,r=new File([a],n,{type:"image/jpeg"});alert(`이미지 캡처 완료: ${n} (${r.size} bytes)`);let o=new FormData;o.append("bf_file[]",r),o.append("uid",this.generateUid()),alert("서버 업로드 시작...");let s=await fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:o}),d=await s.json();if(!d.success)throw Error(d.message||"업로드 실패");alert("이미지 블록 생성 중...");let c=window.getSelection(),p=this.editor.lastElementChild;p||((p=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(p));let h=document.createElement("p");h.innerHTML="<br>",p.parentNode.insertBefore(h,p.nextSibling),d.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width=e.width+"px",a.style.maxWidth="100%",a.style.margin="0 auto";let l=document.createElement("img");l.src=e.url,l.style.width="100%",l.dataset.width=e.width,l.dataset.height=e.height,a.appendChild(l),t.appendChild(a);let i=this.createMediaControls(a,l);t.appendChild(i);let n=document.createElement("p");n.appendChild(t),h.parentNode.insertBefore(n,h.nextSibling);let r=document.createElement("p");if(r.innerHTML="<br>",n.parentNode.insertBefore(r,n.nextSibling),c){let o=document.createRange();o.setStartAfter(r),o.collapse(!0),c.removeAllRanges(),c.addRange(o)}}),this.normalizeContent(),this.createUndoPoint(),this.autoSave(),alert("이미지 업로드 및 삽입 완료!")}catch(u){console.error("이미지 처리 중 오류:",u),alert(`이미지 처리 중 오류가 발생했습니다.
상세 오류: ${u.message}`)}}handleMultipleImageUpload(e,t){let a=new FormData(e);a.delete("bf_file[]"),t.forEach(e=>a.append("bf_file[]",e)),fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:a}).then(e=>e.json()).then(e=>{if(e.success){let t=window.getSelection(),a=t.getRangeAt(0),l=this.getClosestBlock(a.startContainer);if(l&&l!==this.editor){let i=document.createElement("p");i.innerHTML="<br>",l.parentNode.insertBefore(i,l.nextSibling);let n=i;e.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width=e.width+"px",a.style.maxWidth="100%",a.style.margin="0 auto";let l=document.createElement("img");l.src=e.url,l.style.width="100%",l.dataset.width=e.width,l.dataset.height=e.height,a.appendChild(l),t.appendChild(a);let i=this.createMediaControls(a,l);t.appendChild(i);let r=document.createElement("p");r.appendChild(t),n.parentNode.insertBefore(r,n.nextSibling);let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling),n=o});let r=document.createRange();r.setStartAfter(n),r.collapse(!0),t.removeAllRanges(),t.addRange(r),this.normalizeContent(),this.createUndoPoint()}}else alert("이미지 업로드 실패: "+e.message)}).catch(e=>{console.error("업로드 에러:",e),alert("이미지 업로드 중 오류가 발생했습니다.")})}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}updateImageTransform(e,t,a){e.style.transform=`
       rotate(${t}deg)
       scaleX(${a?-1:1})
   `}handlePaste(e){if(e.items)for(let t=0;t<e.items.length;t++){let a=e.items[t];if(-1!==a.type.indexOf("image")){let l=a.getAsFile();if(l){let i=new FormData;i.append("bf_file[]",l),i.append("uid",this.generateUid()),fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:i}).then(e=>e.json()).then(e=>{if(e.success){let t=window.getSelection(),a=this.editor.lastElementChild;a||((a=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(a));let l=document.createElement("p");l.innerHTML="<br>",a.parentNode.insertBefore(l,a.nextSibling),e.files.forEach(e=>{let a=document.createElement("div");a.className="t2-media-block";let i=document.createElement("div");i.style.width=e.width+"px",i.style.maxWidth="100%",i.style.margin="0 auto";let n=document.createElement("img");n.src=e.url,n.style.width="100%",n.dataset.width=e.width,n.dataset.height=e.height,i.appendChild(n),a.appendChild(i);let r=this.createMediaControls(i,n);a.appendChild(r);let o=document.createElement("p");o.appendChild(a),l.parentNode.insertBefore(o,l.nextSibling);let s=document.createElement("p");if(s.innerHTML="<br>",o.parentNode.insertBefore(s,o.nextSibling),t){let d=document.createRange();d.setStartAfter(s),d.collapse(!0),t.removeAllRanges(),t.addRange(d)}}),this.normalizeContent(),this.createUndoPoint(),this.autoSave()}else alert("이미지 업로드 실패: "+e.message)}).catch(e=>{console.error("이미지 업로드 에러:",e),alert("이미지 업로드 중 오류가 발생했습니다.")});return}}}let n=e.getData("text/html");if(n&&n.includes("<table")){let r=document.createElement("div");r.innerHTML=n;let o=r.querySelectorAll("table");o.forEach(e=>{let t=e.cloneNode(!0);t.className="t2-table",t.setAttribute("data-t2-table","true"),t.style.width="100%",t.style.borderCollapse="collapse";let a=t.querySelectorAll("td, th");a.forEach(e=>{e.style.border="1px solid #ccc",e.style.padding="8px","TH"===e.tagName&&(e.style.backgroundColor="#f5f5f5")});let l=document.createElement("div");l.className="t2-table-wrapper",l.contentEditable=!1,l.appendChild(t);let i=document.createElement("div");i.className="t2-table-controls",i.innerHTML=`
                <div class="t2-table-control-group">
                    <span>가로:</span>
                    <button class="t2-btn t2-table-control-btn" data-action="add-col">
                        <span class="material-icons">add</span>
                    </button>
                    <button class="t2-btn t2-table-control-btn" data-action="remove-col">
                        <span class="material-icons">remove</span>
                    </button>
                </div>
                <div class="t2-table-control-group">
                    <span>세로:</span>
                    <button class="t2-btn t2-table-control-btn" data-action="add-row">
                        <span class="material-icons">add</span>
                    </button>
                    <button class="t2-btn t2-table-control-btn" data-action="remove-row">
                        <span class="material-icons">remove</span>
                    </button>
                </div>
                <button class="t2-btn t2-table-delete-btn" data-action="delete-table">
                    <span class="material-icons">close</span>
                </button>
            `,l.appendChild(i),this.insertAtCursor(l),this.setupTableControlEvents(i,t),this.setupTableCellEditing(t)});let s=Array.from(r.childNodes).filter(e=>"TABLE"!==e.nodeName);if(s.length>0){let d=document.createDocumentFragment();if(s.forEach(e=>{d.appendChild(e.cloneNode(!0))}),d.childNodes.length>0){let c=window.getSelection(),p=c.getRangeAt(0);this.getClosestBlock(p.startContainer),p.deleteContents(),p.insertNode(d);let h=p.commonAncestorContainer.lastChild||p.commonAncestorContainer,u=document.createRange();u.setStartAfter(h),u.collapse(!0),c.removeAllRanges(),c.addRange(u)}}this.normalizeContent(),this.createUndoPoint();return}let m=e.getData("text/plain"),b=window.getSelection(),v=b.getRangeAt(0),g=this.getClosestBlock(v.startContainer);if(g&&g!==this.editor||(g=document.createElement("p"),this.editor.appendChild(g)),!n||this.isIOS||this.isSafari){let f=m.split(/\r?\n/);f.forEach((e,t)=>{if(0===t&&v.collapsed)document.execCommand("insertText",!1,e);else{let a=document.createElement("p");a.textContent=e||"​",e||a.appendChild(document.createElement("br")),g.parentNode.insertBefore(a,g.nextSibling),g=a}})}else{let y=document.createElement("div");y.innerHTML=n,this.cleanupPastedHTML(y),v.deleteContents(),Array.from(y.childNodes).forEach((e,t)=>{let a;e.nodeType===Node.TEXT_NODE?(a=document.createElement("p")).appendChild(e.cloneNode()):e.nodeType===Node.ELEMENT_NODE&&(this.isBlockElement(e)?a=e.cloneNode(!0):(a=document.createElement("p")).appendChild(e.cloneNode(!0))),a&&(0===t&&v.collapsed?v.insertNode(a):g.parentNode.insertBefore(a,g.nextSibling),g=a)})}this.normalizeContent(),this.createUndoPoint()}cleanupPastedHTML(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,null,!1),a=[],l;for(;l=t.nextNode();)l.removeAttribute("style"),l.removeAttribute("class"),["STYLE","SCRIPT","META"].includes(l.tagName)&&a.push(l),this.isBlockElement(l)&&!l.textContent.trim()&&(l.innerHTML="<br>");a.forEach(e=>e.parentNode.removeChild(e))}getYouTubeVideoId(e){let t=e.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);return t&&11==t[7].length?t[7]:null}setupAutoSaveToggle(){let e=this.container.querySelector(".t2-editor-status"),t=document.createElement("div");t.className="t2-autosave-toggle",t.innerHTML=`
            <label class="t2-switch">
                <input type="checkbox" ${this.autoSaveEnabled?"checked":""}>
                <span class="t2-slider"></span>
            </label>
            <span class="t2-autosave-text">자동 저장</span>
        `;let a=t.querySelector('input[type="checkbox"]');a.addEventListener("change",e=>{this.autoSaveEnabled=e.target.checked,localStorage.setItem("t2editor-autosave-enabled",this.autoSaveEnabled),this.autoSaveEnabled?this.autoSave():this.clearAutoSave()});let l=e.querySelector(".t2-logo").parentElement;l.parentNode.insertBefore(t,l.nextSibling)}autoSave(){if(!this.autoSaveEnabled)return;let e=this.editor.innerHTML,t=e.replace(/<p>\s*<\/p>/g,"<p><br></p>");localStorage.setItem("t2editor-autosave",t)}loadAutoSave(){if(!this.autoSaveEnabled)return;let e=localStorage.getItem("t2editor-autosave");e&&(this.editor.innerHTML=e,this.normalizeContent())}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}setupBeforeUnload(){window.addEventListener("beforeunload",()=>{this.autoSaveEnabled&&this.autoSave()})}setContent(e){e&&(this.editor.innerHTML=e,this.editor.querySelectorAll('img, iframe[src*="youtube"], video').forEach(e=>{if(!e.closest(".t2-media-block")){let t=e.style.width?parseInt(e.style.width):e.width||320,a=e.style.height?parseInt(e.style.height):e.height||180,l=document.createElement("div");l.className="t2-media-block";let i=document.createElement("div");i.style.width=`${t}px`,i.style.maxWidth="100%",i.style.margin="0 auto";let n=e.cloneNode(!0);n.style.width="100%",("IFRAME"===n.tagName||"VIDEO"===n.tagName)&&(i.style.height=`${a}px`,n.style.height="100%"),i.appendChild(n),l.appendChild(i);let r=this.createMediaControls(i,n);l.appendChild(r);let o=document.createElement("p");o.appendChild(l),e.parentNode.replaceChild(o,e)}}),this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),a=t?.querySelector("img, iframe, video");if(a){if(parseInt(t.style.width),parseInt(t.style.height),t.style.maxWidth||(t.style.maxWidth="100%"),t.style.margin||(t.style.margin="0 auto"),a.style.width="100%",("IFRAME"===a.tagName||"VIDEO"===a.tagName)&&(a.style.height="100%"),"P"!==e.parentNode.nodeName){let l=document.createElement("p");e.parentNode.insertBefore(l,e),l.appendChild(e)}let i=e.querySelector(".t2-media-controls");i&&i.remove();let n=this.createMediaControls(t,a);e.appendChild(n)}}),this.editor.querySelectorAll(".t2-file-block").forEach(e=>{if(e.querySelector(".t2-media-controls"))return;let t=e.querySelectorAll("a[href]");if(0===t.length)return;let a=t[0],l=a.getAttribute("href"),i="",n="",r="",o=e.querySelector(".file-name");o&&(i=o.textContent.trim());let s=e.querySelectorAll(".file-details span");s.length>=1&&(n=s[0].textContent.trim()),s.length>=2&&(r=s[1].textContent.trim());let d=i.split(".").pop().toLowerCase(),c=["mp3","m4a"].includes(d),p=document.createElement("div");if(p.className="t2-file-block t2-media-block",c){p.innerHTML=`
                <div class="audio-player">
                    <audio src="${l}" preload="metadata"></audio>
                </div>
                <a href="${l}" download style="text-decoration: none; color: inherit;">
                    <div class="audio-file-container">
                        <div class="audio-file-icon"></div>
                        <div class="audio-file-info">
                            <div class="audio-file-name">${i}</div>
                            <div class="audio-file-details">
                                <span>${n}</span>
                                <span>${r}</span>
                                <span class="audio-duration">--:--</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;let h=p.querySelector("audio"),u=p.querySelector(".audio-duration");h&&u&&(h.addEventListener("loadedmetadata",()=>{let e=Math.floor(h.duration/60),t=Math.floor(h.duration%60);u.textContent=`${e}:${t.toString().padStart(2,"0")}`}),h.addEventListener("error",()=>{u.textContent="--:--"}))}else p.innerHTML=`
                <a href="${l}" ${"pdf"===d?"":"download"} style="text-decoration: none; color: inherit;">
                    <div class="file-container">
                        <div class="file-icon"></div>
                        <div class="file-info">
                            <div class="file-name">${i}</div>
                            <div class="file-details">
                                <span>${n}&nbsp;</span>
                                <span>${r}</span>
                            </div>
                        </div>
                    </div>
                </a>
            `;let m=document.createElement("div");if(m.className="t2-media-controls",m.innerHTML=`
            <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
                <span class="material-icons">delete</span>
            </button>
        `,p.appendChild(m),e.parentNode.replaceChild(p,e),"P"!==p.parentNode.nodeName){let b=document.createElement("p");p.parentNode.insertBefore(b,p),b.appendChild(p)}}),this.editor.querySelectorAll(".table-responsive").forEach(e=>{let t=e.querySelector("table");if(t){t.classList.contains("t2-table")||t.classList.add("t2-table");let a=document.createElement("div");a.className="t2-table-wrapper",a.contentEditable=!1;let l=t.querySelector("tr")?.children.length||0,i=t.querySelectorAll("tr").length,n=74*l,r=this.editor.clientWidth;if(n>320||n>r){let o=document.createElement("div");o.className="t2-table-scroll-wrapper",o.appendChild(t),a.appendChild(o),t.classList.add("t2-table-large")}else a.appendChild(t),t.classList.remove("t2-table-large");e.parentNode.insertBefore(a,e),e.remove();let s=this.createTableControls(t,i,l);a.appendChild(s);let d=document.createElement("button");d.className="t2-table-download-btn",d.innerHTML='<span class="material-icons">download</span>',d.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.exportTableToCSV(t)}),a.appendChild(d),this.setupTableControlEvents(s,t),this.setupTableCellEditing(t),this.setupTableResizing(t)}}),this.initializeTableBlocks(),this.normalizeContent())}createMediaControls(e,t){let a=document.createElement("div");a.className="t2-media-controls",a.contentEditable=!1;let l=parseInt(t.dataset.width)||parseInt(e.style.width)||320,i=parseInt(t.dataset.height)||parseInt(e.style.height)||180,n=this.editor.clientWidth,r=parseInt(e.style.width);a.innerHTML=`
        <button class="t2-btn delete-btn">
            <span class="material-icons">delete</span>
        </button>
        ${"IFRAME"===t.tagName?`
            <button class="t2-btn edit-url-btn">
                <span class="material-icons">edit</span>
            </button>
        `:""}
        <input type="range" min="30" max="${Math.min(100,Math.floor(n/l*100))}" value="${Math.round(r/l*100)}" class="size-slider" style="width: 100px;">
    `;let o=a.querySelector(".size-slider");if(o){let s=new ResizeObserver(()=>{let a=this.editor.clientWidth,n=Math.min(100,Math.floor(a/l*100));o.max=n,parseInt(o.value)>n&&(o.value=n,e.style.width=`${Math.round(l*n/100)}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${Math.round(i*n/100)}px`,t.style.height="100%"))});s.observe(this.editor),o.addEventListener("input",a=>{let n=parseInt(a.target.value),r=Math.round(l*n/100),o=Math.round(i*n/100);e.style.width=`${r}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${o}px`,t.style.height="100%"),t.dataset.currentWidth=r,t.dataset.currentHeight=o})}let d=a.querySelector(".delete-btn");d&&d.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),a.closest(".t2-media-block").remove()});let c=a.querySelector(".edit-url-btn");return c&&"IFRAME"===t.tagName&&c.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let a=t.src.match(/embed\/([^?]+)/)?.[1];a&&this.showVideoUrlEditModal(t,{type:"youtube",id:a})}),a}attachControlEvents(e,t,a,l,i){e.querySelector(".delete-btn")?.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),e.closest(".t2-media-block").remove()});let n=e.querySelector(".size-slider");n&&n.addEventListener("input",e=>{let n=e.target.value;t.style.width=`${l*n/100}px`,("IFRAME"===a.tagName||"VIDEO"===a.tagName)&&(t.style.height=`${i*n/100}px`)});let r=e.querySelector(".edit-url-btn");r&&"IFRAME"===a.tagName&&r.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let t=a.src.match(/embed\/([^?]+)/)?.[1];t&&this.showVideoUrlEditModal(a,{type:"youtube",id:t})})}initializeMediaControls(){this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),a=t.querySelector("img, iframe, video"),l=e.querySelector(".t2-media-controls");if(l){let i=this.createMediaControls(t,a);e.replaceChild(i,l)}})}initializeBlocks(){this.editor.querySelectorAll("img:not(.t2-media-block img)").forEach(e=>{let t=parseInt(e.style.width)||e.naturalWidth||320,a=parseInt(e.style.height)||e.naturalHeight||180,l=this.createMediaBlock(e.src,t,a,"image");e.parentNode.replaceChild(l,e)}),this.editor.querySelectorAll('iframe[src*="youtube"]:not(.t2-media-block iframe)').forEach(e=>{let t=parseInt(e.style.width)||320,a=parseInt(e.style.height)||180,l=this.createMediaBlock(e.src,t,a,"youtube");e.parentNode.replaceChild(l,e)}),this.initializeTableBlocks()}initializeTableBlocks(){this.editor.querySelectorAll("table.t2-table, .table-responsive table").forEach(e=>{let t=e.closest(".t2-table-wrapper"),a=e.closest(".table-responsive");if(!t){(t=document.createElement("div")).className="t2-table-wrapper",t.contentEditable=!1;let l=e.querySelector("tr")?.children.length||0,i=e.querySelectorAll("tr").length,n=74*l,r=this.editor.clientWidth;if(a){let o=e.closest(".table-responsive");o.parentNode.insertBefore(t,o),o.remove()}else e.parentNode.insertBefore(t,e);if(n>320||n>r){let s=document.createElement("div");s.className="t2-table-scroll-wrapper",s.appendChild(e),t.appendChild(s),e.classList.add("t2-table-large")}else t.appendChild(e),e.classList.remove("t2-table-large");let d=this.createTableControls(e,i,l);t.appendChild(d);let c=document.createElement("button");c.className="t2-table-download-btn",c.innerHTML='<span class="material-icons">download</span>',c.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),this.exportTableToCSV(e)}),t.appendChild(c),this.setupTableControlEvents(d,e),this.setupTableCellEditing(e),this.setupTableResizing(e)}})}exportTableToCSV(e){let t=Array.from(e.querySelectorAll("tr")),a=[];t.forEach(e=>{let t=Array.from(e.querySelectorAll("th, td")),l=t.map(e=>{let t=e.textContent.trim();return(t.includes('"')||t.includes(","))&&(t=`"${t.replace(/"/g,'""')}"`),t});a.push(l.join(","))});let l=a.join("\n"),i=new Blob([l],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a"),r=URL.createObjectURL(i);n.setAttribute("href",r),n.setAttribute("download",`table_export_${new Date().toISOString().slice(0,10)}.csv`),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(r)}createTableControls(e,t,a){let l=document.createElement("div");return l.className="t2-table-controls",l.innerHTML=`
        <div class="t2-table-control-group">
            <span>가로:</span>
            <button class="t2-btn t2-table-control-btn" data-action="add-col">
                <span class="material-icons">add</span>
            </button>
            <button class="t2-btn t2-table-control-btn" data-action="remove-col">
                <span class="material-icons">remove</span>
            </button>
        </div>
        <div class="t2-table-control-group">
            <span>세로:</span>
            <button class="t2-btn t2-table-control-btn" data-action="add-row">
                <span class="material-icons">add</span>
            </button>
            <button class="t2-btn t2-table-control-btn" data-action="remove-row">
                <span class="material-icons">remove</span>
            </button>
        </div>
        <button class="t2-btn t2-table-delete-btn" data-action="delete-table">
            <span class="material-icons">close</span>
        </button>
    `,l}wrapMediaBlock(e){let t=document.createElement("div");t.className="t2-media-block",e.parentNode.insertBefore(t,e),t.appendChild(e);let a=this.createMediaControls(t,e);t.appendChild(a)}updateCharCount(){let e=this.editor.textContent;e=e.replace(/\s+/g,""),this.charCount.textContent=e.length}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}showLinkModal(){let e=window.getSelection(),t=e.getRangeAt(0);if(t.collapsed){alert("텍스트를 선택한 후 링크를 추가해주세요.");return}this.saveSelection();let a=null,l=t.startContainer,i=t.endContainer,n=e=>{for(;e&&e!==this.editor;){if("A"===e.nodeName)return e;e=e.parentNode}return null},r=n(l),o=n(i);if(l===i||r&&r===o)a=r;else{let s=t.toString(),d=[],c=document.createTreeWalker(t.commonAncestorContainer,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>"A"===e.nodeName?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}),p;for(;p=c.nextNode();)if(t.intersectsNode(p)){if(p.textContent===s){a=p;break}d.push(p)}a||1!==d.length||d[0].textContent!==s||(a=d[0])}let h=document.createElement("div");h.className="t2-modal-overlay",h.innerHTML=`
        <div class="t2-link-editor-modal">
            <h3>${a?"링크 수정":"링크 추가"}</h3>
            <div class="t2-link-input-container">
                <input type="text" class="t2-link-url-input" 
                       placeholder="https://" 
                       value="${a?a.href:""}">
                <div class="t2-link-options">
                    <label>
                        <input type="checkbox" class="t2-link-new-tab" ${a&&"_blank"===a.target?"checked":""}>
                        새 탭에서 열기
                    </label>
                </div>
            </div>
            <div class="t2-btn-group">
                ${a?'<button class="t2-btn" data-action="remove">링크 제거</button>':""}
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">${a?"수정":"추가"}</button>
            </div>
        </div>
    `;let u=()=>{let t=h.querySelector(".t2-link-url-input").value.trim(),l=h.querySelector(".t2-link-new-tab").checked;if(!t){alert("URL을 입력해주세요.");return}let i=t;/^https?:\/\//i.test(t)||(i="http://"+t),this.restoreSelection();try{let n=e.getRangeAt(0);if(a){if(n.toString()===a.textContent)a.href=i,a.target=l?"_blank":"",a.rel=l?"noopener noreferrer":"";else{let r=n.toString(),o=document.createElement("a");o.href=i,o.target=l?"_blank":"",o.rel=l?"noopener noreferrer":"",o.textContent=r,n.deleteContents(),n.insertNode(o)}}else{let s=n.toString(),d=document.createElement("a");d.href=i,d.target=l?"_blank":"",d.rel=l?"noopener noreferrer":"",d.textContent=s,n.deleteContents(),n.insertNode(d)}h.remove(),this.createUndoPoint(),this.autoSave(),this.normalizeContent()}catch(c){console.error("링크 적용 중 오류:",c),alert("링크를 적용하는 중 오류가 발생했습니다. 선택 영역을 다시 확인해주세요.")}};h.querySelector('[data-action="insert"]').onclick=u,h.querySelector('[data-action="cancel"]').onclick=()=>h.remove(),a&&(h.querySelector('[data-action="remove"]').onclick=()=>{this.restoreSelection();try{let t=e.getRangeAt(0),l=a.textContent,i=t.toString();if(i===l){let n=a.parentNode;for(;a.firstChild;)n.insertBefore(a.firstChild,a);a.remove()}else{let r=t.startOffset,o=t.endOffset;a.firstChild;let s=l.substring(0,r),d=l.substring(r,o),c=l.substring(o),p=a.parentNode;if(s){let u=a.cloneNode(!1);u.textContent=s,p.insertBefore(u,a)}let m=document.createTextNode(d);if(p.insertBefore(m,a),c){let b=a.cloneNode(!1);b.textContent=c,p.insertBefore(b,a)}a.remove()}h.remove(),this.createUndoPoint(),this.autoSave()}catch(v){console.error("링크 제거 중 오류:",v),alert("링크를 제거하는 중 오류가 발생했습니다. 선택 영역을 다시 확인해주세요.")}}),h.querySelector(".t2-link-url-input").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),u())}),document.body.appendChild(h),h.querySelector(".t2-link-url-input").focus()}insertFileIcon(e){let t=document.createElement("div");t.className="t2-media-block t2-file-block";let a=new Date().toISOString().split("T")[0].replace(/-/g,"."),l=this.formatFileSize(e.size),i=/\.(mp3|m4a)$/i.test(e.original_name),n=/\.pdf$/i.test(e.original_name),r=e.url;if(n){let o=r.match(/data\/editor\/t2editor_(\d+)\/(.+\.pdf)$/i);if(o){let[,s,d]=o;r=g5_url+`/plugin/editor/t2editor/pdf_view.php?pdf=${s}/${d}`}}if(i){t.innerHTML=`
            <div class="audio-player">
                <audio src="${e.url}" preload="metadata"></audio>
            </div>
            <a href="${e.url}" download style="text-decoration: none; color: inherit;">
                <div class="audio-file-container">
                    <div class="audio-file-icon"></div>
                    <div class="audio-file-info">
                        <div class="audio-file-name">${e.original_name}</div>
                        <div class="audio-file-details">
                            <span>DATE: ${a}</span>
                            <span>Size: ${l}</span>
                            <span class="audio-duration">--:--</span>
                        </div>
                    </div>
                </div>
            </a>
        `;let c=t.querySelector("audio"),p=t.querySelector(".audio-duration");c.addEventListener("loadedmetadata",()=>{let e=Math.floor(c.duration/60),t=Math.floor(c.duration%60);p.textContent=`${e}:${t.toString().padStart(2,"0")}`}),c.addEventListener("error",()=>{p.textContent="--:--"})}else t.innerHTML=`
            <a href="${r}" ${n?"":"download"} style="text-decoration: none; color: inherit;">
                <div class="file-container">
                    <div class="file-icon"></div>
                    <div class="file-info">
                        <div class="file-name">${e.original_name}</div>
                        <div class="file-details">
                            <span>DATE: ${a}&nbsp;</span>
                            <span>Size: ${l}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;let h=document.createElement("div");h.className="t2-media-controls",h.innerHTML=`
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
    `,t.appendChild(h);let u=window.getSelection(),m=u.getRangeAt(0),b=this.getClosestBlock(m.startContainer);if(b&&b!==this.editor){let v=document.createElement("p");v.appendChild(t);let g=document.createElement("p");g.innerHTML="<br>",b.parentNode.insertBefore(g,b.nextSibling),g.parentNode.insertBefore(v,g.nextSibling);let f=document.createElement("p");f.innerHTML="<br>",v.parentNode.insertBefore(f,v.nextSibling);let y=document.createRange();y.setStartAfter(f),y.collapse(!0),u.removeAllRanges(),u.addRange(y)}this.normalizeContent(),this.createUndoPoint()}async uploadFile(e){let t=new FormData;t.append("bf_file",e),t.append("uid",this.generateUid());try{let a=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),l=await a.json();l.success?this.insertFileIcon(l.file):alert("파일 업로드 실패: "+l.message)}catch(i){console.error("업로드 에러:",i),alert("파일 업로드 중 오류가 발생했습니다.")}}handleAttachFile(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
        <div class="t2-file-editor-modal">
            <h3>파일 첨부</h3>
            <div class="t2-file-upload-area">
                <span class="material-icons">attach_file</span>
                <div class="t2-file-upload-text">클릭하여 파일 선택</div>
                <div class="t2-file-upload-hint">지원 형식: ZIP, PDF, TXT, MP3</div>
                <input type="file" accept=".zip,.pdf,.txt,.mp3" />
            </div>
            <div class="t2-file-preview-grid"></div>
            <div class="t2-upload-progress" style="display: none;">
                <div class="t2-progress-bar">
                    <div class="t2-progress-fill"></div>
                </div>
                <div class="t2-progress-text">파일 업로드 중...</div>
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="upload" disabled>첨부</button>
            </div>
        </div>
    `;let t=e.querySelector(".t2-file-preview-grid"),a=e.querySelector('input[type="file"]'),l=e.querySelector('[data-action="upload"]'),i=e.querySelector(".t2-file-upload-area"),n=e.querySelector(".t2-progress-fill"),r=e.querySelector(".t2-upload-progress"),o=e.querySelector(".t2-progress-text"),s=null,d=e=>{if(![".zip",".pdf",".txt",".mp3"].some(t=>e.name.toLowerCase().endsWith(t))){alert("지원하지 않는 파일 형식입니다.");return}t.innerHTML="";let i=document.createElement("div");i.className="t2-file-preview-item",i.innerHTML=`
            <div class="t2-file-preview-icon" style="background-color: ${this.getFileColor(e.name.split(".").pop())}"></div>
            <div class="t2-file-preview-name">${e.name}</div>
            <button type="button" class="t2-file-preview-remove">
                <span class="material-icons">close</span>
            </button>
        `;let n=i.querySelector(".t2-file-preview-remove");n.onclick=e=>{e.preventDefault(),e.stopPropagation(),s=null,i.remove(),l.disabled=!0,a.value=""},s=e,t.appendChild(i),l.disabled=!1};a.onchange=e=>{e.target.files.length>0&&d(e.target.files[0])},i.ondragover=e=>{e.preventDefault(),i.classList.add("drag-over")},i.ondragleave=e=>{e.preventDefault(),i.classList.remove("drag-over")},i.ondrop=e=>{e.preventDefault(),i.classList.remove("drag-over"),e.dataTransfer.files.length>0&&d(e.dataTransfer.files[0])},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=async()=>{if(s){l.disabled=!0,r.style.display="block",n.style.width="0%",o.textContent="파일 업로드 중...";try{let t=new FormData;t.append("bf_file",s),t.append("uid",this.generateUid());let a=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),i=await a.json();if(i.success)n.style.width="100%",o.textContent="업로드 완료",this.insertFileIcon(i.file),e.remove(),this.createUndoPoint(),this.autoSave();else throw Error(i.message||"업로드 실패")}catch(d){console.error("업로드 에러:",d),alert("파일 업로드 중 오류가 발생했습니다."),l.disabled=!1}}},document.body.appendChild(e)}getFileColor(e){return({zip:"#E8B56F",pdf:"#F44336",txt:"#585858",mp3:"#9C27B0",m4a:"#2196F3"})[e.toLowerCase()]||"#E8B56F"}formatFileSize(e){if(0===e)return"0 Bytes";let t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(2))+" "+["Bytes","KB","MB","GB"][t]}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}showTableModal(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
        <div class="t2-table-editor-modal">
            <h3>테이블 삽입</h3>
            <div class="t2-table-size-selector">
                <div class="t2-table-size-inputs">
                    <div class="t2-table-input-group">
                        <label>가로 셀 수:</label>
                        <div class="t2-input-with-controls">
                            <button class="t2-btn t2-table-control-btn" data-action="decrease-cols">
                                <span class="material-icons">remove</span>
                            </button>
                            <input type="number" class="t2-table-cols" value="3" min="1" max="30">
                            <button class="t2-btn t2-table-control-btn" data-action="increase-cols">
                                <span class="material-icons">add</span>
                            </button>
                        </div>
                    </div>
                    <div class="t2-table-input-group">
                        <label>세로 셀 수:</label>
                        <div class="t2-input-with-controls">
                            <button class="t2-btn t2-table-control-btn" data-action="decrease-rows">
                                <span class="material-icons">remove</span>
                            </button>
                            <input type="number" class="t2-table-rows" value="3" min="1" max="30">
                            <button class="t2-btn t2-table-control-btn" data-action="increase-rows">
                                <span class="material-icons">add</span>
                            </button>
                        </div>
                    </div>
                    <div class="t2-table-warning" style="display: none; color: #e67e22; margin-top: 10px; font-size: 13px;">
                        <span class="material-icons" style="font-size: 16px; vertical-align: middle;">warning</span>
                        큰 테이블은 가로 스크롤이 생성됩니다.
                    </div>
                </div>
                <div class="t2-table-preview-container" style="width: 160px; height: 160px; overflow: hidden; border: 1px solid #ddd; border-radius: 4px;">
                    <div class="t2-table-preview" style="transform-origin: top left;"></div>
                </div>
            </div>
            <div class="t2-table-style-options">
                <div class="t2-table-style-option">
                    <p>테이블 너비:&nbsp;</p>
                    <select class="t2-table-width">
                        <option value="100%">100% (전체)</option>
                        <option value="75%">75%</option>
                        <option value="50%">50%</option>
                        <option value="custom">직접 입력</option>
                    </select>
                    <div class="t2-custom-width-container" style="display: none;">
                        <input type="number" class="t2-custom-width-value" value="100" min="10" max="100">
                        <span>%</span>
                    </div>
                </div>
                <div class="t2-table-style-option">
                    <p>테두리 스타일:&nbsp;</p>
                    <select class="t2-table-border-style">
                        <option value="solid">실선</option>
                        <option value="dashed">점선</option>
                        <option value="dotted">점선 (원형)</option>
                        <option value="double">이중선</option>
                    </select>
                </div>
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">삽입</button>
            </div>
        </div>
    `;let t=e.querySelector(".t2-table-preview"),a=e.querySelector(".t2-table-cols"),l=e.querySelector(".t2-table-rows"),i=e.querySelector(".t2-table-width"),n=e.querySelector(".t2-custom-width-container"),r=e.querySelector(".t2-custom-width-value"),o=e.querySelector(".t2-table-warning"),s=()=>{let e=parseInt(a.value)||3,i=parseInt(l.value)||3;e>10||i>10?o.style.display="block":o.style.display="none";let n=Math.min(1,140/Math.max(16*e,16*i)),r=`<table class="t2-preview-table" style="transform: scale(${n}); transform-origin: top left;">`;r+="<tr>";for(let s=0;s<e;s++)r+='<th style="width: 16px; height: 16px; border: 1px solid #ccc; background: #f5f5f5;"></th>';r+="</tr>";for(let d=1;d<i;d++){r+="<tr>";for(let c=0;c<e;c++)r+='<td style="width: 16px; height: 16px; border: 1px solid #ccc;"></td>';r+="</tr>"}r+="</table>",t.innerHTML=r};e.querySelector('[data-action="decrease-cols"]').onclick=()=>{a.value=Math.max(1,parseInt(a.value)-1),s()},e.querySelector('[data-action="increase-cols"]').onclick=()=>{a.value=Math.min(30,parseInt(a.value)+1),s()},e.querySelector('[data-action="decrease-rows"]').onclick=()=>{l.value=Math.max(1,parseInt(l.value)-1),s()},e.querySelector('[data-action="increase-rows"]').onclick=()=>{l.value=Math.min(30,parseInt(l.value)+1),s()},i.addEventListener("change",()=>{"custom"===i.value?n.style.display="flex":n.style.display="none"}),a.addEventListener("input",()=>{a.value=Math.min(30,Math.max(1,parseInt(a.value)||1)),s()}),l.addEventListener("input",()=>{l.value=Math.min(30,Math.max(1,parseInt(l.value)||1)),s()}),s(),e.querySelector('[data-action="insert"]').onclick=()=>{let t=parseInt(a.value)||3,n=parseInt(l.value)||3,o=e.querySelector(".t2-table-border-style").value,s;if("custom"===i.value){let d=parseInt(r.value)||100;s=Math.min(100,Math.max(10,d))+"%"}else s=i.value;this.insertTableAtCursor(t,n,s,o),e.remove()},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),document.body.appendChild(e)}insertTableAtCursor(e,t,a,l){let i=document.createElement("table");i.className="t2-table",i.style.width=a,i.style.borderCollapse="collapse",i.setAttribute("border","1"),i.setAttribute("data-t2-table","true");let n="#ccc",r=document.createElement("thead"),o=document.createElement("tr");for(let s=0;s<e;s++){let d=document.createElement("th");d.style.border=`1px ${l} ${n}`,d.style.padding="8px",d.style.backgroundColor="#f5f5f5",d.textContent=`헤더 ${s+1}`,o.appendChild(d)}r.appendChild(o),i.appendChild(r);let c=document.createElement("tbody");for(let p=1;p<t;p++){let h=document.createElement("tr");for(let u=0;u<e;u++){let m=document.createElement("td");m.style.border=`1px ${l} ${n}`,m.style.padding="8px",m.innerHTML="<br>",h.appendChild(m)}c.appendChild(h)}i.appendChild(c);let b=document.createElement("div");b.className="t2-table-wrapper",b.contentEditable=!1;let v=74*e,g=this.editor.clientWidth;if(v>320||v>g){let f=document.createElement("div");f.className="t2-table-scroll-wrapper",f.appendChild(i),b.appendChild(f),i.classList.add("t2-table-large")}else b.appendChild(i);let y=this.createTableControls(i,t,e);b.appendChild(y);let $=document.createElement("button");return $.className="t2-table-download-btn",$.innerHTML='<span class="material-icons">download</span>',$.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.exportTableToCSV(i)}),b.appendChild($),this.insertAtCursor(b),this.setupTableControlEvents(y,i),this.setupTableCellEditing(i),this.setupTableResizing(i),b}setupTableControlEvents(e,t){let a=()=>{let e=t.querySelector("tr")?.children.length||0;t.querySelectorAll("tr").length;let a=74*e,l=this.editor.clientWidth,i=a>320||a>l,n=t.closest(".t2-table-wrapper"),r=t.closest(".t2-table-scroll-wrapper");if(i&&!r){let o=document.createElement("div");o.className="t2-table-scroll-wrapper",n.insertBefore(o,t),o.appendChild(t),t.classList.add("t2-table-large")}else!i&&r&&(n.insertBefore(t,r),r.remove(),t.classList.remove("t2-table-large"))};e.querySelector('[data-action="add-col"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),i=l[0].children.length;l.forEach((e,t)=>{let a=0===t?document.createElement("th"):document.createElement("td");a.style.border=l[0].children[0].style.border,a.style.padding="8px",0===t?(a.style.backgroundColor="#f5f5f5",a.textContent=`헤더 ${i+1}`):a.innerHTML="<br>",e.appendChild(a),this.setupCellEditing(a)}),a(),this.createUndoPoint()}),e.querySelector('[data-action="remove-col"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr");l[0].children.length<=1||(l.forEach(e=>e.removeChild(e.lastChild)),a(),this.createUndoPoint())}),e.querySelector('[data-action="add-row"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),i=l[0].children.length,n=t.querySelector("tbody")||t,r=document.createElement("tr");for(let o=0;o<i;o++){let s=document.createElement("td");s.style.border=l[0].children[0].style.border,s.style.padding="8px",s.innerHTML="<br>",r.appendChild(s),this.setupCellEditing(s)}n.appendChild(r),a(),this.createUndoPoint()}),e.querySelector('[data-action="remove-row"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr");if(l.length<=1)return;let i=t.querySelector("tbody")||t;i.removeChild(i.lastChild),a(),this.createUndoPoint()}),e.querySelector('[data-action="delete-table"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let a=t.closest(".t2-table-wrapper");a&&(a.remove(),this.createUndoPoint())}),a()}setupTableResizing(e){let t=!1,a=null,l=0,i=0,n=e.querySelectorAll("th");n.forEach(e=>{e.addEventListener("mousedown",n=>{let r=e.getBoundingClientRect();r.right-n.clientX<=5&&(t=!0,a=e,l=n.clientX,i=e.offsetWidth,document.body.style.cursor="col-resize",document.body.style.userSelect="none",n.preventDefault(),n.stopPropagation())})}),document.addEventListener("mousemove",n=>{if(!t)return;let r=n.clientX-l,o=Math.max(30,i+r);a.style.width=`${o}px`;let s=Array.from(a.parentNode.children).indexOf(a),d=e.querySelectorAll("tr");d.forEach(e=>{let t=e.children[s];t&&(t.style.width=`${o}px`)}),n.preventDefault()}),document.addEventListener("mouseup",()=>{t&&(t=!1,a=null,document.body.style.cursor="",document.body.style.userSelect="",this.createUndoPoint())})}setupTableCellEditing(e){let t=e.querySelectorAll("th, td");t.forEach(e=>{this.setupCellEditing(e)})}setupCellEditing(e){e.contentEditable=!0,e.addEventListener("click",t=>{t.stopPropagation();let a=window.getSelection(),l=document.createRange();l.selectNodeContents(e),a.removeAllRanges(),a.addRange(l)}),e.addEventListener("keydown",e=>{"Enter"===e.key&&(e.preventDefault(),document.execCommand("insertHTML",!1,"<br>"))})}exportToHTML(){let e=prompt("내보낼 HTML 파일의 제목을 입력하세요:","문서 제목")||"T2Editor 내보내기";fetch(g5_url+"/plugin/editor/t2editor/export_html_skin.html").then(e=>e.text()).then(t=>{let a=this.processContentForExport(),l=t.replace(/\{\{TITLE\}\}/g,e).replace(/\{\{CONTENT\}\}/g,a).replace(/\{\{EXPORT_DATE\}\}/g,new Date().toLocaleString());this.downloadHTML(l,this.sanitizeFileName(e)+".html")}).catch(e=>{console.error("내보내기 템플릿 로드 실패:",e),alert("내보내기 템플릿을 불러오는 데 실패했습니다: "+e.message)})}processContentForExport(){console.log("내보내기 처리 시작");let e=document.createElement("div");return e.innerHTML=this.editor.innerHTML,console.log("원본 콘텐츠 길이:",e.innerHTML.length),e.querySelectorAll(".t2-media-block").forEach(e=>{console.log("미디어 블록 발견:",e.className);let t=e.querySelector(".t2-media-controls");t&&(t.remove(),console.log("미디어 컨트롤 제거됨"))}),e.querySelectorAll("img").forEach(e=>{let t=e.getAttribute("src");if(console.log("이미지 경로 처리:",t),t&&!t.startsWith("http")&&!t.startsWith("data:")){let a=window.location.origin;if(t.startsWith("/"))e.src=a+t;else{let l=window.location.pathname.substring(0,window.location.pathname.lastIndexOf("/")+1);e.src=a+l+t}console.log("이미지 경로 변환됨:",e.src)}}),e.querySelectorAll("iframe").forEach(e=>{console.log("iframe 발견:",e.src);let t=e.closest(".t2-media-block")?.querySelector("div:first-child");t&&(e.style.width=t.style.width||"100%",e.style.height=t.style.height||"315px",console.log("iframe 스타일 적용:",e.style.width,e.style.height))}),e.querySelectorAll(".t2-table-wrapper").forEach(e=>{console.log("테이블 래퍼 발견");let t=e.querySelector("table");if(t){let a=e.querySelector(".t2-table-controls");a&&a.remove();let l=e.querySelector(".t2-table-download-btn");l&&l.remove();let i=e.querySelector(".t2-table-scroll-wrapper");if(i){let n=document.createElement("div");n.className="table-responsive",n.style.cssText="display:block; width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch;",i.parentNode.insertBefore(t,i),i.remove(),n.appendChild(t),e.parentNode.insertBefore(n,e),e.remove(),console.log("테이블 스크롤 래퍼 처리 완료")}else e.parentNode.insertBefore(t,e),e.remove(),console.log("일반 테이블 처리 완료")}}),e.querySelectorAll(".t2-file-block").forEach(e=>{console.log("파일 블록 발견");let t=e.querySelector(".t2-media-controls");t&&t.remove()}),console.log("최종 내보내기 콘텐츠 길이:",e.innerHTML.length),e.innerHTML}sanitizeFileName(e){return e.replace(/[\\/:*?"<>|]/g,"_")}downloadHTML(e,t){let a=new Blob([e],{type:"text/html;charset=utf-8"}),l=URL.createObjectURL(a),i=document.createElement("a");i.href=l,i.download=t,document.body.appendChild(i),i.click(),setTimeout(()=>{document.body.removeChild(i),URL.revokeObjectURL(l)},100)}}const editor=new T2Editor(document.querySelector(".t2-editor-container"));