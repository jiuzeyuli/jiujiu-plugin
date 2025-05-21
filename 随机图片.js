import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

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
        { reg: '^&图片列表$', fnc: 'listImages' },
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
      '&图片列表 - 显示所有图片',
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
      const index = this.getImageList().indexOf(filename) + 1;

      await this.reply([
        segment.image(`file:///${filePath}`),
        '✅ 添加成功！',
        `📛 名称：${filename}`,
        `🎯 编号：${index}`
      ]);
    } catch (err) {
      this.reply(`‼️ 失败原因：${this.errorTranslator(err)}`);
      console.error('添加错误:', err.stack);
    }
  }

  /** 图片处理流水线 */
  async processImage(url, name) {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxContentLength: this.maxFileSize
    });

    if (response.status !== 200) throw new Error(`HTTP_${response.status}`);
    
    const contentType = response.headers['content-type'];
    const fileExt = this.getFileExtension(contentType);
    if (!this.allowedTypes.includes(fileExt)) {
      throw new Error(`invalid_type:${fileExt}`);
    }

    const filename = `${this.sanitizeName(name)}.${fileExt}`;
    const filePath = path.join(this.imageDir, filename);

    if (fs.existsSync(filePath)) throw new Error('file_exists');
    fs.writeFileSync(filePath, response.data);
    
    return { filePath, filename };
  }

  /** 随机展示图片 */
  async sendRandomImage() {
    try {
      const files = this.getImageList();
      if (!files.length) return this.reply('📭 图库为空');
      
      const randomFile = files[Math.floor(Math.random() * files.length)];
      await this.reply(segment.image(`file:///${path.join(this.imageDir, randomFile)}`));
    } catch (err) {
      this.reply('❌ 随机获取失败');
    }
  }

  /** 查看指定图片 */
  async viewSpecificImage() {
    try {
      const files = this.getImageList();
      const index = parseInt(this.e.msg.match(/^&查看图片\s+(\d+)$/)[1]) - 1;
      
      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      await this.reply(segment.image(`file:///${path.join(this.imageDir, files[index])}`));
    } catch (err) {
      this.reply('❌ 查看失败');
    }
  }

  /** 重命名功能 */
  async renameImage() {
    try {
      const files = this.getImageList();
      const match = this.e.msg.match(/^&重命名图片\s+(\d+)\s+(.+)$/);
      const index = parseInt(match[1]) - 1;

      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      const cleanName = this.sanitizeName(match[2]);
      const oldPath = path.join(this.imageDir, files[index]);
      const ext = path.extname(oldPath);
      const newPath = path.join(this.imageDir, `${cleanName}${ext}`);

      if (fs.existsSync(newPath)) throw new Error('file_exists');
      fs.renameSync(oldPath, newPath);

      await this.reply([
        '✅ 重命名成功',
        `原名称：${files[index]}`,
        `新名称：${cleanName}${ext}`,
        `当前编号：${index + 1}`
      ]);
    } catch (err) {
      this.reply(`❌ 重命名失败：${this.errorTranslator(err)}`);
    }
  }

  /** 图片列表 */
  async listImages() {
    try {
      const files = this.getImageList();
      if (!files.length) return this.reply('📭 图库为空');

      let msg = `📷 当前共 ${files.length} 张图片\n\n`;
      files.forEach((file, i) => msg += `${i + 1}. ${file}\n`);

      msg += '\n📌 使用指令：\n';
      msg += '&随机图片 - 随机展示\n';
      msg += '&查看图片 [编号] - 查看详情\n';
      
      if (this.e.isMaster) {
        msg += '\n⚙️ 管理指令：\n';
        msg += '&添加图片 [名称/URL] - 添加图片\n';
        msg += '&重命名图片 [编号] [新名] - 修改名称\n';
        msg += '&删除图片 [编号] - 删除图片\n';
      }

      this.reply(msg);
    } catch (err) {
      this.reply('❌ 列表获取失败');
    }
  }

  /** 删除图片 */
  async deleteImage() {
    try {
      const files = this.getImageList();
      const index = parseInt(this.e.msg.match(/^&删除图片\s+(\d+)$/)[1]) - 1;
      
      if (index < 0 || index >= files.length) {
        return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);
      }

      const filePath = path.join(this.imageDir, files[index]);
      const preview = segment.image(`file:///${filePath}`);
      
      fs.unlinkSync(filePath);
      await this.reply([
        preview,
        '✅ 删除成功',
        `剩余数量：${files.length - 1}`
      ]);
    } catch (err) {
      this.reply('❌ 删除失败');
    }
  }

  /** 工具方法 */
  getImageList() {
    try {
      return fs.readdirSync(this.imageDir)
        .filter(file => this.allowedTypes.includes(path.extname(file).toLowerCase().slice(1)))
        .sort((a, b) => 
          fs.statSync(path.join(this.imageDir, a)).birthtimeMs - 
          fs.statSync(path.join(this.imageDir, b)).birthtimeMs
        );
    } catch (err) {
      return [];
    }
  }

  sanitizeName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
      .trim() || '未命名';
  }

  getFileExtension(contentType) {
    const map = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return map[contentType.toLowerCase()] || 'jpg';
  }

  errorTranslator(err) {
    const errors = {
      ECONNABORTED: '⏳ 下载超时',
      ENOTFOUND: '🌐 域名无法解析',
      invalid_content_type: '❌ 非图片文件',
      file_exists: '⚠️ 文件名已存在',
      HTTP_404: '🔗 图片不存在',
      HTTP_403: '🔒 无访问权限',
      invalid_type: (ext) => `❌ 不支持 ${ext} 格式文件`
    };
    
    if (err.message.startsWith('invalid_type')) {
      return errors.invalid_type(err.message.split(':')[1]);
    }
    return errors[err.message] || `未知错误：${err.message}`;
  }

  formatSize(bytes) {
    return bytes >= 1024 * 1024 
      ? `${(bytes / (1024 * 1024)).toFixed(1)}MB`
      : `${(bytes / 1024).toFixed(1)}KB`;
  }

  generateDefaultName() {
    return `图片_${Date.now().toString(36)}`;
  }

  generateFilenameFromUrl(url) {
    try {
      const pathname = new URL(url).pathname;
      return path.basename(pathname, path.extname(pathname)) || '网络图片';
    } catch {
      return '网络图片';
    }
  }

  usageGuide() {
    return [
      '📚 使用指南：',
      '方式1：发送图片后输入 &添加图片 名称',
      '方式2：输入 &添加图片 [图片URL] [名称]',
      '示例：',
      '  &添加图片 https://example.com/image.jpg 示例图片',
      '  &添加图片 本地图片名称',
      '⚠️ 注意事项：',
      `  • 最大支持 ${this.formatSize(this.maxFileSize)} 图片`,
      '  • 名称不能包含特殊字符'
    ].join('\n');
  }
}