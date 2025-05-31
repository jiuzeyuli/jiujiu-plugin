import fs from "fs";
import path from "path";
import schedule from "node-schedule";

export class Cultivation extends plugin {
  constructor() {
    super({
      name: "终极修仙渡劫系统",
      dsc: "包含完整修仙体系的终极插件",
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
        { reg: "^#丹药列表$", fnc: "viewPills" },
        { reg: "^#炼丹\\s+(\\d+)$", fnc: "alchemy" },
        { reg: "^#服用丹药\\s+(\\d+)$", fnc: "takePill" },
        { reg: "^#修仙排行榜$", fnc: "cultivationRank" },
        { reg: "^#领悟功法$", fnc: "comprehendArt" },
        { reg: "^#奇遇$", fnc: "adventure" },
        { reg: "^#渡劫准备$", fnc: "tribulationPreparation" },
        { reg: "^#挑战秘境\\s*(\\d+)?$", fnc: "challengeDungeon" },
        { reg: "^#双修\\s*@?(\\d+)?$", fnc: "dualCultivation" },
        { reg: "^#炼制法宝\\s*(\\d+)?$", fnc: "forgeArtifact" },
        { reg: "^#装备法宝\\s*(\\d+)?$", fnc: "equipArtifact" },
        { reg: "^#宗门信息$", fnc: "sectInfo" },
        { reg: "^#加入宗门\\s*(\\S+)$", fnc: "joinSect" },
        { reg: "^#创建宗门\\s*(\\S+)$", fnc: "createSect" },
        { reg: "^#每日签到$", fnc: "dailySign" },
        { reg: "^#领取俸禄$", fnc: "claimSalary" },
        { reg: "^#查看天劫$", fnc: "viewTribulationSystem" },
        { reg: "^#查看功法$", fnc: "viewArtSystem" },
        { reg: "^#查看宗门体系$", fnc: "viewSectSystem" },
        { reg: "^#查看境界体系$", fnc: "viewRealmSystem" },
        { reg: "^#查看法宝系统$", fnc: "viewArtifactSystem" },
        { reg: "^#查看丹药系统$", fnc: "viewPillSystem" },
        { reg: "^#查看灵石经济$", fnc: "viewEconomySystem" },
        { reg: "^#我的背包$", fnc: "viewInventory" },
        { reg: "^#使用物品\\s+(\\d+)$", fnc: "useItem" },
        { reg: "^#修仙商店$", fnc: "viewShop" },
        { reg: "^#购买物品\\s+(\\d+)\\s*(\\d+)?$", fnc: "buyItem" },
        { reg: "^#出售物品\\s+(\\d+)\\s*(\\d+)?$", fnc: "sellItem" },
        { reg: "^#强化法宝\\s+(\\d+)$", fnc: "enhanceArtifact" },
        { reg: "^#宗门任务$", fnc: "sectMission" },
        { reg: "^#宗门商店$", fnc: "sectShop" },
        { reg: "^#兑换贡献\\s+(\\d+)$", fnc: "exchangeContribution" },
        { reg: "^#传功\\s*@?(\\d+)?$", fnc: "transferPower" },
        { reg: "^#渡劫记录$", fnc: "tribulationRecords" },
      ],
    });

    // 修仙境界体系
    this.realms = [
      {
        id: 0,
        name: "凡人",
        maxExp: 100,
        description: "尚未踏入修仙之路的普通人",
      },
      {
        id: 1,
        name: "炼气初期",
        maxExp: 300,
        description: "初步感应天地灵气，引气入体",
      },
      {
        id: 2,
        name: "炼气中期",
        maxExp: 600,
        description: "灵气在体内形成循环，强化肉身",
      },
      {
        id: 3,
        name: "炼气后期",
        maxExp: 1000,
        description: "灵气充盈，准备筑基",
      },
      {
        id: 4,
        name: "筑基初期",
        maxExp: 3000,
        description: "筑就道基，正式踏入修仙之路",
      },
      {
        id: 5,
        name: "筑基中期",
        maxExp: 6000,
        description: "道基稳固，灵力浑厚",
      },
      {
        id: 6,
        name: "筑基后期",
        maxExp: 10000,
        description: "道基圆满，准备结丹",
      },
      {
        id: 7,
        name: "金丹初期",
        maxExp: 30000,
        description: "凝聚金丹，寿元大增",
      },
      {
        id: 8,
        name: "金丹中期",
        maxExp: 60000,
        description: "金丹稳固，灵力凝练",
      },
      {
        id: 9,
        name: "金丹后期",
        maxExp: 100000,
        description: "金丹圆满，准备化婴",
      },
      {
        id: 10,
        name: "元婴初期",
        maxExp: 300000,
        description: "元婴初成，神识初开",
      },
      {
        id: 11,
        name: "元婴中期",
        maxExp: 600000,
        description: "元婴成长，神通初显",
      },
      {
        id: 12,
        name: "元婴后期",
        maxExp: 1000000,
        description: "元婴大成，准备化神",
      },
      {
        id: 13,
        name: "化神初期",
        maxExp: 3000000,
        description: "元神初成，感悟天地",
      },
      {
        id: 14,
        name: "化神中期",
        maxExp: 6000000,
        description: "元神稳固，神通广大",
      },
      {
        id: 15,
        name: "化神后期",
        maxExp: 10000000,
        description: "元神圆满，准备炼虚",
      },
      {
        id: 16,
        name: "炼虚初期",
        maxExp: 30000000,
        description: "炼虚合道，参悟法则",
      },
      {
        id: 17,
        name: "炼虚中期",
        maxExp: 60000000,
        description: "虚境稳固，掌握法则",
      },
      {
        id: 18,
        name: "炼虚后期",
        maxExp: 100000000,
        description: "虚境圆满，准备合体",
      },
      {
        id: 19,
        name: "合体初期",
        maxExp: 300000000,
        description: "元神与肉身合一",
      },
      {
        id: 20,
        name: "合体中期",
        maxExp: 600000000,
        description: "身神合一，神通自成",
      },
      {
        id: 21,
        name: "合体后期",
        maxExp: 1000000000,
        description: "身神圆满，准备大乘",
      },
      {
        id: 22,
        name: "大乘初期",
        maxExp: 3000000000,
        description: "大道初成，触摸仙门",
      },
      {
        id: 23,
        name: "大乘中期",
        maxExp: 6000000000,
        description: "道法自然，神通广大",
      },
      {
        id: 24,
        name: "大乘后期",
        maxExp: 10000000000,
        description: "大乘圆满，准备渡劫",
      },
      {
        id: 25,
        name: "渡劫初期",
        maxExp: 30000000000,
        description: "天劫降临，九死一生",
      },
      {
        id: 26,
        name: "渡劫中期",
        maxExp: 60000000000,
        description: "历经天劫，道体初成",
      },
      {
        id: 27,
        name: "渡劫后期",
        maxExp: 100000000000,
        description: "劫满飞升，羽化登仙",
      },
      {
        id: 28,
        name: "人仙",
        maxExp: 300000000000,
        description: "初入仙道，超凡脱俗",
      },
      {
        id: 29,
        name: "地仙",
        maxExp: 600000000000,
        description: "掌握大地之力，神通广大",
      },
      {
        id: 30,
        name: "天仙",
        maxExp: 1000000000000,
        description: "翱翔九天，逍遥自在",
      },
      {
        id: 31,
        name: "真仙",
        maxExp: 3000000000000,
        description: "仙体大成，万法不侵",
      },
      {
        id: 32,
        name: "玄仙",
        maxExp: 6000000000000,
        description: "参悟玄机，神通广大",
      },
      {
        id: 33,
        name: "金仙",
        maxExp: 10000000000000,
        description: "金身不灭，万劫不磨",
      },
      {
        id: 34,
        name: "太乙金仙",
        maxExp: 30000000000000,
        description: "掌握本源，神通无量",
      },
      {
        id: 35,
        name: "大罗金仙",
        maxExp: 100000000000000,
        description: "超脱时空，永恒不灭",
      },
    ];

