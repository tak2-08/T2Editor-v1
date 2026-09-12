class T2Editor{constructor(e){this.container=e,this.editor=e.querySelector(".t2-editor"),this.toolbar=e.querySelector(".t2-toolbar"),this.isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1,this.isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),this.autoSaveEnabled="false"!==localStorage.getItem("t2editor-autosave-enabled"),this.setupEditor(),this.setupEventListeners(),this.loadAutoSave(),this.setupAutoSaveToggle(),this.autoSaveEnabled&&this.loadAutoSave(),this.setupBeforeUnload(),this.alignmentState="left",this.bulletState={active:!1,type:null,count:1},this.undoStack=[],this.redoStack=[],this.lastCheckpoint=null,this.undoBtn=e.querySelector('[data-command="undo"]'),this.redoBtn=e.querySelector('[data-command="redo"]'),this.updateUndoRedoButtons(),this.charCount=e.querySelector(".t2-char-count span"),this.updateCharCount(),this.editor.addEventListener("input",()=>{this.updateCharCount()})}setupEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.appendChild(e),this.editor.style.whiteSpace="pre-wrap",this.editor.style.wordBreak="break-word"}updateUndoRedoButtons(){this.undoBtn.disabled=0===this.undoStack.length,this.redoBtn.disabled=0===this.redoStack.length}setupEventListeners(){this.toolbar.addEventListener("click",e=>{let t=e.target.closest(".t2-btn");if(!t)return;e.preventDefault(),e.stopPropagation();let a=t.dataset.command;this.handleCommand(a,t)}),this.isIOS||this.isSafari?this.editor.addEventListener("keydown",e=>{"Backspace"===e.key&&this.handleBackspace(e)}):this.editor.addEventListener("keydown",e=>{"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}),this.editor.addEventListener("input",e=>{this.handleInput(e)}),this.editor.addEventListener("paste",e=>{e.preventDefault(),this.handlePaste(e.clipboardData)}),this.editor.addEventListener("DOMNodeInserted",e=>{this.handleNodeInserted(e)})}handleInput(e){this.autoSave(),this.handleBulletPoints(),this.isIOS||this.isSafari?requestAnimationFrame(()=>{this.normalizeContent()}):this.normalizeContent(),this.createUndoPoint()}handleKeyDown(e){"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}handleEnterKey(){let e=window.getSelection(),t=e.getRangeAt(0),a=this.getClosestBlock(t.startContainer);if(!a||a===this.editor){(a=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(a),this.setCaretToStart(a);return}let l=document.createElement("p");if(t.collapsed){let n=document.createRange();n.selectNodeContents(a),n.setEnd(t.startContainer,t.startOffset);let i=document.createRange();i.selectNodeContents(a),i.setStart(t.startContainer,t.startOffset);let r=n.cloneContents(),o=i.cloneContents();r.textContent.trim()?(a.innerHTML="",a.appendChild(r)):a.innerHTML="<br>",o.textContent.trim()?l.appendChild(o):l.innerHTML="<br>"}else l.innerHTML="<br>";a.parentNode.insertBefore(l,a.nextSibling),this.setCaretToStart(l),this.normalizeContent(),this.createUndoPoint(),this.autoSave()}setCaretToStart(e){let t=document.createRange(),a=window.getSelection(),l=e.firstChild;for(;l&&l.nodeType===Node.ELEMENT_NODE&&"BR"!==l.tagName;)l=l.firstChild;l?l.nodeType===Node.TEXT_NODE?t.setStart(l,0):t.setStartBefore(l):t.setStart(e,0),t.collapse(!0),a.removeAllRanges(),a.addRange(t)}normalizeContent(){let e=null,t=Array.from(this.editor.childNodes);if(t.forEach(t=>{if(t.nodeType===Node.TEXT_NODE){let a=document.createElement("p");t.parentNode.insertBefore(a,t),a.appendChild(t),e=a}else if(t.nodeType===Node.ELEMENT_NODE){t.textContent.trim()||t.querySelector("br")||(this.isIOS||this.isSafari?t.innerHTML="<br>":t.innerHTML="​<br>");let l=t.lastChild;l&&l.nodeType===Node.TEXT_NODE&&!l.textContent.trim()&&t.appendChild(document.createElement("br")),e=t}}),!this.editor.firstChild){let a=document.createElement("p");this.isIOS||this.isSafari?a.innerHTML="<br>":a.innerHTML="​<br>",this.editor.appendChild(a)}}splitBlock(e,t){let a=e.cloneNode(!1),l=t.extractContents();return""===l.textContent.trim()?a.innerHTML="<br>":a.appendChild(l),e.parentNode.insertBefore(a,e.nextSibling),a}getClosestBlock(e){let t=["P","DIV","H1","H2","H3","H4","H5","H6","PRE"];for(;e&&e!==this.editor;){if(t.includes(e.nodeName))return e;e=e.parentNode}return null}handleBackspace(e){let t=window.getSelection(),a=t.getRangeAt(0);if(this.editor.childNodes.length<=1){let l=this.editor.firstElementChild;if(!l||""===l.textContent.trim()){e.preventDefault(),l&&"P"===l.tagName||this.resetEditor();return}}if(a.collapsed&&this.isAtBlockStart(a)){e.preventDefault();let n=this.getClosestBlock(a.startContainer);if(!n||n===this.editor)return;let i=n.previousElementSibling;if(!i)return;this.mergeBlocks(i,n),this.createUndoPoint()}setTimeout(()=>this.normalizeContent(),0)}mergeBlocks(e,t){let a=e.textContent.length;for("<br>"===e.innerHTML&&(e.innerHTML=""),"<br>"===t.innerHTML&&(t.innerHTML="");t.firstChild;)e.appendChild(t.firstChild);t.remove(),this.setCaretPosition(e,a),this.normalizeContent()}isAtBlockStart(e){let t=this.getClosestBlock(e.startContainer);if(!t)return!1;let a=document.createRange();return a.selectNodeContents(t),a.collapse(!0),0===e.compareBoundaryPoints(Range.START_TO_START,a)}setCaretPosition(e,t){let a=document.createRange(),l=window.getSelection(),n=e.firstChild;for(;n&&n.nodeType!==Node.TEXT_NODE;)n=n.firstChild;n||(n=e,t=0),a.setStart(n,Math.min(t,n.length)),a.collapse(!0),l.removeAllRanges(),l.addRange(a)}createUndoPoint(){let e=this.editor.innerHTML;e!==this.lastCheckpoint&&(this.undoStack.push(this.lastCheckpoint),this.lastCheckpoint=e,this.redoStack=[],this.undoStack.length>100&&this.undoStack.shift(),this.updateUndoRedoButtons())}undo(){if(0===this.undoStack.length)return;let e=this.editor.innerHTML;this.redoStack.push(e);let t=this.undoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}redo(){if(0===this.redoStack.length)return;let e=this.editor.innerHTML;this.undoStack.push(e);let t=this.redoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}handleNodeInserted(e){if(e.target.nodeType===Node.TEXT_NODE&&e.target.parentNode===this.editor){let t=document.createElement("p");e.target.parentNode.insertBefore(t,e.target),t.appendChild(e.target),this.normalizeContent()}}insertAtCursor(e){let t=window.getSelection();if(!t.rangeCount)return;let a=t.getRangeAt(0),l=this.getClosestBlock(a.startContainer);if(l&&l!==this.editor){let n=document.createElement("p");n.appendChild(e),l.parentNode.insertBefore(n,l.nextSibling);let i=document.createElement("p");i.innerHTML="<br>",n.parentNode.insertBefore(i,n.nextSibling);let r=document.createRange();r.setStartAfter(i),r.collapse(!0),t.removeAllRanges(),t.addRange(r)}this.normalizeContent(),this.createUndoPoint()}isBlockElement(e){return["P","DIV","H1","H2","H3","H4","H5","H6","PRE"].includes(e.tagName)}handleCommand(e,t){switch(e){case"undo":this.undo();break;case"redo":this.redo();break;case"fontSize":this.showFontSizeList(t);break;case"justifyContent":this.toggleAlignment(t);break;case"foreColor":case"backColor":this.saveSelection(),this.showColorPalette(e,t);break;case"insertYouTube":this.insertYouTube();break;case"insertCodeBlock":this.insertCodeBlock();break;case"insertImage":this.showImageUploadModal();break;case"createLink":this.showLinkModal();break;case"attachFile":this.handleAttachFile();break;case"insertTable":this.showTableModal();break;default:this.execCommand(e),["bold","italic","underline","strikeThrough"].includes(e)&&t.classList.toggle("active")}this.createUndoPoint()}saveSelection(){window.getSelection&&(this.savedSelection=window.getSelection().getRangeAt(0).cloneRange())}restoreSelection(){if(this.savedSelection){let e=window.getSelection();e.removeAllRanges(),e.addRange(this.savedSelection)}}execCommand(e,t=null){if(document.execCommand("styleWithCSS",!1,!0),"fontSize"===e){let a=window.getSelection(),l=a.getRangeAt(0),n=document.createElement("span");n.style.fontSize=t+"px";let i=l.commonAncestorContainer.parentElement;i&&i.style.fontSize?i.style.fontSize=t+"px":l.surroundContents(n)}else document.execCommand(e,!1,t);this.normalizeContent()}toggleAlignment(e){let t=["left","center","right"],a=t.indexOf(this.alignmentState);a=(a+1)%t.length,this.alignmentState=t[a],e.querySelector(".material-icons").textContent=["format_align_left","format_align_center","format_align_right"][a];let l=window.getSelection(),n=l.getRangeAt(0),i=this.getClosestBlock(n.commonAncestorContainer);i&&(i.style.textAlign=this.alignmentState),this.execCommand(["justifyLeft","justifyCenter","justifyRight"][a]),this.createUndoPoint()}showFontSizeList(e){let t=document.createElement("div");t.className="t2-font-size-list",t.style.cssText=`
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
        `,a.addEventListener("mouseenter",()=>{a.style.backgroundColor="#f5f5f5"}),a.addEventListener("mouseleave",()=>{a.style.backgroundColor="transparent"}),a.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.execCommand("fontSize",e),t.parentElement.remove(),this.createUndoPoint()}),t.appendChild(a)}),this.showDropdown(t,e)}showDropdown(e,t){let a=t.getBoundingClientRect(),l=this.toolbar.getBoundingClientRect(),n=document.createElement("div");n.style.cssText=`
        position: absolute;
        top: ${a.bottom-l.top}px;
        left: ${a.left-l.left}px;
        z-index: 10000;
    `,n.appendChild(e),this.toolbar.appendChild(n);let i=e.getBoundingClientRect(),r=window.innerWidth;if(i.right>r){let o=i.right-r;n.style.left=`${parseInt(n.style.left)-o-10}px`}let s=a=>{e.contains(a.target)||a.target===t||(n.remove(),document.removeEventListener("mousedown",s))};requestAnimationFrame(()=>{document.addEventListener("mousedown",s)})}showColorPalette(e,t){let a=document.createElement("div");a.className="t2-color-palette",a.style.cssText=`
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
    `;let n=document.createElement("div");n.className="t2-color-input-container";let i=document.createElement("span");i.textContent="#",i.className="t2-color-hash";let r=document.createElement("input");r.type="text",r.className="t2-color-input",r.maxLength=6,n.appendChild(i),n.appendChild(r);let o=document.createElement("button");o.textContent="적용",o.className="t2-color-apply-btn";let s=e=>3===e.length?e.split("").map(e=>e+e).join(""):e,d=()=>{let t=r.value.trim();if(/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(t)){let l="#"+s(t);this.restoreSelection(),this.execCommand(e,l),a.parentElement.remove(),this.createUndoPoint()}else alert("올바른 색상 코드를 입력해주세요. (예: FF0000 또는 F00)")};o.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),d()}),r.addEventListener("input",e=>{let t=e.target.value.replace(/[^0-9A-Fa-f]/gi,"");t.length>6&&(t=t.slice(0,6)),e.target.value=t}),r.addEventListener("keypress",e=>{if(r.value.length>=6&&r.selectionStart===r.selectionEnd||!/[0-9A-Fa-f]/i.test(e.key)){e.preventDefault();return}"Enter"===e.key&&(e.preventDefault(),d())}),r.addEventListener("paste",e=>{e.preventDefault();let t=(e.clipboardData||window.clipboardData).getData("text");t.startsWith("#")&&(t=t.substring(1)),t=(t=(t=t.replace(/#/g,"")).replace(/[^0-9A-Fa-f]/gi,"")).slice(0,6);let a=r.selectionStart,l=r.selectionEnd,n=r.value,i=n.slice(0,a),o=n.slice(l),s=(i+t+o).slice(0,6);r.value=s}),l.appendChild(n),l.appendChild(o),a.appendChild(l),this.showDropdown(a,t),r.focus()}getVideoType(e){let t=e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);if(t&&11===t[2].length)return{type:"youtube",id:t[2]};let a=e.match(/\.(mp4|webm|ogg)$/i);return a?{type:"video",url:e}:null}createVideoBlock(e){let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width="320px",a.style.height="180px",a.style.maxWidth="100%",a.style.margin="0 auto",a.dataset.width=320,a.dataset.height=180;let l;"youtube"===e.type?((l=document.createElement("iframe")).src=`https://www.youtube.com/embed/${e.id}`,l.frameBorder="0",l.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",l.allowFullscreen=!0):((l=document.createElement("video")).src=e.url,l.controls=!0,l.style.backgroundColor="#000"),l.style.width="100%",l.style.height="100%",a.appendChild(l);let n=this.createVideoControls(a,l,e,320,180);return t.appendChild(a),t.appendChild(n),t}createVideoControls(e,t,a,l,n){let i=document.createElement("div");i.className="t2-media-controls",i.contentEditable=!1,i.innerHTML=`
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
        <button class="t2-btn edit-url-btn">
            <span class="material-icons">edit</span>
        </button>
        <input type="range" min="30" max="200" value="100" style="width: 100px;">
    `;let r=i.querySelector('input[type="range"]');r.addEventListener("input",t=>{let a=t.target.value;e.style.width=l*a/100+"px",e.style.height=n*a/100+"px"});let o=i.querySelector(".edit-url-btn");return o.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.showVideoUrlEditModal(t,a)}),i}showVideoUrlEditModal(e,t){let a="youtube"===t.type?`https://youtube.com/watch?v=${t.id}`:t.url,l=document.createElement("div");l.className="t2-modal-overlay",l.innerHTML=`
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
    `;let n=()=>{let t=l.querySelector(".t2-youtube-url").value,a=this.getVideoType(t);if(!a){alert("올바른 비디오 URL을 입력해주세요.");return}if("youtube"===a.type)e.src=`https://www.youtube.com/embed/${a.id}`;else{let n=document.createElement("video");n.src=a.url,n.controls=!0,n.style=e.style,e.parentNode.replaceChild(n,e)}l.remove(),this.createUndoPoint(),this.autoSave()};l.querySelector('[data-action="cancel"]').onclick=()=>l.remove(),l.querySelector('[data-action="insert"]').onclick=n,l.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),n())}),document.body.appendChild(l),l.querySelector(".t2-youtube-url").focus()}insertYouTube(){let e=window.getSelection(),t=e.getRangeAt(0),a=t.cloneRange(),l=document.createElement("div");l.className="t2-modal-overlay",l.innerHTML=`
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
    `;let n=()=>{let t=l.querySelector(".t2-youtube-url").value,n=this.getVideoType(t);if(!n){alert("올바른 비디오 URL을 입력해주세요.");return}let i=this.createVideoBlock(n);e.removeAllRanges(),e.addRange(a);let r=this.getClosestBlock(a.startContainer);if(r&&r!==this.editor){let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling);let s=document.createElement("p");s.appendChild(i),o.parentNode.insertBefore(s,o.nextSibling);let d=document.createElement("p");d.innerHTML="<br>",s.parentNode.insertBefore(d,s.nextSibling);let c=document.createRange();c.setStartAfter(d),c.collapse(!0),e.removeAllRanges(),e.addRange(c)}this.normalizeContent(),this.createUndoPoint(),this.autoSave(),l.remove()};l.querySelector('[data-action="cancel"]').onclick=()=>l.remove(),l.querySelector('[data-action="insert"]').onclick=n,l.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),n())}),document.body.appendChild(l),l.querySelector(".t2-youtube-url").focus()}insertCodeBlock(){let e=document.createElement("div");e.className="t2-code-block";let t=document.createElement("pre"),a=document.createElement("code");a.textContent="코드를 입력하세요",a.classList.add("code-placeholder"),a.setAttribute("contenteditable","true"),t.appendChild(a),a.addEventListener("click",function(e){if(this.classList.contains("code-placeholder")){this.textContent="",this.classList.remove("code-placeholder");let t=document.createRange(),a=window.getSelection();t.setStart(this,0),t.collapse(!0),a.removeAllRanges(),a.addRange(t)}}),a.addEventListener("focus",function(e){this.classList.contains("code-placeholder")&&(this.textContent="",this.classList.remove("code-placeholder"))}),a.addEventListener("blur",function(){""===this.textContent.trim()&&(this.textContent="코드를 입력하세요",this.classList.add("code-placeholder"))}),a.addEventListener("keydown",function(e){"Tab"===e.key&&(e.preventDefault(),document.execCommand("insertText",!1,"    "))}),e.appendChild(t),this.insertAtCursor(e)}resetEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.innerHTML="",this.editor.appendChild(e),this.setCaretToStart(e)}showImageUploadModal(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
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
    `;let t=e.querySelector(".t2-image-preview-grid"),a=e.querySelector('input[type="file"]'),l=e.querySelector('[data-action="upload"]'),n=e.querySelector(".t2-image-upload-area"),i=e.querySelector(".t2-image-upload-form"),r=e.querySelector(".t2-image-url-input"),o=e.querySelector(".t2-url-preview"),s=new Map,d="";e.querySelectorAll(".t2-tab").forEach(t=>{t.addEventListener("click",()=>{e.querySelectorAll(".t2-tab").forEach(e=>e.classList.remove("active")),t.classList.add("active");let a=t.dataset.tab;e.querySelectorAll(".t2-tab-pane").forEach(e=>{e.classList.remove("active"),e.dataset.pane===a&&e.classList.add("active")}),"upload"===a?l.disabled=0===s.size:l.disabled=!d})});let c;r.addEventListener("input",e=>{let t=e.target.value.trim();clearTimeout(c),c=setTimeout(()=>{if(t){let e=new Image;e.onload=()=>{d=t,o.innerHTML=`
                        <div class="t2-url-preview-image">
                            <img src="${t}" alt="URL Preview">
                        </div>
                    `,l.disabled=!1},e.onerror=()=>{d="",o.innerHTML=`
                        <div class="t2-url-preview-error">
                            올바른 이미지 URL이 아닙니다
                        </div>
                    `,l.disabled=!0},e.src=t}else d="",o.innerHTML="",l.disabled=!0},300)});let p=e=>{Array.from(e).forEach(e=>{if(!e.type.startsWith("image/")){alert("이미지 파일만 업로드 가능합니다.");return}let a=new FileReader;a.onload=a=>{let n=document.createElement("div");n.className="t2-preview-item",n.innerHTML=`
                    <img src="${a.target.result}" alt="Preview">
                    <button type="button" class="t2-preview-remove">
                        <span class="material-icons">close</span>
                    </button>
                `;let i=n.querySelector(".t2-preview-remove");i.onclick=()=>{s.delete(e),n.remove(),l.disabled=0===s.size},s.set(e,n),t.appendChild(n),l.disabled=!1},a.readAsDataURL(e)})};a.onchange=e=>p(e.target.files),n.ondragover=e=>{e.preventDefault(),n.classList.add("drag-over")},n.ondragleave=e=>{e.preventDefault(),n.classList.remove("drag-over")},n.ondrop=e=>{e.preventDefault(),n.classList.remove("drag-over"),p(e.dataTransfer.files)},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=()=>{let t=e.querySelector(".t2-tab.active").dataset.tab;"upload"===t?s.size>0&&this.handleMultipleImageUpload(i,Array.from(s.keys())):"url"===t&&d&&this.handleUrlImageUpload(d),e.remove()},document.body.appendChild(e)}async handleUrlImageUpload(e){try{let t=async e=>{let t=async(e,t)=>new Promise((a,l)=>{let n=new Image,i=document.createElement("div");i.style.cssText="position: fixed; left: -9999px; top: -9999px; visibility: hidden;",document.body.appendChild(i);let r=()=>{i.parentNode&&i.parentNode.removeChild(i),URL.revokeObjectURL(n.src)};switch(n.onload=()=>{try{let e=document.createElement("canvas"),t=e.getContext("2d"),i=n.naturalWidth,o=n.naturalHeight;if(i>2e3||o>2e3){let s=Math.min(2e3/i,2e3/o);i=Math.floor(i*s),o=Math.floor(o*s)}e.width=i,e.height=o,t.fillStyle="#FFFFFF",t.fillRect(0,0,i,o),t.drawImage(n,0,0,i,o),e.toBlob(e=>{r(),e&&e.size>0?a({blob:e,width:i,height:o}):l(Error("빈 이미지"))},"image/jpeg",.92)}catch(d){r(),l(d)}},n.onerror=()=>{r(),l(Error(`로드 실패 (${t})`))},t){case"crossOrigin":n.crossOrigin="anonymous",n.src=e;break;case"direct":n.removeAttribute("crossOrigin"),n.src=e;break;case"blob":fetch(e,{mode:"cors",credentials:"omit"}).then(e=>e.blob()).then(e=>{n.src=URL.createObjectURL(e)}).catch(()=>{r(),l(Error("Blob fetch 실패"))});break;default:r(),l(Error("알 수 없는 방법"))}i.appendChild(n),setTimeout(()=>{r(),l(Error("시간 초과"))},1e4)}),a=["crossOrigin","direct","blob"],l=null;for(let n of[e=>e,e=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(e)}`,e=>`https://corsproxy.io/?${encodeURIComponent(e)}`,e=>`https://api.allorigins.win/raw?url=${encodeURIComponent(e)}`,e=>`https://proxy.cors.sh/${e}`,e=>`https://cors-anywhere.herokuapp.com/${e}`])for(let i of a)try{alert(`이미지 다운로드 시도... (${i})`);let r=await t(n(e),i);if(r)return r}catch(o){l=o,console.log(`시도 실패 (${i}):`,o.message);continue}throw l||Error("모든 다운로드 시도 실패")},{blob:a,width:l,height:n}=await t(e),i=`image_${Date.now()}.jpg`,r=new File([a],i,{type:"image/jpeg"});alert(`이미지 캡처 완료: ${i} (${r.size} bytes)`);let o=new FormData;o.append("bf_file[]",r),o.append("uid",this.generateUid()),alert("서버 업로드 시작...");let s=await fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:o}),d=await s.json();if(!d.success)throw Error(d.message||"업로드 실패");alert("이미지 블록 생성 중...");let c=window.getSelection(),p=this.editor.lastElementChild;p||((p=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(p));let h=document.createElement("p");h.innerHTML="<br>",p.parentNode.insertBefore(h,p.nextSibling),d.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width=e.width+"px",a.style.maxWidth="100%",a.style.margin="0 auto";let l=document.createElement("img");l.src=e.url,l.style.width="100%",l.dataset.width=e.width,l.dataset.height=e.height,a.appendChild(l),t.appendChild(a);let n=this.createMediaControls(a,l);t.appendChild(n);let i=document.createElement("p");i.appendChild(t),h.parentNode.insertBefore(i,h.nextSibling);let r=document.createElement("p");if(r.innerHTML="<br>",i.parentNode.insertBefore(r,i.nextSibling),c){let o=document.createRange();o.setStartAfter(r),o.collapse(!0),c.removeAllRanges(),c.addRange(o)}}),this.normalizeContent(),this.createUndoPoint(),this.autoSave(),alert("이미지 업로드 및 삽입 완료!")}catch(u){console.error("이미지 처리 중 오류:",u),alert(`이미지 처리 중 오류가 발생했습니다.
상세 오류: ${u.message}`)}}handleMultipleImageUpload(e,t){let a=new FormData(e);a.delete("bf_file[]"),t.forEach(e=>a.append("bf_file[]",e)),fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:a}).then(e=>e.json()).then(e=>{if(e.success){let t=window.getSelection(),a=t.getRangeAt(0),l=this.getClosestBlock(a.startContainer);if(l&&l!==this.editor){let n=document.createElement("p");n.innerHTML="<br>",l.parentNode.insertBefore(n,l.nextSibling);let i=n;e.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let a=document.createElement("div");a.style.width=e.width+"px",a.style.maxWidth="100%",a.style.margin="0 auto";let l=document.createElement("img");l.src=e.url,l.style.width="100%",l.dataset.width=e.width,l.dataset.height=e.height,a.appendChild(l),t.appendChild(a);let n=this.createMediaControls(a,l);t.appendChild(n);let r=document.createElement("p");r.appendChild(t),i.parentNode.insertBefore(r,i.nextSibling);let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling),i=o});let r=document.createRange();r.setStartAfter(i),r.collapse(!0),t.removeAllRanges(),t.addRange(r),this.normalizeContent(),this.createUndoPoint()}}else alert("이미지 업로드 실패: "+e.message)}).catch(e=>{console.error("업로드 에러:",e),alert("이미지 업로드 중 오류가 발생했습니다.")})}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}updateImageTransform(e,t,a){e.style.transform=`
       rotate(${t}deg)
       scaleX(${a?-1:1})
   `}handlePaste(e){if(e.items)for(let t=0;t<e.items.length;t++){let a=e.items[t];if(-1!==a.type.indexOf("image")){let l=a.getAsFile();if(l){let n=new FormData;n.append("bf_file[]",l),n.append("uid",this.generateUid()),fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:n}).then(e=>e.json()).then(e=>{if(e.success){let t=window.getSelection(),a=this.editor.lastElementChild;a||((a=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(a));let l=document.createElement("p");l.innerHTML="<br>",a.parentNode.insertBefore(l,a.nextSibling),e.files.forEach(e=>{let a=document.createElement("div");a.className="t2-media-block";let n=document.createElement("div");n.style.width=e.width+"px",n.style.maxWidth="100%",n.style.margin="0 auto";let i=document.createElement("img");i.src=e.url,i.style.width="100%",i.dataset.width=e.width,i.dataset.height=e.height,n.appendChild(i),a.appendChild(n);let r=this.createMediaControls(n,i);a.appendChild(r);let o=document.createElement("p");o.appendChild(a),l.parentNode.insertBefore(o,l.nextSibling);let s=document.createElement("p");if(s.innerHTML="<br>",o.parentNode.insertBefore(s,o.nextSibling),t){let d=document.createRange();d.setStartAfter(s),d.collapse(!0),t.removeAllRanges(),t.addRange(d)}}),this.normalizeContent(),this.createUndoPoint(),this.autoSave()}else alert("이미지 업로드 실패: "+e.message)}).catch(e=>{console.error("이미지 업로드 에러:",e),alert("이미지 업로드 중 오류가 발생했습니다.")});return}}}let i=e.getData("text/html");if(i&&i.includes("<table")){let r=document.createElement("div");r.innerHTML=i;let o=r.querySelectorAll("table");o.forEach(e=>{let t=e.cloneNode(!0);t.className="t2-table",t.setAttribute("data-t2-table","true"),t.style.width="100%",t.style.borderCollapse="collapse";let a=t.querySelectorAll("td, th");a.forEach(e=>{e.style.border="1px solid #ccc",e.style.padding="8px","TH"===e.tagName&&(e.style.backgroundColor="#f5f5f5")});let l=document.createElement("div");l.className="t2-table-wrapper",l.contentEditable=!1,l.appendChild(t);let n=document.createElement("div");n.className="t2-table-controls",n.innerHTML=`
                <div class="t2-table-control-group">
                    <span>가로셀:</span>
                    <button class="t2-btn t2-table-control-btn" data-action="add-col">
                        <span class="material-icons">add</span>
                    </button>
                    <button class="t2-btn t2-table-control-btn" data-action="remove-col">
                        <span class="material-icons">remove</span>
                    </button>
                </div>
                <div class="t2-table-control-group">
                    <span>세로셀:</span>
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
            `,l.appendChild(n),this.insertAtCursor(l),this.setupTableControlEvents(n,t),this.setupTableCellEditing(t)});let s=Array.from(r.childNodes).filter(e=>"TABLE"!==e.nodeName);if(s.length>0){let d=document.createDocumentFragment();if(s.forEach(e=>{d.appendChild(e.cloneNode(!0))}),d.childNodes.length>0){let c=window.getSelection(),p=c.getRangeAt(0);this.getClosestBlock(p.startContainer),p.deleteContents(),p.insertNode(d);let h=p.commonAncestorContainer.lastChild||p.commonAncestorContainer,u=document.createRange();u.setStartAfter(h),u.collapse(!0),c.removeAllRanges(),c.addRange(u)}}this.normalizeContent(),this.createUndoPoint();return}let m=e.getData("text/plain"),b=window.getSelection(),v=b.getRangeAt(0),g=this.getClosestBlock(v.startContainer);if(g&&g!==this.editor||(g=document.createElement("p"),this.editor.appendChild(g)),!i||this.isIOS||this.isSafari){let f=m.split(/\r?\n/);f.forEach((e,t)=>{if(0===t&&v.collapsed)document.execCommand("insertText",!1,e);else{let a=document.createElement("p");a.textContent=e||"​",e||a.appendChild(document.createElement("br")),g.parentNode.insertBefore(a,g.nextSibling),g=a}})}else{let y=document.createElement("div");y.innerHTML=i,this.cleanupPastedHTML(y),v.deleteContents(),Array.from(y.childNodes).forEach((e,t)=>{let a;e.nodeType===Node.TEXT_NODE?(a=document.createElement("p")).appendChild(e.cloneNode()):e.nodeType===Node.ELEMENT_NODE&&(this.isBlockElement(e)?a=e.cloneNode(!0):(a=document.createElement("p")).appendChild(e.cloneNode(!0))),a&&(0===t&&v.collapsed?v.insertNode(a):g.parentNode.insertBefore(a,g.nextSibling),g=a)})}this.normalizeContent(),this.createUndoPoint()}cleanupPastedHTML(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,null,!1),a=[],l;for(;l=t.nextNode();)l.removeAttribute("style"),l.removeAttribute("class"),["STYLE","SCRIPT","META"].includes(l.tagName)&&a.push(l),this.isBlockElement(l)&&!l.textContent.trim()&&(l.innerHTML="<br>");a.forEach(e=>e.parentNode.removeChild(e))}getYouTubeVideoId(e){let t=e.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);return t&&11==t[7].length?t[7]:null}setupAutoSaveToggle(){let e=this.container.querySelector(".t2-editor-status"),t=document.createElement("div");t.className="t2-autosave-toggle",t.innerHTML=`
            <label class="t2-switch">
                <input type="checkbox" ${this.autoSaveEnabled?"checked":""}>
                <span class="t2-slider"></span>
            </label>
            <span class="t2-autosave-text">자동 저장</span>
        `;let a=t.querySelector('input[type="checkbox"]');a.addEventListener("change",e=>{this.autoSaveEnabled=e.target.checked,localStorage.setItem("t2editor-autosave-enabled",this.autoSaveEnabled),this.autoSaveEnabled?this.autoSave():this.clearAutoSave()});let l=e.querySelector(".t2-logo").parentElement;l.parentNode.insertBefore(t,l.nextSibling)}autoSave(){if(!this.autoSaveEnabled)return;let e=this.editor.innerHTML,t=e.replace(/<p>\s*<\/p>/g,"<p><br></p>");localStorage.setItem("t2editor-autosave",t)}loadAutoSave(){if(!this.autoSaveEnabled)return;let e=localStorage.getItem("t2editor-autosave");e&&(this.editor.innerHTML=e,this.normalizeContent())}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}setupBeforeUnload(){window.addEventListener("beforeunload",()=>{this.autoSaveEnabled&&this.autoSave()})}setContent(e){e&&(this.editor.innerHTML=e,this.editor.querySelectorAll('img, iframe[src*="youtube"], video').forEach(e=>{if(!e.closest(".t2-media-block")){let t=e.style.width?parseInt(e.style.width):e.width||320,a=e.style.height?parseInt(e.style.height):e.height||180,l=document.createElement("div");l.className="t2-media-block";let n=document.createElement("div");n.style.width=`${t}px`,n.style.maxWidth="100%",n.style.margin="0 auto";let i=e.cloneNode(!0);i.style.width="100%",("IFRAME"===i.tagName||"VIDEO"===i.tagName)&&(n.style.height=`${a}px`,i.style.height="100%"),n.appendChild(i),l.appendChild(n);let r=this.createMediaControls(n,i);l.appendChild(r);let o=document.createElement("p");o.appendChild(l),e.parentNode.replaceChild(o,e)}}),this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),a=t.querySelector("img, iframe, video");if(a){if(parseInt(t.style.width),parseInt(t.style.height),t.style.maxWidth||(t.style.maxWidth="100%"),t.style.margin||(t.style.margin="0 auto"),a.style.width="100%",("IFRAME"===a.tagName||"VIDEO"===a.tagName)&&(a.style.height="100%"),"P"!==e.parentNode.nodeName){let l=document.createElement("p");e.parentNode.insertBefore(l,e),l.appendChild(e)}let n=e.querySelector(".t2-media-controls");n&&n.remove();let i=this.createMediaControls(t,a);e.appendChild(i)}}),this.initializeTableBlocks(),this.normalizeContent())}createMediaControls(e,t){let a=document.createElement("div");a.className="t2-media-controls",a.contentEditable=!1;let l=parseInt(t.dataset.width)||parseInt(e.style.width)||320,n=parseInt(t.dataset.height)||parseInt(e.style.height)||180,i=this.editor.clientWidth,r=parseInt(e.style.width);a.innerHTML=`
        <button class="t2-btn delete-btn">
            <span class="material-icons">delete</span>
        </button>
        ${"IFRAME"===t.tagName?`
            <button class="t2-btn edit-url-btn">
                <span class="material-icons">edit</span>
            </button>
        `:""}
        <input type="range" min="30" max="${Math.min(100,Math.floor(i/l*100))}" value="${Math.round(r/l*100)}" class="size-slider" style="width: 100px;">
    `;let o=a.querySelector(".size-slider");if(o){let s=new ResizeObserver(()=>{let a=this.editor.clientWidth,i=Math.min(100,Math.floor(a/l*100));o.max=i,parseInt(o.value)>i&&(o.value=i,e.style.width=`${Math.round(l*i/100)}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${Math.round(n*i/100)}px`,t.style.height="100%"))});s.observe(this.editor),o.addEventListener("input",a=>{let i=parseInt(a.target.value),r=Math.round(l*i/100),o=Math.round(n*i/100);e.style.width=`${r}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${o}px`,t.style.height="100%"),t.dataset.currentWidth=r,t.dataset.currentHeight=o})}let d=a.querySelector(".delete-btn");d&&d.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),a.closest(".t2-media-block").remove()});let c=a.querySelector(".edit-url-btn");return c&&"IFRAME"===t.tagName&&c.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let a=t.src.match(/embed\/([^?]+)/)?.[1];a&&this.showVideoUrlEditModal(t,{type:"youtube",id:a})}),a}attachControlEvents(e,t,a,l,n){e.querySelector(".delete-btn")?.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),e.closest(".t2-media-block").remove()});let i=e.querySelector(".size-slider");i&&i.addEventListener("input",e=>{let i=e.target.value;t.style.width=`${l*i/100}px`,("IFRAME"===a.tagName||"VIDEO"===a.tagName)&&(t.style.height=`${n*i/100}px`)});let r=e.querySelector(".edit-url-btn");r&&"IFRAME"===a.tagName&&r.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let t=a.src.match(/embed\/([^?]+)/)?.[1];t&&this.showVideoUrlEditModal(a,{type:"youtube",id:t})})}initializeMediaControls(){this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),a=t.querySelector("img, iframe, video"),l=e.querySelector(".t2-media-controls");if(l){let n=this.createMediaControls(t,a);e.replaceChild(n,l)}})}initializeBlocks(){this.editor.querySelectorAll("img:not(.t2-media-block img)").forEach(e=>{let t=parseInt(e.style.width)||e.naturalWidth||320,a=parseInt(e.style.height)||e.naturalHeight||180,l=this.createMediaBlock(e.src,t,a,"image");e.parentNode.replaceChild(l,e)}),this.editor.querySelectorAll('iframe[src*="youtube"]:not(.t2-media-block iframe)').forEach(e=>{let t=parseInt(e.style.width)||320,a=parseInt(e.style.height)||180,l=this.createMediaBlock(e.src,t,a,"youtube");e.parentNode.replaceChild(l,e)}),this.initializeTableBlocks()}initializeTableBlocks(){this.editor.querySelectorAll("table.t2-table").forEach(e=>{if(e.closest(".t2-table-wrapper"))return;let t=e.querySelectorAll("tr").length,a=e.querySelector("tr")?.children.length||0,l=a>10||t>10;l&&e.classList.add("t2-table-large");let n=document.createElement("div");if(n.className="t2-table-wrapper",n.contentEditable=!1,l){let i=document.createElement("div");i.className="t2-table-scroll-wrapper",i.appendChild(e),n.appendChild(i)}else n.appendChild(e);e.parentNode.insertBefore(n,e),l||n.appendChild(e);let r=document.createElement("div");r.className="t2-table-controls",r.innerHTML=`
            <div class="t2-table-control-counter">
                <span class="t2-row-count">${t}</span>행 \xd7 <span class="t2-col-count">${a}</span>열
            </div>
            <div class="t2-table-control-group">
                <span>가로셀:</span>
                <button class="t2-btn t2-table-control-btn" data-action="add-col">
                    <span class="material-icons">add</span>
                </button>
                <button class="t2-btn t2-table-control-btn" data-action="remove-col">
                    <span class="material-icons">remove</span>
                </button>
            </div>
            <div class="t2-table-control-group">
                <span>세로셀:</span>
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
        `,n.appendChild(r),this.setupTableControlEvents(r,e),this.setupTableCellEditing(e),this.setupTableResizing(e)})}wrapMediaBlock(e){let t=document.createElement("div");t.className="t2-media-block",e.parentNode.insertBefore(t,e),t.appendChild(e);let a=this.createMediaControls(t,e);t.appendChild(a)}updateCharCount(){let e=this.editor.textContent;e=e.replace(/\s+/g,""),this.charCount.textContent=e.length}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}showLinkModal(){let e=window.getSelection(),t=e.getRangeAt(0);if(t.collapsed){alert("텍스트를 선택한 후 링크를 추가해주세요.");return}this.saveSelection();let a=null,l=t.startContainer,n=t.endContainer,i=e=>{for(;e&&e!==this.editor;){if("A"===e.nodeName)return e;e=e.parentNode}return null},r=i(l),o=i(n);if(l===n||r&&r===o)a=r;else{let s=t.toString(),d=[],c=document.createTreeWalker(t.commonAncestorContainer,NodeFilter.SHOW_ELEMENT,{acceptNode:e=>"A"===e.nodeName?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}),p;for(;p=c.nextNode();)if(t.intersectsNode(p)){if(p.textContent===s){a=p;break}d.push(p)}a||1!==d.length||d[0].textContent!==s||(a=d[0])}let h=document.createElement("div");h.className="t2-modal-overlay",h.innerHTML=`
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
    `;let u=()=>{let t=h.querySelector(".t2-link-url-input").value.trim(),l=h.querySelector(".t2-link-new-tab").checked;if(!t){alert("URL을 입력해주세요.");return}let n=t;/^https?:\/\//i.test(t)||(n="http://"+t),this.restoreSelection();try{let i=e.getRangeAt(0);if(a){if(i.toString()===a.textContent)a.href=n,a.target=l?"_blank":"",a.rel=l?"noopener noreferrer":"";else{let r=i.toString(),o=document.createElement("a");o.href=n,o.target=l?"_blank":"",o.rel=l?"noopener noreferrer":"",o.textContent=r,i.deleteContents(),i.insertNode(o)}}else{let s=i.toString(),d=document.createElement("a");d.href=n,d.target=l?"_blank":"",d.rel=l?"noopener noreferrer":"",d.textContent=s,i.deleteContents(),i.insertNode(d)}h.remove(),this.createUndoPoint(),this.autoSave(),this.normalizeContent()}catch(c){console.error("링크 적용 중 오류:",c),alert("링크를 적용하는 중 오류가 발생했습니다. 선택 영역을 다시 확인해주세요.")}};h.querySelector('[data-action="insert"]').onclick=u,h.querySelector('[data-action="cancel"]').onclick=()=>h.remove(),a&&(h.querySelector('[data-action="remove"]').onclick=()=>{this.restoreSelection();try{let t=e.getRangeAt(0),l=a.textContent,n=t.toString();if(n===l){let i=a.parentNode;for(;a.firstChild;)i.insertBefore(a.firstChild,a);a.remove()}else{let r=t.startOffset,o=t.endOffset;a.firstChild;let s=l.substring(0,r),d=l.substring(r,o),c=l.substring(o),p=a.parentNode;if(s){let u=a.cloneNode(!1);u.textContent=s,p.insertBefore(u,a)}let m=document.createTextNode(d);if(p.insertBefore(m,a),c){let b=a.cloneNode(!1);b.textContent=c,p.insertBefore(b,a)}a.remove()}h.remove(),this.createUndoPoint(),this.autoSave()}catch(v){console.error("링크 제거 중 오류:",v),alert("링크를 제거하는 중 오류가 발생했습니다. 선택 영역을 다시 확인해주세요.")}}),h.querySelector(".t2-link-url-input").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),u())}),document.body.appendChild(h),h.querySelector(".t2-link-url-input").focus()}insertFileIcon(e){let t=document.createElement("div");t.className="t2-media-block t2-file-block";let a=new Date().toISOString().split("T")[0].replace(/-/g,"."),l=this.formatFileSize(e.size),n=/\.(mp3|m4a)$/i.test(e.original_name),i=/\.pdf$/i.test(e.original_name),r=e.url;if(i){let o=r.match(/data\/editor\/t2editor_(\d+)\/(.+\.pdf)$/i);if(o){let[,s,d]=o;r=g5_url+`/plugin/editor/t2editor/pdf_view.php?pdf=${s}/${d}`}}if(n){t.innerHTML=`
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
            <a href="${r}" ${i?"":"download"} style="text-decoration: none; color: inherit;">
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
    `,t.appendChild(h);let u=window.getSelection(),m=u.getRangeAt(0),b=this.getClosestBlock(m.startContainer);if(b&&b!==this.editor){let v=document.createElement("p");v.appendChild(t);let g=document.createElement("p");g.innerHTML="<br>",b.parentNode.insertBefore(g,b.nextSibling),g.parentNode.insertBefore(v,g.nextSibling);let f=document.createElement("p");f.innerHTML="<br>",v.parentNode.insertBefore(f,v.nextSibling);let y=document.createRange();y.setStartAfter(f),y.collapse(!0),u.removeAllRanges(),u.addRange(y)}this.normalizeContent(),this.createUndoPoint()}async uploadFile(e){let t=new FormData;t.append("bf_file",e),t.append("uid",this.generateUid());try{let a=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),l=await a.json();l.success?this.insertFileIcon(l.file):alert("파일 업로드 실패: "+l.message)}catch(n){console.error("업로드 에러:",n),alert("파일 업로드 중 오류가 발생했습니다.")}}handleAttachFile(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
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
    `;let t=e.querySelector(".t2-file-preview-grid"),a=e.querySelector('input[type="file"]'),l=e.querySelector('[data-action="upload"]'),n=e.querySelector(".t2-file-upload-area"),i=e.querySelector(".t2-progress-fill"),r=e.querySelector(".t2-upload-progress"),o=e.querySelector(".t2-progress-text"),s=null,d=e=>{if(![".zip",".pdf",".txt",".mp3"].some(t=>e.name.toLowerCase().endsWith(t))){alert("지원하지 않는 파일 형식입니다.");return}t.innerHTML="";let n=document.createElement("div");n.className="t2-file-preview-item",n.innerHTML=`
            <div class="t2-file-preview-icon" style="background-color: ${this.getFileColor(e.name.split(".").pop())}"></div>
            <div class="t2-file-preview-name">${e.name}</div>
            <button type="button" class="t2-file-preview-remove">
                <span class="material-icons">close</span>
            </button>
        `;let i=n.querySelector(".t2-file-preview-remove");i.onclick=e=>{e.preventDefault(),e.stopPropagation(),s=null,n.remove(),l.disabled=!0,a.value=""},s=e,t.appendChild(n),l.disabled=!1};a.onchange=e=>{e.target.files.length>0&&d(e.target.files[0])},n.ondragover=e=>{e.preventDefault(),n.classList.add("drag-over")},n.ondragleave=e=>{e.preventDefault(),n.classList.remove("drag-over")},n.ondrop=e=>{e.preventDefault(),n.classList.remove("drag-over"),e.dataTransfer.files.length>0&&d(e.dataTransfer.files[0])},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=async()=>{if(s){l.disabled=!0,r.style.display="block",i.style.width="0%",o.textContent="파일 업로드 중...";try{let t=new FormData;t.append("bf_file",s),t.append("uid",this.generateUid());let a=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),n=await a.json();if(n.success)i.style.width="100%",o.textContent="업로드 완료",this.insertFileIcon(n.file),e.remove(),this.createUndoPoint(),this.autoSave();else throw Error(n.message||"업로드 실패")}catch(d){console.error("업로드 에러:",d),alert("파일 업로드 중 오류가 발생했습니다."),l.disabled=!1}}},document.body.appendChild(e)}getFileColor(e){return({zip:"#E8B56F",pdf:"#F44336",txt:"#585858",mp3:"#9C27B0",m4a:"#2196F3"})[e.toLowerCase()]||"#E8B56F"}formatFileSize(e){if(0===e)return"0 Bytes";let t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(2))+" "+["Bytes","KB","MB","GB"][t]}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}showTableModal(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
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
                    <label>테이블 너비:</label>
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
                    <label>테두리 스타일:</label>
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
    `;let t=e.querySelector(".t2-table-preview"),a=e.querySelector(".t2-table-cols"),l=e.querySelector(".t2-table-rows"),n=e.querySelector(".t2-table-width"),i=e.querySelector(".t2-custom-width-container"),r=e.querySelector(".t2-custom-width-value"),o=e.querySelector(".t2-table-warning"),s=()=>{let e=parseInt(a.value)||3,n=parseInt(l.value)||3;e>10||n>10?o.style.display="block":o.style.display="none";let i=Math.min(1,140/Math.max(16*e,16*n)),r=`<table class="t2-preview-table" style="transform: scale(${i}); transform-origin: top left;">`;r+="<tr>";for(let s=0;s<e;s++)r+='<th style="width: 16px; height: 16px; border: 1px solid #ccc; background: #f5f5f5;"></th>';r+="</tr>";for(let d=1;d<n;d++){r+="<tr>";for(let c=0;c<e;c++)r+='<td style="width: 16px; height: 16px; border: 1px solid #ccc;"></td>';r+="</tr>"}r+="</table>",t.innerHTML=r};e.querySelector('[data-action="decrease-cols"]').onclick=()=>{a.value=Math.max(1,parseInt(a.value)-1),s()},e.querySelector('[data-action="increase-cols"]').onclick=()=>{a.value=Math.min(30,parseInt(a.value)+1),s()},e.querySelector('[data-action="decrease-rows"]').onclick=()=>{l.value=Math.max(1,parseInt(l.value)-1),s()},e.querySelector('[data-action="increase-rows"]').onclick=()=>{l.value=Math.min(30,parseInt(l.value)+1),s()},n.addEventListener("change",()=>{"custom"===n.value?i.style.display="flex":i.style.display="none"}),a.addEventListener("input",()=>{a.value=Math.min(30,Math.max(1,parseInt(a.value)||1)),s()}),l.addEventListener("input",()=>{l.value=Math.min(30,Math.max(1,parseInt(l.value)||1)),s()}),s(),e.querySelector('[data-action="insert"]').onclick=()=>{let t=parseInt(a.value)||3,i=parseInt(l.value)||3,o=e.querySelector(".t2-table-border-style").value,s;if("custom"===n.value){let d=parseInt(r.value)||100;s=Math.min(100,Math.max(10,d))+"%"}else s=n.value;this.insertTableAtCursor(t,i,s,o),e.remove()},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),document.body.appendChild(e)}insertTableAtCursor(e,t,a,l){let n=e>10||t>10,i=document.createElement("table");i.className="t2-table"+(n?" t2-table-large":""),i.style.width=a,i.style.borderCollapse="collapse",i.setAttribute("border","1"),i.setAttribute("data-t2-table","true");let r="#ccc",o=document.createElement("thead"),s=document.createElement("tr");for(let d=0;d<e;d++){let c=document.createElement("th");c.style.border=`1px ${l} ${r}`,c.style.padding="8px",c.style.backgroundColor="#f5f5f5",c.textContent=`헤더 ${d+1}`,s.appendChild(c)}o.appendChild(s),i.appendChild(o);let p=document.createElement("tbody");for(let h=1;h<t;h++){let u=document.createElement("tr");for(let m=0;m<e;m++){let b=document.createElement("td");b.style.border=`1px ${l} ${r}`,b.style.padding="8px",b.innerHTML="<br>",u.appendChild(b)}p.appendChild(u)}i.appendChild(p);let v=document.createElement("div");if(v.className="t2-table-wrapper",v.contentEditable=!1,n){let g=document.createElement("div");g.className="t2-table-scroll-wrapper",g.appendChild(i),v.appendChild(g)}else v.appendChild(i);let f=document.createElement("div");return f.className="t2-table-controls",f.innerHTML=`
        <div class="t2-table-control-counter">
            <span class="t2-row-count">${t}</span>행 \xd7 <span class="t2-col-count">${e}</span>열
        </div>
        <div class="t2-table-control-group">
            <span>가로셀:</span>
            <button class="t2-btn t2-table-control-btn" data-action="add-col">
                <span class="material-icons">add</span>
            </button>
            <button class="t2-btn t2-table-control-btn" data-action="remove-col">
                <span class="material-icons">remove</span>
            </button>
        </div>
        <div class="t2-table-control-group">
            <span>세로셀:</span>
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
    `,v.appendChild(f),this.setupTableControlEvents(f,i),this.insertAtCursor(v),this.setupTableCellEditing(i),this.setupTableResizing(i),v}setupTableControlEvents(e,t){let a=()=>{let a=t.querySelectorAll("tr").length,l=t.querySelector("tr").children.length,n=e.querySelector(".t2-row-count"),i=e.querySelector(".t2-col-count");n&&i&&(n.textContent=a,i.textContent=l);let r=l>10||a>10;t.classList.toggle("t2-table-large",r);let o=t.closest(".t2-table-wrapper"),s=r&&!t.closest(".t2-table-scroll-wrapper"),d=t.closest(".t2-table-scroll-wrapper");if(s){let c=document.createElement("div");c.className="t2-table-scroll-wrapper",o.insertBefore(c,t),c.appendChild(t)}else!r&&d&&(o.insertBefore(t,d),d.remove())};e.querySelector('[data-action="add-col"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),n=l[0].children.length;l.forEach((e,t)=>{let a=0===t?document.createElement("th"):document.createElement("td");a.style.border=l[0].children[0].style.border,a.style.padding="8px",0===t?(a.style.backgroundColor="#f5f5f5",a.textContent=`헤더 ${n+1}`):a.innerHTML="<br>",e.appendChild(a),this.setupCellEditing(a)}),a(),this.createUndoPoint()}),e.querySelector('[data-action="remove-col"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),n=l[0].children.length;n<=1||(l.forEach(e=>{e.removeChild(e.lastChild)}),a(),this.createUndoPoint())}),e.querySelector('[data-action="add-row"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),n=l[0].children.length,i=t.querySelector("tbody")||t,r=document.createElement("tr");for(let o=0;o<n;o++){let s=document.createElement("td");s.style.border=l[0].children[0].style.border,s.style.padding="8px",s.innerHTML="<br>",r.appendChild(s),this.setupCellEditing(s)}i.appendChild(r),a(),this.createUndoPoint()}),e.querySelector('[data-action="remove-row"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let l=t.querySelectorAll("tr"),n=l.length;if(n<=1)return;let i=t.querySelector("tbody")||t;i.removeChild(i.lastChild),a(),this.createUndoPoint()}),e.querySelector('[data-action="delete-table"]').addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let a=t.closest(".t2-table-wrapper");a&&(a.remove(),this.createUndoPoint())}),a()}setupTableResizing(e){let t=!1,a=null,l=0,n=0,i=e.querySelectorAll("th");i.forEach(e=>{e.addEventListener("mousedown",i=>{let r=e.getBoundingClientRect();r.right-i.clientX<=5&&(t=!0,a=e,l=i.clientX,n=e.offsetWidth,document.body.style.cursor="col-resize",document.body.style.userSelect="none",i.preventDefault(),i.stopPropagation())})}),document.addEventListener("mousemove",i=>{if(!t)return;let r=i.clientX-l,o=Math.max(30,n+r);a.style.width=`${o}px`;let s=Array.from(a.parentNode.children).indexOf(a),d=e.querySelectorAll("tr");d.forEach(e=>{let t=e.children[s];t&&(t.style.width=`${o}px`)}),i.preventDefault()}),document.addEventListener("mouseup",()=>{t&&(t=!1,a=null,document.body.style.cursor="",document.body.style.userSelect="",this.createUndoPoint())})}setupTableCellEditing(e){let t=e.querySelectorAll("th, td");t.forEach(e=>{this.setupCellEditing(e)})}setupCellEditing(e){e.contentEditable=!0,e.addEventListener("click",t=>{t.stopPropagation();let a=window.getSelection(),l=document.createRange();l.selectNodeContents(e),a.removeAllRanges(),a.addRange(l)}),e.addEventListener("keydown",e=>{"Enter"===e.key&&(e.preventDefault(),document.execCommand("insertHTML",!1,"<br>"))})}}const editor=new T2Editor(document.querySelector(".t2-editor-container"));