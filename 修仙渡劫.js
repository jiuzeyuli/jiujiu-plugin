import fs from "fs";
import path from "path";
import schedule from "node-schedule";

export class UltimateCultivation extends plugin {
  constructor() {
    super({
      name: "终极修仙渡劫系统",
      dsc: "全方位修仙体验，包含境界突破、天劫挑战、宗门争霸等完整玩法",
      event: "message",
      priority: 9999,
      rule: [
        { reg: "^#修仙帮助$", fnc: "cultivationHelp" },
        { reg: "^#我的境界$", fnc: "checkCultivation" },
        { reg: "^#修炼$", fnc: "cultivate" },
        { reg: "^#突破$", fnc: "breakthrough" },
        { reg: "^#闭关\\s*(\\d+)?\\s*(天|时辰)?$", fnc: "seclusion" },
        { reg: "^#渡劫$", fnc: "tribulation" },
        { reg: "^#灵根测试$", fnc: "spiritRootTest" },
        { reg: "^#丹药图鉴$", fnc: "viewPills" },
        { reg: "^#炼丹\\s+(\\d+)$", fnc: "alchemy" },
        { reg: "^#服用丹药\\s+(\\d+)$", fnc: "takePill" },
        { reg: "^#修仙排行榜$", fnc: "cultivationRank" },
        { reg: "^#领悟功法$", fnc: "comprehendArt" },
        { reg: "^#奇遇$", fnc: "adventure" },
        { reg: "^#天劫信息$", fnc: "tribulationInfo" },
        { reg: "^#挑战秘境\\s*(\\d+)?$", fnc: "challengeDungeon" },
        { reg: "^#双修\\s*@?(\\d+)?$", fnc: "dualCultivation" },
        { reg: "^#炼制法宝\\s*(\\d+)?$", fnc: "forgeArtifact" },
        { reg: "^#装备法宝\\s*(\\d+)?$", fnc: "equipArtifact" },
        { reg: "^#法宝图鉴$", fnc: "viewArtifacts" },
        { reg: "^#宗门信息$", fnc: "sectInfo" },
        { reg: "^#加入宗门\\s*(\\S+)$", fnc: "joinSect" },
        { reg: "^#创建宗门\\s*(\\S+)$", fnc: "createSect" },
        {
          reg: "^#宗门管理\\s+(公告|解散|升级|传位)\\s*(.*)$",
          fnc: "sectManagement",
          permission: "master",
        },
        { reg: "^#每日签到$", fnc: "dailySign" },
        { reg: "^#领取俸禄$", fnc: "claimSalary" },
        { reg: "^#我的背包$", fnc: "viewInventory" },
        { reg: "^#使用物品\\s+(\\d+)$", fnc: "useItem" },
        { reg: "^#修仙商店$", fnc: "cultivationShop" },
        { reg: "^#购买\\s+(\\d+)\\s*(\\d+)?$", fnc: "buyItem" },
        { reg: "^#境界体系$", fnc: "realmSystem" },
        { reg: "^#功法大全$", fnc: "allArts" },
        { reg: "^#天劫大全$", fnc: "allTribulations" },
        { reg: "^#宗门列表$", fnc: "sectList" },
        { reg: "^#宗门排行$", fnc: "sectRank" },
        { reg: "^#宗门任务$", fnc: "sectMission" },
        { reg: "^#提交任务$", fnc: "submitMission" },
        { reg: "^#炼器$", fnc: "artifactRefining" },
        { reg: "^#渡劫准备$", fnc: "tribulationPreparation" },
      ],
    });

    // 修仙境界体系 - 30个详细境界
    this.realms = [
      "凡人",
      "炼气初期",
      "炼气中期",
      "炼气后期",
      "筑基初期",
      "筑基中期",
      "筑基后期",
      "金丹初期",
      "金丹中期",
      "金丹后期",
      "元婴初期",
      "元婴中期",
      "元婴后期",
      "化神初期",
      "化神中期",
      "化神后期",
      "炼虚初期",
      "炼虚中期",
      "炼虚后期",
      "合体初期",
      "合体中期",
      "合体后期",
      "大乘初期",
      "大乘中期",
      "大乘后期",
      "渡劫初期",
      "渡劫中期",
      "渡劫后期",
      "半步真仙",
      "真仙",
    ];

    // 灵根资质系统
    this.spiritRoots = [
      {
        id: 0,
        name: "废灵根",
        expRate: 0.5,
        alchemy: 0.3,
        breakthrough: 0.4,
        tribulation: 0.4,
      },
      {
        id: 1,
        name: "伪灵根",
        expRate: 0.7,
        alchemy: 0.5,
        breakthrough: 0.6,
        tribulation: 0.5,
      },
      {
        id: 2,
        name: "下品灵根",
        expRate: 0.9,
        alchemy: 0.7,
        breakthrough: 0.8,
        tribulation: 0.6,
      },
      {
        id: 3,
        name: "中品灵根",
        expRate: 1.0,
        alchemy: 0.9,
        breakthrough: 1.0,
        tribulation: 0.7,
      },
      {
        id: 4,
        name: "上品灵根",
        expRate: 1.2,
        alchemy: 1.1,
        breakthrough: 1.2,
        tribulation: 0.8,
      },
      {
        id: 5,
        name: "地灵根",
        expRate: 1.5,
        alchemy: 1.3,
        breakthrough: 1.4,
        tribulation: 0.9,
      },
      {
        id: 6,
        name: "天灵根",
        expRate: 1.8,
        alchemy: 1.5,
        breakthrough: 1.6,
        tribulation: 1.0,
      },
      {
        id: 7,
        name: "圣灵根",
        expRate: 2.0,
        alchemy: 1.8,
        breakthrough: 1.8,
        tribulation: 1.2,
      },
      {
        id: 8,
        name: "仙灵根",
        expRate: 2.5,
        alchemy: 2.0,
        breakthrough: 2.0,
        tribulation: 1.5,
      },
      {
        id: 9,
        name: "混沌灵根",
        expRate: 3.0,
        alchemy: 2.5,
        breakthrough: 2.5,
        tribulation: 2.0,
      },
    ];

    // 丹药系统
    this.pills = [
      {
        id: 1,
        name: "聚气丹",
        effect: "exp:100",
        cost: 50,
        desc: "增加100点修为",
        quality: 1,
        type: "cultivation",
      },
      {
        id: 2,
        name: "筑基丹",
        effect: "breakthrough:15",
        cost: 300,
        desc: "增加突破成功率15%",
        quality: 2,
        type: "breakthrough",
      },
      {
        id: 3,
        name: "凝金丹",
        effect: "exp:2000",
        cost: 1500,
        desc: "增加2000点修为",
        quality: 3,
        type: "cultivation",
      },
      {
        id: 4,
        name: "元婴丹",
        effect: "exp:10000",
        cost: 8000,
        desc: "增加10000点修为",
        quality: 4,
        type: "cultivation",
      },
      {
        id: 5,
        name: "渡劫丹",
        effect: "tribulation:20",
        cost: 50000,
        desc: "增加渡劫成功率20%",
        quality: 5,
        type: "tribulation",
      },
      {
        id: 6,
        name: "九转还魂丹",
        effect: "revive",
        cost: 100000,
        desc: "渡劫失败保命",
        quality: 6,
        type: "special",
      },
      {
        id: 7,
        name: "九转金丹",
        effect: "exp:500000",
        cost: 300000,
        desc: "大幅提升修为",
        quality: 7,
        type: "cultivation",
      },
      {
        id: 8,
        name: "太虚神丹",
        effect: "spirit_root",
        cost: 500000,
        desc: "永久提升灵根资质",
        quality: 8,
        type: "special",
      },
      {
        id: 9,
        name: "生生造化丹",
        effect: "life:50",
        cost: 2000,
        desc: "恢复50点生命",
        quality: 3,
        type: "recovery",
      },
      {
        id: 10,
        name: "悟道丹",
        effect: "comprehension:0.5",
        cost: 10000,
        desc: "提升悟性0.5",
        quality: 4,
        type: "special",
      },
    ];

    // 功法系统
    this.arts = [
      {
        id: 1,
        name: "《基础吐纳诀》",
        effect: "expRate:1.1",
        level: 1,
        cost: 0,
        desc: "基础修炼功法",
      },
      {
        id: 2,
        name: "《五行道法》",
        effect: "breakthrough:1.15",
        level: 2,
        cost: 500,
        desc: "提升突破成功率",
      },
      {
        id: 3,
        name: "《九天玄功》",
        effect: "expRate:1.3, alchemy:1.2",
        level: 3,
        cost: 2000,
        desc: "提升修炼和炼丹效率",
      },
      {
        id: 4,
        name: "《太虚剑意》",
        effect: "tribulation:1.2",
        level: 4,
        cost: 5000,
        desc: "增强渡劫能力",
      },
      {
        id: 5,
        name: "《大衍神诀》",
        effect: "expRate:1.5, luck:10",
        level: 5,
        cost: 10000,
        desc: "提升修炼效率和气运",
      },
      {
        id: 6,
        name: "《混沌经》",
        effect: "expRate:2.0, breakthrough:1.3",
        level: 6,
        cost: 50000,
        desc: "顶级修炼功法",
      },
      {
        id: 7,
        name: "《星辰变》",
        effect: "all:1.25",
        level: 7,
        cost: 100000,
        desc: "全面提升属性",
      },
      {
        id: 8,
        name: "《一气化三清》",
        effect: "expRate:2.5, tribulation:1.5",
        level: 8,
        cost: 500000,
        desc: "无上仙法",
      },
      {
        id: 9,
        name: "《不死神凰诀》",
        effect: "life:50, revive:1",
        level: 9,
        cost: 300000,
        desc: "增加生命和复活机会",
      },
      {
        id: 10,
        name: "《虚空经》",
        effect: "dungeon:1.3, adventure:1.5",
        level: 10,
        cost: 200000,
        desc: "增强秘境和奇遇收益",
      },
    ];

    // 法宝系统
    this.artifacts = [
      {
        id: 1,
        name: "青锋剑",
        effect: "突破成功率+5%",
        level: 1,
        cost: 500,
        type: "weapon",
        attr: "breakthrough:5",
      },
      {
        id: 2,
        name: "玄武盾",
        effect: "天劫伤害-10%",
        level: 2,
        cost: 1500,
        type: "armor",
        attr: "tribulation:10",
      },
      {
        id: 3,
        name: "神农鼎",
        effect: "炼丹成功率+15%",
        level: 3,
        cost: 5000,
        type: "tool",
        attr: "alchemy:15",
      },
      {
        id: 4,
        name: "昆仑镜",
        effect: "奇遇触发率+20%",
        level: 4,
        cost: 20000,
        type: "mystic",
        attr: "adventure:20",
      },
      {
        id: 5,
        name: "东皇钟",
        effect: "全属性+15%",
        level: 5,
        cost: 100000,
        type: "divine",
        attr: "all:15",
      },
      {
        id: 6,
        name: "诛仙剑阵",
        effect: "攻击类法宝效果翻倍",
        level: 6,
        cost: 500000,
        type: "weapon",
        attr: "weapon_effect:100",
      },
      {
        id: 7,
        name: "炼妖壶",
        effect: "秘境收益+30%",
        level: 5,
        cost: 80000,
        type: "tool",
        attr: "dungeon:30",
      },
      {
        id: 8,
        name: "伏羲琴",
        effect: "双修效果+50%",
        level: 4,
        cost: 30000,
        type: "mystic",
        attr: "dual:50",
      },
      {
        id: 9,
        name: "盘古斧",
        effect: "突破成功率+20%",
        level: 7,
        cost: 300000,
        type: "weapon",
        attr: "breakthrough:20",
      },
      {
        id: 10,
        name: "女娲石",
        effect: "生命上限+30%",
        level: 6,
        cost: 150000,
        type: "divine",
        attr: "life:30",
      },
    ];

    // 秘境系统
    this.dungeons = [
      {
        id: 1,
        name: "迷雾森林",
        minRealm: 0,
        rewards: "灵石+100~300，修为+50~150",
        difficulty: "简单",
      },
      {
        id: 2,
        name: "熔岩洞穴",
        minRealm: 4,
        rewards: "灵石+300~800，修为+200~500，低阶丹药",
        difficulty: "普通",
      },
      {
        id: 3,
        name: "幽冥地府",
        minRealm: 8,
        rewards: "灵石+1000~3000，修为+800~2000，中阶丹药",
        difficulty: "困难",
      },
      {
        id: 4,
        name: "九天仙宫",
        minRealm: 12,
        rewards: "灵石+5000~15000，修为+3000~8000，高阶丹药",
        difficulty: "极难",
      },
      {
        id: 5,
        name: "混沌虚空",
        minRealm: 20,
        rewards: "极品法宝，仙丹，稀有功法",
        difficulty: "地狱",
      },
    ];

    // 天劫系统
    this.tribulations = [
      {
        id: 1,
        name: "三九天劫",
        damage: 30,
        desc: "三重雷劫，每重九道天雷",
        level: 1,
        successRate: 60,
      },
      {
        id: 2,
        name: "六九天劫",
        damage: 50,
        desc: "六重雷劫，每重九道天雷",
        level: 2,
        successRate: 50,
      },
      {
        id: 3,
        name: "九九天劫",
        damage: 70,
        desc: "九重雷劫，每重九道天雷",
        level: 3,
        successRate: 40,
      },
      {
        id: 4,
        name: "心魔劫",
        damage: 40,
        desc: "引动心魔，道心不稳者极易陨落",
        level: 4,
        successRate: 45,
      },
      {
        id: 5,
        name: "业火劫",
        damage: 60,
        desc: "红莲业火焚身，净化因果业力",
        level: 5,
        successRate: 35,
      },
      {
        id: 6,
        name: "混沌劫",
        damage: 90,
        desc: "混沌神雷，毁天灭地",
        level: 6,
        successRate: 25,
      },
    ];

    // 商店物品
    this.shopItems = [
      {
        id: 1,
        name: "下品灵石袋",
        price: 100,
        effect: "stone:500",
        type: "resource",
        limit: 5,
      },
      {
        id: 2,
        name: "中品灵石袋",
        price: 500,
        effect: "stone:2500",
        type: "resource",
        limit: 3,
      },
      {
        id: 3,
        name: "上品灵石袋",
        price: 2000,
        effect: "stone:10000",
        type: "resource",
        limit: 1,
      },
      {
        id: 4,
        name: "聚气丹",
        price: 80,
        effect: "item:1",
        type: "pill",
        limit: 10,
      },
      {
        id: 5,
        name: "筑基丹",
        price: 400,
        effect: "item:2",
        type: "pill",
        limit: 5,
      },
      {
        id: 6,
        name: "炼器材料包",
        price: 300,
        effect: "refine:1",
        type: "material",
        limit: 3,
      },
      {
        id: 7,
        name: "气运符",
        price: 1500,
        effect: "luck:20",
        type: "buff",
        limit: 2,
      },
      {
        id: 8,
        name: "悟道茶",
        price: 2500,
        effect: "comprehension:1",
        type: "buff",
        limit: 1,
      },
      {
        id: 9,
        name: "宗门建设令",
        price: 5000,
        effect: "sect_exp:1000",
        type: "sect",
        limit: 1,
      },
      {
        id: 10,
        name: "随机功法卷轴",
        price: 10000,
        effect: "random_art",
        type: "special",
        limit: 1,
      },
    ];

    // 宗门职位体系
    this.sectTitles = [
      { id: 1, name: "外门弟子", salary: 100, authority: 0 },
      { id: 2, name: "内门弟子", salary: 200, authority: 1 },
      { id: 3, name: "核心弟子", salary: 300, authority: 2 },
      { id: 4, name: "执事", salary: 400, authority: 3 },
      { id: 5, name: "长老", salary: 600, authority: 4 },
      { id: 6, name: "护法", salary: 800, authority: 5 },
      { id: 7, name: "副宗主", salary: 1200, authority: 6 },
      { id: 8, name: "宗主", salary: 2000, authority: 10 },
    ];

    // 宗门任务
    this.sectMissions = [
      {
        id: 1,
        name: "采集灵草",
        requirement: "collect_herb",
        reward: "贡献+50, 灵石+200",
        difficulty: "简单",
      },
      {
        id: 2,
        name: "剿灭妖兽",
        requirement: "kill_monster",
        reward: "贡献+100, 灵石+500",
        difficulty: "普通",
      },
      {
        id: 3,
        name: "守卫矿脉",
        requirement: "defend_mine",
        reward: "贡献+200, 灵石+1000",
        difficulty: "困难",
      },
      {
        id: 4,
        name: "探索遗迹",
        requirement: "explore_ruin",
        reward: "贡献+500, 灵石+3000, 随机丹药",
        difficulty: "极难",
      },
      {
        id: 5,
        name: "炼制法宝",
        requirement: "forge_artifact",
        reward: "贡献+1000, 灵石+8000, 宗门经验+500",
        difficulty: "地狱",
      },
    ];

    // 数据存储路径
    this.dataPath = path.join(process.cwd(), "data/cultivation_data");
    this.userDataFile = path.join(this.dataPath, "user_data.json");
    this.sectDataFile = path.join(this.dataPath, "sect_data.json");

    // 初始化数据存储
    this.initStorage();
    this.loadData();

    // 定时任务
    schedule.scheduleJob("0 0 0 * * *", () => this.dailyReset());
    schedule.scheduleJob("0 0 0 * * 1", () => this.weeklyReset());
  }

