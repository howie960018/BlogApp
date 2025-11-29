// 警告：在目前的瀏覽器預覽環境中，請保持為 false。
// 如果您已下載程式碼並啟動了本地 Node.js 伺服器，請將此改為 true。
export const USE_REAL_BACKEND = true;


// 根據環境判斷 API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
