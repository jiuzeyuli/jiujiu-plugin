import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

export class RandomImage extends plugin {
  constructor() {
    super({
      name: '终极图片管家',
      dsc: '支持本地上传、URL添加和引用添加的图片管理',
      event: 'message',
      priority: 999,
      rule: [
        { reg: '^&随机图片$', fnc: 'sendRandomImage' },
        { reg: '^&查看图片\\s+(\\d+)$', fnc: 'viewSpecificImage' },
        { reg: '^&重命名图片\\s+(\\d+)\\s+(.+)$', fnc: 'renameImage', permission: 'master' },
        { reg: '^&添加图片(?:\\s+(.+))?$', fnc: 'addImage', permission: 'master' },
        { reg: '^&图片列表$', fnc: 'listImages' },
        { reg: '^&删除图片\\s+(\\d+)$', fnc: 'deleteImage', permission: 'master' }
      ]
    });

    this.imageDir = path.join(process.cwd(), 'data/images');
    this.maxFileSize = 30 * 1024 * 1024; // 30MB限制
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

  /** 核心添加方法（三模式支持） */
  async addImage() {
    if (!this.e.isMaster) return this.reply('❌ 管理员专属功能');
    
    try {
      let imageUrl, customName;

      // 模式0：引用消息添加
      if (this.e.source) {
        const quotedMsg = await this.e.group.getMsg(this.e.source.seq);
        if (!quotedMsg) throw new Error('message_expired');
        imageUrl = quotedMsg.img?.[0];
        if (!imageUrl) throw new Error('no_image_in_quote');
        const [_, name] = this.e.msg.match(/^&添加图片\s*(.+)?$/) || [];
        customName = name || this.generateDefaultName();
      }
      
      // 模式1：本地上传
      if (!imageUrl && this.e.img?.[0]) {
        imageUrl = this.e.img[0];
        const [_, name] = this.e.msg.match(/^&添加图片\s*(.+)?$/) || [];
        customName = name || this.generateDefaultName();
      }
      
      // 模式2：URL添加
      if (!imageUrl) {
        const [_, url, name] = this.e.msg.match(/^&添加图片\s+(https?:\/\/\S+)(?:\s+(.+))?$/) || [];
        if (!url) throw new Error('invalid_input');
        imageUrl = url;
        customName = name || this.generateFilenameFromUrl(url);
      }

      // 统一处理流程
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
      timeout: 30000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
      maxContentLength: this.maxFileSize,
      validateStatus: status => status === 200 || status === 413
    });

    if (response.status === 413) throw new Error('HTTP_413');
    if (response.status !== 200) throw new Error(`HTTP_${response.status}`);
    
    const contentType = response.headers['content-type'];
    if (!contentType?.startsWith('image/')) throw new Error('invalid_content_type');

    const ext = this.getFileExtension(contentType);
    const filename = `${this.sanitizeName(name)}.${ext}`;
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
      const index = parseInt(this.e.msg.match(/^&查看图片\s+(\d+)$/)[1] - 1;
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
      const [_, numStr, newName] = this.e.msg.match(/^&重命名图片\s+(\d+)\s+(.+)$/);
      const index = parseInt(numStr) - 1;
      if (index < 0 || index >= files.length) return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);

      const cleanName = this.sanitizeName(newName);
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
      msg += '\n📌 使用指令：\n&随机图片 - 随机展示\n&查看图片 [编号] - 查看详情\n';
      
      if (this.e.isMaster) {
        msg += '\n⚙️ 管理指令：\n&添加图片 [名称/URL]\n&重命名图片 [编号] [新名]\n&删除图片 [编号]\n';
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
      const index = parseInt(this.e.msg.match(/^&删除图片\s+(\d+)$/)[1] - 1;
      if (index < 0 || index >= files.length) return this.reply(`❌ 编号错误，当前共 ${files.length} 张图片`);

      const filePath = path.join(this.imageDir, files[index]);
      const preview = segment.image(`file:///${filePath}`);
      fs.unlinkSync(filePath);
      await this.reply([preview, '✅ 删除成功', `剩余数量：${files.length - 1}`]);
    } catch (err) {
      this.reply('❌ 删除失败');
    }
  }

  // ====== 工具方法 ====== //
  getImageList() {
    try {
      return fs.readdirSync(this.imageDir)
        .filter(file => ['.jpg','.jpeg','.png','.gif','.webp'].includes(path.extname(file).toLowerCase()))
        .sort((a, b) => fs.statSync(path.join(this.imageDir, a)).birthtimeMs - fs.statSync(path.join(this.imageDir, b)).birthtimeMs);
    } catch (err) {
      return [];
    }
  }

  sanitizeName(name) {
    return name.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_').substring(0, 50).trim() || '未命名';
  }

  getFileExtension(contentType) {
    const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' };
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
      HTTP_413: '📦 文件超过30MB限制',
      message_expired: '⏳ 被引用的消息已过期',
      no_image_in_quote: '❌ 引用消息中无图片',
      invalid_input: '📝 指令格式错误'
    };
    return errors[err.message] || `未知错误：${err.message}`;
  }

  usageGuide() {
    return [
      '📚 使用指南：',
      '方式1：引用图片消息后发送 &添加图片 [名称]',
      '方式2：直接发送图片+指令 &添加图片 [名称]',
      '方式3：输入 &添加图片 [图片URL] [名称]',
      '示例：',
      '  • &添加图片 https://example.com/img.jpg 示例',
      '⚠️ 注意事项：',
      '  • 最大支持30MB图片',
      '  • 名称不能包含特殊字符',
      '  • 引用消息需在24小时内'
    ].join('\n');
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
}