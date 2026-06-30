let html5QrCode = null;

function openScanner() {
    // 1. 先把彈窗顯示出來
    document.getElementById('scanModal').style.display = 'flex';
    
    const errorEl = document.getElementById('error-msg');
    if (errorEl) errorEl.style.display = 'none';

    // 2. 延遲 100 毫秒再啟動相機，確保瀏覽器已經渲染好 #reader 容器的寬高
    setTimeout(() => {
        try {
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader");
            }

            // 如果已經在掃描中，先不要重複啟動
            if (html5QrCode.isScanning) return;

            // 啟動相機
            html5QrCode.start(
                // 用這個設定在 iOS/Android 的 Chrome/Safari 都能完美調用後鏡頭
                { facingMode: { exact: "environment" } }, 
                {
                    fps: 10,
                    qrbox: function(width, height) {
                        // 動態計算掃描框，避免大螢幕或小螢幕變形
                        const minEdge = Math.min(width, height);
                        const size = Math.floor(minEdge * 0.65);
                        return { width: size, height: size };
                    },
                    // 修正某些手機畫面不正確拉伸的問題
                    aspectRatio: 1.0 
                },
                onScanSuccess,
                onScanFailure
            ).catch(err => {
                console.warn("無法強制調用後鏡頭，嘗試切換至預設相機:", err);
                
                // 【備援方案】如果手機沒有後鏡頭或精確匹配失敗，使用一般模式啟動
                html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 220, height: 220 } },
                    onScanSuccess,
                    onScanFailure
                ).catch(finalErr => {
                    showError("相機啟動失敗：請確認網址為 HTTPS 或已允許相機權限。");
                    closeScanner();
                });
            });

        } catch (e) {
            showError("系統初始化失敗：" + e.message);
            closeScanner();
        }
    }, 100);
}

function closeScanner() {
    // 1. 先把 UI 彈窗隱藏
    document.getElementById('scanModal').style.display = 'none';
    
    // 2. 檢查是否正在掃描，若是，則非同步停止它
    if (html5QrCode && html5QrCode.isScanning) {
        // 返回這個 Promise 讓外層可以等它結束
        return html5QrCode.stop()
            .then(() => {
                // 相機完全停止後，才清空內部 HTML 結構，防範 removeChild 錯誤
                const readerEl = document.getElementById('reader');
                if (readerEl) readerEl.innerHTML = '';
                console.log("相機已安全關閉並釋放資源");
            })
            .catch(err => {
                console.error("停止相機失敗：", err);
            });
    }
    
    // 如果本來就沒在掃描，回傳一個已經完成的 Promise
    return Promise.resolve();
}

