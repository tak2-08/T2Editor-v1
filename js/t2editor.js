class T2Editor{constructor(e){this.container=e,this.editor=e.querySelector(".t2-editor"),this.toolbar=e.querySelector(".t2-toolbar"),this.isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1,this.isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),this.autoSaveEnabled="false"!==localStorage.getItem("t2editor-autosave-enabled"),this.setupEditor(),this.setupEventListeners(),this.loadAutoSave(),this.setupAutoSaveToggle(),this.autoSaveEnabled&&this.loadAutoSave(),this.setupBeforeUnload(),this.alignmentState="left",this.bulletState={active:!1,type:null,count:1},this.undoStack=[],this.redoStack=[],this.lastCheckpoint=null,this.undoBtn=e.querySelector('[data-command="undo"]'),this.redoBtn=e.querySelector('[data-command="redo"]'),this.updateUndoRedoButtons(),this.charCount=e.querySelector(".t2-char-count span"),this.updateCharCount(),this.editor.addEventListener("input",()=>{this.updateCharCount()})}setupEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.appendChild(e),this.editor.style.whiteSpace="pre-wrap",this.editor.style.wordBreak="break-word"}updateUndoRedoButtons(){this.undoBtn.disabled=0===this.undoStack.length,this.redoBtn.disabled=0===this.redoStack.length}setupEventListeners(){this.toolbar.addEventListener("click",e=>{let t=e.target.closest(".t2-btn");if(!t)return;e.preventDefault(),e.stopPropagation();let i=t.dataset.command;this.handleCommand(i,t)}),this.isIOS||this.isSafari?this.editor.addEventListener("keydown",e=>{"Backspace"===e.key&&this.handleBackspace(e)}):this.editor.addEventListener("keydown",e=>{"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}),this.editor.addEventListener("input",e=>{this.handleInput(e)}),this.editor.addEventListener("paste",e=>{e.preventDefault(),this.handlePaste(e.clipboardData)}),this.editor.addEventListener("DOMNodeInserted",e=>{this.handleNodeInserted(e)})}handleInput(e){this.autoSave(),this.handleBulletPoints(),this.isIOS||this.isSafari?requestAnimationFrame(()=>{this.normalizeContent()}):this.normalizeContent(),this.createUndoPoint()}handleKeyDown(e){"Enter"===e.key?(e.preventDefault(),this.handleEnterKey()):"Backspace"===e.key&&this.handleBackspace(e)}handleEnterKey(){let e=window.getSelection(),t=e.getRangeAt(0),i=this.getClosestBlock(t.startContainer);if(!i||i===this.editor){(i=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(i),this.setCaretToStart(i);return}let a=document.createElement("p");if(t.collapsed){let n=document.createRange();n.selectNodeContents(i),n.setEnd(t.startContainer,t.startOffset);let l=document.createRange();l.selectNodeContents(i),l.setStart(t.startContainer,t.startOffset);let r=n.cloneContents(),o=l.cloneContents();r.textContent.trim()?(i.innerHTML="",i.appendChild(r)):i.innerHTML="<br>",o.textContent.trim()?a.appendChild(o):a.innerHTML="<br>"}else a.innerHTML="<br>";i.parentNode.insertBefore(a,i.nextSibling),this.setCaretToStart(a),this.normalizeContent(),this.createUndoPoint(),this.autoSave()}setCaretToStart(e){let t=document.createRange(),i=window.getSelection(),a=e.firstChild;for(;a&&a.nodeType===Node.ELEMENT_NODE&&"BR"!==a.tagName;)a=a.firstChild;a?a.nodeType===Node.TEXT_NODE?t.setStart(a,0):t.setStartBefore(a):t.setStart(e,0),t.collapse(!0),i.removeAllRanges(),i.addRange(t)}normalizeContent(){let e=null,t=Array.from(this.editor.childNodes);if(t.forEach(t=>{if(t.nodeType===Node.TEXT_NODE){let i=document.createElement("p");t.parentNode.insertBefore(i,t),i.appendChild(t),e=i}else if(t.nodeType===Node.ELEMENT_NODE){t.textContent.trim()||t.querySelector("br")||(this.isIOS||this.isSafari?t.innerHTML="<br>":t.innerHTML="​<br>");let a=t.lastChild;a&&a.nodeType===Node.TEXT_NODE&&!a.textContent.trim()&&t.appendChild(document.createElement("br")),e=t}}),!this.editor.firstChild){let i=document.createElement("p");this.isIOS||this.isSafari?i.innerHTML="<br>":i.innerHTML="​<br>",this.editor.appendChild(i)}}splitBlock(e,t){let i=e.cloneNode(!1),a=t.extractContents();return""===a.textContent.trim()?i.innerHTML="<br>":i.appendChild(a),e.parentNode.insertBefore(i,e.nextSibling),i}getClosestBlock(e){let t=["P","DIV","H1","H2","H3","H4","H5","H6","PRE"];for(;e&&e!==this.editor;){if(t.includes(e.nodeName))return e;e=e.parentNode}return null}handleBackspace(e){let t=window.getSelection(),i=t.getRangeAt(0);if(this.editor.childNodes.length<=1){let a=this.editor.firstElementChild;if(!a||""===a.textContent.trim()){e.preventDefault(),a&&"P"===a.tagName||this.resetEditor();return}}if(i.collapsed&&this.isAtBlockStart(i)){e.preventDefault();let n=this.getClosestBlock(i.startContainer);if(!n||n===this.editor)return;let l=n.previousElementSibling;if(!l)return;this.mergeBlocks(l,n),this.createUndoPoint()}setTimeout(()=>this.normalizeContent(),0)}mergeBlocks(e,t){let i=e.textContent.length;for("<br>"===e.innerHTML&&(e.innerHTML=""),"<br>"===t.innerHTML&&(t.innerHTML="");t.firstChild;)e.appendChild(t.firstChild);t.remove(),this.setCaretPosition(e,i),this.normalizeContent()}isAtBlockStart(e){let t=this.getClosestBlock(e.startContainer);if(!t)return!1;let i=document.createRange();return i.selectNodeContents(t),i.collapse(!0),0===e.compareBoundaryPoints(Range.START_TO_START,i)}setCaretPosition(e,t){let i=document.createRange(),a=window.getSelection(),n=e.firstChild;for(;n&&n.nodeType!==Node.TEXT_NODE;)n=n.firstChild;n||(n=e,t=0),i.setStart(n,Math.min(t,n.length)),i.collapse(!0),a.removeAllRanges(),a.addRange(i)}createUndoPoint(){let e=this.editor.innerHTML;e!==this.lastCheckpoint&&(this.undoStack.push(this.lastCheckpoint),this.lastCheckpoint=e,this.redoStack=[],this.undoStack.length>100&&this.undoStack.shift(),this.updateUndoRedoButtons())}undo(){if(0===this.undoStack.length)return;let e=this.editor.innerHTML;this.redoStack.push(e);let t=this.undoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}redo(){if(0===this.redoStack.length)return;let e=this.editor.innerHTML;this.undoStack.push(e);let t=this.redoStack.pop();this.lastCheckpoint=t,this.editor.innerHTML=t,this.updateUndoRedoButtons()}handleNodeInserted(e){if(e.target.nodeType===Node.TEXT_NODE&&e.target.parentNode===this.editor){let t=document.createElement("p");e.target.parentNode.insertBefore(t,e.target),t.appendChild(e.target),this.normalizeContent()}}insertAtCursor(e){let t=window.getSelection();if(!t.rangeCount)return;let i=t.getRangeAt(0),a=this.getClosestBlock(i.startContainer);if(a&&a!==this.editor){let n=document.createElement("p");n.appendChild(e),a.parentNode.insertBefore(n,a.nextSibling);let l=document.createElement("p");l.innerHTML="<br>",n.parentNode.insertBefore(l,n.nextSibling);let r=document.createRange();r.setStartAfter(l),r.collapse(!0),t.removeAllRanges(),t.addRange(r)}this.normalizeContent(),this.createUndoPoint()}isBlockElement(e){return["P","DIV","H1","H2","H3","H4","H5","H6","PRE"].includes(e.tagName)}handleCommand(e,t){switch(e){case"undo":this.undo();break;case"redo":this.redo();break;case"fontSize":this.showFontSizeList(t);break;case"justifyContent":this.toggleAlignment(t);break;case"foreColor":case"backColor":this.saveSelection(),this.showColorPalette(e,t);break;case"insertYouTube":this.insertYouTube();break;case"insertCodeBlock":this.insertCodeBlock();break;case"insertImage":this.showImageUploadModal();break;case"createLink":this.showLinkModal();break;case"attachFile":this.handleAttachFile();break;default:this.execCommand(e),["bold","italic","underline","strikeThrough"].includes(e)&&t.classList.toggle("active")}this.createUndoPoint()}saveSelection(){window.getSelection&&(this.savedSelection=window.getSelection().getRangeAt(0).cloneRange())}restoreSelection(){if(this.savedSelection){let e=window.getSelection();e.removeAllRanges(),e.addRange(this.savedSelection)}}execCommand(e,t=null){if(document.execCommand("styleWithCSS",!1,!0),"fontSize"===e){let i=window.getSelection(),a=i.getRangeAt(0),n=document.createElement("span");n.style.fontSize=t+"px";let l=a.commonAncestorContainer.parentElement;l&&l.style.fontSize?l.style.fontSize=t+"px":a.surroundContents(n)}else document.execCommand(e,!1,t);this.normalizeContent()}toggleAlignment(e){let t=["left","center","right"],i=t.indexOf(this.alignmentState);i=(i+1)%t.length,this.alignmentState=t[i],e.querySelector(".material-icons").textContent=["format_align_left","format_align_center","format_align_right"][i];let a=window.getSelection(),n=a.getRangeAt(0),l=this.getClosestBlock(n.commonAncestorContainer);l&&(l.style.textAlign=this.alignmentState),this.execCommand(["justifyLeft","justifyCenter","justifyRight"][i]),this.createUndoPoint()}showFontSizeList(e){let t=document.createElement("div");t.className="t2-font-size-list",t.style.cssText=`
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px 0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 120px;
    `,["11","13","15","16","19","24","30","34","38"].forEach(e=>{let i=document.createElement("div");i.className="t2-font-size-option",i.textContent=`${e}px`,i.style.cssText=`
            padding: 5px 15px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.1s ease;
        `,i.addEventListener("mouseenter",()=>{i.style.backgroundColor="#f5f5f5"}),i.addEventListener("mouseleave",()=>{i.style.backgroundColor="transparent"}),i.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),this.execCommand("fontSize",e),t.parentElement.remove(),this.createUndoPoint()}),t.appendChild(i)}),this.showDropdown(t,e)}showDropdown(e,t){let i=t.getBoundingClientRect(),a=this.toolbar.getBoundingClientRect(),n=document.createElement("div");n.style.cssText=`
        position: absolute;
        top: ${i.bottom-a.top}px;
        left: ${i.left-a.left}px;
        z-index: 10000;
    `,n.appendChild(e),this.toolbar.appendChild(n);let l=e.getBoundingClientRect(),r=window.innerWidth;if(l.right>r){let o=l.right-r;n.style.left=`${parseInt(n.style.left)-o-10}px`}let s=i=>{e.contains(i.target)||i.target===t||(n.remove(),document.removeEventListener("mousedown",s))};requestAnimationFrame(()=>{document.addEventListener("mousedown",s)})}showColorPalette(e,t){let i=document.createElement("div");i.className="t2-color-palette",i.style.cssText=`
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: 4px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 120px;
    `,["#000000","#434343","#666666","#999999","#b7b7b7","#cccccc","#d9d9d9","#f3f3f3","#ffffff","#ed2f27","#ff8d3f","#eeea7e","#acbc8a","#56bf56","#588c7e","#5ed0fe","#0187fe","#3c55dc","#7d4afe","#f2a5d8"].forEach(t=>{let a=document.createElement("div");a.className="t2-color-option",a.style.cssText=`
            width: 25px;
            height: 25px;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #ddd;
            background-color: ${t};
        `,a.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.restoreSelection(),this.execCommand(e,t),i.parentElement.remove(),this.createUndoPoint()}),i.appendChild(a)}),this.showDropdown(i,t)}getVideoType(e){let t=e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);if(t&&11===t[2].length)return{type:"youtube",id:t[2]};let i=e.match(/\.(mp4|webm|ogg)$/i);return i?{type:"video",url:e}:null}createVideoBlock(e){let t=document.createElement("div");t.className="t2-media-block";let i=document.createElement("div");i.style.width="320px",i.style.height="180px",i.style.maxWidth="100%",i.style.margin="0 auto",i.dataset.width=320,i.dataset.height=180;let a;"youtube"===e.type?((a=document.createElement("iframe")).src=`https://www.youtube.com/embed/${e.id}`,a.frameBorder="0",a.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",a.allowFullscreen=!0):((a=document.createElement("video")).src=e.url,a.controls=!0,a.style.backgroundColor="#000"),a.style.width="100%",a.style.height="100%",i.appendChild(a);let n=this.createVideoControls(i,a,e,320,180);return t.appendChild(i),t.appendChild(n),t}createVideoControls(e,t,i,a,n){let l=document.createElement("div");l.className="t2-media-controls",l.contentEditable=!1,l.innerHTML=`
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
        <button class="t2-btn edit-url-btn">
            <span class="material-icons">edit</span>
        </button>
        <input type="range" min="30" max="200" value="100" style="width: 100px;">
    `;let r=l.querySelector('input[type="range"]');r.addEventListener("input",t=>{let i=t.target.value;e.style.width=a*i/100+"px",e.style.height=n*i/100+"px"});let o=l.querySelector(".edit-url-btn");return o.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this.showVideoUrlEditModal(t,i)}),l}showVideoUrlEditModal(e,t){let i="youtube"===t.type?`https://youtube.com/watch?v=${t.id}`:t.url,a=document.createElement("div");a.className="t2-modal-overlay",a.innerHTML=`
        <div class="t2-video-editor-modal">
            <h3>비디오 URL 수정</h3>
            <input type="text" placeholder="동영상 링크 삽입" class="t2-youtube-url" value="${i}">
            <div class="t2-video-type-info">
                지원 동영상 유형: 유튜브, 비디오 파일(.mp4, .webm, .ogg) 링크
            </div>
            <div class="t2-btn-group">
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">수정</button>
            </div>
        </div>
    `;let n=()=>{let t=a.querySelector(".t2-youtube-url").value,i=this.getVideoType(t);if(!i){alert("올바른 비디오 URL을 입력해주세요.");return}if("youtube"===i.type)e.src=`https://www.youtube.com/embed/${i.id}`;else{let n=document.createElement("video");n.src=i.url,n.controls=!0,n.style=e.style,e.parentNode.replaceChild(n,e)}a.remove(),this.createUndoPoint(),this.autoSave()};a.querySelector('[data-action="cancel"]').onclick=()=>a.remove(),a.querySelector('[data-action="insert"]').onclick=n,a.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),n())}),document.body.appendChild(a),a.querySelector(".t2-youtube-url").focus()}insertYouTube(){let e=window.getSelection(),t=e.getRangeAt(0),i=t.cloneRange(),a=document.createElement("div");a.className="t2-modal-overlay",a.innerHTML=`
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
    `;let n=()=>{let t=a.querySelector(".t2-youtube-url").value,n=this.getVideoType(t);if(!n){alert("올바른 비디오 URL을 입력해주세요.");return}let l=this.createVideoBlock(n);e.removeAllRanges(),e.addRange(i);let r=this.getClosestBlock(i.startContainer);if(r&&r!==this.editor){let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling);let s=document.createElement("p");s.appendChild(l),o.parentNode.insertBefore(s,o.nextSibling);let d=document.createElement("p");d.innerHTML="<br>",s.parentNode.insertBefore(d,s.nextSibling);let c=document.createRange();c.setStartAfter(d),c.collapse(!0),e.removeAllRanges(),e.addRange(c)}this.normalizeContent(),this.createUndoPoint(),this.autoSave(),a.remove()};a.querySelector('[data-action="cancel"]').onclick=()=>a.remove(),a.querySelector('[data-action="insert"]').onclick=n,a.querySelector(".t2-youtube-url").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),n())}),document.body.appendChild(a),a.querySelector(".t2-youtube-url").focus()}insertCodeBlock(){let e=document.createElement("div");e.className="t2-code-block";let t=document.createElement("pre"),i=document.createElement("code");i.textContent="코드를 입력하세요",i.classList.add("code-placeholder"),i.setAttribute("contenteditable","true"),t.appendChild(i),i.addEventListener("click",function(e){if(this.classList.contains("code-placeholder")){this.textContent="",this.classList.remove("code-placeholder");let t=document.createRange(),i=window.getSelection();t.setStart(this,0),t.collapse(!0),i.removeAllRanges(),i.addRange(t)}}),i.addEventListener("focus",function(e){this.classList.contains("code-placeholder")&&(this.textContent="",this.classList.remove("code-placeholder"))}),i.addEventListener("blur",function(){""===this.textContent.trim()&&(this.textContent="코드를 입력하세요",this.classList.add("code-placeholder"))}),i.addEventListener("keydown",function(e){"Tab"===e.key&&(e.preventDefault(),document.execCommand("insertText",!1,"    "))}),e.appendChild(t),this.insertAtCursor(e)}resetEditor(){let e=document.createElement("p");e.innerHTML="<br>",this.editor.innerHTML="",this.editor.appendChild(e),this.setCaretToStart(e)}showImageUploadModal(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
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
    `;let t=e.querySelector(".t2-image-preview-grid"),i=e.querySelector('input[type="file"]'),a=e.querySelector('[data-action="upload"]'),n=e.querySelector(".t2-image-upload-area"),l=e.querySelector(".t2-image-upload-form"),r=e.querySelector(".t2-image-url-input"),o=e.querySelector(".t2-url-preview"),s=new Map,d="";e.querySelectorAll(".t2-tab").forEach(t=>{t.addEventListener("click",()=>{e.querySelectorAll(".t2-tab").forEach(e=>e.classList.remove("active")),t.classList.add("active");let i=t.dataset.tab;e.querySelectorAll(".t2-tab-pane").forEach(e=>{e.classList.remove("active"),e.dataset.pane===i&&e.classList.add("active")}),"upload"===i?a.disabled=0===s.size:a.disabled=!d})});let c;r.addEventListener("input",e=>{let t=e.target.value.trim();clearTimeout(c),c=setTimeout(()=>{if(t){let e=new Image;e.onload=()=>{d=t,o.innerHTML=`
                        <div class="t2-url-preview-image">
                            <img src="${t}" alt="URL Preview">
                        </div>
                    `,a.disabled=!1},e.onerror=()=>{d="",o.innerHTML=`
                        <div class="t2-url-preview-error">
                            올바른 이미지 URL이 아닙니다
                        </div>
                    `,a.disabled=!0},e.src=t}else d="",o.innerHTML="",a.disabled=!0},300)});let p=e=>{Array.from(e).forEach(e=>{if(!e.type.startsWith("image/")){alert("이미지 파일만 업로드 가능합니다.");return}let i=new FileReader;i.onload=i=>{let n=document.createElement("div");n.className="t2-preview-item",n.innerHTML=`
                    <img src="${i.target.result}" alt="Preview">
                    <button type="button" class="t2-preview-remove">
                        <span class="material-icons">close</span>
                    </button>
                `;let l=n.querySelector(".t2-preview-remove");l.onclick=()=>{s.delete(e),n.remove(),a.disabled=0===s.size},s.set(e,n),t.appendChild(n),a.disabled=!1},i.readAsDataURL(e)})};i.onchange=e=>p(e.target.files),n.ondragover=e=>{e.preventDefault(),n.classList.add("drag-over")},n.ondragleave=e=>{e.preventDefault(),n.classList.remove("drag-over")},n.ondrop=e=>{e.preventDefault(),n.classList.remove("drag-over"),p(e.dataTransfer.files)},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=()=>{let t=e.querySelector(".t2-tab.active").dataset.tab;"upload"===t?s.size>0&&this.handleMultipleImageUpload(l,Array.from(s.keys())):"url"===t&&d&&this.handleUrlImageUpload(d),e.remove()},document.body.appendChild(e)}async handleUrlImageUpload(e){try{let t=async e=>{let t=async(e,t)=>new Promise((i,a)=>{let n=new Image,l=document.createElement("div");l.style.cssText="position: fixed; left: -9999px; top: -9999px; visibility: hidden;",document.body.appendChild(l);let r=()=>{l.parentNode&&l.parentNode.removeChild(l),URL.revokeObjectURL(n.src)};switch(n.onload=()=>{try{let e=document.createElement("canvas"),t=e.getContext("2d"),l=n.naturalWidth,o=n.naturalHeight;if(l>2e3||o>2e3){let s=Math.min(2e3/l,2e3/o);l=Math.floor(l*s),o=Math.floor(o*s)}e.width=l,e.height=o,t.fillStyle="#FFFFFF",t.fillRect(0,0,l,o),t.drawImage(n,0,0,l,o),e.toBlob(e=>{r(),e&&e.size>0?i({blob:e,width:l,height:o}):a(Error("빈 이미지"))},"image/jpeg",.92)}catch(d){r(),a(d)}},n.onerror=()=>{r(),a(Error(`로드 실패 (${t})`))},t){case"crossOrigin":n.crossOrigin="anonymous",n.src=e;break;case"direct":n.removeAttribute("crossOrigin"),n.src=e;break;case"blob":fetch(e,{mode:"cors",credentials:"omit"}).then(e=>e.blob()).then(e=>{n.src=URL.createObjectURL(e)}).catch(()=>{r(),a(Error("Blob fetch 실패"))});break;default:r(),a(Error("알 수 없는 방법"))}l.appendChild(n),setTimeout(()=>{r(),a(Error("시간 초과"))},1e4)}),i=["crossOrigin","direct","blob"],a=null;for(let n of[e=>e,e=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(e)}`,e=>`https://corsproxy.io/?${encodeURIComponent(e)}`,e=>`https://api.allorigins.win/raw?url=${encodeURIComponent(e)}`,e=>`https://proxy.cors.sh/${e}`,e=>`https://cors-anywhere.herokuapp.com/${e}`])for(let l of i)try{alert(`이미지 다운로드 시도... (${l})`);let r=await t(n(e),l);if(r)return r}catch(o){a=o,console.log(`시도 실패 (${l}):`,o.message);continue}throw a||Error("모든 다운로드 시도 실패")},{blob:i,width:a,height:n}=await t(e),l=`image_${Date.now()}.jpg`,r=new File([i],l,{type:"image/jpeg"});alert(`이미지 캡처 완료: ${l} (${r.size} bytes)`);let o=new FormData;o.append("bf_file[]",r),o.append("uid",this.generateUid()),alert("서버 업로드 시작...");let s=await fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:o}),d=await s.json();if(!d.success)throw Error(d.message||"업로드 실패");alert("이미지 블록 생성 중...");let c=window.getSelection(),p=this.editor.lastElementChild;p||((p=document.createElement("p")).innerHTML="<br>",this.editor.appendChild(p));let h=document.createElement("p");h.innerHTML="<br>",p.parentNode.insertBefore(h,p.nextSibling),d.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let i=document.createElement("div");i.style.width=e.width+"px",i.style.maxWidth="100%",i.style.margin="0 auto";let a=document.createElement("img");a.src=e.url,a.style.width="100%",a.dataset.width=e.width,a.dataset.height=e.height,i.appendChild(a),t.appendChild(i);let n=this.createMediaControls(i,a);t.appendChild(n);let l=document.createElement("p");l.appendChild(t),h.parentNode.insertBefore(l,h.nextSibling);let r=document.createElement("p");if(r.innerHTML="<br>",l.parentNode.insertBefore(r,l.nextSibling),c){let o=document.createRange();o.setStartAfter(r),o.collapse(!0),c.removeAllRanges(),c.addRange(o)}}),this.normalizeContent(),this.createUndoPoint(),this.autoSave(),alert("이미지 업로드 및 삽입 완료!")}catch(u){console.error("이미지 처리 중 오류:",u),alert(`이미지 처리 중 오류가 발생했습니다.
상세 오류: ${u.message}`)}}handleMultipleImageUpload(e,t){let i=new FormData(e);i.delete("bf_file[]"),t.forEach(e=>i.append("bf_file[]",e)),fetch(g5_url+"/plugin/editor/t2editor/image_upload.php",{method:"POST",body:i}).then(e=>e.json()).then(e=>{if(e.success){let t=window.getSelection(),i=t.getRangeAt(0),a=this.getClosestBlock(i.startContainer);if(a&&a!==this.editor){let n=document.createElement("p");n.innerHTML="<br>",a.parentNode.insertBefore(n,a.nextSibling);let l=n;e.files.forEach(e=>{let t=document.createElement("div");t.className="t2-media-block";let i=document.createElement("div");i.style.width=e.width+"px",i.style.maxWidth="100%",i.style.margin="0 auto";let a=document.createElement("img");a.src=e.url,a.style.width="100%",a.dataset.width=e.width,a.dataset.height=e.height,i.appendChild(a),t.appendChild(i);let n=this.createMediaControls(i,a);t.appendChild(n);let r=document.createElement("p");r.appendChild(t),l.parentNode.insertBefore(r,l.nextSibling);let o=document.createElement("p");o.innerHTML="<br>",r.parentNode.insertBefore(o,r.nextSibling),l=o});let r=document.createRange();r.setStartAfter(l),r.collapse(!0),t.removeAllRanges(),t.addRange(r),this.normalizeContent(),this.createUndoPoint()}}else alert("이미지 업로드 실패: "+e.message)}).catch(e=>{console.error("업로드 에러:",e),alert("이미지 업로드 중 오류가 발생했습니다.")})}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}updateImageTransform(e,t,i){e.style.transform=`
       rotate(${t}deg)
       scaleX(${i?-1:1})
   `}handlePaste(e){let t=e.getData("text/plain");if(this.isIOS||this.isSafari){let i=t.split(/\r?\n/);i.forEach((e,t)=>{if(t>0){let i=document.createElement("p");i.textContent=e||"",i.appendChild(document.createElement("br")),this.insertAtCursor(i)}else document.execCommand("insertText",!1,e)})}else{let a=t.split(/\r?\n/);a.forEach((e,t)=>{if(t>0){let i=document.createElement("p");i.textContent=e||"​",this.insertAtCursor(i)}else document.execCommand("insertText",!1,e)})}this.normalizeContent(),this.createUndoPoint()}getYouTubeVideoId(e){let t=e.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);return t&&11==t[7].length?t[7]:null}setupAutoSaveToggle(){let e=this.container.querySelector(".t2-editor-status"),t=document.createElement("div");t.className="t2-autosave-toggle",t.innerHTML=`
            <label class="t2-switch">
                <input type="checkbox" ${this.autoSaveEnabled?"checked":""}>
                <span class="t2-slider"></span>
            </label>
            <span class="t2-autosave-text">자동 저장</span>
        `;let i=t.querySelector('input[type="checkbox"]');i.addEventListener("change",e=>{this.autoSaveEnabled=e.target.checked,localStorage.setItem("t2editor-autosave-enabled",this.autoSaveEnabled),this.autoSaveEnabled?this.autoSave():this.clearAutoSave()});let a=e.querySelector(".t2-logo").parentElement;a.parentNode.insertBefore(t,a.nextSibling)}autoSave(){if(!this.autoSaveEnabled)return;let e=this.editor.innerHTML,t=e.replace(/<p>\s*<\/p>/g,"<p><br></p>");localStorage.setItem("t2editor-autosave",t)}loadAutoSave(){if(!this.autoSaveEnabled)return;let e=localStorage.getItem("t2editor-autosave");e&&(this.editor.innerHTML=e,this.normalizeContent())}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}setupBeforeUnload(){window.addEventListener("beforeunload",()=>{this.autoSaveEnabled&&this.autoSave()})}setContent(e){e&&(this.editor.innerHTML=e,this.editor.querySelectorAll('img, iframe[src*="youtube"], video').forEach(e=>{if(!e.closest(".t2-media-block")){let t=e.style.width?parseInt(e.style.width):e.width||320,i=e.style.height?parseInt(e.style.height):e.height||180,a=document.createElement("div");a.className="t2-media-block";let n=document.createElement("div");n.style.width=`${t}px`,n.style.maxWidth="100%",n.style.margin="0 auto";let l=e.cloneNode(!0);l.style.width="100%",("IFRAME"===l.tagName||"VIDEO"===l.tagName)&&(n.style.height=`${i}px`,l.style.height="100%"),n.appendChild(l),a.appendChild(n);let r=this.createMediaControls(n,l);a.appendChild(r);let o=document.createElement("p");o.appendChild(a),e.parentNode.replaceChild(o,e)}}),this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),i=t.querySelector("img, iframe, video");if(i){if(parseInt(t.style.width),parseInt(t.style.height),t.style.maxWidth||(t.style.maxWidth="100%"),t.style.margin||(t.style.margin="0 auto"),i.style.width="100%",("IFRAME"===i.tagName||"VIDEO"===i.tagName)&&(i.style.height="100%"),"P"!==e.parentNode.nodeName){let a=document.createElement("p");e.parentNode.insertBefore(a,e),a.appendChild(e)}let n=e.querySelector(".t2-media-controls");n&&n.remove();let l=this.createMediaControls(t,i);e.appendChild(l)}}),this.normalizeContent())}createMediaControls(e,t){let i=document.createElement("div");i.className="t2-media-controls",i.contentEditable=!1;let a=parseInt(t.dataset.width)||parseInt(e.style.width)||320,n=parseInt(t.dataset.height)||parseInt(e.style.height)||180,l=this.editor.clientWidth,r=parseInt(e.style.width);i.innerHTML=`
        <button class="t2-btn delete-btn">
            <span class="material-icons">delete</span>
        </button>
        ${"IFRAME"===t.tagName?`
            <button class="t2-btn edit-url-btn">
                <span class="material-icons">edit</span>
            </button>
        `:""}
        <input type="range" min="30" max="${Math.min(100,Math.floor(l/a*100))}" value="${Math.round(r/a*100)}" class="size-slider" style="width: 100px;">
    `;let o=i.querySelector(".size-slider");if(o){let s=new ResizeObserver(()=>{let i=this.editor.clientWidth,l=Math.min(100,Math.floor(i/a*100));o.max=l,parseInt(o.value)>l&&(o.value=l,e.style.width=`${Math.round(a*l/100)}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${Math.round(n*l/100)}px`,t.style.height="100%"))});s.observe(this.editor),o.addEventListener("input",i=>{let l=parseInt(i.target.value),r=Math.round(a*l/100),o=Math.round(n*l/100);e.style.width=`${r}px`,e.style.maxWidth="100%",t.style.width="100%",("IFRAME"===t.tagName||"VIDEO"===t.tagName)&&(e.style.height=`${o}px`,t.style.height="100%"),t.dataset.currentWidth=r,t.dataset.currentHeight=o})}let d=i.querySelector(".delete-btn");d&&d.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),i.closest(".t2-media-block").remove()});let c=i.querySelector(".edit-url-btn");return c&&"IFRAME"===t.tagName&&c.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let i=t.src.match(/embed\/([^?]+)/)?.[1];i&&this.showVideoUrlEditModal(t,{type:"youtube",id:i})}),i}attachControlEvents(e,t,i,a,n){e.querySelector(".delete-btn")?.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),e.closest(".t2-media-block").remove()});let l=e.querySelector(".size-slider");l&&l.addEventListener("input",e=>{let l=e.target.value;t.style.width=`${a*l/100}px`,("IFRAME"===i.tagName||"VIDEO"===i.tagName)&&(t.style.height=`${n*l/100}px`)});let r=e.querySelector(".edit-url-btn");r&&"IFRAME"===i.tagName&&r.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();let t=i.src.match(/embed\/([^?]+)/)?.[1];t&&this.showVideoUrlEditModal(i,{type:"youtube",id:t})})}initializeMediaControls(){this.editor.querySelectorAll(".t2-media-block").forEach(e=>{let t=e.querySelector("div:first-child"),i=t.querySelector("img, iframe, video"),a=e.querySelector(".t2-media-controls");if(a){let n=this.createMediaControls(t,i);e.replaceChild(n,a)}})}initializeBlocks(){this.editor.querySelectorAll("img:not(.t2-media-block img)").forEach(e=>{let t=parseInt(e.style.width)||e.naturalWidth||320,i=parseInt(e.style.height)||e.naturalHeight||180,a=this.createMediaBlock(e.src,t,i,"image");e.parentNode.replaceChild(a,e)}),this.editor.querySelectorAll('iframe[src*="youtube"]:not(.t2-media-block iframe)').forEach(e=>{let t=parseInt(e.style.width)||320,i=parseInt(e.style.height)||180,a=this.createMediaBlock(e.src,t,i,"youtube");e.parentNode.replaceChild(a,e)})}wrapMediaBlock(e){let t=document.createElement("div");t.className="t2-media-block",e.parentNode.insertBefore(t,e),t.appendChild(e);let i=this.createMediaControls(t,e);t.appendChild(i)}updateCharCount(){let e=this.editor.textContent;e=e.replace(/\s+/g,""),this.charCount.textContent=e.length}clearAutoSave(){localStorage.removeItem("t2editor-autosave")}showLinkModal(){let e=window.getSelection(),t=e.getRangeAt(0);if(t.collapsed){alert("텍스트를 선택한 후 링크를 추가해주세요.");return}this.saveSelection();let i=null,a=t.commonAncestorContainer;for(;a&&a!==this.editor;){if("A"===a.nodeName){i=a;break}a=a.parentNode}let n=document.createElement("div");n.className="t2-modal-overlay",n.innerHTML=`
        <div class="t2-link-editor-modal">
            <h3>${i?"링크 수정":"링크 추가"}</h3>
            <div class="t2-link-input-container">
                <input type="text" class="t2-link-url-input" 
                       placeholder="https://" 
                       value="${i?i.href:""}">
                <div class="t2-link-options">
                    <label>
                        <input type="checkbox" class="t2-link-new-tab" ${i&&"_blank"===i.target?"checked":""}>
                        새 탭에서 열기
                    </label>
                </div>
            </div>
            <div class="t2-btn-group">
                ${i?'<button class="t2-btn" data-action="remove">링크 제거</button>':""}
                <button class="t2-btn" data-action="cancel">취소</button>
                <button class="t2-btn" data-action="insert">${i?"수정":"추가"}</button>
            </div>
        </div>
    `;let l=()=>{let t=n.querySelector(".t2-link-url-input").value.trim(),a=n.querySelector(".t2-link-new-tab").checked;if(!t){alert("URL을 입력해주세요.");return}let l=t;if(/^https?:\/\//i.test(t)||(l="http://"+t),this.restoreSelection(),i)i.href=l,i.target=a?"_blank":"",i.rel=a?"noopener noreferrer":"";else{let r=document.createElement("a");r.href=l,r.target=a?"_blank":"",r.rel=a?"noopener noreferrer":"";let o=e.getRangeAt(0);o.surroundContents(r)}n.remove(),this.createUndoPoint()};n.querySelector('[data-action="insert"]').onclick=l,n.querySelector('[data-action="cancel"]').onclick=()=>n.remove(),i&&(n.querySelector('[data-action="remove"]').onclick=()=>{this.restoreSelection();let e=i.parentNode;for(;i.firstChild;)e.insertBefore(i.firstChild,i);i.remove(),n.remove(),this.createUndoPoint()}),n.querySelector(".t2-link-url-input").addEventListener("keypress",e=>{"Enter"===e.key&&(e.preventDefault(),l())}),document.body.appendChild(n),n.querySelector(".t2-link-url-input").focus()}insertFileIcon(e){let t=document.createElement("div");t.className="t2-media-block t2-file-block";let i=new Date().toISOString().split("T")[0].replace(/-/g,"."),a=this.formatFileSize(e.size),n=/\.(mp3|m4a)$/i.test(e.original_name),l=/\.pdf$/i.test(e.original_name),r=e.url;if(l){let o=r.match(/data\/editor\/t2editor_(\d+)\/(.+\.pdf)$/i);if(o){let[,s,d]=o;r=g5_url+`/plugin/editor/t2editor/pdf_view.php?pdf=${s}/${d}`}}if(n){t.innerHTML=`
            <div class="audio-player">
                <audio src="${e.url}" preload="metadata"></audio>
            </div>
            <a href="${e.url}" download style="text-decoration: none; color: inherit;">
                <div class="audio-file-container">
                    <div class="audio-file-icon"></div>
                    <div class="audio-file-info">
                        <div class="audio-file-name">${e.original_name}</div>
                        <div class="audio-file-details">
                            <span>DATE: ${i}</span>
                            <span>Size: ${a}</span>
                            <span class="audio-duration">--:--</span>
                        </div>
                    </div>
                </div>
            </a>
        `;let c=t.querySelector("audio"),p=t.querySelector(".audio-duration");c.addEventListener("loadedmetadata",()=>{let e=Math.floor(c.duration/60),t=Math.floor(c.duration%60);p.textContent=`${e}:${t.toString().padStart(2,"0")}`}),c.addEventListener("error",()=>{p.textContent="--:--"})}else t.innerHTML=`
            <a href="${r}" ${l?"":"download"} style="text-decoration: none; color: inherit;">
                <div class="file-container">
                    <div class="file-icon"></div>
                    <div class="file-info">
                        <div class="file-name">${e.original_name}</div>
                        <div class="file-details">
                            <span>DATE: ${i}&nbsp;</span>
                            <span>Size: ${a}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;let h=document.createElement("div");h.className="t2-media-controls",h.innerHTML=`
        <button class="t2-btn" onclick="event.preventDefault(); event.stopPropagation(); this.closest('.t2-media-block').remove()">
            <span class="material-icons">delete</span>
        </button>
    `,t.appendChild(h);let u=window.getSelection(),m=u.getRangeAt(0),g=this.getClosestBlock(m.startContainer);if(g&&g!==this.editor){let v=document.createElement("p");v.appendChild(t);let f=document.createElement("p");f.innerHTML="<br>",g.parentNode.insertBefore(f,g.nextSibling),f.parentNode.insertBefore(v,f.nextSibling);let b=document.createElement("p");b.innerHTML="<br>",v.parentNode.insertBefore(b,v.nextSibling);let y=document.createRange();y.setStartAfter(b),y.collapse(!0),u.removeAllRanges(),u.addRange(y)}this.normalizeContent(),this.createUndoPoint()}async uploadFile(e){let t=new FormData;t.append("bf_file",e),t.append("uid",this.generateUid());try{let i=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),a=await i.json();a.success?this.insertFileIcon(a.file):alert("파일 업로드 실패: "+a.message)}catch(n){console.error("업로드 에러:",n),alert("파일 업로드 중 오류가 발생했습니다.")}}handleAttachFile(){let e=document.createElement("div");e.className="t2-modal-overlay",e.innerHTML=`
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
    `;let t=e.querySelector(".t2-file-preview-grid"),i=e.querySelector('input[type="file"]'),a=e.querySelector('[data-action="upload"]'),n=e.querySelector(".t2-file-upload-area"),l=e.querySelector(".t2-progress-fill"),r=e.querySelector(".t2-upload-progress"),o=e.querySelector(".t2-progress-text"),s=null,d=e=>{if(![".zip",".pdf",".txt",".mp3"].some(t=>e.name.toLowerCase().endsWith(t))){alert("지원하지 않는 파일 형식입니다.");return}t.innerHTML="";let n=document.createElement("div");n.className="t2-file-preview-item",n.innerHTML=`
            <div class="t2-file-preview-icon" style="background-color: ${this.getFileColor(e.name.split(".").pop())}"></div>
            <div class="t2-file-preview-name">${e.name}</div>
            <button type="button" class="t2-file-preview-remove">
                <span class="material-icons">close</span>
            </button>
        `;let l=n.querySelector(".t2-file-preview-remove");l.onclick=e=>{e.preventDefault(),e.stopPropagation(),s=null,n.remove(),a.disabled=!0,i.value=""},s=e,t.appendChild(n),a.disabled=!1};i.onchange=e=>{e.target.files.length>0&&d(e.target.files[0])},n.ondragover=e=>{e.preventDefault(),n.classList.add("drag-over")},n.ondragleave=e=>{e.preventDefault(),n.classList.remove("drag-over")},n.ondrop=e=>{e.preventDefault(),n.classList.remove("drag-over"),e.dataTransfer.files.length>0&&d(e.dataTransfer.files[0])},e.querySelector('[data-action="cancel"]').onclick=()=>e.remove(),e.querySelector('[data-action="upload"]').onclick=async()=>{if(s){a.disabled=!0,r.style.display="block",l.style.width="0%",o.textContent="파일 업로드 중...";try{let t=new FormData;t.append("bf_file",s),t.append("uid",this.generateUid());let i=await fetch(g5_url+"/plugin/editor/t2editor/file_upload.php",{method:"POST",body:t}),n=await i.json();if(n.success)l.style.width="100%",o.textContent="업로드 완료",this.insertFileIcon(n.file),e.remove(),this.createUndoPoint(),this.autoSave();else throw Error(n.message||"업로드 실패")}catch(d){console.error("업로드 에러:",d),alert("파일 업로드 중 오류가 발생했습니다."),a.disabled=!1}}},document.body.appendChild(e)}getFileColor(e){return({zip:"#E8B56F",pdf:"#F44336",txt:"#585858",mp3:"#9C27B0",m4a:"#2196F3"})[e.toLowerCase()]||"#E8B56F"}formatFileSize(e){if(0===e)return"0 Bytes";let t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(2))+" "+["Bytes","KB","MB","GB"][t]}generateUid(){let e=new Date().getTime();return`${Math.floor(1e9*Math.random())}${e}`}}const editor=new T2Editor(document.querySelector(".t2-editor-container"));