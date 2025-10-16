// レイヤー管理システム
class LayerManager {
    constructor(canvasWidth, canvasHeight) {
        this.layers = [];
        this.currentLayerId = 0;
        this.nextId = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvasStack = document.getElementById('canvasStack');
        this.layerList = document.getElementById('layerList');
        this.history = [];
        this.historyStep = -1;
        this.maxHistorySteps = 50;
        this.backgroundCanvas = null;
        
        // 背景キャンバスを作成
        this.createBackgroundCanvas();
        
        // 初期レイヤーを作成
        this.addLayer();
        this.saveState();
    }
    
    createBackgroundCanvas() {
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.canvasWidth;
        this.backgroundCanvas.height = this.canvasHeight;
        this.backgroundCanvas.className = 'background-canvas';
        this.backgroundCanvas.style.zIndex = '-1';
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        
        // デフォルト背景（白）
        this.setBackground('white');
        
        this.canvasStack.appendChild(this.backgroundCanvas);
    }
    
    setBackground(type) {
        const ctx = this.backgroundCtx;
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        switch(type) {
            case 'white':
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                break;
                
            case 'city':
                // 都会の夕暮れ - グラデーション空
                const cityGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                cityGradient.addColorStop(0, '#ff6b6b');
                cityGradient.addColorStop(0.3, '#ffd93d');
                cityGradient.addColorStop(0.6, '#ff8c42');
                cityGradient.addColorStop(1, '#6c5ce7');
                ctx.fillStyle = cityGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // ビルのシルエット
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                for (let i = 0; i < 15; i++) {
                    const x = i * 60;
                    const height = Math.random() * 200 + 150;
                    const width = 50 + Math.random() * 30;
                    ctx.fillRect(x, this.canvasHeight - height, width, height);
                    
                    // 窓
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
                    for (let j = 0; j < height / 20; j++) {
                        for (let k = 0; k < 3; k++) {
                            if (Math.random() > 0.3) {
                                ctx.fillRect(x + k * 15 + 5, this.canvasHeight - height + j * 20 + 5, 10, 10);
                            }
                        }
                    }
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                }
                break;
                
            case 'forest':
                // 森の中 - 緑のグラデーション
                const forestGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                forestGradient.addColorStop(0, '#87ceeb');
                forestGradient.addColorStop(0.3, '#98d8c8');
                forestGradient.addColorStop(1, '#2d5016');
                ctx.fillStyle = forestGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 木々
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const treeHeight = Math.random() * 200 + 100;
                    const treeWidth = Math.random() * 40 + 30;
                    
                    // 幹
                    ctx.fillStyle = 'rgba(101, 67, 33, 0.8)';
                    ctx.fillRect(x - 5, this.canvasHeight - treeHeight, 10, treeHeight);
                    
                    // 葉
                    ctx.fillStyle = `rgba(34, 139, 34, ${0.5 + Math.random() * 0.3})`;
                    ctx.beginPath();
                    ctx.arc(x, this.canvasHeight - treeHeight, treeWidth, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'ocean':
                // 海辺 - 空と海
                const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight * 0.5);
                skyGradient.addColorStop(0, '#87ceeb');
                skyGradient.addColorStop(1, '#b0e0e6');
                ctx.fillStyle = skyGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight * 0.5);
                
                const seaGradient = ctx.createLinearGradient(0, this.canvasHeight * 0.5, 0, this.canvasHeight);
                seaGradient.addColorStop(0, '#4682b4');
                seaGradient.addColorStop(1, '#1e3a5f');
                ctx.fillStyle = seaGradient;
                ctx.fillRect(0, this.canvasHeight * 0.5, this.canvasWidth, this.canvasHeight * 0.5);
                
                // 波
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    const y = this.canvasHeight * 0.5 + i * 30;
                    for (let x = 0; x < this.canvasWidth; x += 20) {
                        ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
                    }
                    ctx.stroke();
                }
                