    // 灵根资质系统
    this.spiritRoots = [
      {
        id: 0,
        name: "废灵根",
        expRate: 0.5,
        alchemy: 0.3,
        breakthrough: 0.4,
        description: "修炼效率极低，突破困难",
      },
      {
        id: 1,
        name: "伪灵根",
        expRate: 0.7,
        alchemy: 0.5,
        breakthrough: 0.6,
        description: "修炼效率较低，突破较难",
      },
      {
        id: 2,
        name: "下品灵根",
        expRate: 0.9,
        alchemy: 0.7,
        breakthrough: 0.8,
        description: "普通修炼资质",
      },
      {
        id: 3,
        name: "中品灵根",
        expRate: 1.0,
        alchemy: 0.9,
        breakthrough: 1.0,
        description: "良好修炼资质",
      },
      {
        id: 4,
        name: "上品灵根",
        expRate: 1.2,
        alchemy: 1.1,
        breakthrough: 1.2,
        description: "优秀修炼资质",
      },
      {
        id: 5,
        name: "地灵根",
        expRate: 1.5,
        alchemy: 1.3,
        breakthrough: 1.4,
        description: "罕见修炼资质",
      },
      {
        id: 6,
        name: "天灵根",
        expRate: 1.8,
        alchemy: 1.5,
        breakthrough: 1.6,
        description: "千年难遇的修炼奇才",
      },
      {
        id: 7,
        name: "圣灵根",
        expRate: 2.0,
        alchemy: 1.8,
        breakthrough: 1.8,
        description: "万年难遇的绝世资质",
      },
      {
        id: 8,
        name: "仙灵根",
        expRate: 2.5,
        alchemy: 2.0,
        breakthrough: 2.0,
        description: "传说中的仙人之资",
      },
      {
        id: 9,
        name: "混沌灵根",
        expRate: 3.0,
        alchemy: 2.5,
        breakthrough: 2.5,
        description: "开天辟地级的无上资质",
      },
    ];

