// V2Board 自动登录获取订阅脚本 - Sub-Store 专用
// 解决了阅后即焚问题，且请求 IP 与 Sub-Store 所在 IP 一致（防封号）

async function operator(args) {
  const { url, email, password } = args;
  
  if (!url || !email || !password) {
    throw new Error("缺少参数，请在 Args 中填写 url, email 和 password");
  }

  // 去除 url 结尾可能存在的 /
  const cleanUrl = url.replace(/\/$/, '');
  
  // 1. 模拟登录
  const loginPath = `${cleanUrl}/api/v1/passport/auth/login`;
  const loginHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  
  const loginBody = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  console.log(`正在尝试登录: ${cleanUrl}`);
  
  const loginResp = await fetch(loginPath, {
    method: 'POST',
    headers: loginHeaders,
    body: loginBody
  });

  if (loginResp.status !== 200) {
    throw new Error(`登录请求失败，状态码: ${loginResp.status}`);
  }

  const loginData = await loginResp.json();
  
  // 检查是否获取到 token
  if (!loginData.data || !loginData.data.auth_data) {
    throw new Error(`登录失败，未获取到 Token。请检查账号密码或机场是否开启了验证码/2FA。返回: ${JSON.stringify(loginData)}`);
  }

  const token = loginData.data.auth_data;
  console.log("登录成功，获取到 Token");

  // 2. 使用 Token 获取订阅内容
  // 注意：这里模拟 v2rayng 客户端，防止被识别为爬虫
  const subPath = `${cleanUrl}/api/v1/client/subscribe?token=${token}`;
  
  const subResp = await fetch(subPath, {
    headers: {
      'User-Agent': '2rayng/1.8.5' 
    }
  });

  if (subResp.status !== 200) {
    throw new Error(`获取订阅内容失败，状态码: ${subResp.status}`);
  }

  const content = await subResp.text();
  return content; // 返回给 Sub-Store 处理
}