                // 太陽
                ctx.fillStyle = 'rgba(255, 223, 0, 0.8)';
                ctx.beginPath();
                ctx.arc(this.canvasWidth * 0.8, this.canvasHeight * 0.3, 40, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'sunset':
                // 夕焼け空
                const sunsetGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                sunsetGradient.addColorStop(0, '#ff6b9d');
                sunsetGradient.addColorStop(0.2, '#ffa07a');
                sunsetGradient.addColorStop(0.4, '#ffd700');
                sunsetGradient.addColorStop(0.6, '#ff8c00');
                sunsetGradient.addColorStop(1, '#4a148c');
                ctx.fillStyle = sunsetGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 雲
                ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
                for (let i = 0; i < 8; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const y = Math.random() * this.canvasHeight * 0.6;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 60 + Math.random() * 40, 20 + Math.random() * 15, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'night':
                // 夜空
                const nightGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                nightGradient.addColorStop(0, '#0a0e27');
                nightGradient.addColorStop(0.5, '#1a1a3e');
                nightGradient.addColorStop(1, '#2d1b4e');
                ctx.fillStyle = nightGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 星
                ctx.fillStyle = 'white';
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const y = Math.random() * this.canvasHeight * 0.7;
                    const size = Math.random() * 2;
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // 月
                ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
                ctx.beginPath();
                ctx.arc(this.canvasWidth * 0.8, this.canvasHeight * 0.2, 50, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'spring':
                // 春の桜
                const springGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                springGradient.addColorStop(0, '#e3f2fd');
                springGradient.addColorStop(1, '#fff9e6');
                ctx.fillStyle = springGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 桜の花びら
                for (let i = 0; i < 50; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const y = Math.random() * this.canvasHeight;
                    ctx.fillStyle = `rgba(255, 182, 193, ${0.5 + Math.random() * 0.5})`;
                    ctx.beginPath();
                    for (let j = 0; j < 5; j++) {
                        const angle = (j * Math.PI * 2) / 5;
                        const px = x + Math.cos(angle) * 8;
                        const py = y + Math.sin(angle) * 8;
                        if (j === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
                break;
                
            case 'autumn':
                // 秋の紅葉
                const autumnGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                autumnGradient.addColorStop(0, '#ffeaa7');
                autumnGradient.addColorStop(1, '#fdcb6e');
                ctx.fillStyle = autumnGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 紅葉
                const colors = ['#ff6b6b', '#ee5a24', '#ffa502', '#ff7675', '#d63031'];
                for (let i = 0; i < 40; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const y = Math.random() * this.canvasHeight;
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    ctx.fillStyle = `${color}${Math.floor(128 + Math.random() * 127).toString(16)}`;
                    
                    // 葉の形
                    ctx.beginPath();
                    ctx.moveTo(x, y - 10);
                    ctx.quadraticCurveTo(x + 8, y - 5, x + 5, y + 5);
                    ctx.quadraticCurveTo(x, y + 3, x - 5, y + 5);
                    ctx.quadraticCurveTo(x - 8, y - 5, x, y - 10);
                    ctx.fill();
                }
                break;
                
            case 'snow':
                // 雪景色
                const snowGradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
                snowGradient.addColorStop(0, '#b8c6db');
                snowGradient.addColorStop(1, '#f5f7fa');
                ctx.fillStyle = snowGradient;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                
                // 雪の結晶
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 2;
                for (let i = 0; i < 60; i++) {
                    const x = Math.random() * this.canvasWidth;
                    const y = Math.random() * this.canvasHeight;
                    const size = Math.random() * 6 + 2;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // 雪の結晶の線
                    if (size > 4) {
                        for (let j = 0; j < 6; j++) {
                            const angle = (j * Math.PI) / 3;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + Math.cos(angle) * size * 2, y + Math.sin(angle) * size * 2);
                            ctx.stroke();
                        }
                    }
                }
                break;
                
            case 'grid':
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 1;
                const gridSize = 20;
                for (let x = 0; x <= this.canvasWidth; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, this.canvasHeight);
                    ctx.stroke();
                }
                for (let y = 0; y <= this.canvasHeight; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(this.canvasWidth, y);
                    ctx.stroke();
                }
                break;
        }
    }
    
    saveState() {
        // 現在の履歴位置より後ろを削除
        this.history = this.history.slice(0, this.historyStep + 1);
        
        // すべてのレイヤーの状態を保存
        const state = this.layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            visible: layer.visible,
            opacity: layer.opacity,
            imageData: layer.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
        }));
        
        this.history.push({
            layers: state,
            currentLayerId: this.currentLayerId
        });
        
        // 履歴の上限を超えたら古いものを削除
        if (this.history.length > this.maxHistorySteps) {
            this.history.shift();
        } else {
            this.historyStep++;
        }
        
