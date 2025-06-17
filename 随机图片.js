import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import https from 'https';
import http from 'http';
import { pipeline } from 'stream/promises';

export class RandomImage extends plugin {
  constructor() {
    super({
      name: '终极图片管家',
      dsc: '支持本地上传和URL添加的图片管理',
      event: 'message',
      priority: 999,
      rule: [
        { reg: '^&随机图片$', fnc: 'sendRandomImage' },
        { reg: '^&查看图片\\s+(\\d+)$', fnc: 'viewSpecificImage' },
        { reg: '^&重命名图片\\s+(\\d+)\\s+(.+)$', fnc: 'renameImage', permission: 'master' },
        { reg: '^&添加图片(?:\\s+(.+))?$', fnc: 'addImage', permission: 'master' },
        { reg: '^&图片列表(?:\\s+(\\d+))?$', fnc: 'listImages' },
        { reg: '^&删除图片\\s+(\\d+)$', fnc: 'deleteImage', permission: 'master' },
        { reg: '^&设置图片大小\\s+(\\d+)(MB|KB)$', fnc: 'setMaxFileSize', permission: 'master' },
        { reg: '^&帮助$', fnc: 'help' }
      ]
    });

    this.imageDir = path.join(process.cwd(), 'data/images');
    this.configPath = path.join(process.cwd(), 'data/image_config.json');
    this.loadConfig();
    this.initStorage();
  }

  /** 初始化存储目录 */
  initStorage() {
    try {
      if (!fs.existsSync(this.imageDir)) {
        fs.mkdirSync(this.imageDir, { recursive: true });
        fs.chmodSync(this.imageDir, 0o755);
      }
    } catch (err) {
      console.error('存储初始化失败:', err);
    }
  }