    // 天劫系统
    this.tribulationTypes = [
      {
        id: 1,
        name: "三九天劫",
        damage: 30,
        description: "三重雷劫，每重九道天雷，共计二十七道",
        levels: [4, 7, 10, 13, 16, 19, 22, 25, 28, 31],
        successBonus: "灵力纯度提升10%",
      },
      {
        id: 2,
        name: "六九天劫",
        damage: 50,
        description: "六重雷劫，每重九道天雷，共计五十四道",
        levels: [6, 9, 12, 15, 18, 21, 24, 27, 30, 33],
        successBonus: "灵力纯度提升20%，神通威力增加",
      },
      {
        id: 3,
        name: "九九天劫",
        damage: 70,
        description: "九重雷劫，每重九道天雷，共计八十一道",
        levels: [9, 12, 15, 18, 21, 24, 27, 30, 33, 35],
        successBonus: "灵力纯度提升30%，获得天劫淬体",
      },
      {
        id: 4,
        name: "心魔劫",
        damage: 40,
        description: "引动心魔，道心不稳者极易陨落",
        levels: [5, 8, 11, 14, 17, 20, 23, 26, 29, 32],
        successBonus: "道心稳固，神识增强20%",
      },
      {
        id: 5,
        name: "业火劫",
        damage: 60,
        description: "红莲业火焚身，净化因果业力",
        levels: [7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
        successBonus: "业力消除，获得业火红莲护体",
      },
      {
        id: 6,
        name: "混沌劫",
        damage: 90,
        description: "混沌神雷，毁天灭地",
        levels: [10, 14, 18, 22, 26, 30, 34, 35],
        successBonus: "获得混沌之力，神通威力倍增",
      },
    ];

    // 功法系统
    this.arts = [
      {
        id: 1,
        name: "《基础吐纳诀》",
        effect: "expRate:1.1",
        level: 1,
        description: "修仙界最基础的修炼功法",
        requirements: "无",
      },
      {
        id: 2,
        name: "《五行道法》",
        effect: "breakthrough:1.15",
        level: 2,
        description: "掌握五行之力，提升突破成功率",
        requirements: "筑基期",
      },
      {
        id: 3,
        name: "《九天玄功》",
        effect: "expRate:1.3, alchemy:1.2",
        level: 3,
        description: "九天玄女所创，大幅提升修炼效率",
        requirements: "金丹期",
      },
      {
        id: 4,
        name: "《太虚剑意》",
        effect: "tribulation:1.2",
        level: 4,
        description: "剑道极致，增强渡劫能力",
        requirements: "元婴期",
      },
      {
        id: 5,
        name: "《大衍神诀》",
        effect: "expRate:1.5, luck:10",
        level: 5,
        description: "推演天机，提升气运和修炼效率",
        requirements: "化神期",
      },
      {
        id: 6,
        name: "《混沌经》",
        effect: "expRate:2.0, breakthrough:1.3",
        level: 6,
        description: "混沌初开时诞生的无上功法",
        requirements: "炼虚期",
      },
      {
        id: 7,
        name: "《星辰变》",
        effect: "all:1.25",
        level: 7,
        description: "引动星辰之力，全面提升属性",
        requirements: "合体期",
      },
      {
        id: 8,
        name: "《一气化三清》",
        effect: "expRate:2.5, tribulation:1.5",
        level: 8,
        description: "道门至高秘法，可分身修炼",
        requirements: "大乘期",
      },
      {
        id: 9,
        name: "《八九玄功》",
        effect: "combat:1.5, defense:1.5",
        level: 9,
        description: "肉身成圣的无上法门",
        requirements: "渡劫期",
      },
      {
        id: 10,
        name: "《混元道经》",
        effect: "all:1.8",
        level: 10,
        description: "直指混元大道的终极功法",
        requirements: "天仙",
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
        enhanceCost: 100,
        maxLevel: 10,
        description: "修仙者常用的飞剑",
        type: "武器",
      },
      {
        id: 2,
        name: "玄武盾",
        effect: "天劫伤害-10%",
        level: 2,
        cost: 1500,
        enhanceCost: 300,
        maxLevel: 10,
        description: "防御型法宝，可抵御天劫",
        type: "防御",
      },
      {
        id: 3,
        name: "神农鼎",
        effect: "炼丹成功率+15%",
        level: 3,
        cost: 5000,
        enhanceCost: 1000,
        maxLevel: 10,
        description: "炼丹神器，提升丹药品质",
        type: "辅助",
      },
      {
        id: 4,
        name: "昆仑镜",
        effect: "奇遇触发率+20%",
        level: 4,
        cost: 20000,
        enhanceCost: 4000,
        maxLevel: 10,
        description: "可窥探天机的神器",
        type: "辅助",
      },
      {
        id: 5,
        name: "东皇钟",
        effect: "全属性+15%",
        level: 5,
        cost: 100000,
        enhanceCost: 20000,
        maxLevel: 10,
        description: "上古神器，威能无穷",
        type: "神器",
      },
      {
        id: 6,
        name: "诛仙剑阵",
        effect: "攻击类法宝效果翻倍",
        level: 6,
        cost: 500000,
        enhanceCost: 100000,
        maxLevel: 10,
        description: "洪荒杀阵，神魔辟易",
        type: "阵法",
      },
      {
        id: 7,
        name: "混沌钟",
        effect: "全属性+30%，渡劫成功率+20%",
        level: 7,
        cost: 2000000,
        enhanceCost: 500000,
        maxLevel: 10,
        description: "混沌至宝，镇压诸天",
        type: "神器",
      },
    ];

    // 丹药系统
    this.pills = [
      {
        id: 1,
        name: "聚气丹",
        effect: 100,
        cost: 50,
        description: "增加100点修为",
        quality: 1,
        type: "修为",
      },
      {
        id: 2,
        name: "筑基丹",
        effect: 500,
        cost: 300,
        description: "突破筑基必备",
        quality: 2,
        type: "突破",
      },
      {
        id: 3,
        name: "凝金丹",
        effect: 2000,
        cost: 1500,
        description: "凝结金丹辅助",
        quality: 3,
        type: "突破",
      },
      {
        id: 4,
        name: "元婴丹",
        effect: 10000,
        cost: 8000,
        description: "孕育元婴所需",
        quality: 4,
        type: "突破",
      },
      {
        id: 5,
        name: "渡劫丹",
        effect: 50000,
        cost: 50000,
        description: "抵御天劫损伤",
        quality: 5,
        type: "渡劫",
      },
      {
        id: 6,
        name: "九转还魂丹",
        effect: 0,
        cost: 100000,
        description: "渡劫失败保命",
        quality: 6,
        type: "保命",
      },
      {
        id: 7,
        name: "九转金丹",
        effect: 500000,
        cost: 300000,
        description: "大幅提升修为",
        quality: 7,
        type: "修为",
      },
      {
        id: 8,
        name: "太虚神丹",
        effect: 0,
        cost: 500000,
        description: "永久提升灵根资质",
        quality: 8,
        type: "资质",
      },
      {
        id: 9,
        name: "悟道丹",
        effect: 0,
        cost: 200000,
        description: "提升悟性",
        quality: 6,
        type: "悟性",
      },
      {
        id: 10,
        name: "长生丹",
        effect: 0,
        cost: 1000000,
        description: "增加寿元",
        quality: 9,
        type: "寿元",
      },
    ];

    // 背包物品系统
    this.items = [
      {
        id: 1,
        name: "下品灵石",
        type: "货币",
        value: 1,
        description: "修仙界基础货币",
      },
      {
        id: 2,
        name: "中品灵石",
        type: "货币",
        value: 100,
        description: "相当于100下品灵石",
      },
      {
        id: 3,
        name: "上品灵石",
        type: "货币",
        value: 10000,
        description: "相当于100中品灵石",
      },
      {
        id: 4,
        name: "极品灵石",
        type: "货币",
        value: 1000000,
        description: "稀有灵石，蕴含精纯灵气",
      },
      {
        id: 5,
        name: "灵草",
        type: "材料",
        value: 50,
        description: "炼丹基础材料",
      },
      {
        id: 6,
        name: "朱果",
        type: "材料",
        value: 500,
        description: "炼制高级丹药的材料",
      },
      {
        id: 7,
        name: "千年灵芝",
        type: "材料",
        value: 5000,
        description: "稀有灵药，可炼制珍品丹药",
      },
      {
        id: 8,
        name: "玄铁",
        type: "材料",
        value: 200,
        description: "炼制法宝的基础材料",
      },
      {
        id: 9,
        name: "星辰砂",
        type: "材料",
        value: 5000,
        description: "炼制高级法宝的材料",
      },
      {
        id: 10,
        name: "秘境地图",
        type: "特殊",
        value: 10000,
        description: "记载秘境位置的地图",
      },
      {
        id: 11,
        name: "宗门令",
        type: "特殊",
        value: 0,
        description: "宗门身份象征",
      },
      {
        id: 12,
        name: "渡劫符",
        type: "消耗品",
        value: 50000,
        description: "减少天劫伤害20%",
      },
    ];

    // 商店系统
    this.shopItems = [
      { id: 1, itemId: 5, price: 60, dailyLimit: 100 }, // 灵草
      { id: 2, itemId: 8, price: 250, dailyLimit: 50 }, // 玄铁
      { id: 3, itemId: 1, price: 1, dailyLimit: 10000 }, // 下品灵石
      { id: 4, itemId: 2, price: 100, dailyLimit: 100 }, // 中品灵石
      { id: 5, itemId: 12, price: 50000, dailyLimit: 5 }, // 渡劫符
      { id: 6, itemId: 9, price: 6000, dailyLimit: 10 }, // 星辰砂
      { id: 7, itemId: 6, price: 600, dailyLimit: 20 }, // 朱果
    ];

    // 宗门系统
    this.sectRanks = [
      { id: 1, name: "外门弟子", salary: 100, permissions: [] },
      { id: 2, name: "内门弟子", salary: 200, permissions: ["接任务"] },
      {
        id: 3,
        name: "核心弟子",
        salary: 300,
        permissions: ["接任务", "使用修炼室"],
      },
      {
        id: 4,
        name: "执事",
        salary: 400,
        permissions: ["接任务", "使用修炼室", "招募弟子"],
      },
      {
        id: 5,
        name: "长老",
        salary: 500,
        permissions: ["接任务", "使用修炼室", "招募弟子", "发布任务"],
      },
      {
        id: 6,
        name: "护法",
        salary: 700,
        permissions: [
          "接任务",
          "使用修炼室",
          "招募弟子",
          "发布任务",
          "惩罚弟子",
        ],
      },
      {
        id: 7,
        name: "副宗主",
        salary: 1000,
        permissions: [
          "接任务",
          "使用修炼室",
          "招募弟子",
          "发布任务",
          "惩罚弟子",
          "升级建筑",
        ],
      },
      { id: 8, name: "宗主", salary: 1500, permissions: ["所有权限"] },
    ];

    // 宗门任务
    this.sectMissions = [
      {
        id: 1,
        name: "采集灵草",
        reward: { stone: 100, contribution: 10 },
        description: "采集10株灵草",
      },
      {
        id: 2,
        name: "猎杀妖兽",
        reward: { stone: 200, contribution: 20 },
        description: "猎杀5只炼气期妖兽",
      },
      {
        id: 3,
        name: "守卫宗门",
        reward: { stone: 500, contribution: 50 },
        description: "参与宗门守卫任务",
      },
      {
        id: 4,
        name: "探索秘境",
        reward: { stone: 800, contribution: 80 },
        description: "探索未知秘境",
      },
      {
        id: 5,
        name: "炼制丹药",
        reward: { stone: 300, contribution: 30 },
        description: "为宗门炼制10枚聚气丹",
      },
      {
        id: 6,
        name: "教导弟子",
        reward: { stone: 400, contribution: 40 },
        description: "指导新入门弟子修炼",
      },
    ];

    // 宗门商店
    this.sectShop = [
      {
        id: 1,
        itemId: 3,
        price: 100,
        contribution: 50,
        description: "100下品灵石",
      },
      { id: 2, itemId: 5, price: 0, contribution: 10, description: "灵草×10" },
      {
        id: 3,
        itemId: 2,
        price: 0,
        contribution: 100,
        description: "中品灵石×1",
      },
      {
        id: 4,
        itemId: 12,
        price: 0,
        contribution: 500,
        description: "渡劫符×1",
      },
      {
        id: 5,
        itemId: 7,
        price: 0,
        contribution: 1000,
        description: "千年灵芝×1",
      },
      {
        id: 6,
        itemId: 4,
        price: 0,
        contribution: 5000,
        description: "上品灵石×1",
      },
    ];

    // 数据存储路径
    this.dataPath = path.join(process.cwd(), "data/cultivation_data");
    this.userDataFile = path.join(this.dataPath, "user_data.json");
    this.sectDataFile = path.join(this.dataPath, "sect_data.json");
    this.shopDataFile = path.join(this.dataPath, "shop_data.json");

    // 初始化数据存储
    this.initStorage();
    this.loadData();

    // 每日任务
    schedule.scheduleJob("0 0 0 * * *", () => this.dailyReset());
    // 每周宗门福利
    schedule.scheduleJob("0 0 0 * * 1", () => this.weeklySectBenefits());
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

    if (!fs.existsSync(this.shopDataFile)) {
      fs.writeFileSync(
        this.shopDataFile,
        JSON.stringify({
          lastReset: Date.now(),
          dailySold: {},
        })
      );
    }
  }