        this.updateUndoRedoButtons();
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState(this.history[this.historyStep]);
            this.updateUndoRedoButtons();
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState(this.history[this.historyStep]);
            this.updateUndoRedoButtons();
        }
    }
    
    restoreState(state) {
        // 既存のレイヤーをクリア
        this.layers.forEach(layer => {
            this.canvasStack.removeChild(layer.canvas);
        });
        this.layers = [];
        
        // 保存された状態を復元
        state.layers.forEach((savedLayer, index) => {
            const layer = {
                id: savedLayer.id,
                name: savedLayer.name,
                canvas: document.createElement('canvas'),
                ctx: null,
                visible: savedLayer.visible,
                opacity: savedLayer.opacity
            };
            
            layer.canvas.width = this.canvasWidth;
            layer.canvas.height = this.canvasHeight;
            layer.canvas.style.zIndex = index;
            layer.canvas.style.opacity = layer.opacity;
            layer.canvas.style.display = layer.visible ? 'block' : 'none';
            layer.ctx = layer.canvas.getContext('2d');
            
            // 画像データを復元
            layer.ctx.putImageData(savedLayer.imageData, 0, 0);
            
            this.layers.push(layer);
            this.canvasStack.appendChild(layer.canvas);
            this.setupCanvasEvents(layer.canvas);
        });
        
        this.currentLayerId = state.currentLayerId;
        this.updateLayerList();
    }
    
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyStep <= 0;
            undoBtn.style.opacity = this.historyStep <= 0 ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyStep >= this.history.length - 1;
            redoBtn.style.opacity = this.historyStep >= this.history.length - 1 ? '0.5' : '1';
        }
    }
    
    addLayer() {
        const layer = {
            id: this.nextId++,
            name: `レイヤー ${this.nextId}`,
            canvas: document.createElement('canvas'),
            ctx: null,
            visible: true,
            opacity: 1
        };
        
        layer.canvas.width = this.canvasWidth;
        layer.canvas.height = this.canvasHeight;
        layer.canvas.style.zIndex = this.layers.length;
        layer.ctx = layer.canvas.getContext('2d');
        
        // 背景を透明に
        layer.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.layers.push(layer);
        this.canvasStack.appendChild(layer.canvas);
        this.currentLayerId = layer.id;
        
        this.updateLayerList();
        this.setupCanvasEvents(layer.canvas);
        this.saveState();
        
        return layer;
    }
    
    deleteLayer(id) {
        if (this.layers.length <= 1) {
            alert('最低1つのレイヤーは必要です');
            return;
        }
        
        const index = this.layers.findIndex(l => l.id === id);
        if (index !== -1) {
            this.canvasStack.removeChild(this.layers[index].canvas);
            this.layers.splice(index, 1);
            
            if (this.currentLayerId === id) {
                this.currentLayerId = this.layers[0].id;
            }
            
            this.updateLayerList();
            this.saveState();
        }
    }
    
    getActiveLayer() {
        return this.layers.find(l => l.id === this.currentLayerId);
    }
    
    setActiveLayer(id) {
        this.currentLayerId = id;
        this.updateLayerList();
    }
    
    toggleLayerVisibility(id) {
        const layer = this.layers.find(l => l.id === id);
        if (layer) {
            layer.visible = !layer.visible;
            layer.canvas.style.display = layer.visible ? 'block' : 'none';
            this.updateLayerList();
            this.saveState();
        }
    }
    
    setLayerOpacity(id, opacity) {
        const layer = this.layers.find(l => l.id === id);
        if (layer) {
            layer.opacity = opacity;
            layer.canvas.style.opacity = opacity;
        }
    }
    
    updateLayerList() {
        this.layerList.innerHTML = '';
        
        // 逆順で表示（上のレイヤーが上に表示される）
        [...this.layers].reverse().forEach(layer => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (layer.id === this.currentLayerId) {
                layerItem.classList.add('active');
            }
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'layer-name';
            nameSpan.textContent = layer.name;
            
            const visibilityBtn = document.createElement('button');
            visibilityBtn.className = 'layer-visibility';
            visibilityBtn.textContent = layer.visible ? '👁️' : '👁️‍🗨️';
            visibilityBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleLayerVisibility(layer.id);
            };
            
            const opacitySlider = document.createElement('input');
            opacitySlider.type = 'range';
            opacitySlider.className = 'layer-opacity';
            opacitySlider.min = '0';
            opacitySlider.max = '100';
            opacitySlider.value = layer.opacity * 100;
            opacitySlider.onclick = (e) => e.stopPropagation();
            opacitySlider.oninput = (e) => {
                this.setLayerOpacity(layer.id, e.target.value / 100);
            };
            
            layerItem.appendChild(nameSpan);
            layerItem.appendChild(opacitySlider);
            layerItem.appendChild(visibilityBtn);
            
            layerItem.onclick = () => this.setActiveLayer(layer.id);
            
            this.layerList.appendChild(layerItem);
        });
    }
    
    setupCanvasEvents(canvas) {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    mergeAndSave() {
        const mergedCanvas = document.createElement('canvas');
        mergedCanvas.width = this.canvasWidth;
        mergedCanvas.height = this.canvasHeight;
        const mergedCtx = mergedCanvas.getContext('2d');
        
        // 背景を含める
        mergedCtx.drawImage(this.backgroundCanvas, 0, 0);
        
        // すべてのレイヤーを合成
        this.layers.forEach(layer => {
            if (layer.visible) {
                mergedCtx.globalAlpha = layer.opacity;
                mergedCtx.drawImage(layer.canvas, 0, 0);
            }
        });
        
        return mergedCanvas.toDataURL();
    }
}