  /** 初始化存储 */
  initStorage() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }

    if (!fs.existsSync(this.userDataFile)) {
      fs.writeFileSync(this.userDataFile, "{}");
    }

    if (!fs.existsSync(this.sectDataFile)) {
      fs.writeFileSync(this.sectDataFile, "{}");
    }
  }

  /** 加载数据 */
  loadData() {
    try {
      this.userData = JSON.parse(fs.readFileSync(this.userDataFile, "utf8"));
      this.sects = JSON.parse(fs.readFileSync(this.sectDataFile, "utf8"));
    } catch (err) {
      console.error("修仙数据加载失败:", err);
      this.userData = {};
      this.sects = {};
    }
  }

  /** 保存数据 */
  saveData() {
    fs.writeFileSync(this.userDataFile, JSON.stringify(this.userData, null, 2));
    fs.writeFileSync(this.sectDataFile, JSON.stringify(this.sects, null, 2));
  }

  /** 获取用户修仙数据 */
  getUserData(userId) {
    if (!this.userData[userId]) {
      this.userData[userId] = {
        realm: 0, // 当前境界
        exp: 0, // 当前修为
        maxExp: 100, // 当前境界最大修为
        spiritRoot: 0, // 灵根资质
        pills: {}, // 丹药库存 {id: count}
        arts: [1], // 已领悟功法ID
        artifacts: [], // 拥有的法宝ID
        equippedArtifact: null, // 装备的法宝ID
        lastCultivate: 0, // 上次修炼时间
        lastSeclusion: 0, // 上次闭关时间
        lastDungeon: 0, // 上次挑战秘境时间
        life: 100, // 生命值
        maxLife: 100, // 最大生命值
        tribulationCount: 0, // 渡劫次数
        successCount: 0, // 成功次数
        stone: 100, // 灵石
        luck: 50, // 气运值
        lastAdventure: 0, // 上次奇遇时间
        lastSign: 0, // 上次签到时间
        signStreak: 0, // 连续签到次数
        sect: null, // 所属宗门ID
        title: 1, // 宗门职位ID
        contribution: 0, // 宗门贡献
        comprehension: 1, // 悟性
        daoHeart: 1, // 道心
        combatPower: 5, // 战斗力
        lastSalary: 0, // 上次领取俸禄时间
        inventory: {}, // 背包物品 {id: count}
        currentMission: null, // 当前宗门任务
        lastRefine: 0, // 上次炼器时间
        rebirthCount: 0, // 转世次数
      };
    }
    return this.userData[userId];
  }

  /** 每日重置 */
  dailyReset() {
    Object.keys(this.userData).forEach((userId) => {
      const user = this.userData[userId];
      user.luck = Math.min(100, user.luck + 10);
      user.life = Math.min(user.maxLife, user.life + 30);

      // 宗门每日福利
      if (user.sect && this.sects[user.sect]) {
        const sect = this.sects[user.sect];
        const title = this.sectTitles.find((t) => t.id === user.title);
        if (title) {
          user.stone += title.salary;
        }
      }

      // 重置每日购买限制
      if (user.shopLimits) {
        Object.keys(user.shopLimits).forEach((itemId) => {
          user.shopLimits[itemId] = 0;
        });
      }
    });
    this.saveData();
  }

  /** 每周重置 */
  weeklyReset() {
    Object.keys(this.sects).forEach((sectId) => {
      const sect = this.sects[sectId];
      sect.funds += sect.members.length * 500;
    });
    this.saveData();
  }

  /** 帮助信息 */
  async cultivationHelp() {
    const helpMsg = [
      "🌌 终极修仙渡劫系统",
      "================================",
      "🏮 基础指令：",
      "#每日签到 - 每日领取资源 (冷却: 无)",
      "#修炼 - 日常修炼增加修为 (冷却: 5分钟)",
      "#突破 - 尝试突破到下一境界 (冷却: 无)",
      "#渡劫 - 境界圆满后渡劫飞升 (冷却: 无)",
      "#我的境界 - 查看当前修仙状态 (冷却: 无)",
      "#灵根测试 - 检测自身灵根资质 (冷却: 无)",
      "",
      "💰 资源获取：",
      "#领取俸禄 - 领取宗门俸禄 (需加入宗门, 冷却: 无)",
      "#奇遇 - 探索修仙界获取资源 (冷却: 2小时)",
      "#挑战秘境 [层级] - 挑战秘境获取资源 (冷却: 1小时)",
      "#修仙商店 - 查看修仙商店 (冷却: 无)",
      "#购买 [物品ID] [数量] - 购买物品 (冷却: 无)",
      "",
      "📦 物品系统：",
      "#我的背包 - 查看背包物品 (冷却: 无)",
      "#使用物品 [物品ID] - 使用物品 (冷却: 无)",
      "#丹药图鉴 - 查看所有丹药 (冷却: 无)",
      "#法宝图鉴 - 查看所有法宝 (冷却: 无)",
      "",
      "🔮 进阶指令：",
      "#闭关 [时间] - 长时间闭关修炼 (冷却: 6小时)",
      "#炼丹 [丹药ID] - 炼制丹药 (冷却: 无)",
      "#服用丹药 [丹药ID] - 使用丹药 (冷却: 无)",
      "#领悟功法 - 尝试领悟新功法 (冷却: 无)",
      "#渡劫准备 - 查看渡劫准备情况 (冷却: 无)",
      "#天劫信息 - 查看天劫系统 (冷却: 无)",
      "#境界体系 - 查看所有境界 (冷却: 无)",
      "#功法大全 - 查看所有功法 (冷却: 无)",
      "",
      "⚔️ 法宝系统：",
      "#炼制法宝 [ID] - 炼制法宝 (冷却: 无)",
      "#装备法宝 [ID] - 装备法宝 (冷却: 无)",
      "#炼器 - 炼制随机法宝 (冷却: 12小时)",
      "",
      "👥 宗门系统：",
      "#宗门信息 - 查看宗门信息 (冷却: 无)",
      "#加入宗门 [名称] - 加入宗门 (冷却: 无)",
      "#创建宗门 [名称] - 创建新宗门 (冷却: 无)",
      "#宗门列表 - 查看所有宗门 (冷却: 无)",
      "#宗门排行 - 宗门实力排行榜 (冷却: 无)",
      "#宗门任务 - 接取宗门任务 (冷却: 无)",
      "#提交任务 - 提交当前任务 (冷却: 无)",
      "#宗门管理 [命令] - 管理宗门 (宗主专用)",
      "================================",
      "💡 提示：输入 #修仙帮助 查看详细指令说明",
      "💎 灵石获取途径：签到、俸禄、秘境、奇遇、任务、商店",
    ].join("\n");
    await this.reply(helpMsg);
  }

  /** 每日签到 */
  async dailySign() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();
    const today = new Date(now).toDateString();
    const lastSignDate = user.lastSign
      ? new Date(user.lastSign).toDateString()
      : null;

    // 检查是否已签到
    if (lastSignDate === today) {
      return this.reply("❌ 今日已签到，请明日再来");
    }

    // 计算连续签到
    const oneDay = 24 * 60 * 60 * 1000;
    const isConsecutive = user.lastSign && now - user.lastSign < 2 * oneDay;

    if (isConsecutive) {
      user.signStreak += 1;
    } else {
      user.signStreak = 1;
    }

    // 基础奖励
    let stoneReward = 200 + user.realm * 30;
    let expReward = 100 + user.realm * 20;
    let luckReward = 5;
    let extraMsg = "";

    // 连续签到奖励
    if (user.signStreak >= 7) {
      stoneReward *= 2;
      expReward *= 2;
      luckReward = 10;
      extraMsg = "🎁 连续签到7天奖励翻倍！";
    } else if (user.signStreak >= 3) {
      stoneReward = Math.floor(stoneReward * 1.5);
      expReward = Math.floor(expReward * 1.5);
      luckReward = 8;
      extraMsg = "🎁 连续签到3天奖励提升50%！";
    }

    // 气运加成
    const luckBonus = Math.floor(user.luck / 10);
    stoneReward += luckBonus * 20;
    expReward += luckBonus * 10;

    // 随机额外奖励
    let randomReward = "";
    const rand = Math.random();
    if (rand < 0.2) {
      // 20%概率获得丹药
      const pillId = Math.min(5, Math.floor(Math.random() * 3) + 1);
      this.addToInventory(user, `pill_${pillId}`, 1);
      randomReward = `，额外获得 ${this.pills[pillId - 1].name}×1`;
    } else if (rand < 0.3) {
      // 10%概率获得法宝
      const artifactId = Math.min(3, Math.floor(Math.random() * 2) + 1);
      if (!user.artifacts.includes(artifactId)) {
        user.artifacts.push(artifactId);
        randomReward = `，获得法宝 ${this.artifacts[artifactId - 1].name}！`;
      }
    }

    // 更新用户数据
    user.stone += stoneReward;
    user.exp += expReward;
    user.luck = Math.min(100, user.luck + luckReward);
    user.lastSign = now;

    this.saveData();

    await this.reply(
      [
        "🎉 签到成功！获得修仙资源：",
        `💎 灵石 +${stoneReward}`,
        `✨ 修为 +${expReward}`,
        `🍀 气运 +${luckReward}`,
        `📅 连续签到：${user.signStreak}天`,
        extraMsg,
        randomReward,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  /** 领取俸禄 */
  async claimSalary() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法领取俸禄");
    }

    const now = Date.now();
    const lastSalaryDate = user.lastSalary
      ? new Date(user.lastSalary).toDateString()
      : null;
    const today = new Date(now).toDateString();

    if (lastSalaryDate === today) {
      return this.reply("❌ 今日俸禄已领取，请明日再来");
    }

    const sect = this.sects[user.sect];
    if (!sect) {
      return this.reply("❌ 宗门数据异常，无法领取俸禄");
    }

    // 获取职位信息
    const title = this.sectTitles.find((t) => t.id === user.title);
    if (!title) {
      return this.reply("❌ 职位数据异常，无法领取俸禄");
    }

    // 基础俸禄
    let salary = title.salary;

    // 宗门等级加成
    salary *= sect.level;

    // 个人贡献加成
    const contributionBonus = Math.min(1.0, user.contribution / 1000);
    salary = Math.floor(salary * (1 + contributionBonus));

    // 更新数据
    user.stone += salary;
    user.lastSalary = now;
    user.contribution += 50; // 每日领取俸禄增加贡献

    this.saveData();

    await this.reply(
      [
        `🏯 成功领取 ${sect.name} 俸禄！`,
        `🎖️ 职位：${title.name}`,
        `💎 灵石 +${salary}`,
        `📊 贡献加成：${Math.floor(contributionBonus * 100)}%`,
        `🎖️ 宗门贡献 +50`,
      ].join("\n")
    );
  }

  /** 查看背包 */
  async viewInventory() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.inventory || Object.keys(user.inventory).length === 0) {
      return this.reply("📭 你的背包空空如也");
    }

    let msg = ["📦 背包物品："];

    // 显示丹药
    const pills = Object.keys(user.inventory)
      .filter((id) => id.startsWith("pill_"))
      .map((id) => {
        const pillId = parseInt(id.split("_")[1]);
        const pill = this.pills.find((p) => p.id === pillId);
        return pill
          ? `💊 ${pill.name} [ID: ${id}] ×${user.inventory[id]}`
          : null;
      })
      .filter(Boolean);

    if (pills.length > 0) {
      msg.push("【丹药】", ...pills);
    }

    // 显示材料
    const materials = Object.keys(user.inventory)
      .filter((id) => id.startsWith("mat_"))
      .map((id) => {
        const matId = id.split("_")[1];
        const count = user.inventory[id];
        return `📦 ${this.getMaterialName(matId)} [ID: ${id}] ×${count}`;
      });

    if (materials.length > 0) {
      msg.push("【材料】", ...materials);
    }

    // 显示其他物品
    const others = Object.keys(user.inventory)
      .filter((id) => !id.startsWith("pill_") && !id.startsWith("mat_"))
      .map(
        (id) => `🎁 ${this.getItemName(id)} [ID: ${id}] ×${user.inventory[id]}`
      );

    if (others.length > 0) {
      msg.push("【其他】", ...others);
    }

    msg.push("", "💡 使用 #使用物品 [物品ID] 使用物品");
    msg.push("💡 物品ID可在物品名称后查看");

    await this.reply(msg.join("\n"));
  }

  /** 使用物品 */
  async useItem() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#使用物品\s+(\S+)$/);

    if (!match) {
      return this.reply("❌ 格式错误，请使用 #使用物品 [物品ID]");
    }

    const itemId = match[1];

    if (
      !user.inventory ||
      !user.inventory[itemId] ||
      user.inventory[itemId] <= 0
    ) {
      return this.reply("❌ 没有此物品或物品数量不足");
    }

    // 减少物品数量
    user.inventory[itemId] -= 1;
    if (user.inventory[itemId] <= 0) {
      delete user.inventory[itemId];
    }

    let effectMsg = "";

    // 根据物品类型应用效果
    if (itemId.startsWith("pill_")) {
      const pillId = parseInt(itemId.split("_")[1]);
      const pill = this.pills.find((p) => p.id === pillId);
      if (pill) {
        // 应用丹药效果
        if (pill.effect.startsWith("exp:")) {
          const exp = parseInt(pill.effect.split(":")[1]);
          user.exp += exp;
          effectMsg = `✨ 修为 +${exp}`;
        } else if (pill.effect === "spirit_root") {
          if (user.spiritRoot < this.spiritRoots.length - 1) {
            user.spiritRoot += 1;
            const root = this.spiritRoots[user.spiritRoot];
            effectMsg = `🌱 灵根提升至：${root.name}`;
          } else {
            effectMsg = "✅ 灵根已达最高等级";
          }
        } else if (pill.effect.startsWith("life:")) {
          const life = parseInt(pill.effect.split(":")[1]);
          user.life = Math.min(user.maxLife, user.life + life);
          effectMsg = `❤️ 生命值 +${life}`;
        }
      }
    } else if (itemId.startsWith("buff_")) {
      // 应用buff效果
      effectMsg = "🛡️ 获得特殊效果，持续24小时";
    }

    this.saveData();

    await this.reply(
      [
        `✅ 使用物品成功！`,
        effectMsg,
        `📦 剩余数量：${user.inventory[itemId] || 0}`,
      ].join("\n")
    );
  }

  /** 修仙商店 */
  async cultivationShop() {
    const shopList = this.shopItems
      .map(
        (item) =>
          `${item.id}. ${item.name} - ${item.desc || "无描述"}\n  价格: ${
            item.price
          }灵石 | 类型: ${item.type} | 限购: ${item.limit || "无"}`
      )
      .join("\n\n");

    await this.reply(
      [
        "🏪 修仙商店",
        "================================",
        shopList,
        "================================",
        "使用 #购买 [物品ID] [数量] 购买物品",
        `💎 你的灵石数量: ${this.getUserData(this.e.user_id).stone || 0}`,
      ].join("\n")
    );
  }

  /** 购买物品 */
  async buyItem() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#购买\s+(\d+)\s*(\d+)?$/);

    if (!match) {
      return this.reply("❌ 格式错误，请使用 #购买 [物品ID] [数量]");
    }

    const itemId = parseInt(match[1]);
    const quantity = match[2] ? parseInt(match[2]) : 1;

    const shopItem = this.shopItems.find((i) => i.id === itemId);
    if (!shopItem) {
      return this.reply("❌ 商品不存在");
    }

    // 检查购买限制
    if (shopItem.limit) {
      if (!user.shopLimits) user.shopLimits = {};
      const bought = user.shopLimits[itemId] || 0;
      if (bought + quantity > shopItem.limit) {
        return this.reply(
          `❌ 超过购买限制，今日还可购买 ${shopItem.limit - bought} 个`
        );
      }
    }

    // 计算总价
    const totalPrice = shopItem.price * quantity;
    if (user.stone < totalPrice) {
      return this.reply(
        `❌ 灵石不足！需要 ${totalPrice} 灵石，当前只有 ${user.stone} 灵石`
      );
    }

    // 扣除灵石
    user.stone -= totalPrice;

    // 记录购买限制
    if (shopItem.limit) {
      user.shopLimits[itemId] = (user.shopLimits[itemId] || 0) + quantity;
    }

    // 添加物品到背包
    if (shopItem.effect.startsWith("item:")) {
      const pillId = parseInt(shopItem.effect.split(":")[1]);
      this.addToInventory(user, `pill_${pillId}`, quantity);
    } else if (shopItem.effect.startsWith("stone:")) {
      const stone = parseInt(shopItem.effect.split(":")[1]) * quantity;
      user.stone += stone;
    } else {
      this.addToInventory(user, shopItem.effect, quantity);
    }

    this.saveData();

    await this.reply(
      [
        `🛒 购买成功！`,
        `✅ 获得 ${shopItem.name} ×${quantity}`,
        `💎 消耗灵石：${totalPrice}`,
        `📦 当前灵石：${user.stone}`,
      ].join("\n")
    );
  }

  /** 添加物品到背包 */
  addToInventory(user, itemId, quantity = 1) {
    if (!user.inventory) user.inventory = {};
    user.inventory[itemId] = (user.inventory[itemId] || 0) + quantity;
  }

  /** 查看境界体系 */
  async realmSystem() {
    const realmList = this.realms
      .map(
        (realm, index) =>
          `${index + 1}. ${realm}${
            index === 0
              ? " (初始境界)"
              : index === this.realms.length - 1
              ? " (最高境界)"
              : ""
          }`
      )
      .join("\n");

    await this.reply(
      [
        "🌌 修仙境界体系",
        "================================",
        "境界共分30层，每层突破需积累修为：",
        realmList,
        "================================",
        "💡 境界越高，实力越强，可探索更多秘境",
      ].join("\n")
    );
  }

  /** 查看功法大全 */
  async allArts() {
    const artList = this.arts
      .map(
        (art) =>
          `${art.id}. ${art.name} - ${art.desc}\n  效果: ${art.effect} | 境界要求: ${art.level} | 参悟消耗: ${art.cost}灵石`
      )
      .join("\n\n");

    await this.reply(
      [
        "📚 功法大全",
        "================================",
        artList,
        "================================",
        "💡 使用 #领悟功法 随机领悟新功法",
      ].join("\n")
    );
  }

  /** 查看天劫大全 */
  async allTribulations() {
    const tribulationList = this.tribulations
      .map(
        (t) =>
          `${t.id}. ${t.name} - ${t.desc}\n  伤害: ${t.damage}% | 基础成功率: ${t.successRate}% | 境界要求: ${t.level}`
      )
      .join("\n\n");

    await this.reply(
      [
        "⚡ 天劫大全",
        "================================",
        "渡劫是修仙路上的重要考验，不同天劫有不同特点：",
        tribulationList,
        "================================",
        "💡 使用 #渡劫准备 查看当前天劫信息",
      ].join("\n")
    );
  }

  /** 查看宗门列表 */
  async sectList() {
    if (Object.keys(this.sects).length === 0) {
      return this.reply("📭 尚无宗门创建");
    }

    const sectList = Object.values(this.sects)
      .map(
        (sect) =>
          `🏯 ${sect.name} (Lv.${sect.level}) - 成员: ${sect.members.length}人 - 宗主: ${sect.leaderName}`
      )
      .join("\n");

    await this.reply(
      [
        "🏯 宗门列表",
        "================================",
        sectList,
        "================================",
        "💡 使用 #加入宗门 [名称] 加入宗门",
      ].join("\n")
    );
  }

  /** 宗门排行 */
  async sectRank() {
    if (Object.keys(this.sects).length === 0) {
      return this.reply("📭 尚无宗门创建");
    }

    const rankedSects = Object.values(this.sects)
      .sort(
        (a, b) => b.level * 1000 + b.prestige - (a.level * 1000 + a.prestige)
      )
      .slice(0, 10);

    const sectList = rankedSects
      .map(
        (sect, index) =>
          `${index + 1}. ${sect.name} (Lv.${sect.level}) ⭐${
            sect.prestige
          } - 成员: ${sect.members.length}人`
      )
      .join("\n");

    await this.reply(
      [
        "🏆 宗门排行榜",
        "================================",
        sectList,
        "================================",
        "💡 宗门等级和声望决定排名",
      ].join("\n")
    );
  }

  /** 查看法宝图鉴 */
  async viewArtifacts() {
    const artifactList = this.artifacts
      .map(
        (a) =>
          `${a.id}. ${a.name} - ${a.effect}\n  类型: ${a.type} | 境界要求: ${a.level} | 炼制消耗: ${a.cost}灵石`
      )
      .join("\n\n");

    await this.reply(
      [
        "🔮 法宝图鉴",
        "================================",
        artifactList,
        "================================",
        "💡 使用 #炼制法宝 [ID] 炼制法宝",
      ].join("\n")
    );
  }

  /** 宗门管理 */
  async sectManagement() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 你未加入任何宗门");
    }

    const sect = this.sects[user.sect];
    if (!sect) {
      return this.reply("❌ 宗门数据异常");
    }

    // 检查是否为宗主
    if (sect.leader !== userId) {
      return this.reply("❌ 只有宗主可以进行管理");
    }

    const match = this.e.msg.match(
      /^#宗门管理\s+(公告|解散|升级|传位)\s*(.*)$/
    );
    const command = match[1];
    const param = match[2].trim();

    switch (command) {
      case "公告":
        sect.notice = param.substring(0, 100);
        this.saveData();
        await this.reply(`✅ 宗门公告已更新：\n${sect.notice}`);
        break;

      case "解散":
        if (param !== "确认") {
          return this.reply("❌ 请使用 #宗门管理 解散 确认 来解散宗门");
        }
        // 解散宗门
        delete this.sects[user.sect];
        Object.keys(this.userData).forEach((uid) => {
          if (this.userData[uid].sect === user.sect) {
            this.userData[uid].sect = null;
            this.userData[uid].title = 1;
          }
        });
        this.saveData();
        await this.reply("⚠️ 宗门已解散！");
        break;

      case "升级":
        const cost = sect.level * 5000;
        if (sect.funds < cost) {
          return this.reply(
            `❌ 升级需要 ${cost} 灵石，当前资金: ${sect.funds}`
          );
        }
        sect.funds -= cost;
        sect.level += 1;
        this.saveData();
        await this.reply(`🎉 宗门升级成功！当前等级: Lv.${sect.level}`);
        break;

      case "传位":
        const targetUser = this.getUserData(param);
        if (!targetUser || targetUser.sect !== user.sect) {
          return this.reply("❌ 目标用户不存在或不在本宗门");
        }
        sect.leader = param;
        sect.leaderName = this.e.sender.card || this.e.sender.nickname;
        user.title = 7; // 设为副宗主
        targetUser.title = 8; // 设为宗主
        this.saveData();
        await this.reply(`👑 已将宗主之位传给 ${param}`);
        break;

      default:
        await this.reply("❌ 未知管理命令");
    }
  }

  /** 宗门任务 */
  async sectMission() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法接取任务");
    }

    if (user.currentMission) {
      return this.reply("❌ 你已有进行中的任务，请先完成");
    }

    // 随机选择一个任务
    const mission =
      this.sectMissions[Math.floor(Math.random() * this.sectMissions.length)];
    user.currentMission = mission.id;

    this.saveData();

    await this.reply(
      [
        `📜 接取宗门任务成功！`,
        `✅ 任务名称: ${mission.name}`,
        `📝 任务要求: ${mission.requirement}`,
        `🎁 任务奖励: ${mission.reward}`,
        `⚠️ 难度: ${mission.difficulty}`,
        `💡 完成后来 #提交任务`,
      ].join("\n")
    );
  }

  /** 提交任务 */
  async submitMission() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法提交任务");
    }

    if (!user.currentMission) {
      return this.reply("❌ 没有进行中的任务");
    }

    const sect = this.sects[user.sect];
    if (!sect) {
      return this.reply("❌ 宗门数据异常");
    }

    const mission = this.sectMissions.find((m) => m.id === user.currentMission);
    if (!mission) {
      return this.reply("❌ 任务数据异常");
    }

    // 根据难度给予奖励
    let stoneReward = 0;
    let contribReward = 0;

    switch (mission.difficulty) {
      case "简单":
        stoneReward = 200;
        contribReward = 50;
        break;
      case "普通":
        stoneReward = 500;
        contribReward = 100;
        break;
      case "困难":
        stoneReward = 1000;
        contribReward = 200;
        break;
      case "极难":
        stoneReward = 3000;
        contribReward = 500;
        break;
      case "地狱":
        stoneReward = 8000;
        contribReward = 1000;
        break;
    }

    // 额外奖励
    let extraMsg = "";
    if (Math.random() < 0.3) {
      const pillId = Math.floor(Math.random() * 5) + 1;
      this.addToInventory(user, `pill_${pillId}`, 1);
      extraMsg = `，额外获得 ${this.pills[pillId - 1].name}×1`;
    }

    // 更新数据
    user.stone += stoneReward;
    user.contribution += contribReward;
    sect.funds += Math.floor(stoneReward / 2);
    sect.prestige += Math.floor(contribReward / 10);
    user.currentMission = null;

    this.saveData();

    await this.reply(
      [
        `✅ 任务完成！`,
        `💎 获得灵石: ${stoneReward}`,
        `🎖️ 获得贡献: ${contribReward}`,
        `🏯 宗门声望 +${Math.floor(contribReward / 10)}`,
        mission.difficulty === "地狱"
          ? `🎉 完成高难度任务${extraMsg}`
          : extraMsg,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  /** 炼器 */
  async artifactRefining() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 冷却时间12小时
    if (now - user.lastRefine < 12 * 60 * 60 * 1000) {
      const remaining = Math.ceil(
        (12 * 60 * 60 * 1000 - (now - user.lastRefine)) / 3600000
      );
      return this.reply(`⏳ 炼器需准备，请${remaining}小时后再试`);
    }

    // 消耗灵石
    const cost = 5000;
    if (user.stone < cost) {
      return this.reply(`❌ 炼器需要 ${cost} 灵石`);
    }

    user.stone -= cost;
    user.lastRefine = now;

    // 炼器结果
    const successRate = 60 + user.spiritRoot * 5 + Math.floor(user.luck / 10);
    const success = Math.random() * 100 < successRate;

    if (success) {
      // 成功 - 获得随机法宝
      const availableArtifacts = this.artifacts.filter(
        (a) => a.level <= user.realm && !user.artifacts.includes(a.id)
      );

      if (availableArtifacts.length > 0) {
        const artifact =
          availableArtifacts[
            Math.floor(Math.random() * availableArtifacts.length)
          ];
        user.artifacts.push(artifact.id);

        await this.reply(
          [
            `🔥 炼器成功！`,
            `🔮 获得法宝: ${artifact.name}`,
            `📊 效果: ${artifact.effect}`,
            `💎 消耗灵石: ${cost}`,
          ].join("\n")
        );
      } else {
        // 没有可获得的法宝，给予灵石补偿
        const compensation = cost * 2;
        user.stone += compensation;

        await this.reply(
          [
            `🔥 炼器成功，但未获得新法宝`,
            `💎 获得灵石补偿: ${compensation}`,
            `💡 提示: 提升境界可解锁更多法宝`,
          ].join("\n")
        );
      }
    } else {
      // 失败 - 获得炼器材料
      const materials = ["玄铁", "精金", "星辰沙", "凤凰羽", "龙鳞"];
      const mat = materials[Math.floor(Math.random() * materials.length)];
      const matCount = 3 + Math.floor(Math.random() * 5);

      this.addToInventory(user, `mat_${mat}`, matCount);

      await this.reply(
        [
          `💥 炼器失败！`,
          `📦 获得材料: ${mat} ×${matCount}`,
          `💎 消耗灵石: ${cost}`,
          `💡 下次炼器成功率提升10%`,
        ].join("\n")
      );
    }

    this.saveData();
  }

  /** 获取材料名称 */
  getMaterialName(matId) {
    const materials = {
      玄铁: "玄铁矿石",
      精金: "精金矿",
      星辰沙: "星辰沙",
      凤凰羽: "凤凰羽毛",
      龙鳞: "龙鳞",
      灵玉: "灵玉",
      天蚕丝: "天蚕丝",
    };
    return materials[matId] || matId;
  }

  /** 获取物品名称 */
  getItemName(itemId) {
    if (itemId.startsWith("pill_")) {
      const pillId = parseInt(itemId.split("_")[1]);
      const pill = this.pills.find((p) => p.id === pillId);
      return pill ? pill.name : "未知丹药";
    }
    if (itemId.startsWith("mat_")) {
      return this.getMaterialName(itemId.split("_")[1]);
    }
    return "未知物品";
  }

  /** 查看天劫信息 */
  async tribulationInfo() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (user.realm < this.realms.length - 3) {
      return this.reply("❌ 境界不足！至少需要渡劫初期才可查看天劫信息");
    }

    // 随机选择天劫类型
    const tribulationType =
      this.tribulations[Math.floor(Math.random() * this.tribulations.length)];

    // 计算成功率
    const baseRate = tribulationType.successRate;
    const pillBonus = user.pills[5] ? user.pills[5] * 5 : 0; // 渡劫丹加成
    const luckBonus = Math.floor(user.luck / 3);
    const daoHeartBonus = user.daoHeart * 8;

    // 功法加成
    let artBonus = 0;
    user.arts.forEach((artId) => {
      const art = this.arts.find((a) => a.id === artId);
      if (art && art.effect.includes("tribulation")) {
        artBonus += 15;
      }
    });

    // 法宝加成
    let artifactBonus = 0;
    if (user.equippedArtifact) {
      const artifact = this.artifacts.find(
        (a) => a.id === user.equippedArtifact
      );
      if (artifact && artifact.effect.includes("天劫伤害")) {
        artifactBonus = 10;
      }
    }

    const successRate = Math.min(
      95,
      baseRate +
        pillBonus +
        luckBonus +
        daoHeartBonus +
        artBonus +
        artifactBonus
    );

    const msg = [
      `⚡ 天劫预兆：${tribulationType.name}`,
      `📜 ${tribulationType.desc}`,
      `💔 预计伤害：${tribulationType.damage}%生命值`,
      `✅ 当前渡劫成功率：${successRate}%`,
      `🍀 气运值：${user.luck}/100`,
      `💖 道心：${user.daoHeart.toFixed(1)}/10`,
      `🔮 渡劫丹：${user.pills[5] || 0}枚`,
      `📜 护体功法：${artBonus > 0 ? "已掌握" : "未掌握"}`,
      `🔧 护身法宝：${artifactBonus > 0 ? "已装备" : "未装备"}`,
      `💡 使用 #渡劫准备 查看详细准备建议`,
    ];

    await this.reply(msg.join("\n"));
  }

  /** 渡劫准备 */
  async tribulationPreparation() {
    const advice = [
      "🌟 渡劫准备建议：",
      "1. 确保生命值全满（使用 #修炼 或丹药恢复）",
      "2. 准备足够的渡劫丹（#炼丹 5）",
      "3. 装备护身法宝（#装备法宝）",
      "4. 学习护体功法（#领悟功法）",
      "5. 提升气运值（#奇遇 或使用气运符）",
      "6. 道心稳固（通过突破失败积累道心）",
      "",
      "💎 推荐资源：",
      "  - 渡劫丹：增加20%成功率/枚",
      "  - 玄武盾：减少10%天劫伤害",
      "  - 《太虚剑意》：提升20%渡劫成功率",
      "  - 九转还魂丹：渡劫失败保命",
      "",
      "⚠️ 警告：渡劫失败可能导致境界跌落！",
    ];

    await this.reply(advice.join("\n"));
  }

  /** 修炼功能 */
  async cultivate() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 检查修炼CD（5分钟）
    if (now - user.lastCultivate < 5 * 60 * 1000) {
      const remaining = Math.ceil(
        (5 * 60 * 1000 - (now - user.lastCultivate)) / 1000
      );
      return this.reply(`🕒 修炼需调息，请${remaining}秒后再试`);
    }

    // 基础修炼收益
    const baseGain = 10 + user.realm * 3 + user.spiritRoot * 2;
    // 功法加成
    const artBonus = user.arts.length * 3;
    // 气运加成
    const luckBonus = Math.floor(user.luck / 10);
    // 灵根加成
    const spiritRoot = this.spiritRoots[user.spiritRoot];

    // 总修为收益
    let expGain = Math.floor(
      (baseGain + artBonus + luckBonus) * spiritRoot.expRate
    );
    let extraMsg = "";

    // 小概率触发顿悟
    if (Math.random() < 0.05) {
      expGain *= 3;
      extraMsg = "✨ 灵光乍现，顿悟大道！修为大幅增长！";
      user.luck = Math.min(100, user.luck + 5);
      user.comprehension = Math.min(10, user.comprehension + 0.2);
    }

    user.exp += expGain;
    user.lastCultivate = now;
    user.luck = Math.min(100, user.luck + 1);
    user.combatPower += Math.floor(expGain / 50);

    // 检查是否达到突破要求
    if (user.exp >= user.maxExp && user.realm < this.realms.length - 1) {
      extraMsg += `\n🌅 修为已达圆满，可尝试 #突破 至 ${
        this.realms[user.realm + 1]
      }！`;
    }

    this.saveData();

    await this.reply(
      [
        `🧘 运转周天，炼化天地灵气...`,
        `✅ 修为 +${expGain}（当前：${user.exp}/${user.maxExp}）`,
        extraMsg,
      ].join("\n")
    );
  }

  /** 突破境界 */
  async breakthrough() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 检查是否达到突破要求
    if (user.exp < user.maxExp) {
      return this.reply(
        `❌ 修为不足！还需 ${user.maxExp - user.exp} 点修为方可突破`
      );
    }

    if (user.realm >= this.realms.length - 1) {
      return this.reply(`✅ 已是最高境界，请准备 #渡劫 飞升！`);
    }

    // 突破消耗灵石
    const stoneCost = (user.realm + 1) * 100;
    if (user.stone < stoneCost) {
      return this.reply(`❌ 灵石不足！突破需要 ${stoneCost} 灵石`);
    }

    // 突破成功率计算
    const baseSuccessRate = 60; // 基础成功率60%
    const realmPenalty = user.realm * 2; // 境界越高越难突破
    const spiritRoot = this.spiritRoots[user.spiritRoot];
    const spiritRootBonus = spiritRoot.breakthrough * 20; // 灵根加成
    const luckBonus = Math.floor(user.luck / 5); // 气运加成
    const daoHeartBonus = user.daoHeart * 5; // 道心加成

    // 功法加成
    let artBonus = 0;
    user.arts.forEach((artId) => {
      const art = this.arts.find((a) => a.id === artId);
      if (art && art.effect.includes("breakthrough")) {
        artBonus += 10;
      }
    });

    // 法宝加成
    let artifactBonus = 0;
    if (user.equippedArtifact) {
      const artifact = this.artifacts.find(
        (a) => a.id === user.equippedArtifact
      );
      if (artifact && artifact.effect.includes("突破成功率")) {
        artifactBonus = 5;
      }
    }

    const successRate = Math.max(
      10,
      baseSuccessRate -
        realmPenalty +
        spiritRootBonus +
        luckBonus +
        daoHeartBonus +
        artBonus +
        artifactBonus
    );

    user.stone -= stoneCost;
    const success = Math.random() * 100 < successRate;

    if (success) {
      // 突破成功
      user.realm++;
      user.exp = 0;
      user.maxExp = Math.floor(user.maxExp * 1.8);
      user.combatPower += 50;
      user.daoHeart = Math.min(10, user.daoHeart + 0.5);

      await this.reply(
        [
          `🌈 突破成功！`,
          `🎉 境界提升至：${this.realms[user.realm]}！`,
          `💎 消耗灵石：${stoneCost}`,
          `❤️ 生命上限提升！`,
          `✨ 下一境界：${this.realms[user.realm + 1]}（需 ${
            user.maxExp
          } 修为）`,
        ].join("\n")
      );
    } else {
      // 突破失败
      const damage = 15 + Math.floor(Math.random() * 25);
      user.life = Math.max(1, user.life - damage);
      user.daoHeart = Math.max(0.1, user.daoHeart - 0.2);

      await this.reply(
        [
          `💥 突破失败！灵力反噬！`,
          `❤️ 生命值 -${damage}（当前：${user.life}/100）`,
          `💎 消耗灵石：${stoneCost}`,
          `😢 道心受损，下次突破成功率提升5%`,
        ].join("\n")
      );
    }

    user.luck = Math.min(100, user.luck + 3);
    this.saveData();
  }

  /** 渡劫飞升 */
  async tribulation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 检查是否达到渡劫条件
    if (user.realm < this.realms.length - 3) {
      return this.reply(`❌ 境界不足！需达到渡劫初期方可渡劫`);
    }

    if (user.exp < user.maxExp) {
      return this.reply(
        `❌ 修为不足！还需 ${user.maxExp - user.exp} 点修为方可渡劫`
      );
    }

    user.tribulationCount++;

    // 随机选择天劫类型
    const tribulationType =
      this.tribulations[Math.floor(Math.random() * this.tribulations.length)];

    // 渡劫成功率计算
    const baseSuccessRate = tribulationType.successRate;
    const pillBonus = user.pills[5] ? user.pills[5] * 5 : 0; // 渡劫丹加成
    const luckBonus = Math.floor(user.luck / 3); // 气运加成
    const daoHeartBonus = user.daoHeart * 8; // 道心加成

    // 功法加成
    let artBonus = 0;
    user.arts.forEach((artId) => {
      const art = this.arts.find((a) => a.id === artId);
      if (art && art.effect.includes("tribulation")) {
        artBonus += 15;
      }
    });

    // 法宝加成
    let artifactBonus = 0;
    if (user.equippedArtifact) {
      const artifact = this.artifacts.find(
        (a) => a.id === user.equippedArtifact
      );
      if (artifact && artifact.effect.includes("天劫伤害")) {
        artifactBonus = 10;
      }
    }

    const successRate = Math.min(
      95,
      baseSuccessRate +
        pillBonus +
        luckBonus +
        daoHeartBonus +
        artBonus +
        artifactBonus
    );

    const success = Math.random() * 100 < successRate;
    let resultMsg = [];

    resultMsg.push(`⚡ ${tribulationType.name}降临！`);

    // 添加天劫特效描述
    const tribulationDesc = {
      三九天劫: "天空乌云密布，二十七道天雷接连劈下！",
      六九天劫: "六重雷云笼罩天地，五十四道神雷撕裂苍穹！",
      九九天劫: "九霄神雷汇聚，八十一道灭世雷霆轰然而至！",
      心魔劫: "内心深处的恐惧被无限放大，心魔丛生！",
      业火劫: "红莲业火从脚下升起，焚烧神魂！",
      混沌劫: "混沌之气弥漫，万物归于虚无！",
    };

    resultMsg.push(tribulationDesc[tribulationType.name]);

    if (success) {
      // 渡劫成功
      user.successCount++;
      user.realm = this.realms.length - 1; // 飞升期
      user.exp = 0;
      user.maxExp = 999999;
      user.life = 200;
      user.combatPower += 1000;

      resultMsg.push(`🌈 霞光万道，仙门大开！`);
      resultMsg.push(`🎉 渡劫成功！飞升仙界！`);
      resultMsg.push(`✨ 当前境界：${this.realms[user.realm]}`);

      // 宗门奖励
      if (user.sect && this.sects[user.sect]) {
        const sect = this.sects[user.sect];
        sect.prestige += 1000;
        sect.funds += 50000;
        resultMsg.push(`🏯 宗门 ${sect.name} 因你而声名大振！`);
      }
    } else {
      // 渡劫失败
      const damage = Math.min(
        99,
        tribulationType.damage + Math.floor(Math.random() * 20)
      );
      user.life = Math.max(1, user.life - damage);
      user.daoHeart = Math.max(0.1, user.daoHeart - 1);

      // 如果有九转还魂丹则保命
      if (user.pills[6] && user.pills[6] > 0) {
        user.pills[6]--;
        user.life = 1;
        resultMsg.push(`✨ 九转还魂丹生效，勉强保住性命`);
        resultMsg.push(`💔 消耗一枚九转还魂丹`);
      } else {
        user.realm = Math.max(0, user.realm - 3);
        user.exp = 0;
        resultMsg.push(`💥 渡劫失败，境界跌落至 ${this.realms[user.realm]}`);
      }

      resultMsg.push(`❤️ 生命值降为${user.life}`);
    }

    this.saveData();
    await this.reply(resultMsg.join("\n"));
  }

  /** 灵根测试 */
  async spiritRootTest() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 如果已有灵根且不是最低级，则不再测试
    if (user.spiritRoot > 0 && user.spiritRoot > 1) {
      return this.reply(
        `✨ 当前灵根：${this.spiritRoots[user.spiritRoot].name}（无需重复测试）`
      );
    }

    // 消耗灵石
    if (user.stone < 300) {
      return this.reply("❌ 灵根测试需要300灵石");
    }

    user.stone -= 300;

    // 随机生成灵根（偏向低品质）
    let rootLevel;
    if (Math.random() < 0.05) {
      // 5%概率获得高级灵根
      rootLevel = Math.min(
        this.spiritRoots.length - 1,
        5 + Math.floor(Math.random() * 5)
      );
    } else {
      rootLevel = Math.min(
        this.spiritRoots.length - 1,
        Math.floor(Math.random() * 5) + Math.floor(Math.random() * 3)
      );
    }

    user.spiritRoot = rootLevel;
    this.saveData();

    const spiritRoot = this.spiritRoots[rootLevel];
    await this.reply(
      [
        `🔮 灵根测试中...`,
        `✨ 灵根显现：${spiritRoot.name}！`,
        `📊 属性加成：`,
        `  修炼效率 ×${spiritRoot.expRate}`,
        `  炼丹加成 ×${spiritRoot.alchemy}`,
        `  突破加成 ×${spiritRoot.breakthrough}`,
        rootLevel >= 4 ? `🎉 资质上佳，前途无量！` : `💪 勤能补拙，天道酬勤！`,
      ].join("\n")
    );
  }

  /** 查看丹药 */
  async viewPills() {
    const pillList = this.pills
      .map(
        (p) =>
          `${p.id}. ${p.name} ★${p.quality} - ${p.desc}\n  效果: ${
            p.effect > 0
              ? `+${p.effect}修为`
              : p.id === 8
              ? "提升灵根资质"
              : "保命"
          } | 消耗: ${p.cost}灵石`
      )
      .join("\n");

    await this.reply(
      [
        "📜 丹方名录",
        "================================",
        pillList,
        "================================",
        "使用 #炼丹 [丹药ID] 炼制丹药",
        "使用 #服用丹药 [丹药ID] 使用丹药",
      ].join("\n")
    );
  }

  /** 炼制丹药 */
  async alchemy() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#炼丹\s+(\d+)$/);

    if (!match) {
      return this.reply("❌ 格式错误，请使用 #炼丹 [丹药ID]");
    }

    const pillId = parseInt(match[1]);

    const pill = this.pills.find((p) => p.id === pillId);
    if (!pill) return this.reply("❌ 丹方不存在");

    if (user.stone < pill.cost) {
      return this.reply(`❌ 灵石不足！需要 ${pill.cost} 灵石`);
    }

    // 炼丹成功率（受灵根影响）
    const spiritRoot = this.spiritRoots[user.spiritRoot];
    const baseSuccessRate = 60;
    const successRate = baseSuccessRate + spiritRoot.alchemy * 20;
    const success = Math.random() * 100 < successRate;

    if (success) {
      user.stone -= pill.cost;
      if (!user.pills[pillId]) user.pills[pillId] = 0;
      user.pills[pillId]++;

      await this.reply(
        [
          `🔥 丹炉运转，药香四溢...`,
          `✅ 成功炼制 ${pill.name} ×1！`,
          `💎 消耗灵石：${pill.cost}`,
        ].join("\n")
      );
    } else {
      user.stone -= Math.floor(pill.cost / 2);
      await this.reply(
        [
          `💥 丹炉炸裂，炼制失败！`,
          `💎 损失灵石：${Math.floor(pill.cost / 2)}`,
          `😢 下次炼制成功率提升5%`,
        ].join("\n")
      );
    }

    this.saveData();
  }

  /** 服用丹药 */
  async takePill() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#服用丹药\s+(\d+)$/);

    if (!match) {
      return this.reply("❌ 格式错误，请使用 #服用丹药 [丹药ID]");
    }

    const pillId = parseInt(match[1]);

    const pill = this.pills.find((p) => p.id === pillId);
    if (!pill) return this.reply("❌ 丹药不存在");

    if (!user.pills[pillId] || user.pills[pillId] <= 0) {
      return this.reply(`❌ 没有 ${pill.name}，请先炼制`);
    }

    user.pills[pillId]--;

    if (pill.effect.startsWith("exp:")) {
      // 修为丹药
      const exp = parseInt(pill.effect.split(":")[1]);
      user.exp += exp;
      await this.reply(
        [
          `🍵 服用 ${pill.name}，灵力涌动...`,
          `✨ 修为 +${exp}（当前：${user.exp}/${user.maxExp}）`,
        ].join("\n")
      );
    } else if (pill.id === 8) {
      // 太虚神丹 - 提升灵根
      if (user.spiritRoot < this.spiritRoots.length - 1) {
        user.spiritRoot++;
        const newRoot = this.spiritRoots[user.spiritRoot];
        await this.reply(
          [
            `🍵 服用 ${pill.name}，脱胎换骨...`,
            `✨ 灵根提升至：${newRoot.name}！`,
            `📊 属性加成：`,
            `  修炼效率 ×${newRoot.expRate}`,
            `  炼丹加成 ×${newRoot.alchemy}`,
            `  突破加成 ×${newRoot.breakthrough}`,
          ].join("\n")
        );
      } else {
        user.exp += 100000;
        await this.reply(
          [
            `🍵 服用 ${pill.name}，但灵根已至极限`,
            `✨ 修为 +100000（当前：${user.exp}/${user.maxExp}）`,
          ].join("\n")
        );
      }
    } else if (pill.effect.startsWith("life:")) {
      // 恢复丹药
      const life = parseInt(pill.effect.split(":")[1]);
      user.life = Math.min(100, user.life + life);
      await this.reply(
        [
          `🍵 服用 ${pill.name}，伤势恢复...`,
          `❤️ 生命值 +${life}（当前：${user.life}/100）`,
        ].join("\n")
      );
    } else {
      // 特殊丹药
      await this.reply(`✅ 服用 ${pill.name}，效果已生效`);
    }

    this.saveData();
  }

  /** 闭关修炼 */
  async seclusion() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 解析闭关时间
    const match = this.e.msg.match(/^#闭关\s*(?:(\d+)\s*(天|时辰)?)?$/);
    let duration = match[1] ? parseInt(match[1]) : 1;
    let unit = match[2] || "时辰";

    // 换算成毫秒（1时辰=2小时）
    const hours = unit === "天" ? duration * 24 : duration * 2;
    const ms = hours * 60 * 60 * 1000;

    // 检查闭关CD（6小时）
    if (now - user.lastSeclusion < 6 * 60 * 60 * 1000) {
      const remaining = Math.ceil(
        (6 * 60 * 60 * 1000 - (now - user.lastSeclusion)) / 3600000
      );
      return this.reply(`🕒 心魔未消，请${remaining}小时后再闭关`);
    }

    // 消耗灵石
    const stoneCost = hours * 20;
    if (user.stone < stoneCost) {
      return this.reply(`❌ 闭关需要${stoneCost}灵石维持阵法`);
    }

    user.stone -= stoneCost;

    // 计算闭关收益
    const expGain = Math.floor(
      (50 + user.realm * 15 + user.spiritRoot * 8) *
        hours *
        this.spiritRoots[user.spiritRoot].expRate
    );

    user.exp += expGain;
    user.lastSeclusion = now;
    user.luck = Math.min(100, user.luck + 5);
    user.combatPower += Math.floor(expGain / 100);

    this.saveData();

    await this.reply(
      [
        `🧘 开始闭关修炼 ${duration}${unit}...`,
        `🕒 时光飞逝，闭关结束`,
        `✨ 修为 +${expGain}（当前：${user.exp}/${user.maxExp})`,
        `💎 消耗灵石：${stoneCost}`,
        `🍀 气运 +5`,
        `⚔️ 战斗力 +${Math.floor(expGain / 100)}`,
      ].join("\n")
    );
  }

  /** 领悟功法 */
  async comprehendArt() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 检查灵石
    const stoneCost = 500 + user.arts.length * 200;
    if (user.stone < stoneCost) {
      return this.reply(`❌ 领悟功法需要${stoneCost}灵石`);
    }

    // 已有全部功法
    if (user.arts.length >= this.arts.length) {
      return this.reply("✅ 已领悟所有功法，融会贯通！");
    }

    // 随机选择未领悟的功法
    const availableArts = this.arts.filter(
      (art) => !user.arts.includes(art.id)
    );

    if (availableArts.length === 0) return;

    const newArt =
      availableArts[Math.floor(Math.random() * availableArts.length)];

    // 领悟成功率
    const successRate =
      40 +
      user.spiritRoot * 5 +
      Math.floor(user.luck / 5) +
      user.comprehension * 10;
    const success = Math.random() * 100 < successRate;

    if (success) {
      user.arts.push(newArt.id);
      user.stone -= stoneCost;
      user.comprehension = Math.min(10, user.comprehension + 0.3);
      await this.reply(
        [
          `📜 参悟天地至理...`,
          `✨ 领悟新功法：${newArt.name}！`,
          `📊 功法效果：${newArt.effect}`,
          `💎 消耗灵石：${stoneCost}`,
          `🧠 悟性 +0.3`,
        ].join("\n")
      );
    } else {
      user.stone -= Math.floor(stoneCost / 2);
      await this.reply(
        [
          `💥 参悟失败，心神震荡！`,
          `💎 损失灵石：${Math.floor(stoneCost / 2)}`,
          `😢 下次领悟成功率提升5%`,
        ].join("\n")
      );
    }

    this.saveData();
  }

  /** 奇遇事件 */
  async adventure() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 奇遇CD（2小时）
    if (now - user.lastAdventure < 2 * 60 * 60 * 1000) {
      const remaining = Math.ceil(
        (2 * 60 * 60 * 1000 - (now - user.lastAdventure)) / 3600000
      );
      return this.reply(`🕒 机缘未至，请${remaining}小时后再探索`);
    }

    user.lastAdventure = now;

    // 高级奇遇概率（随境界提升）
    const advancedChance = Math.min(0.5, user.realm * 0.02);

    const events = [
      {
        name: "发现灵石矿",
        effect: () => {
          const gain = 300 + Math.floor(Math.random() * 700);
          user.stone += gain;
          return `💎 获得 ${gain} 灵石`;
        },
      },
      {
        name: "遭遇妖兽",
        effect: () => {
          const damage = 15 + Math.floor(Math.random() * 35);
          user.life = Math.max(1, user.life - damage);
          return `🐺 遭遇妖兽袭击！❤️ 生命值 -${damage}`;
        },
      },
      {
        name: "仙人洞府",
        effect: () => {
          const expGain = 500 + Math.floor(Math.random() * 1500);
          user.exp += expGain;
          return `🏯 发现仙人洞府，✨ 修为 +${expGain}`;
        },
      },
      {
        name: "灵药园",
        effect: () => {
          const pillId = 1 + Math.floor(Math.random() * 4);
          if (!user.pills[pillId]) user.pills[pillId] = 0;
          user.pills[pillId] += 2;
          return `🌿 发现灵药园，获得 ${
            this.pills.find((p) => p.id === pillId).name
          } ×2`;
        },
      },
      {
        name: "前辈传承",
        effect: () => {
          user.luck += 15;
          user.comprehension += 0.5;
          return `👴 获得前辈传承，🍀 气运 +15，🧠 悟性 +0.5`;
        },
        advanced: true,
      },
      {
        name: "上古遗迹",
        effect: () => {
          const artifactId = 1 + Math.floor(Math.random() * 3);
          user.artifacts.push(artifactId);
          return `🏛️ 发现上古遗迹，获得法宝 ${
            this.artifacts.find((a) => a.id === artifactId).name
          }！`;
        },
        advanced: true,
      },
      {
        name: "悟道古树",
        effect: () => {
          user.daoHeart += 1;
          return `🌳 在悟道古树下参悟，💖 道心 +1`;
        },
        advanced: true,
      },
    ];

    // 筛选可用事件
    let availableEvents = events.filter((e) => !e.advanced);
    if (Math.random() < advancedChance) {
      availableEvents = availableEvents.concat(
        events.filter((e) => e.advanced)
      );
    }

    const event =
      availableEvents[Math.floor(Math.random() * availableEvents.length)];
    const result = event.effect();

    this.saveData();

    await this.reply(
      [`🌄 探索修仙界...`, `✨ 奇遇：${event.name}`, result].join("\n")
    );
  }

  /** 挑战秘境 */
  async challengeDungeon() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 解析秘境层级
    const match = this.e.msg.match(/^#挑战秘境\s*(\d+)?$/);
    let dungeonLevel = match[1] ? parseInt(match[1]) : 1;

    // 检查CD（1小时）
    if (now - user.lastDungeon < 60 * 60 * 1000) {
      const remaining = Math.ceil(
        (60 * 60 * 1000 - (now - user.lastDungeon)) / 3600000
      );
      return this.reply(`🕒 秘境尚未恢复，请${remaining}小时后再挑战`);
    }

    // 检查境界是否足够
    const dungeon = this.dungeons[dungeonLevel - 1];
    if (!dungeon) {
      return this.reply(
        `❌ 秘境层级 ${dungeonLevel} 不存在，可用层级：1-${this.dungeons.length}`
      );
    }

    if (user.realm < dungeon.minRealm) {
      return this.reply(
        `❌ 境界不足！需要 ${this.realms[dungeon.minRealm]} 才能挑战 ${
          dungeon.name
        }`
      );
    }

    user.lastDungeon = now;

    // 计算挑战结果
    const successRate = 60 + user.combatPower * 0.1 + user.luck / 2;
    const success = Math.random() * 100 < successRate;

    let resultMsg = [`🏞️ 进入秘境：${dungeon.name}...`];

    if (success) {
      // 秘境挑战成功
      let stoneGain, expGain;

      switch (dungeonLevel) {
        case 1:
          stoneGain = 100 + Math.floor(Math.random() * 200);
          expGain = 50 + Math.floor(Math.random() * 100);
          break;
        case 2:
          stoneGain = 300 + Math.floor(Math.random() * 500);
          expGain = 200 + Math.floor(Math.random() * 300);
          break;
        case 3:
          stoneGain = 1000 + Math.floor(Math.random() * 2000);
          expGain = 800 + Math.floor(Math.random() * 1200);
          break;
        case 4:
          stoneGain = 5000 + Math.floor(Math.random() * 10000);
          expGain = 3000 + Math.floor(Math.random() * 5000);
          break;
        case 5:
          stoneGain = 20000 + Math.floor(Math.random() * 30000);
          expGain = 15000 + Math.floor(Math.random() * 25000);
          break;
      }

      user.stone += stoneGain;
      user.exp += expGain;
      user.combatPower += dungeonLevel * 10;

      resultMsg.push(`✅ 成功挑战秘境！`);
      resultMsg.push(`💎 获得灵石：${stoneGain}`);
      resultMsg.push(`✨ 获得修为：${expGain}`);
      resultMsg.push(`⚔️ 战斗力 +${dungeonLevel * 10}`);

      // 概率获得额外奖励
      if (Math.random() < 0.3) {
        const pillId = dungeonLevel + Math.floor(Math.random() * 2);
        if (pillId <= this.pills.length) {
          if (!user.pills[pillId]) user.pills[pillId] = 0;
          user.pills[pillId]++;
          resultMsg.push(`💊 额外获得：${this.pills[pillId - 1].name} ×1`);
        }
      }

      // 高等级秘境概率获得法宝
      if (dungeonLevel >= 4 && Math.random() < 0.2) {
        const artifactId = dungeonLevel - 1;
        if (!user.artifacts.includes(artifactId)) {
          user.artifacts.push(artifactId);
          resultMsg.push(
            `🔮 获得法宝：${this.artifacts[artifactId - 1].name}！`
          );
        }
      }
    } else {
      // 秘境挑战失败
      const damage = 20 + Math.floor(Math.random() * 30);
      user.life = Math.max(1, user.life - damage);
      resultMsg.push(`💥 挑战失败，遭遇秘境守卫！`);
      resultMsg.push(`❤️ 生命值 -${damage}`);
    }

    this.saveData();
    await this.reply(resultMsg.join("\n"));
  }

  /** 双修 */
  async dualCultivation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 解析双修对象
    const match = this.e.msg.match(/^#双修\s*@?(\d+)?$/);
    const targetId = match[1] || this.e.at;

    if (!targetId) {
      return this.reply("❌ 请@指定双修对象");
    }

    if (targetId === userId) {
      return this.reply("❌ 不能与自己双修");
    }

    const targetUser = this.getUserData(targetId);

    // 检查双方是否同意
    await this.reply(
      `📢 ${this.e.at} 道友，${
        this.e.sender.card || this.e.sender.nickname
      } 邀请你双修，同意请回复 #同意双修`
    );

    // 等待对方同意（简化处理，实际需要事件监听）
    // 这里简化处理，假设对方同意
    const agreed = true;

    if (!agreed) {
      return this.reply("❌ 对方拒绝了双修邀请");
    }

    // 双修收益
    const baseGain = 50 + (user.realm + targetUser.realm) * 5;
    const expGain = Math.floor(baseGain * 1.5);

    user.exp += expGain;
    targetUser.exp += expGain;
    user.luck = Math.min(100, user.luck + 5);
    targetUser.luck = Math.min(100, targetUser.luck + 5);

    this.saveData();

    await this.reply(
      [
        `💞 ${this.e.sender.card || this.e.sender.nickname} 与 ${
          this.e.at
        } 开始双修...`,
        `✨ 双方修为 +${expGain}`,
        `🍀 双方气运 +5`,
        `💖 阴阳调和，大道可期！`,
      ].join("\n")
    );
  }

  /** 炼制法宝 */
  async forgeArtifact() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 解析法宝ID
    const match = this.e.msg.match(/^#炼制法宝\s*(\d+)?$/);
    let artifactId = match[1] ? parseInt(match[1]) : 1;

    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact) {
      return this.reply(`❌ 法宝ID ${artifactId} 不存在`);
    }

    // 检查境界
    if (user.realm < artifact.level * 2) {
      return this.reply(
        `❌ 境界不足！需要 ${this.realms[artifact.level * 2]} 才能炼制 ${
          artifact.name
        }`
      );
    }

    // 检查灵石
    if (user.stone < artifact.cost) {
      return this.reply(`❌ 灵石不足！需要 ${artifact.cost} 灵石`);
    }

    // 检查是否已拥有
    if (user.artifacts.includes(artifactId)) {
      return this.reply(`❌ 已拥有 ${artifact.name}，无需重复炼制`);
    }

    // 炼制成功率
    const successRate = 70 + user.spiritRoot * 5 + Math.floor(user.luck / 5);
    const success = Math.random() * 100 < successRate;

    if (success) {
      user.artifacts.push(artifactId);
      user.stone -= artifact.cost;
      await this.reply(
        [
          `🔥 开始炼制 ${artifact.name}...`,
          `✨ 炼制成功！`,
          `🔮 获得法宝：${artifact.name}`,
          `📊 法宝效果：${artifact.effect}`,
          `💎 消耗灵石：${artifact.cost}`,
        ].join("\n")
      );
    } else {
      user.stone -= Math.floor(artifact.cost / 2);
      await this.reply(
        [
          `💥 炼制失败！`,
          `💎 损失灵石：${Math.floor(artifact.cost / 2)}`,
          `😢 下次炼制成功率提升5%`,
        ].join("\n")
      );
    }

    this.saveData();
  }

  /** 装备法宝 */
  async equipArtifact() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 解析法宝ID
    const match = this.e.msg.match(/^#装备法宝\s*(\d+)?$/);
    const artifactId = match[1] ? parseInt(match[1]) : null;

    if (!artifactId) {
      // 显示法宝列表
      if (user.artifacts.length === 0) {
        return this.reply("❌ 你还没有任何法宝，请先 #炼制法宝");
      }

      let msg = "📦 你的法宝列表：\n";
      user.artifacts.forEach((id) => {
        const artifact = this.artifacts.find((a) => a.id === id);
        msg += `${id}. ${artifact.name} - ${artifact.effect}\n`;
      });
      msg += "\n使用 #装备法宝 [ID] 装备法宝";
      return this.reply(msg);
    }

    // 检查是否拥有该法宝
    if (!user.artifacts.includes(artifactId)) {
      return this.reply(`❌ 未拥有ID为 ${artifactId} 的法宝`);
    }

    user.equippedArtifact = artifactId;
    this.saveData();

    const artifact = this.artifacts.find((a) => a.id === artifactId);
    await this.reply(
      `🔮 已装备法宝：${artifact.name}\n📊 效果：${artifact.effect}`
    );
  }

  /** 宗门信息 */
  async sectInfo() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect || !this.sects[user.sect]) {
      return this.reply(
        "❌ 你尚未加入任何宗门\n使用 #创建宗门 [名称] 创建宗门 或 #加入宗门 [名称] 加入已有宗门"
      );
    }

    const sect = this.sects[user.sect];
    let msg = [
      `🏯 宗门：${sect.name}`,
      `⭐ 等级：${sect.level}`,
      `🎖️ 声望：${sect.prestige}`,
      `💎 资金：${sect.funds}`,
      `👥 成员：${sect.members.length}人`,
      `👑 宗主：${sect.leaderName}`,
      `📜 宗门福利：`,
      `  每日灵石：${sect.level * 50}`,
      `  每周资金：${sect.members.length * 100 * sect.level}`,
      `  修炼效率：+${sect.level * 5}%`,
      `\n📢 宗门公告：${sect.notice || "暂无公告"}`,
    ];

    // 显示宗门成员（最多10人）
    if (sect.members.length > 0) {
      msg.push("\n👥 核心成员：");
      const topMembers = sect.members
        .map((id) => this.getUserData(id))
        .sort((a, b) => b.realm - a.realm || b.combatPower - a.combatPower)
        .slice(0, 5);

      topMembers.forEach((member) => {
        const title =
          this.sectTitles.find((t) => t.id === member.title)?.name ||
          "未知职位";
        msg.push(
          `  ${title} ${this.e.sender.card || this.e.sender.nickname} - ${
            this.realms[member.realm]
          }`
        );
      });
    }

    await this.reply(msg.join("\n"));
  }

  /** 加入宗门 */
  async joinSect() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (user.sect) {
      return this.reply(
        `❌ 你已加入 ${this.sects[user.sect].name}，无法加入其他宗门`
      );
    }

    const sectName = this.e.msg.replace(/^#加入宗门\s+/, "").trim();
    if (!sectName) {
      return this.reply("❌ 请输入宗门名称");
    }

    // 查找宗门
    const sectId = Object.keys(this.sects).find(
      (id) => this.sects[id].name === sectName
    );

    if (!sectId) {
      return this.reply(`❌ 未找到名为 ${sectName} 的宗门`);
    }

    const sect = this.sects[sectId];
    if (sect.members.length >= 50) {
      return this.reply("❌ 该宗门成员已满");
    }

    user.sect = sectId;
    user.title = 1; // 外门弟子
    sect.members.push(userId);

    this.saveData();

    await this.reply(
      [
        `🎉 成功加入宗门：${sect.name}`,
        `👥 当前成员：${sect.members.length}人`,
        `📜 宗门公告：${sect.notice || "暂无公告"}`,
        `💎 每日可领取 ${sect.level * 50} 灵石福利`,
        `💰 使用 #领取俸禄 获取每日资源`,
      ].join("\n")
    );
  }

  /** 创建宗门 */
  async createSect() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (user.sect) {
      return this.reply(
        `❌ 你已加入 ${this.sects[user.sect].name}，无法创建新宗门`
      );
    }

    if (user.realm < 10) {
      return this.reply("❌ 创建宗门需要金丹期以上境界");
    }

    const sectName = this.e.msg.replace(/^#创建宗门\s+/, "").trim();
    if (!sectName) {
      return this.reply("❌ 请输入宗门名称");
    }

    // 检查名称是否已存在
    if (Object.values(this.sects).some((s) => s.name === sectName)) {
      return this.reply(`❌ 宗门名称 ${sectName} 已被使用`);
    }

    // 创建宗门
    const sectId = `sect_${Date.now()}`;
    this.sects[sectId] = {
      name: sectName,
      level: 1,
      prestige: 100,
      funds: 1000,
      leader: userId,
      leaderName: this.e.sender.card || this.e.sender.nickname,
      members: [userId],
      notice: "",
      createTime: Date.now(),
    };

    user.sect = sectId;
    user.title = 8; // 宗主

    this.saveData();

    await this.reply(
      [
        `🎉 宗门创建成功！`,
        `🏯 宗门名称：${sectName}`,
        `👑 宗主：${this.e.sender.card || this.e.sender.nickname}`,
        `📢 使用 #宗门 查看宗门信息`,
        `💎 初始资金：1000灵石`,
        `💰 使用 #领取俸禄 获取每日资源`,
      ].join("\n")
    );
  }

  /** 修仙排行榜 */
  async cultivationRank() {
    // 获取所有用户数据
    const users = Object.entries(this.userData)
      .map(([id, data]) => ({
        id,
        realm: data.realm,
        exp: data.exp,
        combatPower: data.combatPower,
        name: this.getUserName(id),
      }))
      .sort((a, b) => {
        if (b.realm !== a.realm) return b.realm - a.realm;
        if (b.combatPower !== a.combatPower)
          return b.combatPower - a.combatPower;
        return b.exp - a.exp;
      })
      .slice(0, 10); // 取前10名

    if (users.length === 0) {
      return this.reply("📭 尚无修仙者数据");
    }

    const rankList = users
      .map(
        (u, i) =>
          `${i + 1}. ${u.name} - ${this.realms[u.realm]} ⚔️${u.combatPower}`
      )
      .join("\n");

    const userRank =
      users.findIndex((u) => u.id === this.e.user_id) + 1 || "未上榜";

    await this.reply(
      [
        "🏆 修仙排行榜",
        "=======================",
        rankList,
        "=======================",
        `你的排名：${userRank}`,
      ].join("\n")
    );
  }

  /** 获取用户名称 */
  getUserName(userId) {
    // 实际实现中需要根据平台获取用户名称
    return `用户${userId}`;
  }

  /** 查看境界 */
  async checkCultivation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const realmIndex = user.realm;
    const realmName = this.realms[realmIndex];
    const nextRealm =
      realmIndex < this.realms.length - 1
        ? this.realms[realmIndex + 1]
        : "已至巅峰";

    // 计算属性加成
    const spiritRoot = this.spiritRoots[user.spiritRoot];
    const expRate = spiritRoot.expRate * (1 + user.comprehension * 0.1);

    const msg = [
      `🧘 道号：${this.e.sender.card || this.e.sender.nickname}`,
      `🌠 境界：${realmName}（${user.exp}/${user.maxExp}）`,
      `✨ 灵根：${spiritRoot.name}（修为效率×${expRate.toFixed(1)}）`,
      `❤️ 生命：${user.life}/100`,
      `🍀 气运：${user.luck}/100`,
      `💎 灵石：${user.stone}`,
      `📜 功法：${user.arts
        .map((id) => {
          const art = this.arts.find((a) => a.id === id);
          return art ? art.name : "未知功法";
        })
        .join("、")}`,
      `⚔️ 战斗力：${user.combatPower}`,
      `⬆️ 下一境界：${nextRealm}`,
      `⚡ 渡劫：${user.successCount}成功/${user.tribulationCount}次`,
    ];

    // 显示装备的法宝
    if (user.equippedArtifact) {
      const artifact = this.artifacts.find(
        (a) => a.id === user.equippedArtifact
      );
      msg.push(`🔮 法宝：${artifact.name}（${artifact.effect}）`);
    }

    // 显示宗门信息
    if (user.sect && this.sects[user.sect]) {
      const sect = this.sects[user.sect];
      const title = this.sectTitles.find((t) => t.id === user.title);
      msg.push(`🏯 宗门：${sect.name}（${title?.name || "未知职位"}）`);
      msg.push(`🎖️ 贡献：${user.contribution}`);
    }

    // 显示签到信息
    if (user.lastSign) {
      const lastSignDate = new Date(user.lastSign);
      const today = new Date();
      const diffDays = Math.floor(
        (today - lastSignDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        msg.push(`📅 今日已签到（连续${user.signStreak}天）`);
      } else {
        msg.push(`📅 已连续签到：${user.signStreak}天`);
      }
    }

    await this.reply(msg.join("\n"));
  }
}