  /** 加载数据 */
  loadData() {
    try {
      this.userData = JSON.parse(fs.readFileSync(this.userDataFile, "utf8"));
      this.sects = JSON.parse(fs.readFileSync(this.sectDataFile, "utf8"));
      this.shopData = JSON.parse(fs.readFileSync(this.shopDataFile, "utf8"));

      // 检查商店每日重置
      const now = Date.now();
      const lastReset = new Date(this.shopData.lastReset);
      const today = new Date(now);

      if (
        lastReset.getDate() !== today.getDate() ||
        lastReset.getMonth() !== today.getMonth() ||
        lastReset.getFullYear() !== today.getFullYear()
      ) {
        this.shopData.dailySold = {};
        this.shopData.lastReset = now;
        this.saveShopData();
      }
    } catch (err) {
      console.error("修仙数据加载失败:", err);
      this.userData = {};
      this.sects = {};
      this.shopData = {
        lastReset: Date.now(),
        dailySold: {},
      };
    }
  }

  /** 保存数据 */
  saveData() {
    fs.writeFileSync(this.userDataFile, JSON.stringify(this.userData, null, 2));
    fs.writeFileSync(this.sectDataFile, JSON.stringify(this.sects, null, 2));
  }

  /** 保存商店数据 */
  saveShopData() {
    fs.writeFileSync(this.shopDataFile, JSON.stringify(this.shopData, null, 2));
  }

  /** 获取用户修仙数据 */
  getUserData(userId) {
    if (!this.userData[userId]) {
      this.userData[userId] = {
        // 基础属性
        realm: 0,
        exp: 0,
        spiritRoot: 0,
        life: 100,
        maxLife: 100,
        stone: 100,
        luck: 50,
        comprehension: 1,
        daoHeart: 1,
        combatPower: 5,

        // 时间记录
        lastCultivate: 0,
        lastSeclusion: 0,
        lastDungeon: 0,
        lastAdventure: 0,
        lastSign: 0,
        lastSalary: 0,
        lastMission: 0,

        // 统计
        signStreak: 0,
        tribulationCount: 0,
        successCount: 0,
        missionsCompleted: 0,

        // 背包系统
        inventory: {
          1: 100, // 下品灵石
          5: 10, // 灵草
        },

        // 功法系统
        arts: [1],
        artLevels: { 1: 1 },

        // 法宝系统
        artifacts: [],
        equippedArtifact: null,
        artifactLevels: {},

        // 丹药系统
        pills: {},

        // 宗门系统
        sect: null,
        sectRank: 1,
        contribution: 0,
        sectJoinDate: Date.now(),

        // 渡劫记录
        tribulationRecords: [],
      };
    }
    return this.userData[userId];
  }

  /** 每日重置 */
  dailyReset() {
    const now = Date.now();
    Object.keys(this.userData).forEach((userId) => {
      const user = this.userData[userId];

      // 每日恢复
      user.luck = Math.min(100, user.luck + 10);
      user.life = Math.min(user.maxLife, user.life + 20);

      // 宗门每日福利
      if (user.sect && this.sects[user.sect]) {
        const sect = this.sects[user.sect];
        user.stone += sect.level * 50;
        user.contribution += 10;
      }
    });

    // 重置商店销售记录
    this.shopData.dailySold = {};
    this.shopData.lastReset = now;
    this.saveShopData();
    this.saveData();
  }

  /** 每周宗门福利 */
  weeklySectBenefits() {
    Object.keys(this.sects).forEach((sectId) => {
      const sect = this.sects[sectId];
      sect.funds += sect.members.length * 100 * sect.level;
    });
    this.saveData();
  }

  /** 帮助信息 */
  async cultivationHelp() {
    const helpMsg = [
      "🌌 终极修仙渡劫系统",
      "================================",
      "🏮 基础指令：",
      "#我的境界 - 查看当前修仙状态",
      "#修炼 - 日常修炼",
      "#突破 - 突破境界",
      "#渡劫 - 渡劫飞升",
      "#每日签到 - 每日领取资源",
      "#领取俸禄 - 领取宗门俸禄",
      "",
      "📦 背包系统：",
      "#我的背包 - 查看背包物品",
      "#使用物品 [ID] - 使用物品",
      "#修仙商店 - 查看修仙商店",
      "#购买物品 [ID] [数量] - 购买物品",
      "#出售物品 [ID] [数量] - 出售物品",
      "",
      "📚 查看系统：",
      "#查看天劫 - 查看天劫体系",
      "#查看功法 - 查看功法系统",
      "#查看宗门体系 - 查看宗门系统",
      "#查看境界体系 - 查看境界系统",
      "#查看法宝系统 - 查看法宝系统",
      "#查看丹药系统 - 查看丹药系统",
      "#查看灵石经济 - 查看经济系统",
      "",
      "⚔️ 战斗系统：",
      "#挑战秘境 [层级] - 挑战秘境",
      "#强化法宝 [ID] - 强化法宝",
      "#渡劫准备 - 准备渡劫",
      "#渡劫记录 - 查看渡劫记录",
      "",
      "👥 宗门系统：",
      "#宗门信息 - 查看宗门信息",
      "#宗门任务 - 接取宗门任务",
      "#宗门商店 - 查看宗门商店",
      "#兑换贡献 [ID] - 兑换贡献点",
      "#传功 @对方 - 传功给道友",
      "#加入宗门 [名称] - 加入宗门",
      "#创建宗门 [名称] - 创建宗门",
      "================================",
      "💎 灵石获取途径：签到、俸禄、秘境、奇遇、任务",
    ].join("\n");
    await this.reply(helpMsg);
  }

  // ==================== 查看系统 ====================

  /** 查看天劫系统 */
  async viewTribulationSystem() {
    let msg = ["⚡ 天劫系统", "================================"];

    this.tribulationTypes.forEach((t) => {
      msg.push(`【${t.name}】`);
      msg.push(`伤害：${t.damage}% 生命值`);
      msg.push(`描述：${t.description}`);
      msg.push(
        `适用境界：${t.levels.map((l) => this.realms[l].name).join("、")}`
      );
      msg.push(`渡劫成功奖励：${t.successBonus}`);
      msg.push("--------------------------------");
    });

    msg.push("💡 提示：不同境界可能遭遇不同天劫，请做好充分准备");
    await this.reply(msg.join("\n"));
  }

  /** 查看功法系统 */
  async viewArtSystem() {
    let msg = ["📜 功法系统", "================================"];

    this.arts.forEach((a) => {
      msg.push(`【${a.name}】★${a.level}`);
      msg.push(`效果：${a.effect}`);
      msg.push(`描述：${a.description}`);
      msg.push(`修炼要求：${a.requirements || "无"}`);
      msg.push("--------------------------------");
    });

    msg.push("💡 提示：功法可大幅提升修炼效率和渡劫成功率");
    await this.reply(msg.join("\n"));
  }

  /** 查看宗门体系 */
  async viewSectSystem() {
    let msg = ["🏯 宗门体系", "================================"];

    msg.push("【宗门等级】");
    msg.push("1级：基础宗门，每日福利50灵石");
    msg.push("2级：小型宗门，每日福利100灵石，解锁修炼室");
    msg.push("3级：中型宗门，每日福利150灵石，解锁藏经阁");
    msg.push("4级：大型宗门，每日福利200灵石，解锁炼丹房");
    msg.push("5级：顶级宗门，每日福利300灵石，解锁所有设施");
    msg.push("--------------------------------");

    msg.push("【宗门职位】");
    this.sectRanks.forEach((r) => {
      msg.push(
        `${r.name}：俸禄${r.salary}灵石/天，权限：${
          r.permissions.join("、") || "无"
        }`
      );
    });
    msg.push("--------------------------------");

    msg.push("【宗门建筑】");
    msg.push("修炼室：提升修炼效率20%");
    msg.push("藏经阁：解锁高级功法");
    msg.push("炼丹房：提升炼丹成功率15%");
    msg.push("炼器坊：提升法宝强化成功率10%");
    msg.push("护山大阵：减少外敌入侵概率");

    await this.reply(msg.join("\n"));
  }