// グローバル変数
let layerManager;
let isDrawing = false;
let currentColor = '#000000';
let brushSize = 5;
let isEraser = false;

// 初期化
window.addEventListener('load', () => {
    layerManager = new LayerManager(800, 600);
    
    // Canvas スタックのサイズを設定
    const canvasStack = document.getElementById('canvasStack');
    canvasStack.style.width = '800px';
    canvasStack.style.height = '600px';
});

// UI要素の取得
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const colorPicker = document.getElementById('colorPicker');
const eraserBtn = document.getElementById('eraserBtn');
const penBtn = document.getElementById('penBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const addLayerBtn = document.getElementById('addLayerBtn');
const deleteLayerBtn = document.getElementById('deleteLayerBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const backgroundSelect = document.getElementById('backgroundSelect');

// イベントリスナー
brushSizeSlider.addEventListener('input', (e) => {
    brushSize = e.target.value;
    brushSizeValue.textContent = brushSize;
});

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    isEraser = false;
    updateToolButtons();
});

backgroundSelect.addEventListener('change', (e) => {
    layerManager.setBackground(e.target.value);
});

eraserBtn.addEventListener('click', () => {
    isEraser = true;
    updateToolButtons();
});

penBtn.addEventListener('click', () => {
    isEraser = false;
    updateToolButtons();
});

clearBtn.addEventListener('click', () => {
    if (confirm('現在のレイヤーを全て消去しますか?')) {
        const layer = layerManager.getActiveLayer();
        if (layer) {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
            layerManager.saveState();
        }
    }
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = layerManager.mergeAndSave();
    link.click();
});

addLayerBtn.addEventListener('click', () => {
    layerManager.addLayer();
});

deleteLayerBtn.addEventListener('click', () => {
    if (confirm('現在のレイヤーを削除しますか?')) {
        layerManager.deleteLayer(layerManager.currentLayerId);
    }
});

undoBtn.addEventListener('click', () => {
    layerManager.undo();
});

redoBtn.addEventListener('click', () => {
    layerManager.redo();
});

// ツールボタンの状態更新
function updateToolButtons() {
    if (isEraser) {
        eraserBtn.classList.add('active');
        penBtn.classList.remove('active');
    } else {
        eraserBtn.classList.remove('active');
        penBtn.classList.add('active');
    }
}

// タッチイベントハンドラ
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    e.target.dispatchEvent(mouseEvent);
}

// 描画関数
function startDrawing(e) {
    const layer = layerManager.getActiveLayer();
    if (!layer || !layer.visible) return;
    
    isDrawing = true;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    layer.ctx.beginPath();
    layer.ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    
    const layer = layerManager.getActiveLayer();
    if (!layer || !layer.visible) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    layer.ctx.lineWidth = brushSize;
    layer.ctx.lineCap = 'round';
    layer.ctx.lineJoin = 'round';
    
    if (isEraser) {
        layer.ctx.globalCompositeOperation = 'destination-out';
    } else {
        layer.ctx.globalCompositeOperation = 'source-over';
        layer.ctx.strokeStyle = currentColor;
    }
    
    layer.ctx.lineTo(x, y);
    layer.ctx.stroke();
    layer.ctx.beginPath();
    layer.ctx.moveTo(x, y);
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        const layer = layerManager.getActiveLayer();
        if (layer) {
            layer.ctx.beginPath();
            layerManager.saveState();
        }
    }
}