  /** 加载配置文件 */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024;
        this.allowedTypes = config.allowedTypes || ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      } else {
        this.maxFileSize = 10 * 1024 * 1024;
        this.allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        this.saveConfig();
      }
    } catch (err) {
      console.error('配置加载失败:', err);
      this.maxFileSize = 10 * 1024 * 1024;
      this.allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }
  }

  /** 保存配置 */
  saveConfig() {
    const config = { 
      maxFileSize: this.maxFileSize,
      allowedTypes: this.allowedTypes
    };
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  /** 设置文件大小限制 */
  async setMaxFileSize() {
    try {
      const match = this.e.msg.match(/^&设置图片大小\s+(\d+)(MB|KB)$/);
      if (!match) throw new Error('格式错误');
      
      const size = parseInt(match[1]);
      const unit = match[2];
      const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
      const newSize = size * multiplier;

      if (newSize < 1048576 || newSize > 104857600) {
        return this.reply('❌ 大小范围：1MB ~ 100MB');
      }

      this.maxFileSize = newSize;
      this.saveConfig();
      this.reply(`✅ 已设置图片大小限制为 ${size}${unit}`);
    } catch (err) {
      this.reply('❌ 格式错误，正确示例：&设置图片大小 15MB');
    }
  }

  /** 帮助信息 */
  async help() {
    const helpMsg = [
      '📖 图片管家使用指南',
      '=======================',
      '基础指令：',
      '&随机图片 - 随机发送图片',
      '&查看图片 [编号] - 查看指定图片',
      '&图片列表 [页码] - 显示图片列表',
      '&帮助 - 显示本帮助信息',
      '',
      '⚙️ 管理指令：',
      '&添加图片 [名称/URL] - 添加图片',
      '&重命名图片 [编号] [新名] - 修改名称',
      '&删除图片 [编号] - 删除图片',
      '&设置图片大小 [数值][单位] - 修改大小限制',
      '',
      '⚡ 当前配置：',
      `• 最大文件大小：${this.formatSize(this.maxFileSize)}`,
      `• 支持格式：${this.allowedTypes.join(', ')}`,
      '======================='
    ].join('\n');
    await this.reply(helpMsg);
  }

  /** 核心添加方法 */
  async addImage() {
    if (!this.e.isMaster) return this.reply('❌ 管理员专属功能');
    
    try {
      let imageUrl, customName;

      // 模式1：本地上传
      if (this.e.img?.[0]) {
        imageUrl = this.e.img[0];
        const match = this.e.msg.match(/^&添加图片\s*(.+)?$/);
        customName = match?.[1] || this.generateDefaultName();
      } 
      // 模式2：URL添加
      else {
        const match = this.e.msg.match(/^&添加图片\s+(https?:\/\/\S+)(?:\s+(.+))?$/);
        if (!match) return this.reply(this.usageGuide());
        imageUrl = match[1];
        customName = match[2] || this.generateFilenameFromUrl(match[1]);
      }

      const { filePath, filename } = await this.processImage(imageUrl, customName);
      const files = this.getImageList();
      const index = files.indexOf(filename) + 1;

      await this.reply([
        segment.image(`file:///${filePath}`),
        '✅ 添加成功！',
        `📛 名称：${filename}`,
        `🎯 编号：${index}`
      ]);
    } catch (err) {
      this.reply(`‼️ 失败原因：${this.errorTranslator(err)}`);
      console.error('添加图片错误:', err.stack);
    }
  }

  /** 图片处理流水线 */
  async processImage(url, name) {
    let fileStream = null;
    let finalPath = null;
    
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
      };
      
      const response = await new Promise((resolve, reject) => {
        const req = client.request(url, options, resolve);
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy(new Error('TIMEOUT'));
          reject(new Error('TIMEOUT'));
        });
        req.end();
      });
      
      if (response.statusCode !== 200) {
        throw new Error(`HTTP_${response.statusCode}`);
      }
      
      // 获取内容类型并验证
      const contentType = response.headers['content-type'] || '';
      const contentLength = parseInt(response.headers['content-length']) || 0;
      
      // 检查内容长度是否超过限制
      if (contentLength > this.maxFileSize) {
        throw new Error('FILE_SIZE_EXCEEDED');
      }
      
      const fileExt = this.getFileExtension(contentType, url);
      if (!this.allowedTypes.includes(fileExt)) {
        throw new Error(`invalid_type:${fileExt}`);
      }
      
      // 生成唯一文件名
      const baseName = this.sanitizeName(name);
      const initialFilename = `${baseName}.${fileExt}`;
      const initialPath = path.join(this.imageDir, initialFilename);
      
      // 处理文件名冲突
      finalPath = this.getUniqueFilePath(initialPath);
      const finalFilename = path.basename(finalPath);
      
      // 创建写入流
      fileStream = fs.createWriteStream(finalPath);
      let receivedBytes = 0;
      
      // 进度监控
      response.on('data', (chunk) => {
        receivedBytes += chunk.length;
        if (receivedBytes > this.maxFileSize) {
          response.destroy(new Error('FILE_SIZE_EXCEEDED'));
          fileStream.close();
          fs.unlink(finalPath, () => {});
        }
      });
      
      // 使用pipeline高效传输数据
      await pipeline(response, fileStream);
      
      // 验证文件大小
      const stats = fs.statSync(finalPath);
      if (stats.size > this.maxFileSize) {
        throw new Error('FILE_SIZE_EXCEEDED');
      }
      
      return { filePath: finalPath, filename: finalFilename };
      
    } catch (err) {
      // 清理失败的文件
      if (finalPath && fs.existsSync(finalPath)) {
        fs.unlinkSync(finalPath);
      }
      throw err;
    } finally {
      // 确保流被关闭
      if (fileStream && !fileStream.closed) {
        fileStream.close();
      }
    }
  }

  /** 生成唯一文件名避免冲突 */
  getUniqueFilePath(originalPath) {
    if (!fs.existsSync(originalPath)) {
      return originalPath;
    }
    
    const ext = path.extname(originalPath);
    const base = path.basename(originalPath, ext);
    const dir = path.dirname(originalPath);
    
    let newPath = path.join(dir, `${base}_${Date.now().toString(36).slice(-4)}${ext}`);
    if (!fs.existsSync(newPath)) {
      return newPath;
    }
    
    // 如果时间戳仍冲突，使用序号
    let counter = 1;
    do {
      newPath = path.join(dir, `${base}_${counter}${ext}`);
      counter++;
    } while (fs.existsSync(newPath));
    
    return newPath;
  }

  /** 随机展示图片 - 只发送图片 */
  async sendRandomImage() {
    try {
      const files = this.getImageList();
      if (!files.length) return this.reply('📭 图库为空');
      
      const randomFile = files[Math.floor(Math.random() * files.length)];
      const filePath = path.join(this.imageDir, randomFile);
      
      // 只发送图片，不发送任何附加信息
      await this.reply(segment.image(`file:///${filePath}`));
    } catch (err) {
      this.reply('❌ 随机获取失败');
    }
  }

  /** 查看指定图片 - 只发送图片 */
  async viewSpecificImage() {
    try {
      const files = this.getImageList();
      const match = this.e.msg.match(/^&查看图片\s+(\d+)$/);
      if (!match) return this.reply('❌ 格式错误，正确格式：&查看图片 编号');
      
      const index = parseInt(match[1]) - 1;
      
      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      const filePath = path.join(this.imageDir, files[index]);
      
      // 只发送图片，不发送任何附加信息
      await this.reply(segment.image(`file:///${filePath}`));
    } catch (err) {
      this.reply('❌ 查看失败');
    }
  }

  /** 重命名功能 */
  async renameImage() {
    try {
      const files = this.getImageList();
      const match = this.e.msg.match(/^&重命名图片\s+(\d+)\s+(.+)$/);
      if (!match) return this.reply('❌ 格式错误，正确格式：&重命名图片 编号 新名称');
      
      const index = parseInt(match[1]) - 1;
      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      const filename = files[index];
      const oldPath = path.join(this.imageDir, filename);
      
      if (!fs.existsSync(oldPath)) {
        return this.reply(`❌ 图片文件不存在: ${filename}`);
      }
      
      const cleanName = this.sanitizeName(match[2]);
      const ext = path.extname(oldPath);
      const newBasePath = path.join(this.imageDir, cleanName);
      const newPath = this.getUniqueFilePath(`${newBasePath}${ext}`);
      const newFilename = path.basename(newPath);

      fs.renameSync(oldPath, newPath);
      
      await this.reply([
        '✅ 重命名成功',
        `原名称：${filename}`,
        `新名称：${newFilename}`
      ]);
    } catch (err) {
      this.reply(`❌ 重命名失败：${this.errorTranslator(err)}`);
    }
  }

  /** 图片列表 - 简化版 */
  async listImages() {
    try {
      const files = this.getImageList();
      if (!files.length) return this.reply('📭 图库为空');

      // 分页显示
      const pageSize = 15;
      const totalPages = Math.ceil(files.length / pageSize);
      let page = 1;
      
      // 检查是否有页码参数
      const pageMatch = this.e.msg.match(/^&图片列表\s+(\d+)$/);
      if (pageMatch) page = parseInt(pageMatch[1]);
      if (page < 1 || page > totalPages) page = 1;
      
      const start = (page - 1) * pageSize;
      const end = Math.min(start + pageSize, files.length);
      const pageFiles = files.slice(start, end);
      
      let msg = `📷 图片列表 (${page}/${totalPages}) 共 ${files.length} 张\n`;
      msg += '--------------------------------\n';
      
      pageFiles.forEach((file, i) => {
        const idx = start + i + 1;
        msg += `${idx}. ${file}\n`;
      });

      msg += '--------------------------------\n';
      
      if (totalPages > 1) {
        msg += `📖 翻页：`;
        if (page > 1) msg += `上一页: &图片列表 ${page - 1}  `;
        if (page < totalPages) msg += `下一页: &图片列表 ${page + 1}`;
        msg += '\n';
      }
      
      if (this.e.isMaster) {
        msg += '\n⚙️ 管理指令：';
        msg += '\n&添加图片 [名称/URL] - 添加图片';
        msg += '\n&重命名图片 [编号] [新名] - 修改名称';
        msg += '\n&删除图片 [编号] - 删除图片\n';
      }

      await this.reply(msg);
    } catch (err) {
      this.reply('❌ 列表获取失败');
    }
  }

  /** 删除图片 - 保留预览功能 */
  async deleteImage() {
    try {
      const files = this.getImageList();
      const match = this.e.msg.match(/^&删除图片\s+(\d+)$/);
      if (!match) return this.reply('❌ 格式错误，正确格式：&删除图片 编号');
      
      const index = parseInt(match[1]) - 1;
      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      const filename = files[index];
      const filePath = path.join(this.imageDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return this.reply(`❌ 图片文件不存在: ${filename}`);
      }
      
      const preview = segment.image(`file:///${filePath}`);
      
      // 执行删除
      fs.unlinkSync(filePath);
      
      await this.reply([
        preview,
        '✅ 删除成功',
        `📛 名称：${filename}`,
        `剩余数量：${files.length - 1}`
      ]);
    } catch (err) {
      this.reply('❌ 删除失败');
    }
  }

  /** 工具方法 - 获取图片列表 */
  getImageList() {
    try {
      // 获取文件列表
      const files = fs.readdirSync(this.imageDir);
      
      // 过滤有效图片文件
      const validFiles = files.filter(file => {
        try {
          const ext = path.extname(file).toLowerCase().slice(1);
          return this.allowedTypes.includes(ext) && 
                 fs.statSync(path.join(this.imageDir, file)).isFile();
        } catch {
          return false;
        }
      });
      
      // 按创建时间排序
      const fileStats = validFiles.map(file => ({
        name: file,
        birthtime: fs.statSync(path.join(this.imageDir, file)).birthtimeMs
      }));
      
      fileStats.sort((a, b) => a.birthtime - b.birthtime);
      
      return fileStats.map(item => item.name);
    } catch (err) {
      return [];
    }
  }

  sanitizeName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
      .trim() || '未命名_' + Date.now().toString(36).slice(-4);
  }

  getFileExtension(contentType, url) {
    // 1. 尝试从URL中获取扩展名
    if (url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const urlExt = path.extname(pathname).toLowerCase().slice(1);
        if (urlExt && this.allowedTypes.includes(urlExt)) {
          return urlExt;
        }
      } catch {}
    }
    
    // 2. 从Content-Type获取
    const typeMap = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    
    const lowerType = contentType.toLowerCase();
    for (const [type, ext] of Object.entries(typeMap)) {
      if (lowerType.includes(type)) {
        return this.allowedTypes.includes(ext) ? ext : 'jpg';
      }
    }
    
    // 3. 默认类型
    return 'jpg';
  }

  errorTranslator(err) {
    const errors = {
      ECONNRESET: '🌐 连接意外断开',
      ECONNABORTED: '⏳ 下载超时',
      ENOTFOUND: '🌐 域名无法解析',
      EACCES: '🔒 文件访问权限不足',
      ENOENT: '❌ 文件不存在',
      HTTP_404: '🔗 图片不存在(404)',
      HTTP_403: '🔒 无访问权限(403)',
      HTTP_500: '🛑 服务器错误(500)',
      TIMEOUT: '⏳ 请求超时',
      FILE_SIZE_EXCEEDED: `❌ 文件大小超过限制（最大 ${this.formatSize(this.maxFileSize)}）`,
      invalid_type: (ext) => `❌ 不支持 ${ext} 格式文件`
    };
    
    if (err.message.startsWith('invalid_type')) {
      return errors.invalid_type(err.message.split(':')[1]);
    }
    if (err.message === 'FILE_SIZE_EXCEEDED') {
      return errors.FILE_SIZE_EXCEEDED;
    }
    if (err.message === 'TIMEOUT') {
      return errors.TIMEOUT;
    }
    if (err.message.startsWith('HTTP_')) {
      return errors[err.message] || `HTTP错误: ${err.message.split('_')[1]}`;
    }
    if (err.code && errors[err.code]) {
      return errors[err.code];
    }
    return errors[err.message] || `未知错误：${err.message}`;
  }

  formatSize(bytes) {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }
    return `${(bytes / 1024).toFixed(1)}KB`;
  }

  generateDefaultName() {
    return `图片_${Date.now().toString(36)}`;
  }

  generateFilenameFromUrl(url) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      let base = path.basename(pathname, path.extname(pathname)) || '网络图片';
      
      // 清理文件名中的特殊字符
      base = base.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
      
      // 添加域名前缀避免冲突
      const domain = parsed.hostname.replace('www.', '').split('.')[0];
      return `${domain}_${base}`.substring(0, 40);
    } catch {
      return '网络图片_' + Date.now().toString(36).slice(-6);
    }
  }

  usageGuide() {
    return [
      '📚 使用指南：',
      '方式1：发送图片后输入 &添加图片 [名称]',
      '方式2：输入 &添加图片 [图片URL] [名称]',
      '示例：',
      '  &添加图片 https://example.com/image.jpg 示例图片',
      '  &添加图片 本地图片名称',
      '⚠️ 注意事项：',
      `  • 最大支持 ${this.formatSize(this.maxFileSize)} 图片`,
      '  • 名称不能包含特殊字符 < > : " / \\ | ? *',
      '  • 支持格式: ' + this.allowedTypes.join(', ')
    ].join('\n');
  }
}