  /** 查看境界体系 */
  async viewRealmSystem() {
    let msg = ["🌠 境界体系", "================================"];

    this.realms.forEach((r, i) => {
      if (i % 6 === 0 && i !== 0) {
        msg.push("--------------------------------");
      }
      msg.push(`【${r.name}】需修为：${r.maxExp.toLocaleString()}`);
      msg.push(`描述：${r.description}`);
    });

    msg.push("================================");
    msg.push("💡 提示：境界越高，实力越强，但突破难度也越大");
    await this.reply(msg.join("\n"));
  }

  /** 查看法宝系统 */
  async viewArtifactSystem() {
    let msg = ["🔮 法宝系统", "================================"];

    this.artifacts.forEach((a) => {
      msg.push(`【${a.name}】★${a.level}`);
      msg.push(`类型：${a.type}`);
      msg.push(`效果：${a.effect}`);
      msg.push(`炼制成本：${a.cost}灵石`);
      msg.push(`强化消耗：${a.enhanceCost}灵石/次`);
      msg.push(`描述：${a.description}`);
      msg.push("--------------------------------");
    });

    msg.push("💡 提示：法宝可大幅提升修炼和战斗效率");
    await this.reply(msg.join("\n"));
  }

  /** 查看丹药系统 */
  async viewPillSystem() {
    let msg = ["💊 丹药系统", "================================"];

    msg.push("【丹药类型】");
    msg.push("修为类：直接增加修为");
    msg.push("突破类：提升突破成功率");
    msg.push("渡劫类：增强渡劫能力");
    msg.push("资质类：永久提升属性");
    msg.push("保命类：防止渡劫失败陨落");
    msg.push("--------------------------------");

    msg.push("【丹药品质】");
    msg.push("1-3星：普通丹药");
    msg.push("4-6星：高级丹药");
    msg.push("7-9星：极品丹药");
    msg.push("--------------------------------");

    msg.push("【代表丹药】");
    this.pills.slice(0, 5).forEach((p) => {
      msg.push(`● ${p.name}：${p.description}`);
    });

    await this.reply(msg.join("\n"));
  }

  /** 查看灵石经济 */
  async viewEconomySystem() {
    let msg = ["💎 灵石经济系统", "================================"];

    msg.push("【灵石体系】");
    msg.push("1下品灵石 = 基础单位");
    msg.push("1中品灵石 = 100下品灵石");
    msg.push("1上品灵石 = 100中品灵石");
    msg.push("1极品灵石 = 100上品灵石");
    msg.push("--------------------------------");

    msg.push("【获取途径】");
    msg.push("1. 每日签到");
    msg.push("2. 宗门俸禄");
    msg.push("3. 秘境挑战");
    msg.push("4. 奇遇探索");
    msg.push("5. 宗门任务");
    msg.push("6. 物品出售");
    msg.push("7. 灵石兑换");
    msg.push("--------------------------------");

    msg.push("【消费途径】");
    msg.push("1. 购买物品");
    msg.push("2. 炼制法宝");
    msg.push("3. 炼制丹药");
    msg.push("4. 强化法宝");
    msg.push("5. 宗门建设");
    msg.push("6. 功法领悟");

    await this.reply(msg.join("\n"));
  }

  // ==================== 背包系统 ====================

  /** 查看背包 */
  async viewInventory() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    let msg = ["🎒 我的背包", "================================"];
    let totalValue = 0;
    let hasItems = false;

    for (const itemId in user.inventory) {
      const id = parseInt(itemId);
      const quantity = user.inventory[itemId];
      if (quantity > 0) {
        const item = this.items.find((i) => i.id === id);
        if (item) {
          hasItems = true;
          const value = item.value * quantity;
          totalValue += value;
          msg.push(`[${item.id}] ${item.name} ×${quantity}`);
          msg.push(`  类型: ${item.type} | 价值: ${value}灵石`);
          msg.push(`  描述: ${item.description}`);
          msg.push("--------------------------------");
        }
      }
    }

    if (!hasItems) {
      msg.push("📭 背包空空如也");
    } else {
      msg.push(`💰 背包总价值: ${totalValue}灵石`);
    }

    msg.push("使用 #使用物品 [ID] 使用物品");
    msg.push("使用 #出售物品 [ID] [数量] 出售物品");

    await this.reply(msg.join("\n"));
  }

  /** 使用物品 */
  async useItem() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const itemId = parseInt(this.e.msg.match(/^#使用物品\s+(\d+)$/)[1]);

    const item = this.items.find((i) => i.id === itemId);
    if (!item) return this.reply("❌ 物品不存在");

    if (!user.inventory[itemId] || user.inventory[itemId] <= 0) {
      return this.reply(`❌ 没有 ${item.name}`);
    }

    user.inventory[itemId]--;

    switch (itemId) {
      case 12: // 渡劫符
        if (!user.pills[12]) user.pills[12] = 0;
        user.pills[12]++;
        await this.reply(`🛡️ 使用渡劫符，下次渡劫伤害减少20%`);
        break;
      default:
        await this.reply(`✅ 使用 ${item.name} ×1`);
    }

    this.saveData();
  }

  // ==================== 商店系统 ====================

  /** 查看修仙商店 */
  async viewShop() {
    let msg = ["🏪 修仙商店", "================================"];

    this.shopItems.forEach((si) => {
      const item = this.items.find((i) => i.id === si.itemId);
      const soldToday = this.shopData.dailySold[si.id] || 0;
      const remaining = si.dailyLimit - soldToday;

      if (item) {
        msg.push(`[${si.id}] ${item.name} - ${item.description}`);
        msg.push(
          `  价格: ${si.price}灵石 | 今日剩余: ${remaining}/${si.dailyLimit}`
        );
        msg.push("--------------------------------");
      }
    });

    msg.push("使用 #购买物品 [ID] [数量] 购买物品");
    msg.push("使用 #出售物品 [ID] [数量] 出售物品");

    await this.reply(msg.join("\n"));
  }

  /** 购买物品 */
  async buyItem() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#购买物品\s+(\d+)\s*(\d+)?$/);
    const shopItemId = parseInt(match[1]);
    const quantity = match[2] ? parseInt(match[2]) : 1;

    if (quantity < 1) return this.reply("❌ 数量必须大于0");

    const shopItem = this.shopItems.find((si) => si.id === shopItemId);
    if (!shopItem) return this.reply("❌ 商品不存在");

    const soldToday = this.shopData.dailySold[shopItemId] || 0;
    if (soldToday + quantity > shopItem.dailyLimit) {
      return this.reply(
        `❌ 今日剩余数量不足，仅剩 ${shopItem.dailyLimit - soldToday} 件`
      );
    }

    const totalCost = shopItem.price * quantity;
    if (user.stone < totalCost) {
      return this.reply(`❌ 灵石不足，需要 ${totalCost} 灵石`);
    }

    const item = this.items.find((i) => i.id === shopItem.itemId);
    if (!item) return this.reply("❌ 物品数据异常");

    // 更新数据
    user.stone -= totalCost;
    user.inventory[shopItem.itemId] =
      (user.inventory[shopItem.itemId] || 0) + quantity;
    this.shopData.dailySold[shopItemId] = soldToday + quantity;

    this.saveData();
    this.saveShopData();

    await this.reply(
      [
        `🛒 购买成功！`,
        `✅ 获得 ${item.name} ×${quantity}`,
        `💎 花费 ${totalCost} 灵石`,
        `📦 当前数量：${user.inventory[shopItem.itemId]}`,
      ].join("\n")
    );
  }

  /** 出售物品 */
  async sellItem() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#出售物品\s+(\d+)\s*(\d+)?$/);
    const itemId = parseInt(match[1]);
    const quantity = match[2] ? parseInt(match[2]) : 1;

    if (quantity < 1) return this.reply("❌ 数量必须大于0");

    const item = this.items.find((i) => i.id === itemId);
    if (!item) return this.reply("❌ 物品不存在");

    if (!user.inventory[itemId] || user.inventory[itemId] < quantity) {
      return this.reply(
        `❌ ${item.name} 数量不足，仅有 ${user.inventory[itemId] || 0} 件`
      );
    }

    // 计算出售价格（70%价值）
    const totalValue = Math.floor(item.value * quantity * 0.7);

    // 更新数据
    user.inventory[itemId] -= quantity;
    if (user.inventory[itemId] <= 0) delete user.inventory[itemId];
    user.stone += totalValue;

    this.saveData();

    await this.reply(
      [
        `💰 出售成功！`,
        `✅ 出售 ${item.name} ×${quantity}`,
        `💎 获得 ${totalValue} 灵石`,
        `📦 剩余数量：${user.inventory[itemId] || 0}`,
      ].join("\n")
    );
  }

  // ==================== 法宝系统 ====================

  /** 强化法宝 */
  async enhanceArtifact() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const artifactId = parseInt(this.e.msg.match(/^#强化法宝\s+(\d+)$/)[1]);

    const artifact = this.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return this.reply("❌ 法宝不存在");

    if (!user.artifacts.includes(artifactId)) {
      return this.reply(`❌ 未拥有 ${artifact.name}`);
    }

    const currentLevel = user.artifactLevels[artifactId] || 1;
    if (currentLevel >= artifact.maxLevel) {
      return this.reply(`❌ ${artifact.name} 已达最大等级`);
    }

    const enhanceCost = artifact.enhanceCost * currentLevel;
    if (user.stone < enhanceCost) {
      return this.reply(`❌ 灵石不足，需要 ${enhanceCost} 灵石`);
    }

    // 强化成功率
    const baseRate = 80 - currentLevel * 5;
    const luckBonus = Math.floor(user.luck / 10);
    const successRate = Math.max(30, baseRate + luckBonus);
    const success = Math.random() * 100 < successRate;

    user.stone -= enhanceCost;

    if (success) {
      user.artifactLevels[artifactId] = currentLevel + 1;
      await this.reply(
        [
          `✨ 强化成功！`,
          `🔮 ${artifact.name} 提升至 ${currentLevel + 1} 级`,
          `💎 消耗 ${enhanceCost} 灵石`,
          `📈 效果提升：${Math.floor(10 * currentLevel)}%`,
        ].join("\n")
      );
    } else {
      await this.reply(
        [
          `💥 强化失败！`,
          `💎 损失 ${enhanceCost} 灵石`,
          `😢 下次强化成功率增加5%`,
        ].join("\n")
      );
    }

    this.saveData();
  }

  // ==================== 宗门扩展系统 ====================

  /** 宗门任务 */
  async sectMission() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法接取任务");
    }

    const now = Date.now();
    if (now - user.lastMission < 21600000) {
      // 6小时CD
      const remaining = Math.ceil(
        (21600000 - (now - user.lastMission)) / 3600000
      );
      return this.reply(`⏳ 请 ${remaining} 小时后再接取新任务`);
    }

    const mission =
      this.sectMissions[Math.floor(Math.random() * this.sectMissions.length)];

    // 记录任务
    user.currentMission = mission.id;
    user.lastMission = now;
    this.saveData();

    await this.reply(
      [
        `📋 宗门任务接取成功！`,
        `✅ 任务名称：${mission.name}`,
        `📝 任务要求：${mission.description}`,
        `🎁 任务奖励：${mission.reward.stone}灵石 + ${mission.reward.contribution}贡献`,
        `⏳ 完成任务后自动领取奖励`,
      ].join("\n")
    );
  }

  /** 完成宗门任务 */
  async completeMission(userId) {
    const user = this.getUserData(userId);
    if (!user.currentMission) return;

    const mission = this.sectMissions.find((m) => m.id === user.currentMission);
    if (!mission) return;

    user.stone += mission.reward.stone;
    user.contribution += mission.reward.contribution;
    user.missionsCompleted = (user.missionsCompleted || 0) + 1;
    delete user.currentMission;

    // 宗门奖励
    if (user.sect && this.sects[user.sect]) {
      this.sects[user.sect].funds += mission.reward.stone * 0.2;
    }

    this.saveData();

    await this.reply(
      [
        `🎉 宗门任务完成！`,
        `✅ 任务名称：${mission.name}`,
        `💎 获得灵石：${mission.reward.stone}`,
        `🎖️ 获得贡献：${mission.reward.contribution}`,
        `📊 累计完成任务：${user.missionsCompleted}次`,
      ].join("\n")
    );
  }

  /** 查看宗门商店 */
  async sectShop() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法使用宗门商店");
    }

    let msg = ["🏬 宗门商店", "================================"];
    msg.push(`🎖️ 你的贡献：${user.contribution}`);

    this.sectShop.forEach((ss) => {
      const item = this.items.find((i) => i.id === ss.itemId);
      if (item) {
        msg.push(`[${ss.id}] ${item.name} ×${ss.price || 1}`);
        msg.push(`  兑换：${ss.contribution}贡献`);
        msg.push(`  描述：${ss.description}`);
        msg.push("--------------------------------");
      }
    });

    msg.push("使用 #兑换贡献 [ID] 兑换物品");

    await this.reply(msg.join("\n"));
  }

  /** 兑换贡献 */
  async exchangeContribution() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const shopId = parseInt(this.e.msg.match(/^#兑换贡献\s+(\d+)$/)[1]);

    if (!user.sect) {
      return this.reply("❌ 未加入宗门，无法兑换");
    }

    const shopItem = this.sectShop.find((ss) => ss.id === shopId);
    if (!shopItem) return this.reply("❌ 商品不存在");

    if (user.contribution < shopItem.contribution) {
      return this.reply(`❌ 贡献不足，需要 ${shopItem.contribution} 贡献`);
    }

    const item = this.items.find((i) => i.id === shopItem.itemId);
    if (!item) return this.reply("❌ 物品数据异常");

    // 更新数据
    user.contribution -= shopItem.contribution;
    user.inventory[shopItem.itemId] =
      (user.inventory[shopItem.itemId] || 0) + (shopItem.price || 1);

    this.saveData();

    await this.reply(
      [
        `🔄 兑换成功！`,
        `✅ 获得 ${item.name} ×${shopItem.price || 1}`,
        `🎖️ 消耗 ${shopItem.contribution} 贡献`,
        `📦 当前数量：${user.inventory[shopItem.itemId]}`,
      ].join("\n")
    );
  }

  /** 传功 */
  async transferPower() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const match = this.e.msg.match(/^#传功\s*@?(\d+)?$/);
    const targetId = match[1] || this.e.at;

    if (!targetId) {
      return this.reply("❌ 请@指定传功对象");
    }

    if (targetId === userId) {
      return this.reply("❌ 不能对自己传功");
    }

    const targetUser = this.getUserData(targetId);

    // 检查境界差距
    if (user.realm < targetUser.realm + 3) {
      return this.reply("❌ 传功者境界需高于接受者至少3个小境界");
    }

    // 传功消耗
    const cost = 100000 * (targetUser.realm - user.realm + 3);
    if (user.exp < cost) {
      return this.reply(`❌ 修为不足，传功需要 ${cost} 修为`);
    }

    // 计算收益
    const gain = Math.floor(cost * 0.7);

    user.exp -= cost;
    targetUser.exp += gain;

    this.saveData();

    await this.reply(
      [
        `✨ ${this.e.sender.card || this.e.sender.nickname} 向 ${
          this.e.at
        } 传功...`,
        `💫 传功成功！`,
        `📉 消耗修为：${cost}`,
        `📈 对方获得修为：${gain}`,
        `💖 大道同修，共证长生！`,
      ].join("\n")
    );
  }

  /** 渡劫记录 */
  async tribulationRecords() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (!user.tribulationRecords || user.tribulationRecords.length === 0) {
      return this.reply("📭 暂无渡劫记录");
    }

    let msg = ["⚡ 渡劫记录", "================================"];

    user.tribulationRecords
      .slice(-10)
      .reverse()
      .forEach((record, index) => {
        msg.push(`【第${user.tribulationRecords.length - index}次渡劫】`);
        msg.push(`时间：${new Date(record.time).toLocaleString()}`);
        msg.push(`天劫：${record.type}`);
        msg.push(`结果：${record.success ? "成功" : "失败"}`);
        if (!record.success) {
          msg.push(`原因：${record.reason}`);
        }
        msg.push("--------------------------------");
      });

    await this.reply(msg.join("\n"));
  }

  // ==================== 核心修仙功能 ====================

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
      user.signStreak = 1; // 重置连续签到
    }

    // 基础奖励
    let stoneReward = 100 + user.realm * 20;
    let expReward = 50 + user.realm * 10;
    let extraMsg = "";

    // 连续签到奖励
    if (user.signStreak >= 7) {
      stoneReward *= 2;
      expReward *= 2;
      extraMsg = "🎁 连续签到7天奖励翻倍！";
    } else if (user.signStreak >= 3) {
      stoneReward = Math.floor(stoneReward * 1.5);
      expReward = Math.floor(expReward * 1.5);
      extraMsg = "🎁 连续签到3天奖励提升50%！";
    }

    // 气运加成
    const luckBonus = Math.floor(user.luck / 10);
    stoneReward += luckBonus * 10;
    expReward += luckBonus * 5;

    // 随机额外奖励
    let randomReward = "";
    const rand = Math.random();
    if (rand < 0.1) {
      // 10%概率获得丹药
      const pillId = Math.min(8, Math.floor(Math.random() * 3) + 1);
      if (!user.pills[pillId]) user.pills[pillId] = 0;
      user.pills[pillId] += 1;
      const pill = this.pills.find((p) => p.id === pillId);
      randomReward = `，额外获得 ${pill.name}×1`;
    } else if (rand < 0.2) {
      // 10%概率增加气运
      user.luck = Math.min(100, user.luck + 5);
      randomReward = `，🍀气运+5`;
    }

    // 更新用户数据
    user.stone += stoneReward;
    user.exp += expReward;
    user.lastSign = now;
    user.luck = Math.min(100, user.luck + 1); // 每日签到增加1点气运

    this.saveData();

    await this.reply(
      [
        "🎉 签到成功！获得修仙资源：",
        `💎 灵石 +${stoneReward}`,
        `✨ 修为 +${expReward}`,
        `📅 连续签到：${user.signStreak}天`,
        extraMsg,
        randomReward,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  /** 查看境界 */
  async checkCultivation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const realmIndex = user.realm;
    const realm = this.realms[realmIndex];
    const nextRealm =
      realmIndex < this.realms.length - 1
        ? this.realms[realmIndex + 1]
        : "已至巅峰";

    // 计算属性加成
    const spiritRoot = this.spiritRoots[user.spiritRoot];
    const expRate = spiritRoot.expRate * (1 + user.comprehension * 0.1);

    const msg = [
      `🧘 道号：${this.e.sender.card || this.e.sender.nickname}`,
      `🌠 境界：${realm.name}（${user.exp}/${realm.maxExp}）`,
      `✨ 灵根：${spiritRoot.name}（修炼效率×${expRate.toFixed(1)}）`,
      `❤️ 生命：${user.life}/100`,
      `🍀 气运：${user.luck}/100`,
      `💎 灵石：${user.stone}`,
      `⚔️ 战斗力：${user.combatPower}`,
      `⬆️ 下一境界：${nextRealm.name || "已至巅峰"}`,
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
      const rank = this.sectRanks.find((r) => r.id === user.sectRank);
      msg.push(`🏯 宗门：${sect.name}（${rank.name}）`);
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

  /** 日常修炼 */
  async cultivate() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 检查修炼CD（30分钟）
    if (now - user.lastCultivate < 1800000) {
      const remaining = Math.ceil(
        (1800000 - (now - user.lastCultivate)) / 60000
      );
      return this.reply(`🕒 修炼需调息，请${remaining}分钟后再试`);
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
    const currentRealm = this.realms[user.realm];
    if (
      user.exp >= currentRealm.maxExp &&
      user.realm < this.realms.length - 1
    ) {
      const nextRealm = this.realms[user.realm + 1];
      extraMsg += `\n🌅 修为已达圆满，可尝试 #突破 至 ${nextRealm.name}！`;
    }

    this.saveData();

    await this.reply(
      [
        `🧘 运转周天，炼化天地灵气...`,
        `✅ 修为 +${expGain}（当前：${user.exp}/${currentRealm.maxExp}）`,
        extraMsg,
      ].join("\n")
    );
  }

  /** 突破境界 */
  async breakthrough() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const currentRealm = this.realms[user.realm];

    // 检查是否达到突破要求
    if (user.exp < currentRealm.maxExp) {
      return this.reply(
        `❌ 修为不足！还需 ${currentRealm.maxExp - user.exp} 点修为方可突破`
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
      const newRealm = this.realms[user.realm];
      user.exp = 0;
      user.combatPower += 50;
      user.daoHeart = Math.min(10, user.daoHeart + 0.5);

      await this.reply(
        [
          `🌈 突破成功！`,
          `🎉 境界提升至：${newRealm.name}！`,
          `💎 消耗灵石：${stoneCost}`,
          `❤️ 生命上限提升！`,
          `✨ 下一境界：${
            this.realms[user.realm + 1]?.name || "已至巅峰"
          }（需 ${newRealm.maxExp} 修为）`,
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

  /** 渡劫准备 */
  async tribulationPreparation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    if (user.realm < this.realms.length - 3) {
      return this.reply("❌ 境界不足！至少需要渡劫初期才可准备渡劫");
    }

    // 随机选择天劫类型
    const tribulationType =
      this.tribulationTypes[
        Math.floor(Math.random() * this.tribulationTypes.length)
      ];

    // 计算成功率
    const baseRate = 30;
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
      `📜 ${tribulationType.description}`,
      `💔 预计伤害：${tribulationType.damage}%生命值`,
      `✅ 当前渡劫成功率：${successRate}%`,
      `🍀 气运值：${user.luck}/100`,
      `💖 道心：${user.daoHeart.toFixed(1)}/10`,
      `🔮 渡劫丹：${user.pills[5] || 0}枚`,
      `📜 护体功法：${artBonus > 0 ? "已掌握" : "未掌握"}`,
      `🔧 护身法宝：${artifactBonus > 0 ? "已装备" : "未装备"}`,
    ];

    await this.reply(msg.join("\n"));
  }

  /** 渡劫飞升 */
  async tribulation() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);

    // 检查是否达到渡劫条件
    if (user.realm < this.realms.length - 3) {
      return this.reply(`❌ 境界不足！需达到渡劫初期方可渡劫`);
    }

    const currentRealm = this.realms[user.realm];
    if (user.exp < currentRealm.maxExp) {
      return this.reply(
        `❌ 修为不足！还需 ${currentRealm.maxExp - user.exp} 点修为方可渡劫`
      );
    }

    user.tribulationCount++;

    // 随机选择天劫类型
    const tribulationType =
      this.tribulationTypes[
        Math.floor(Math.random() * this.tribulationTypes.length)
      ];

    // 渡劫成功率计算
    const baseSuccessRate = 30; // 基础成功率30%
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
    resultMsg.push(tribulationType.description);

    // 记录渡劫
    const record = {
      time: Date.now(),
      type: tribulationType.name,
      success: success,
      reason: "",
    };

    if (!user.tribulationRecords) user.tribulationRecords = [];
    user.tribulationRecords.push(record);
    if (user.tribulationRecords.length > 20) {
      user.tribulationRecords.shift(); // 保留最近20条记录
    }

    if (success) {
      // 渡劫成功
      user.successCount++;
      user.realm = Math.min(this.realms.length - 1, user.realm + 1);
      const newRealm = this.realms[user.realm];
      user.exp = 0;
      user.life = 200;
      user.combatPower += 1000;

      resultMsg.push(`🌈 霞光万道，仙门大开！`);
      resultMsg.push(`🎉 渡劫成功！境界提升至：${newRealm.name}！`);

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
      record.reason = "天劫威力过大";

      // 如果有九转还魂丹则保命
      if (user.pills[6] && user.pills[6] > 0) {
        user.pills[6]--;
        user.life = 1;
        resultMsg.push(`✨ 九转还魂丹生效，勉强保住性命`);
        resultMsg.push(`💔 消耗一枚九转还魂丹`);
      } else {
        user.realm = Math.max(0, user.realm - 3);
        user.exp = 0;
        const fallenRealm = this.realms[user.realm];
        resultMsg.push(`💥 渡劫失败，境界跌落至 ${fallenRealm.name}`);
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
          `${p.id}. ${p.name} ★${p.quality} - ${p.description}\n  效果: ${
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
    const pillId = parseInt(this.e.msg.match(/^#炼丹\s+(\d+)$/)[1]);

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
    const pillId = parseInt(this.e.msg.match(/^#服用丹药\s+(\d+)$/)[1]);

    const pill = this.pills.find((p) => p.id === pillId);
    if (!pill) return this.reply("❌ 丹药不存在");

    if (!user.pills[pillId] || user.pills[pillId] <= 0) {
      return this.reply(`❌ 没有 ${pill.name}，请先炼制`);
    }

    user.pills[pillId]--;

    if (pill.effect > 0) {
      // 修为丹药
      user.exp += pill.effect;
      await this.reply(
        [
          `🍵 服用 ${pill.name}，灵力涌动...`,
          `✨ 修为 +${pill.effect}（当前：${user.exp}/${
            this.realms[user.realm].maxExp
          }）`,
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
            `✨ 修为 +100000（当前：${user.exp}/${
              this.realms[user.realm].maxExp
            }）`,
          ].join("\n")
        );
      }
    } else if (pill.id === 9) {
      // 悟道丹 - 提升悟性
      user.comprehension = Math.min(10, user.comprehension + 0.5);
      await this.reply(
        [
          `🍵 服用 ${pill.name}，灵台清明...`,
          `🧠 悟性 +0.5（当前：${user.comprehension}）`,
        ].join("\n")
      );
    } else {
      // 特殊丹药
      user.life = Math.min(100, user.life + 50);
      await this.reply(
        [
          `🍵 服用 ${pill.name}，伤势恢复...`,
          `❤️ 生命值 +50（当前：${user.life}/100）`,
        ].join("\n")
      );
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

    // 检查闭关CD（24小时）
    if (now - user.lastSeclusion < 86400000) {
      const remaining = Math.ceil(
        (86400000 - (now - user.lastSeclusion)) / 3600000
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
        `✨ 修为 +${expGain}（当前：${user.exp}/${
          this.realms[user.realm].maxExp
        })`,
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
    const availableArts = this.arts.filter((a) => !user.arts.includes(a.id));
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

    // 奇遇CD（8小时）
    if (now - user.lastAdventure < 28800000) {
      const remaining = Math.ceil(
        (28800000 - (now - user.lastAdventure)) / 3600000
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

    // 检查是否有任务完成
    if (user.currentMission) {
      await this.completeMission(userId);
    }
  }

  /** 挑战秘境 */
  async challengeDungeon() {
    const userId = this.e.user_id;
    const user = this.getUserData(userId);
    const now = Date.now();

    // 解析秘境层级
    const match = this.e.msg.match(/^#挑战秘境\s*(\d+)?$/);
    let dungeonLevel = match[1] ? parseInt(match[1]) : 1;

    // 检查CD（4小时）
    if (now - user.lastDungeon < 14400000) {
      const remaining = Math.ceil(
        (14400000 - (now - user.lastDungeon)) / 3600000
      );
      return this.reply(`🕒 秘境尚未恢复，请${remaining}小时后再挑战`);
    }

    // 检查境界是否足够
    if (dungeonLevel < 1 || dungeonLevel > 5) {
      return this.reply(`❌ 秘境层级 ${dungeonLevel} 不存在，可用层级：1-5`);
    }

    const minRealm = [0, 4, 8, 12, 20][dungeonLevel - 1];
    if (user.realm < minRealm) {
      return this.reply(
        `❌ 境界不足！需要 ${this.realms[minRealm].name} 才能挑战层级${dungeonLevel}秘境`
      );
    }

    user.lastDungeon = now;

    // 计算挑战结果
    const successRate = 60 + user.combatPower * 0.1 + user.luck / 2;
    const success = Math.random() * 100 < successRate;

    let resultMsg = [`🏞️ 进入秘境层级 ${dungeonLevel}...`];

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

    // 检查是否有任务完成
    if (user.currentMission) {
      await this.completeMission(userId);
    }
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
        `❌ 境界不足！需要 ${this.realms[artifact.level * 2].name} 才能炼制 ${
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
    const rank = this.sectRanks.find((r) => r.id === user.sectRank);

    let msg = [
      `🏯 宗门：${sect.name}`,
      `⭐ 等级：${sect.level}`,
      `🎖️ 声望：${sect.prestige}`,
      `💎 资金：${sect.funds}`,
      `👥 成员：${sect.members.length}人`,
      `👑 宗主：${sect.leaderName}`,
      `👤 你的职位：${rank.name}`,
      `📜 宗门福利：`,
      `  每日灵石：${sect.level * 50}`,
      `  每周资金：${sect.members.length * 100 * sect.level}`,
      `  修炼效率：+${sect.level * 5}%`,
      `\n📢 宗门公告：${sect.notice || "暂无公告"}`,
    ];

    // 显示宗门成员（最多10人）
    if (sect.members.length > 0) {
      msg.push("\n👥 核心成员：");
      const topMembers = sect.members.slice(0, 5).map((id) => {
        const member = this.userData[id];
        const memberRank = this.sectRanks.find((r) => r.id === member.sectRank);
        return {
          id,
          name: this.getUserName(id),
          realm: member.realm,
          rank: memberRank.name,
        };
      });

      topMembers.forEach((member) => {
        msg.push(
          `  ${member.rank} ${member.name} - ${this.realms[member.realm].name}`
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
    user.sectRank = 1; // 外门弟子
    sect.members.push(userId);

    this.saveData();

    await this.reply(
      [
        `🎉 成功加入宗门：${sect.name}`,
        `👥 当前成员：${sect.members.length}人`,
        `📜 宗门公告：${sect.notice || "暂无公告"}`,
        `💎 每日可领取 ${sect.level * 50} 灵石福利`,
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
    user.sectRank = 8; // 宗主

    this.saveData();

    await this.reply(
      [
        `🎉 宗门创建成功！`,
        `🏯 宗门名称：${sectName}`,
        `👑 宗主：${this.e.sender.card || this.e.sender.nickname}`,
        `📢 使用 #宗门 查看宗门信息`,
        `💎 初始资金：1000灵石`,
      ].join("\n")
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

    const rank = this.sectRanks.find((r) => r.id === user.sectRank);
    if (!rank) return this.reply("❌ 职位数据异常");

    // 基础俸禄
    let salary = rank.salary;

    // 宗门等级加成
    salary *= sect.level;

    // 个人贡献加成
    const contributionBonus = Math.min(1, user.contribution / 1000);
    salary = Math.floor(salary * (1 + contributionBonus));

    // 更新数据
    user.stone += salary;
    user.lastSalary = now;
    this.saveData();

    await this.reply(
      [
        `🏯 成功领取 ${sect.name} 俸禄！`,
        `🎖️ 职位：${rank.name}`,
        `💎 灵石 +${salary}`,
        `📊 贡献加成：${Math.floor(contributionBonus * 100)}%`,
        `💡 提示：提升职位和宗门等级可增加俸禄`,
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
          `${i + 1}. ${u.name} - ${this.realms[u.realm].name} ⚔️${
            u.combatPower
          }`
      )
      .join("\n");

    await this.reply(
      [
        "🏆 修仙排行榜",
        "=======================",
        rankList,
        "=======================",
        `你的排名：${
          users.findIndex((u) => u.id === this.e.user_id) + 1 || "未上榜"
        }`,
      ].join("\n")
    );
  }

  /** 获取用户名称 */
  getUserName(userId) {
    // 实际实现中需要根据平台获取用户名称
    return `道友${userId.substring(0, 4)}`;
  }
}
