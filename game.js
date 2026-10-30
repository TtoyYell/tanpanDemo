"use strict";

const app = document.getElementById("app");
const modalRoot = document.getElementById("modal-root");
const toast = document.getElementById("toast");
const fundsValue = document.getElementById("funds-value");
const reputationValue = document.getElementById("reputation-value");
const brandHome = document.getElementById("brand-home");

const STARTING_FUNDS = 268000;
const STARTING_REPUTATION = 62;

const state = {
  screen: "title",
  funds: STARTING_FUNDS,
  reputation: STARTING_REPUTATION,
  levelIndex: 0,
  investigation: null,
  negotiation: null,
  result: null,
  results: [],
};

const clueTypes = {
  person: "人物信息",
  situation: "处境信息",
  evidence: "证据",
  public: "公开信息",
  inference: "推断",
};

const supplierClues = {
  sup_plum: {
    id: "sup_plum",
    type: "person",
    category: "爱好",
    title: "柜台边的半包话梅",
    text: "邵老板等车时只吃盐津话梅。旧照片里，他小时候就在车站旁帮父亲看摊。",
  },
  sup_driver: {
    id: "sup_driver",
    type: "person",
    category: "关系与习惯",
    title: "装车表上的老赵和凌晨四点",
    text: "老赵跟了邵老板二十年，是唯一能稳定跑这条线路的人。装车表还写明：周一四点核单，最早 18 小时送达。",
  },
  sup_teacup: {
    id: "sup_teacup",
    type: "person",
    category: "个人回忆",
    title: "驾驶室里的旧搪瓷缸",
    text: "邵老板驾驶室里放着一只有磕痕的搪瓷缸。老员工说，那是他父亲在车站摆摊时留下的，他一直没舍得换。",
  },
  sup_team_meal: {
    id: "sup_team_meal",
    type: "person",
    category: "待人方式",
    title: "夜班装卸工的包子",
    text: "每逢夜班，邵老板都会自掏腰包给装卸工买热包子。老员工说他不拖欠工钱，只是嘴上强硬。",
  },
  sup_empty: {
    id: "sup_empty",
    type: "situation",
    category: "库存",
    title: "冷库里空着的三块托盘",
    text: "东侧冷库空出三块托盘，实际库存没有公开承诺里那么充足。装车表还备注“最早 18 小时”。",
  },
  sup_rent: {
    id: "sup_rent",
    type: "situation",
    category: "现金流",
    title: "压在玻璃下的租金催缴单",
    text: "仓库租金将在三天后到期，尾款七万二。邵老板比你更急着拿到一笔确定的回款。",
  },
  sup_promo: {
    id: "sup_promo",
    type: "public",
    category: "公开承诺",
    title: "官网上的渠道统一价",
    text: "青禾食品公开页面写着：所有直营渠道统一划线价 21.8 元/箱，并声明“各仓库存充足、不临时加价”。",
  },
  sup_delivery_public: {
    id: "sup_delivery_public",
    type: "public",
    category: "公开承诺",
    title: "官网上的配送时效承诺",
    text: "青禾食品公开的服务承诺写明：确认订单后 12 小时内送达周边高速服务区。",
  },
  sup_invoice: {
    id: "sup_invoice",
    type: "evidence",
    category: "交易记录",
    title: "邻市的实际结算小票",
    text: "同行从邻市服务区拿到的小票显示：同一规格实际成交 20.4 元/箱，装车后 20 小时才送达。",
  },
  sup_cash_inference: {
    id: "sup_cash_inference",
    type: "inference",
    category: "公开信息矛盾",
    title: "公开价与真实成交价冲突",
    text: "官网公示统一价 21.8 元，但同一规格的真实结算价只有 20.4 元。所谓“全渠道统一价”站不住脚。",
    derived: true,
  },
  sup_stock_inference: {
    id: "sup_stock_inference",
    type: "inference",
    category: "公开信息矛盾",
    title: "公开库存承诺与冷库空位冲突",
    text: "官网声明“各仓库存充足”，但东侧冷库空着三块托盘。公开库存承诺与现场库存不符。",
    derived: true,
  },
  sup_route_inference: {
    id: "sup_route_inference",
    type: "inference",
    category: "公开信息矛盾",
    title: "公开 12 小时与装车表冲突",
    text: "官网承诺 12 小时送达，现场装车表却写明最早 18 小时。公开承诺没有覆盖这条线路当前的真实运力。",
    derived: true,
  },
  sup_real_need: {
    id: "sup_real_need",
    type: "situation",
    category: "真实顾虑",
    title: "他要在六点前离场",
    text: "这单最让邵老板担心的不是利润，而是临时改单拖到天亮，错过送女儿上学。",
    discovered: true,
  },
};

const taxClues = {
  tax_tea: {
    id: "tax_tea",
    type: "person",
    category: "习惯",
    title: "泡到第二遍的蓝莓茶",
    text: "沈岚只在处理复杂案子时泡茶。她不喜欢寒暄，但谈到茶叶产地时明显放松。",
  },
  tax_stamp: {
    id: "tax_stamp",
    type: "person",
    category: "价值观",
    title: "玻璃柜里的旧税戳",
    text: "她收藏历年税戳，最在意“经得起复核”。仓促签下的材料会让她觉得自己失职。",
  },
  tax_deadline: {
    id: "tax_deadline",
    type: "situation",
    category: "时间压力",
    title: "周五前必须结案的季度表",
    text: "季度复核表上，xxx服务区案件被红笔圈出。沈岚需要在本周五前给出可复核的结论。",
  },
  tax_public_scope: {
    id: "tax_public_scope",
    type: "public",
    category: "检查公开要求",
    title: "官网公布的三个月抽查口径",
    text: "市局公开的常规随机抽查说明写着：近三个月账目；如需扩大范围，必须附书面追加依据。",
  },
  tax_scope: {
    id: "tax_scope",
    type: "evidence",
    category: "本案文件",
    title: "六个月抽查通知的空白附件",
    text: "本案通知直接勾选六个月，但“附加依据”一栏是空白。与公开的三个月常规口径不一致。",
  },
  tax_pos: {
    id: "tax_pos",
    type: "evidence",
    category: "内部核价",
    title: "系统核价单的“客流正常”",
    text: "内部核价单把 4 月 12 日标为客流正常，并据此推定少报 86,000 元；附录里还保留着收银机离线补传日志。",
  },
  tax_closure: {
    id: "tax_closure",
    type: "public",
    category: "公开公告",
    title: "国道施工封路公告",
    text: "交通部门公开公告写着：4 月 12 日至 16 日，xxx服务区南向车道封闭，预测周边客流下降 40% 以上。",
  },
  tax_sampling_inference: {
    id: "tax_sampling_inference",
    type: "inference",
    category: "公开信息矛盾",
    title: "公开三个月口径与六个月通知冲突",
    text: "市局公开要求常规抽查近三个月，本案却直接扩到六个月，且没有书面追加依据。扩查程序存在直接冲突。",
    derived: true,
  },
  tax_revenue_inference: {
    id: "tax_revenue_inference",
    type: "inference",
    category: "公开信息矛盾",
    title: "公开封路与“客流正常”冲突",
    text: "公开公告显示封路会导致客流下降四成，内部核价单却把同一天记为“客流正常”。少报收入的推定缺少事实基础。",
    derived: true,
  },
  tax_priority: {
    id: "tax_priority",
    type: "situation",
    category: "真实顾虑",
    title: "她要的是一份能复核的结论",
    text: "比起多收一点税，沈岚更怕程序有瑕疵。只要材料链条完整，她愿意重新计算争议销售额。",
    discovered: true,
  },
};

const levels = [
  {
    id: "supplier",
    number: "01",
    location: "xxx服务区 · 后仓",
    date: "10 月 1 日 · 02:40",
    kicker: "第一关 / 断货前夜",
    title: "赶在天亮前，把水补上。",
    subtitle: "供应商坐地起价，而六小时后就是假期车流高峰。",
    intro:
      "假期首日的车流比预报早了四个小时。矿泉水货架已经清空，配送车却还停在服务区外。邵老板把新报价推到你面前：每箱 21.8 元，先款后货。",
    quote: "“不是我不讲交情。今天这车货，谁先付钱，谁先拉走。”",
    objectives: [
      "从仓库与员工口中收集至少两类信息",
      "找出公开承诺与现场事实之间的冲突",
      "在耐心耗尽前与邵老板形成供货条款",
    ],
    briefNote:
      "公开承诺往往只展示有利的一面。把公示信息与现场记录放在一起，才能找出真正可用的矛盾。",
    investTitle: "调查：六点前的真相",
    investDescription:
      "2 条公开信息可以免费查阅；剩下 7 条现场信息需要调查行动。你有 6 次行动，因此最终会漏掉其中 1 条。",
    actionPoints: 6,
    sources: [
      {
        id: "src_office",
        kind: "人物",
        title: "办公室台面",
        teaser: "邵老板在等司机时，总把什么东西放在手边？",
        clueId: "sup_plum",
      },
      {
        id: "src_driver",
        kind: "人物",
        title: "装货月台",
        teaser: "找老赵问问固定线路，再看看门后的凌晨装车表。",
        clueId: "sup_driver",
      },
      {
        id: "src_cab",
        kind: "人物",
        title: "驾驶室",
        teaser: "副驾驶座旁摆着一只旧搪瓷缸，外形已经磕碰。",
        clueId: "sup_teacup",
      },
      {
        id: "src_breakroom",
        kind: "人物",
        title: "装卸工休息室",
        teaser: "夜班工人对这个老板的评价，比办公室里的客套话更真实。",
        clueId: "sup_team_meal",
      },
      {
        id: "src_cold",
        kind: "处境",
        title: "东侧冷库",
        teaser: "他口口声声说不缺货，冷库里真的堆满了吗？",
        clueId: "sup_empty",
      },
      {
        id: "src_rent",
        kind: "处境",
        title: "玻璃柜台",
        teaser: "一张被咖啡杯压住的纸，露出“逾期”和金额。",
        clueId: "sup_rent",
      },
      {
        id: "src_phone",
        kind: "公开",
        title: "大厅里的公示屏",
        teaser: "青禾食品公开给渠道客户的价格是多少？",
        clueId: "sup_promo",
        free: true,
      },
      {
        id: "src_invoice",
        kind: "证据",
        title: "邻市的电话",
        teaser: "问问另一家服务区，昨天真正付了多少钱、等了多久。",
        clueId: "sup_invoice",
      },
      {
        id: "src_public_delivery",
        kind: "公开",
        title: "官网服务承诺",
        teaser: "不用调查，直接查看青禾食品公开的配送时效。",
        clueId: "sup_delivery_public",
        free: true,
      },
    ],
    clues: supplierClues,
    recipes: [
      {
        ingredients: ["sup_promo", "sup_invoice"],
        result: "sup_cash_inference",
        explanation:
          "公开页面写统一价 21.8 元，真实结算小票却是 20.4 元。同一规格、同一时期，公开价与成交价发生冲突。",
      },
      {
        ingredients: ["sup_promo", "sup_empty"],
        result: "sup_stock_inference",
        explanation:
          "官网声明各仓库存充足，现场冷库却空出三块托盘。公开库存承诺与查验结果直接冲突。",
      },
      {
        ingredients: ["sup_delivery_public", "sup_driver"],
        result: "sup_route_inference",
        explanation:
          "公开承诺 12 小时送达，老赵和装车表却证明这条线路最早要 18 小时。配送承诺与当前运力直接冲突。",
      },
    ],
    negotiation: {
      npc: {
        name: "邵振东",
        short: "邵老板",
        title: "青禾食品 · 渠道商",
        avatar: "邵",
        note: "习惯直来直去。比起漂亮话，他更看重一笔能把租金补上的确定交易。",
      },
      stats: {
        mood: 43,
        distance: 17,
        patience: 100,
        alert: 0,
      },
      opening:
        "“货就在后面。价格你也看见了，21.8 一箱。今天先款，下午之前能给你送第一批。”",
      demandOptions: [
        {
          id: "strict",
          title: "争取长期稳定供应",
          tag: "强硬",
          description: "持续供货 14 天，每批 160 箱，合同总价不超过 ¥5,900。",
          playerLine:
            "合同覆盖 14 天，每批 160 箱，总价不超过五千九。这个条件能接，我们就把车装起来。",
          response:
            "“你这是把利润和水一起抽走。”邵老板把计算器按得啪啪响，“七天，每批 120 箱，总价 6,784。”",
          terms: { total: 5900, duration: 14, volume: 160 },
        },
        {
          id: "balanced",
          title: "平衡价格与供货保障",
          tag: "均衡",
          description: "持续供货 10 天，每批 160 箱，合同总价不超过 ¥6,300。",
          playerLine:
            "合同按十天走，每批 160 箱，总价控制在六千三以内。价格和供货量我们各让一步。",
          response:
            "“各让一步可以谈。”邵老板停了停，“我先报七天，每批 120 箱，总价 6,784。”",
          terms: { total: 6300, duration: 10, volume: 160 },
        },
        {
          id: "safe",
          title: "先锁定一周供货",
          tag: "保守",
          description: "持续供货 7 天，每批 120 箱，合同总价不超过 ¥6,600。",
          playerLine:
            "先签七天，每批 120 箱，总价不超过六千六。今天先把货和后续补给保住。",
          response:
            "“这才像做生意。”他点头，“不过我也得保住成本：七天，每批 120 箱，总价 6,784。”",
          terms: { total: 6600, duration: 7, volume: 120 },
        },
      ],
      counterTerms: { total: 6784, duration: 7, volume: 120 },
      terms: [
        {
          key: "total",
          label: "合同总价",
          direction: "整个周期总支出越低越好",
          compare: "max",
          targetPrefix: "≤ ",
          format: (value) => formatMoney(value),
        },
        {
          key: "duration",
          label: "持续供货周期",
          direction: "锁定价格与供货承诺越长越好",
          compare: "min",
          targetPrefix: "≥ ",
          format: (value) => `${value} 天`,
        },
        {
          key: "volume",
          label: "每批供货量",
          direction: "每批至少覆盖目标，过量会增加库存占用",
          compare: "min",
          targetPrefix: "≥ ",
          format: (value) => `${value} 箱 / 次`,
        },
      ],
      chatOptions: [
        {
          id: "chat_plum",
          clueId: "sup_plum",
          title: "聊柜台上的话梅",
          description: "先从一个不涉及生意的小习惯开始。",
          effects: { mood: 11, distance: 14, patience: -4 },
          playerLine: "“还是盐津的？我记得你每次等车都吃这个。”",
          response:
            "邵老板愣了一下，笑着把纸包推过来：“记性倒好。小时候我爸在车站摆摊，就是这个味儿。”",
        },
        {
          id: "chat_schedule",
          clueId: "sup_driver",
          title: "聊老赵和凌晨装车",
          description: "认可他信任的人，也能顺势确认固定装车时间。",
          effects: { mood: 9, distance: 12, patience: -5 },
          playerLine: "“老赵跑这条线二十多年了。你周一四点还亲自核单，这份活别人接不了吧？”",
          response:
            "“别人核我不放心。”他的语气缓了缓，“老赵知道哪段路什么时候堵。核完我得赶六点前去送孩子。”",
        },
        {
          id: "chat_teacup",
          clueId: "sup_teacup",
          title: "聊驾驶室里的旧搪瓷缸",
          description: "从对方愿意保留的旧物切入。",
          effects: { mood: 9, distance: 14, patience: -4 },
          playerLine: "“驾驶室那只搪瓷缸，是以前车站摊子上留下的吧？磕成这样还留着，应该挺有纪念意义。”",
          response:
            "“我爸当年就用这个给人盛水。”他笑了一下，“东西旧，但舍不得扔。”",
        },
        {
          id: "chat_team_meal",
          clueId: "sup_team_meal",
          title: "聊夜班装卸工的包子",
          description: "从他对工人的照顾切入。",
          effects: { mood: 8, distance: 12, patience: -3 },
          playerLine: "“听说你每次夜班都给装卸工买包子。今天这车货，大家也都跟着熬着了。”",
          response:
            "“都是干活的人，总不能让人空着肚子。”邵老板语气缓了些，“你把卸货口安排好就行。”",
        },
        {
          id: "chat_real_need",
          clueId: "sup_real_need",
          title: "替他守住六点前离场",
          description: "回应他真正担心的安排。",
          effects: { mood: 14, distance: 13, patience: -3 },
          playerLine: "“我知道你六点前要送孩子。后面需要改单，我尽量赶在你核完单之前说。”",
          response:
            "“你记得这个就好。”他看了你一眼，“生意归生意，家里的事不能误。”",
        },
        {
          id: "chat_rent_bad",
          clueId: "sup_rent",
          title: "问仓库租金",
          description: "直接点破对方的资金压力。时机不对会显得冒犯。",
          effects: { mood: -9, distance: -7, patience: -7 },
          playerLine: "“仓库租金快到期了吧？现在是不是挺缺现金？”",
          response:
            "他的脸立刻沉下来：“你翻我柜台？缺不缺钱，和这车货没关系。”",
        },
        {
          id: "chat_promo_bad",
          clueId: "sup_promo",
          title: "一上来质疑公开承诺",
          description: "开场就拆穿对方的公示内容，容易把闲聊变成对质。",
          effects: { mood: -5, distance: -4, patience: -5 },
          playerLine: "“官网写着统一价 21.8，怎么到你这里又是另一套说法？”",
          response:
            "“官网是官网，今天路上什么情况你知道吗？”邵老板把报价单抽回去一半。",
        },
      ],
      questions: [
        {
          id: "q_why_now",
          title: "“为什么一定要今天先款？”",
          description: "直接问出他的时间与回款压力。",
          supportClue: "sup_rent",
          supportLabel: "租金催缴单",
          playerLine: "“你今天这么急，不只是怕我改单吧？是不是还有一笔必须补上的款？”",
          supportedResponse:
            "他看了眼玻璃柜台：“三天内要付仓库尾款。你给我一个确定的付款时间，我就给你一个能装车的价。”",
          supportedEffects: { mood: 2, distance: 6, patience: -4 },
          supportedClue: "sup_real_need",
          plainResponse:
            "“做生意哪个不急？”他把这个话题挡了回去，“你到底要不要货？”",
          plainEffects: { mood: -4, distance: -3, patience: -9 },
        },
        {
          id: "q_schedule",
          title: "“周一凌晨能安排装车吗？”",
          description: "确认他最在意的交付时间。",
          supportClue: "sup_driver",
          supportLabel: "老赵与凌晨装车表",
          playerLine: "“老赵那条线是你最稳的。按周一四点核单的节奏，能安排好首批装车吗？”",
          supportedResponse:
            "“只要单子不变，能。”他看了一眼排班板，“我四点核完，六点前必须走。”",
          supportedEffects: { mood: 3, distance: 5, patience: -4 },
          plainResponse:
            "“能不能装，要看司机。”他低头继续算价，明显不想多聊。",
          plainEffects: { mood: -3, distance: -2, patience: -8 },
        },
        {
          id: "q_volume",
          title: "“每批能不能多供给一些？”",
          description: "询问实际供货能力，适合试探他的库存底线。",
          supportClue: "sup_empty",
          supportLabel: "冷库空位与最早装车时间",
          playerLine: "“冷库周转快不代表没货。每批能不能从一百二十箱加到一百六十？”",
          supportedResponse:
            "“分批凑得出来。”他看了眼装车表，“每批一百六可以，但合同周期得写清楚。”",
          supportedEffects: { mood: 4, distance: 4, patience: -5 },
          plainResponse:
            "“今天这个行情，每批最多一百二。”他的耐心开始变薄。",
          plainEffects: { mood: -5, distance: -3, patience: -9 },
        },
      ],
      pressureRules: [
        {
          clueId: "sup_cash_inference",
          title: "公开价与真实成交价冲突",
          playerLine:
            "“官网说全渠道统一 21.8，可邻市同一规格的实际结算小票是 20.4。你所谓统一价并不存在。”",
          response:
            "他沉默了几秒，把合同总价划掉重写：“你倒会找票。总价减七百二，今天先付三成。”",
          effects: { mood: -7, distance: -4, patience: -11 },
          modify: { total: -720, duration: 1 },
        },
        {
          clueId: "sup_empty",
          title: "指出库存与装车缺口",
          playerLine:
            "“东侧冷库空着三块托盘，装车表也写着最早 18 小时。‘库存充足、12 小时送达’和你现场的记录对不上。”",
          response:
            "“库存周转快，不叫缺。”他嘴上硬，却把每批供货量加到一百四十箱。",
          effects: { mood: -8, distance: -5, patience: -12 },
          modify: { total: -300, volume: 20 },
        },
        {
          clueId: "sup_stock_inference",
          title: "公开库存承诺与冷库空位冲突",
          playerLine:
            "“官网说各仓库存充足，冷库却空着三块托盘。你至少得用每批更多供货来证明库存承诺不是一句空话。”",
          response:
            "“托盘空，不代表仓里没货。”他嘴上反驳，还是把总价减了二百，并把每批供货量加到了 140 箱。",
          effects: { mood: -5, distance: -4, patience: -10 },
          modify: { total: -200, volume: 20 },
        },
        {
          clueId: "sup_rent",
          title: "把催缴单摆上谈判桌",
          playerLine:
            "“三天后仓库尾款到期。我给你一笔确定的回款，你给我一个能撑过今天的价。”",
          response:
            "他的指节在桌面敲了两下：“可以，但别把这件事带出去。”合同总价再减四百五。",
          effects: { mood: -12, distance: -8, patience: -14 },
          modify: { total: -450, duration: 1 },
        },
        {
          clueId: "sup_promo",
          title: "用“库存充足”争取每批增量",
          playerLine:
            "“官网公开承诺各仓库存充足。既然不缺货，为什么每批只能给一百二十箱？”",
          response:
            "“仓里有成品，分批能调。”他避开你的视线，把每批供货量加到了 140 箱。",
          effects: { mood: -6, distance: -3, patience: -9 },
          modify: { volume: 20 },
        },
        {
          clueId: "sup_invoice",
          title: "用真实成交小票压价",
          playerLine:
            "“邻市同一规格的结算小票是 20.4 元。你说今天全市场都要 21.8，这张票不是这么写的。”",
          response:
            "“他们拿的是整车价。”邵老板解释了一句，仍把合同总价减了五百二。",
          effects: { mood: -7, distance: -2, patience: -9 },
          modify: { total: -520 },
        },
        {
          clueId: "sup_route_inference",
          title: "公开 12 小时与装车表冲突",
          playerLine:
            "“官网承诺 12 小时，装车表却写四点核单、最早 18 小时。公开的服务承诺与这条线路的实际运力直接冲突。”",
          response:
            "他拿起电话又放下：“既然公开承诺做不到，我每批多给你四十箱，合同也多续两天。”",
          effects: { mood: -2, distance: -1, patience: -8 },
          modify: { volume: 40, duration: 2 },
        },
        {
          clueId: "sup_driver",
          title: "要求兑现固定装车安排",
          playerLine:
            "“老赵固定跑 xxx服务区，四点核单、六点离场。你完全可以把我们排在第一批，而不是拿临时加单当理由。”",
          response:
            "“行，优先装你的货，每批再加二十箱。”他补了一句，“司机不能换。”",
          effects: { mood: 1, distance: 2, patience: -6 },
          modify: { total: -150, volume: 20 },
        },
      ],
      genericPressure: {
        playerLine: "把这条信息当作施压证据抛了出来。",
        response:
          "邵老板皱了皱眉：“这和我给你的合同条件有什么关系？你要谈就谈货，别绕。”",
        effects: { mood: -11, distance: -5, patience: -17 },
        modify: {},
      },
      concessionOptions: [
        {
          id: "c_prepay",
          clueId: "sup_rent",
          title: "先付三成现款",
          description: "拿出 ¥2,400 定金，替他补上最急的现金流缺口。",
          playerLine: "“我先付三成定金，今天就把款落账。剩下的按合同走。”",
          response:
            "他重新拿起笔：“这样我能安排。总价减三百二，周期多一天，每批再加二十箱。”",
          effects: { mood: 12, distance: 8, patience: -2 },
          modify: { total: -320, duration: 1, volume: 20 },
          extraCost: 2400,
        },
        {
          id: "c_route",
          clueId: "sup_driver",
          title: "保留老赵的固定线路",
          description: "不要求换司机，给他一份更稳定的履约安排。",
          playerLine: "“后面这条线我只认老赵，不临时换人。你按他的节奏排就行。”",
          response:
            "“这话我爱听。”他直接改了装车表，“每批加到一百六，合同再多两天。”",
          effects: { mood: 13, distance: 11, patience: -2 },
          modify: { volume: 40, duration: 2 },
          extraCost: 0,
        },
        {
          id: "c_night",
          clueId: "sup_real_need",
          title: "替他守住六点前离场",
          description: "主动承担夜间装卸协调，让他不必拖到送女儿上学前。",
          playerLine: "“夜间装卸我来协调，四点半之前一定让你走车。”",
          response:
            "他紧绷的肩膀松下来：“你把这个安排好，合同总价好说。再减二百六，每批多二十箱。”",
          effects: { mood: 15, distance: 12, patience: -2 },
          modify: { total: -260, volume: 20 },
          extraCost: 600,
        },
      ],
      exchangeOptions: [
        {
          id: "x_cash_price",
          title: "现款一次结清换总价直降",
          description: "一次性拿出合同款，换取更低的合同总价。",
          requires: null,
          playerLine:
            "“我今天一次结清全款，不拖一分钱。合同总价直减一千二，每批也多给二十箱。”",
          response:
            "“全款？”他把计算器一推，“总价能减，但供货周期要缩短两天。想清楚。”",
          effects: { mood: 10, distance: 4, patience: -3 },
          modify: { total: -1200, duration: -2, volume: 20 },
        },
        {
          id: "x_volume_schedule",
          title: "追加采购换优先装车",
          description: "把后续需求也交给他，换取首批优先发车。",
          requires: "sup_empty",
          playerLine:
            "“下一轮补货也交给你，续约周期写进合同。总价再减六百五。”",
          response:
            "“续约单可以。”他圈了合同日期，“总价减六百五，供货周期多两天。”",
          effects: { mood: 8, distance: 5, patience: -4 },
          modify: { total: -650, duration: 2 },
        },
        {
          id: "x_route_duration",
          title: "固定路线换更长供货周期",
          description: "给邵老板稳定线路，换取更长的锁价供货承诺。",
          requires: "sup_route_inference",
          playerLine:
            "“线路固定给老赵，我不再临时改点。供货周期再延长五天，每批加二十箱。”",
          response:
            "“行，合同延长，老赵固定跑。”他抬头看了你一眼，“别让他白等。”",
          effects: { mood: 7, distance: 8, patience: -3 },
          modify: { duration: 5, volume: 20 },
        },
      ],
    },
    settlement: {
      acceptedTitle: "供货条款达成",
      acceptedSummary:
        "天亮前，冷链车驶入 xxx服务区。货架重新补满，邵老板也赶上了六点前离场。",
      conditionalTitle: "一份勉强能用的合同",
      conditionalSummary:
        "供货赶上了，但合同总价、供货周期或每批数量没有完全守住。服务区撑过了早高峰，后续补给仍有压力。",
      failedTitle: "第一批货没能留下",
      failedSummary:
        "谈判破裂，你只能从临时渠道高价补货。货架在上午九点才重新补满。",
      notes: {
        A: "这单不仅保住了利润，也让双方愿意继续合作。稳定线路会在下一次关键时刻帮上忙。",
        B: "条款基本落在可接受范围内。还有几项条件可以继续争取。",
        C: "供货没有中断，但让出的总价和供货保障会压缩下一关的腾挪空间。",
        D: "勉强完成了补货。对方记住了你的急迫，未来议价会更困难。",
        F: "临时采购代价很高，且商业声誉受到了影响。",
      },
    },
  },
  {
    id: "tax",
    number: "02",
    location: "税务所 · 第二办公室",
    date: "10 月 1 日 · 16:20",
    kicker: "第二关 / 可复核的真相",
    title: "这份税单，不该签字签得这么急。",
    subtitle: "税务官要赶在季度复核前结案，你需要给她一份经得起复核的解释。",
    intro:
      "供应商的货刚补上，税务检查通知就送到了办公室。系统显示服务区少报了一段时间的营业额，核定补税与罚款合计 128,000 元。沈岚只给你半小时。",
    quote: "“我不怕你解释得多。我只怕这份卷宗交上去，经不起第二个人复核。”",
    objectives: [
      "调查税务人员的处境、程序和可用记录",
      "找出公开检查要求与本案材料的矛盾",
      "至少把补缴金额、分期或检查范围中的一项谈下来",
    ],
    briefNote:
      "公开规则未必等同于本案实际操作。把公开要求与卷宗里的现场记录互相核对，才能找到可复核的矛盾。",
    investTitle: "调查：卷宗里的空白",
    investDescription:
      "2 条公开信息可以免费查阅；剩下 5 条现场信息需要调查行动。你有 4 次行动，因此最终会漏掉其中 1 条。",
    actionPoints: 4,
    sources: [
      {
        id: "src_tea",
        kind: "人物",
        title: "候客区的茶杯",
        teaser: "一杯蓝莓茶泡到第二遍，说明她今天处理的事务并不简单。",
        clueId: "tax_tea",
      },
      {
        id: "src_stamp",
        kind: "人物",
        title: "玻璃柜里的旧税戳",
        teaser: "她收藏这些旧物，不是只为了好看。",
        clueId: "tax_stamp",
      },
      {
        id: "src_deadline",
        kind: "处境",
        title: "走廊尽头的季度表",
        teaser: "红色的圈，落在一个你必须看清的日期上。",
        clueId: "tax_deadline",
      },
      {
        id: "src_public_scope",
        kind: "公开",
        title: "税务所公示栏",
        teaser: "官网对常规随机抽查的期限和扩查依据是怎么写的？",
        clueId: "tax_public_scope",
        free: true,
      },
      {
        id: "src_scope",
        kind: "证据",
        title: "抽查任务单",
        teaser: "本案通知写着六个月，附加依据栏却空着。",
        clueId: "tax_scope",
      },
      {
        id: "src_pos",
        kind: "证据",
        title: "系统核价单",
        teaser: "核价单为什么把封路当天标成“客流正常”？",
        clueId: "tax_pos",
      },
      {
        id: "src_closure",
        kind: "公开",
        title: "国道施工公告",
        teaser: "交通部门的公开公告，对封路期间的客流作了什么预测？",
        clueId: "tax_closure",
        free: true,
      },
    ],
    clues: taxClues,
    recipes: [
      {
        ingredients: ["tax_public_scope", "tax_scope"],
        result: "tax_sampling_inference",
        explanation:
          "公开规则要求常规抽查近三个月，本案通知却直接扩到六个月，且没有附加依据。程序口径发生了直接冲突。",
      },
      {
        ingredients: ["tax_closure", "tax_pos"],
        result: "tax_revenue_inference",
        explanation:
          "公开封路公告预测客流下降四成，内部核价单却记录客流正常。公共事实与核价依据直接冲突。",
      },
    ],
    negotiation: {
      npc: {
        name: "沈岚",
        short: "沈税务官",
        title: "税务所 · 复核专员",
        avatar: "沈",
        note: "重程序、怕瑕疵。她需要的是能签字负责的结论，而不是一场情绪化的争论。",
      },
      stats: {
        mood: 39,
        distance: 16,
        patience: 100,
        alert: 14,
      },
      opening:
        "“通知你应该看过了。128,000 元，包含补税和拟处罚款。周五前结案，今天需要你确认口径。”",
      demandOptions: [
        {
          id: "strict",
          title: "逐项推翻核定",
          tag: "强硬",
          description: "目标：补税不超过 108,000 元、分 3 期、抽查范围回到 3 个月。",
          playerLine:
            "我要把争议销售额重新核算。补税不超过 108,000，分三期，抽查范围回到三个月。",
          response:
            "“你要求得不少。”沈岚翻了翻卷宗，“我可以先把方案报到 124,000，分一期，范围维持六个月。”",
          terms: {
            tax: 108000,
            installments: 3,
            scope: 3,
            risk: "不扩大抽查",
          },
        },
        {
          id: "balanced",
          title: "保住现金流",
          tag: "均衡",
          description: "目标：补税不超过 112,000 元、分 2 期、抽查范围回到 3 个月。",
          playerLine:
            "我不回避应补的部分，但现金流得留余地。112,000，两期，抽查先按三个月口径。",
          response:
            "“这个方向可以讨论。”她在便笺上写下数字，“目前的初步方案是 124,000，一期，六个月。”",
          terms: {
            tax: 112000,
            installments: 2,
            scope: 3,
            risk: "接受补充说明",
          },
        },
        {
          id: "safe",
          title: "先换取结案",
          tag: "保守",
          description: "目标：补税不超过 120,000 元、分 1 期、接受 6 个月抽查。",
          playerLine:
            "今天先把结案路径定下来。120,000，一期缴清，抽查范围按六个月。",
          response:
            "“你愿意按现范围走，事情会简单一些。”她合上笔帽，“但金额仍然从 124,000 起谈。”",
          terms: {
            tax: 120000,
            installments: 1,
            scope: 6,
            risk: "罚款另议",
          },
        },
      ],
      counterTerms: {
        tax: 124000,
        installments: 1,
        scope: 6,
        risk: "罚款另议",
      },
      terms: [
        {
          key: "tax",
          label: "补缴金额",
          direction: "越低越好",
          compare: "max",
          targetPrefix: "≤ ",
          format: (value) => `¥${Number(value).toLocaleString("zh-CN")}`,
        },
        {
          key: "installments",
          label: "缴款期数",
          direction: "越多越宽松",
          compare: "min",
          targetPrefix: "≥ ",
          format: (value) => `${value} 期`,
        },
        {
          key: "scope",
          label: "抽查范围",
          direction: "越小越好",
          compare: "max",
          targetPrefix: "≤ ",
          format: (value) => `${value} 个月`,
        },
        {
          key: "risk",
          label: "后续处理",
          direction: "限制越少越好",
          compare: "risk",
          targetPrefix: "",
          format: (value) => value,
        },
      ],
      chatOptions: [
        {
          id: "chat_tea",
          clueId: "tax_tea",
          title: "从蓝莓茶聊起",
          description: "她不喜欢寒暄，但一个短的、具体的话题可以降低戒备。",
          effects: { mood: 10, distance: 12, patience: -4, alert: -2 },
          playerLine: "“蓝莓茶。第二泡味道最好，我猜你今天没打算早走。”",
          response:
            "她看了茶杯一眼，语气松了半分：“第二泡才不涩。你今天也别让我把同一套账讲两遍。”",
        },
        {
          id: "chat_stamp",
          clueId: "tax_stamp",
          title: "谈到那枚旧税戳",
          description: "从她对工作的在意切入，而不是直接夸她。",
          effects: { mood: 8, distance: 11, patience: -4, alert: -3 },
          playerLine: "“柜子里那些旧税戳，年份跨度不小。你最在意的是它们经得起复核吧。”",
          response:
            "“税戳不是装饰。”她看了一眼玻璃柜，“只要材料能复核，谁都不用替谁承担信任。”",
        },
        {
          id: "chat_deadline",
          clueId: "tax_deadline",
          title: "问季度表的红圈",
          description:
            "她仍被期限压着且尚未起戒心时，会接受这份体谅；气氛已经缓和后再强调结案压力，可能适得其反。",
          playerLine: "“周五前结案，红圈都画到表上了。你今天是不是也没多少余地？”",
          conditional: {
            hint: "她仍显急躁、耐心尚可且警觉度不高时，才会接受这种体谅",
            requirements: [
              { stat: "mood", max: 45 },
              { stat: "patience", min: 55 },
              { stat: "alert", max: 24 },
            ],
            active: {
              effects: { mood: 2, distance: 2, patience: -4, alert: 1 },
              response:
                "“我需要的不是快，是能复核的快。”她停了停，“你知道就好，别拿时间催我。”",
            },
            inactive: {
              effects: { mood: -1, distance: 0, patience: -4, alert: 2 },
              response:
                "她抬眼看了看时钟：“时间我当然知道。可你现在反复提醒，只会让我觉得你在催我。”",
            },
          },
        },
        {
          id: "chat_priority",
          clueId: "tax_priority",
          title: "按她的复核顺序补材料",
          description:
            "这不是寒暄，而是工作配合。只有双方已经进入试探、耐心仍够且警觉度不高时，才会得到轻微回应。",
          playerLine: "“你先把最影响判断的两页圈出来，我按你的复核顺序整理，不让你反复翻同一份卷宗。”",
          conditional: {
            hint: "双方已有试探基础、耐心充足且警觉度不高时，配合才会被接受",
            requirements: [
              { stat: "distance", min: 20 },
              { stat: "patience", min: 55 },
              { stat: "alert", max: 30 },
            ],
            active: {
              effects: { mood: 1, distance: 3, patience: -4, alert: -3 },
              response:
                "“这算你知道该先补什么。”沈岚把便笺推近半寸，“只是配合流程，别把工作顺序说成交情。”",
            },
            inactive: {
              effects: { mood: -1, distance: -1, patience: -5, alert: 2 },
              response:
                "“你还没问清我为什么这样排，就替我做起主了。”她把便笺收了回去。",
            },
          },
        },
        {
          id: "chat_closure",
          clueId: "tax_closure",
          title: "聊封路那几天的现场",
          description: "从公开事实聊起，避免直接质疑她。",
          effects: { mood: 7, distance: 9, patience: -4, alert: -2 },
          playerLine: "“封路那几天，服务区的人确实都在硬撑。我先把客流和值班记录按时间整理出来。”",
          response:
            "“按时间轴整理会省很多事。”她点了点头，“别把材料堆成一团。”",
        },
        {
          id: "chat_scope_bad",
          clueId: "tax_scope",
          title: "一上来质疑程序",
          description: "证据可以用来施压，但不适合当作闲聊开场。",
          effects: { mood: -9, distance: -6, patience: -7, alert: 7 },
          playerLine: "“公示写三个月，你们通知却写六个月，这程序本身就有问题吧？”",
          response:
            "她合上桌面文件：“如果你想质疑程序，就正式提交材料。不要在闲聊里试探我。”",
        },
        {
          id: "chat_pos_bad",
          clueId: "tax_pos",
          title: "先指出核价单写错了",
          description: "证据在错误时机出现，会让对方进入防御状态。",
          effects: { mood: -5, distance: -3, patience: -5, alert: 5 },
          playerLine: "“核价单把封路当天写成客流正常，这明显不对。”",
          response:
            "她把材料往后推了一寸：“我还没问你答辩，别急着替自己下结论。”",
        },
      ],
      questions: [
        {
          id: "q_deadline",
          title: "“今天必须确认什么？”",
          description: "问清她需要的结案材料。",
          supportClue: "tax_deadline",
          supportLabel: "周五前必须结案的季度表",
          playerLine: "“周五前你得交什么？金额、程序，还是争议项的口径？”",
          supportedResponse:
            "“三项都要有落点。”她递来一张便笺，“但只要有完整说明链，金额可以重算。”",
          supportedEffects: { mood: 3, distance: 5, patience: -4, alert: -2 },
          plainResponse:
            "“该交的都会交。你先回答营业额为什么对不上。”",
          plainEffects: { mood: -3, distance: -2, patience: -8 },
        },
        {
          id: "q_scope",
          title: "“六个月抽查依据在哪里？”",
          description: "试图确认扩查是否存在硬性依据。",
          supportClue: "tax_scope",
          supportLabel: "六个月通知与空白附件",
          playerLine: "“通知扩到六个月，附加依据却是空白的。如果这是争议点，我希望按程序补充书面依据。”",
          supportedResponse:
            "她停了几秒：“扩查需要补充理由。你要质疑，就把材料和理由写成一页，不要只说一句‘不合理’。”",
          supportedEffects: { mood: 1, distance: 4, patience: -5, alert: 2 },
          plainResponse:
            "“抽查范围由检查需要决定，不需要在这里向你解释。”她的语气冷了下来。",
          plainEffects: { mood: -5, distance: -4, patience: -9, alert: 4 },
        },
        {
          id: "q_priority",
          title: "“哪些异常最影响你的判断？”",
          description: "让她自己指出最需要解释的环节。",
          supportClue: "tax_pos",
          supportLabel: "系统核价单与离线补传记录",
          playerLine: "“我不想逐条辩解。哪些异常真正影响你的结论？我按顺序给你能复核的材料。”",
          supportedResponse:
            "“离线时段的连续性，以及销售额下降能不能与外部原因对应。”她用笔尖点了两处，“这两项能解释，后面的可以重算。”",
          supportedEffects: { mood: 5, distance: 8, patience: -4, alert: -4 },
          supportedClue: "tax_priority",
          plainResponse:
            "“所有异常都影响判断。”她把卷宗合上，“请按通知顺序补材料。”",
          plainEffects: { mood: -4, distance: -3, patience: -8, alert: 2 },
        },
      ],
      pressureRules: [
        {
          clueId: "tax_sampling_inference",
          title: "公开三个月口径与六个月通知冲突",
          playerLine:
            "“市局公开规则写着常规抽查近三个月，扩查要附书面依据；本案通知直接勾了六个月，附件却是空白。”",
          response:
            "沈岚把两页纸并排放好，第一次没有立刻反驳：“这段我需要重新核。金额先收回一部分。”",
          effects: { mood: -3, distance: -2, patience: -10, alert: 8 },
          modify: { tax: -7000, scope: -3 },
        },
        {
          clueId: "tax_revenue_inference",
          title: "公开封路与“客流正常”冲突",
          playerLine:
            "“交通部门公开公告写着封路后客流至少下降四成，你的内部核价单却把同一天记为‘客流正常’。这条推定建立在错误事实上。”",
          response:
            "她重新打开客流表：“如果封路时段和补传金额完全对应，这段推定销售额可以调整。”",
          effects: { mood: 1, distance: 2, patience: -9, alert: 5 },
          modify: { tax: -6000 },
        },
        {
          clueId: "tax_scope",
          title: "要求出示六个月扩查依据",
          playerLine:
            "“公开要求是三个月，扩查必须有书面依据。本案通知扩到六个月，附件却是空白。”",
          response:
            "“程序问题可以记录，但你现在拿出来，并不能直接替你证明收入。”她先把金额下调了三千。",
          effects: { mood: -8, distance: -5, patience: -10, alert: 12 },
          modify: { tax: -3000 },
        },
        {
          clueId: "tax_pos",
          title: "把完整补传日志交上去",
          playerLine:
            "“离线两天不是数据丢失。恢复联网后的补传时间、金额和流水号都在这里，可以逐笔核。”",
          response:
            "她抽出一张核对单：“材料是完整的。先减掉这部分重复推定，但还需要外部原因解释。”",
          effects: { mood: 4, distance: 6, patience: -7, alert: -8 },
          modify: { tax: -2000 },
        },
        {
          clueId: "tax_closure",
          title: "提交国道封路公告",
          playerLine:
            "“4 月 12 日到 16 日南向封闭。服务区正好靠南侧匝道，营业额下滑有明确外部原因。”",
          response:
            "她把公告日期圈出来：“这条能进说明附件。还需要与收银流水对照。”",
          effects: { mood: 2, distance: 3, patience: -7, alert: -2 },
          modify: { tax: -3500 },
        },
        {
          clueId: "tax_priority",
          title: "围绕她要复核的点作答",
          playerLine:
            "“你要的是离线连续性和客流下降的外部对应。我不逐条争，先把这两条说明链补齐。”",
          response:
            "“对，这样我能往下签字。”她把需要补的两页材料单独夹了出来。",
          effects: { mood: 7, distance: 8, patience: -5, alert: -5 },
          modify: { tax: -2500 },
        },
      ],
      genericPressure: {
        playerLine: "把这条信息当作施压材料递了过去。",
        response:
          "沈岚没有接材料：“这和本次抽查口径没有直接关系。请回答我真正问的问题。”",
        effects: { mood: -10, distance: -5, patience: -17, alert: 15 },
        modify: {},
      },
      concessionOptions: [
        {
          id: "c_scope",
          clueId: "tax_scope",
          title: "接受三个月样本期复核",
          description: "主动承认三个月样本仍可能存在问题，换取程序口径统一。",
          playerLine:
            "“我接受按三个月样本重新复核，也会补齐这段说明。你按同一口径重新核定。”",
          response:
            "“可以这样处理。”她在抽查栏改成三个月，“但材料缺一页，今天就不算完成。”",
          effects: { mood: 8, distance: 7, patience: -4, alert: -8 },
          modify: { scope: -3, tax: -2000, risk: "接受补充说明" },
        },
        {
          id: "c_logs",
          clueId: "tax_pos",
          title: "开放全量收银日志",
          description: "给她一条完整的复核链，降低因证据不足导致的扩查。",
          playerLine:
            "“我把全量收银日志按时间轴整理好，包括离线、补传和修正记录。你不需要再靠推定。”",
          response:
            "“有了完整时间轴，我可以不扩大抽查。”她抽出另一张核对表，“金额还需要再对一次。”",
          effects: { mood: 9, distance: 10, patience: -4, alert: -14 },
          modify: { scope: -3, tax: -1500, risk: "不扩大抽查" },
        },
        {
          id: "c_priority",
          clueId: "tax_priority",
          title: "按她的复核顺序补材料",
          description: "接受她的核查顺序，换取一份可签字的结案说明。",
          playerLine:
            "“先解释离线连续性，再对照封路客流。我会按这个顺序补齐，不要求你先给结论。”",
          response:
            "她把笔放回桌面：“这样最好。我今天要的是一份能复核完的卷宗，不是为了卡你。”",
          effects: { mood: 9, distance: 9, patience: -3, alert: -7 },
          modify: { tax: -2000, risk: "接受补充说明" },
        },
      ],
      exchangeOptions: [
        {
          id: "x_prepay_installment",
          title: "先缴六成，换三期缴款",
          description: "先拿出更多现金，换更长的缴款安排。",
          requires: null,
          playerLine:
            "“我今天先缴六成，剩下分三期，每期写清日期。这样你的卷宗有落点，我的现金流也能喘口气。”",
          response:
            "“六成到账后，剩余可以分三期。”她在核定单上写下缴款日，“但不能再多。”",
          effects: { mood: 6, distance: 4, patience: -4, alert: -6 },
          modify: { installments: 2, risk: "按期分期" },
        },
        {
          id: "x_scope_noexpand",
          title: "接受三个月样本换不扩查",
          description: "承认现有抽样的可复核部分，换取检查不再扩大。",
          requires: "tax_scope",
          playerLine:
            "“我按三个月样本补充说明，不再争扩查时间。你把这起案件限制在现有范围。”",
          response:
            "“范围可以收回到三个月，但争议销售额不能再按你的单方面计算。”她留下了一个明确边界。",
          effects: { mood: 5, distance: 5, patience: -4, alert: -8 },
          modify: { scope: -3, tax: -2500, risk: "不扩大抽查" },
        },
        {
          id: "x_logs_settlement",
          title: "交全量流水，换今日结案",
          description: "用完整材料换取今天不再追加检查。",
          requires: "tax_pos",
          playerLine:
            "“全量流水今天交，说明链我按你的表补齐。你按现有材料结案，不再追加抽查。”",
          response:
            "“今天补齐，我就按现有范围结案。”她终于把那张红色便签翻到了背面。",
          effects: { mood: 7, distance: 7, patience: -3, alert: -12 },
          modify: { tax: -2000, risk: "今日结案，不扩大抽查" },
        },
      ],
    },
    settlement: {
      acceptedTitle: "税务核定重新形成",
      acceptedSummary:
        "沈岚把新的核定表交给你。金额、缴款安排和检查范围都有了可以复核的落点，今晚的卷宗终于不再是一片红字。",
      conditionalTitle: "先签字，再继续补材料",
      conditionalSummary:
        "税务案暂时结案，但部分条款仍偏向税务机关。服务区能继续营业，只是现金流会被进一步压缩。",
      failedTitle: "按原通知执行",
      failedSummary:
        "谈判没有形成新的核定口径。补税、罚款和临时周转成本一起压了下来，服务区不得不暂停一处广告位。",
      notes: {
        A: "你既守住了现金流，也给了税务官一份经得起复核的卷宗。她的评价会影响后续检查频率。",
        B: "主要金额得到调整，后续说明仍然需要补齐。整体风险已经可控。",
        C: "案件完成了结案，但让出的现金和程序空间有限。下一轮谈判会更依赖经营表现。",
        D: "勉强度过检查，罚款风险仍在。商业声誉受到轻微影响。",
        F: "谈判中止后按原通知执行，服务区承受了最重的现金压力。",
      },
    },
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  const number = Math.round(Number(value));
  return `¥${number.toLocaleString("zh-CN")}`;
}

function currentLevel() {
  return levels[state.levelIndex];
}

function clueById(id) {
  return currentLevel().clues[id];
}

function hasClue(id) {
  return Boolean(
    state.investigation && state.investigation.clues.includes(id),
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function updateHeader() {
  fundsValue.textContent = formatMoney(state.funds);
  reputationValue.textContent = String(state.reputation);
}

function phaseNav(active) {
  const items = [
    { id: "investigate", label: "调查" },
    { id: "negotiate", label: "谈判" },
    { id: "settle", label: "结算" },
  ];
  const activeIndex = items.findIndex((item) => item.id === active);
  return `
    <nav class="phase-nav" aria-label="关卡阶段">
      ${items
        .map(
          (item, index) => `
            <span class="phase-item ${index === activeIndex ? "active" : ""} ${index < activeIndex ? "done" : ""}">
              <span class="phase-dot">${index < activeIndex ? "✓" : index + 1}</span>
              ${item.label}
            </span>
          `,
        )
        .join("")}
    </nav>
  `;
}

function levelTracker() {
  return levels
    .map(
      (level, index) => `
        <span class="phase-item ${index === state.levelIndex ? "active" : ""} ${index < state.levelIndex ? "done" : ""}">
          <span class="phase-dot">${index < state.levelIndex ? "✓" : level.number}</span>
          第${index + 1}关·${level.id === "supplier" ? "供应商" : "税务官"}
        </span>
      `,
    )
    .join("");
}

function render() {
  app.classList.toggle("is-negotiating", state.screen === "negotiate");
  updateHeader();
  if (state.screen === "title") renderTitle();
  if (state.screen === "brief") renderBrief();
  if (state.screen === "investigate") renderInvestigation();
  if (state.screen === "negotiate") renderNegotiation();
  if (state.screen === "settle") renderSettlement();
  if (state.screen === "campaignEnd") renderCampaignEnd();
}

function renderTitle() {
  app.innerHTML = `
    <section class="title-screen">
      <div class="title-copy">
        <div class="eyebrow">Negotiation Simulation / Prototype 0.1</div>
        <h1>谈判模拟</h1>
        <p class="lead">调查信息，找出矛盾，谈成协议。</p>
        <div class="btn-row">
          <button class="btn btn-primary" data-action="start">开始第一天</button>
          <button class="btn btn-ghost" data-action="show-rules">查看谈判规则</button>
        </div>
        <div class="title-meta">
          <span>2 个谈判关卡</span>
          <span>信息组合</span>
          <span>多结局结算</span>
        </div>
      </div>

      <aside class="panel case-preview" aria-label="试玩流程">
        <div class="case-step">
          <b>01</b>
          <div><strong>调查</strong><small>从人物、处境和记录里找出能用的信息。</small></div>
        </div>
        <div class="case-step">
          <b>02</b>
          <div><strong>推演</strong><small>组合相关线索，把零散事实变成判断。</small></div>
        </div>
        <div class="case-step">
          <b>03</b>
        <div><strong>谈判</strong><small>双方报价后，施压、让步或进行条件交换。</small></div>
        </div>
        <div class="case-step">
          <b>04</b>
          <div><strong>结算</strong><small>协议条款、资金和声誉一起写回经营。</small></div>
        </div>
      </aside>
    </section>
  `;
}

function beginCampaign() {
  state.funds = STARTING_FUNDS;
  state.reputation = STARTING_REPUTATION;
  state.results = [];
  state.levelIndex = 0;
  state.result = null;
  openLevelBrief(0);
}

function openLevelBrief(index) {
  state.levelIndex = index;
  state.screen = "brief";
  state.investigation = null;
  state.negotiation = null;
  state.result = null;
  render();
  app.focus({ preventScroll: true });
}

function renderBrief() {
  const level = currentLevel();
  app.innerHTML = `
    <div class="chapter-stamp">${level.kicker}</div>
    <div class="stage-head">
      <div>
        <div class="eyebrow">${level.location} / ${level.date}</div>
        <h1>${level.title}</h1>
        <p>${level.subtitle}</p>
      </div>
    </div>

    ${phaseNav("investigate")}

    <div class="brief-grid">
      <section class="panel brief-main">
        <div class="scene-time">${level.date} &nbsp; 现在开始调查</div>
        <h2>先把能看见的事，变成能说出口的条件。</h2>
        <p>${level.intro}</p>
        <blockquote>${level.quote}</blockquote>
        <p>${level.briefNote}</p>
      </section>

      <aside class="panel objective-card">
        <h3>本关目标</h3>
        <ul class="objective-list">
          ${level.objectives
            .map(
              (objective, index) => `
                <li><span>0${index + 1}</span><span>${objective}</span></li>
              `,
            )
            .join("")}
        </ul>
      </aside>
    </div>

    <div class="brief-actions">
      <p class="muted">
        谈判分为两个阶段。双方提出诉求后会解锁施压、让步与交换，以及结束谈判。
      </p>
      <button class="btn btn-primary" data-action="begin-investigation">进入信息调查</button>
    </div>
  `;
}

function beginInvestigation() {
  const level = currentLevel();
  state.investigation = {
    actions: level.actionPoints,
    maxActions: level.actionPoints,
    claimed: [],
    clues: [],
    selected: [],
    lastClueId: null,
    combineMessage: "",
    combineTone: "neutral",
  };
  state.screen = "investigate";
  render();
  app.focus({ preventScroll: true });
}

function claimSource(sourceId) {
  const level = currentLevel();
  const investigation = state.investigation;
  const source = level.sources.find((item) => item.id === sourceId);
  if (
    !source ||
    investigation.claimed.includes(sourceId) ||
    (!source.free && investigation.actions <= 0)
  ) {
    return;
  }

  investigation.claimed.push(sourceId);
  if (!source.free) {
    investigation.actions -= 1;
  }
  if (!investigation.clues.includes(source.clueId)) {
    investigation.clues.push(source.clueId);
    investigation.lastClueId = source.clueId;
    showToast(`获得线索：${level.clues[source.clueId].title}`);
  }
  render();
}

function toggleClueSelection(clueId) {
  const investigation = state.investigation;
  if (!investigation || !investigation.clues.includes(clueId)) return;
  const selected = investigation.selected;
  if (selected.includes(clueId)) {
    investigation.selected = selected.filter((id) => id !== clueId);
  } else if (selected.length < 2) {
    investigation.selected = [...selected, clueId];
  } else {
    showToast("推演台一次只能放入两条信息。");
  }
  investigation.combineMessage = "";
  render();
}

function combineClues() {
  const level = currentLevel();
  const investigation = state.investigation;
  if (!investigation || investigation.selected.length !== 2) return;

  const selectedSet = new Set(investigation.selected);
  const recipe = level.recipes.find(
    (item) =>
      item.ingredients.length === 2 &&
      item.ingredients.every((ingredient) => selectedSet.has(ingredient)),
  );

  if (!recipe) {
    investigation.combineMessage =
      "这两条信息之间还没有形成可靠关联。再找找能相互印证的人物处境或记录。";
    investigation.combineTone = "neutral";
    render();
    return;
  }

  const resultClue = level.clues[recipe.result];
  if (!investigation.clues.includes(recipe.result)) {
    investigation.clues.push(recipe.result);
    investigation.lastClueId = recipe.result;
    showToast(`矛盾成立：${resultClue.title}`);
  }
  investigation.combineMessage = `矛盾成立：${resultClue.title}。${recipe.explanation}`;
  investigation.combineTone = "success";
  investigation.selected = [];
  render();
}

function clueCardMarkup(clue, selected = false) {
  const typeLabel = clueTypes[clue.type] || "信息";
  const classes = [
    "clue-card",
    selected ? "selected" : "",
    state.investigation &&
    state.investigation.lastClueId === clue.id
      ? "is-new"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `
    <button
      type="button"
      class="${classes}"
      data-clue="${escapeHtml(clue.id)}"
      aria-label="选择信息：${escapeHtml(clue.title)}"
    >
      <span class="clue-top">
        <span class="clue-type ${escapeHtml(clue.type)}">${typeLabel} · ${escapeHtml(clue.category)}</span>
        <span class="mono muted">${selected ? "已选" : "+"}</span>
      </span>
      <strong>${escapeHtml(clue.title)}</strong>
      <p>${escapeHtml(clue.text)}</p>
    </button>
  `;
}

function renderInvestigation() {
  const level = currentLevel();
  const investigation = state.investigation;
  if (!investigation) {
    beginInvestigation();
    return;
  }
  const selectedClues = investigation.selected
    .map((id) => level.clues[id])
    .filter(Boolean);

  app.innerHTML = `
    <div class="chapter-stamp">第 ${level.number} 关 / 信息收集</div>
    <div class="stage-head">
      <div>
        <div class="eyebrow">${level.location} / ${level.date}</div>
        <h2>${level.investTitle}</h2>
        <p>${level.investDescription}</p>
      </div>
      <span class="chapter-stamp">${level.number} · 筹码筹备</span>
    </div>

    ${phaseNav("investigate")}

    <div class="investigation-layout">
      <section class="panel investigation-main">
        <div class="section-heading">
          <div>
            <h3>可调查地点</h3>
            <p>公开信息免费查阅；其余现场信息每次消耗 1 点行动。</p>
          </div>
          <span class="action-counter">调查行动 ${investigation.actions} / ${investigation.maxActions}</span>
        </div>

        <div class="source-grid">
          ${level.sources
            .map((source) => {
              const claimed = investigation.claimed.includes(source.id);
              const disabled =
                claimed || (!source.free && investigation.actions <= 0);
              const clue = level.clues[source.clueId];
              const costLabel = source.free
                ? claimed
                  ? "已查阅"
                  : "免费查阅"
                : claimed
                  ? "已调查"
                  : "消耗 1 次";
              return `
                <button
                  type="button"
                  class="source-card ${claimed ? "claimed" : ""} ${source.free ? "free" : ""}"
                  data-source="${escapeHtml(source.id)}"
                  ${disabled ? "disabled" : ""}
                >
                  <span class="source-kind">${escapeHtml(source.kind)}信息 / ${costLabel}</span>
                  <span>
                    <strong>${escapeHtml(claimed ? clue.title : source.title)}</strong>
                    <small>${escapeHtml(claimed ? clue.text : source.teaser)}</small>
                  </span>
                  <span class="claimed-label">${claimed ? "已收入档案" : source.free ? "点击免费查阅 →" : "点击调查 →"}</span>
                </button>
              `;
            })
            .join("")}
        </div>

        <div class="investigation-footer">
          <p class="muted">提示：先收集线索，再到信息档案里点击两张卡片放入推演台。</p>
          <button class="btn btn-primary" data-action="start-negotiation">
            整理档案，开始谈判
          </button>
        </div>
      </section>

      <aside class="investigation-side">
        <section class="panel notebook">
          <div class="section-heading">
            <div>
              <h3>信息档案</h3>
              <p>已掌握 ${investigation.clues.length} 条，可选择两条进行推演</p>
            </div>
          </div>
          <div class="notebook-list">
            ${
              investigation.clues.length
                ? investigation.clues
                    .map((id) =>
                      clueCardMarkup(
                        level.clues[id],
                        investigation.selected.includes(id),
                      ),
                    )
                    .join("")
                : '<div class="empty-state">档案还是空的。<br />先去左侧调查一个地点。</div>'
            }
          </div>
        </section>

        <section class="panel combine-box">
          <div class="section-heading">
            <div>
              <h3>推演台</h3>
              <p>寻找相互印证或相互矛盾的信息</p>
            </div>
          </div>
          <div class="combine-slots">
            <div class="combine-slot ${selectedClues[0] ? "filled" : ""}">
              ${selectedClues[0] ? escapeHtml(selectedClues[0].title) : "选择第一条线索"}
            </div>
            <span class="combine-symbol">+</span>
            <div class="combine-slot ${selectedClues[1] ? "filled" : ""}">
              ${selectedClues[1] ? escapeHtml(selectedClues[1].title) : "选择第二条线索"}
            </div>
          </div>
          <button
            type="button"
            class="btn btn-wide ${investigation.selected.length === 2 ? "btn-primary" : ""}"
            data-action="combine"
            ${investigation.selected.length !== 2 ? "disabled" : ""}
          >
            尝试整合线索
          </button>
          ${
            investigation.combineMessage
              ? `<div class="combine-result">${escapeHtml(investigation.combineMessage)}</div>`
              : ""
          }
        </section>
      </aside>
    </div>
  `;
}

function startNegotiation() {
  const level = currentLevel();
  const inheritedDistance =
    state.levelIndex === 1 && state.results[0]
      ? ["A", "B"].includes(state.results[0].grade)
        ? 8
        : state.results[0].grade === "F"
          ? -5
          : 0
      : 0;
  const stats = {
    ...level.negotiation.stats,
    distance: clamp(
      level.negotiation.stats.distance + inheritedDistance,
      0,
      100,
    ),
  };
  state.negotiation = {
    phase: 1,
    stats,
    demand: null,
    targetTerms: null,
    offer: null,
    progress: 0,
    usedChats: [],
    usedQuestions: [],
    usedAskClues: [],
    usedDirectAsk: false,
    usedPressure: [],
    usedConcessions: [],
    usedExchange: false,
    failures: 0,
    extraCost: 0,
    log: [
      {
        speaker: "system",
        text: `谈判开始。${level.negotiation.npc.short}正在等待你的第一个问题。`,
      },
      {
        speaker: "npc",
        text: level.negotiation.opening,
      },
    ],
  };
  state.screen = "negotiate";
  render();
  app.focus({ preventScroll: true });
}

function statLabel(value, type) {
  if (type === "mood") {
    if (value >= 70) return "愉快";
    if (value >= 42) return "一般";
    if (value >= 20) return "急躁";
    return "抵触";
  }
  if (type === "distance") {
    if (value >= 75) return "信任";
    if (value >= 50) return "亲近";
    if (value >= 27) return "试探";
    return "疏远";
  }
  if (type === "patience") {
    if (value >= 70) return "充足";
    if (value >= 38) return "尚可";
    if (value > 0) return "告急";
    return "耗尽";
  }
  if (type === "alert") {
    if (value >= 75) return "准备升级";
    if (value >= 48) return "警觉";
    if (value >= 22) return "关注";
    return "低";
  }
  return String(value);
}

function mentalComposite(level, stats) {
  const alertPenalty = level.id === "tax" ? stats.alert * 0.2 : 0;
  return clamp(
    Math.round(
      stats.mood * 0.35 +
        stats.distance * 0.4 +
        stats.patience * 0.25 -
        alertPenalty,
    ),
    0,
    100,
  );
}

function mentalLabel(score) {
  if (score >= 70) return "稳定";
  if (score >= 52) return "尚可";
  if (score >= 35) return "不稳";
  return "濒临破裂";
}

function askFailureChance(stats) {
  return clamp((34 - stats.mood) * 0.012, 0, 0.42);
}

function trustFailureChance(stats) {
  return clamp((34 - stats.distance) * 0.01, 0, 0.35);
}

function pressureFailureChance(level, stats) {
  const composite = mentalComposite(level, stats);
  const moodDeficit = Math.max(0, 35 - stats.mood);
  const distanceDeficit = Math.max(0, 35 - stats.distance);
  const compositeDeficit = Math.max(0, 55 - composite);
  return clamp(
    compositeDeficit * 0.006 +
      distanceDeficit * 0.004 +
      moodDeficit * 0.002,
    0,
    0.55,
  );
}

function riskLabel(chance) {
  if (chance <= 0) return "低";
  if (chance < 0.18) return "中";
  if (chance < 0.35) return "高";
  return "很高";
}

function addStatMarkup(label, key, value, role) {
  const toneClass = key === "alert" ? "red" : key === "patience" ? "amber" : "";
  return `
    <div class="stat-block">
      <div class="stat-label">
        <span>${label}</span>
        <span>${statLabel(value, key)} · ${value}</span>
      </div>
      <div class="stat-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
        <div class="stat-fill ${toneClass}" style="width: ${value}%"></div>
      </div>
      <span class="stat-role">${role}</span>
    </div>
  `;
}

function renderDialogue(log) {
  return log
    .slice(-14)
    .map((line) => {
      if (line.speaker === "system") {
        return `
          <div class="dialogue-line system">
            <div class="speaker">系统记录</div>
            <div>${escapeHtml(line.text)}</div>
          </div>
        `;
      }
      return `
        <div class="dialogue-line ${line.speaker === "player" ? "player" : ""}">
          <div class="speaker">${line.speaker === "player" ? "你" : "对方"}</div>
          <div class="dialogue-copy">
            ${escapeHtml(line.text)}
            ${line.effects ? renderEffects(line.effects) : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderEffects(effects) {
  if (!effects || !effects.length) return "";
  return `
    <div class="effect-strip">
      ${effects
        .map(
          (effect) => `
            <span class="effect ${effect.tone || ""}">${escapeHtml(effect.text)}</span>
          `,
        )
        .join("")}
    </div>
  `;
}

function riskQuality(value) {
  const order = {
    "罚款另议": 0,
    "按原通知执行": 0,
    "仍需补充复核材料": 1,
    "接受补充说明": 2,
    "按期分期": 2,
    "不扩大抽查": 3,
    "今日结案，不扩大抽查": 3,
  };
  return order[value] ?? 1;
}

function isTermReached(term, current, target) {
  if (current === undefined || target === undefined) return false;
  if (term.compare === "max") return Number(current) <= Number(target);
  if (term.compare === "min") return Number(current) >= Number(target);
  if (term.compare === "risk") {
    return riskQuality(current) >= riskQuality(target);
  }
  return current === target;
}

function termCompletion(term, baseline, current, target) {
  if (
    baseline === undefined ||
    current === undefined ||
    target === undefined
  ) {
    return 0;
  }
  if (isTermReached(term, current, target)) return 1;

  if (term.compare === "risk") {
    const baselineValue = riskQuality(baseline);
    const currentValue = riskQuality(current);
    const targetValue = riskQuality(target);
    const span = Math.abs(targetValue - baselineValue);
    if (span === 0) return 0;
    return clamp(
      (currentValue - baselineValue) / (targetValue - baselineValue),
      0,
      1,
    );
  }

  const baselineNumber = Number(baseline);
  const currentNumber = Number(current);
  const targetNumber = Number(target);
  if (term.compare === "max") {
    const span = baselineNumber - targetNumber;
    if (span <= 0) return 0;
    return clamp((baselineNumber - currentNumber) / span, 0, 1);
  }
  if (term.compare === "min") {
    const span = targetNumber - baselineNumber;
    if (span <= 0) return 0;
    return clamp((currentNumber - baselineNumber) / span, 0, 1);
  }
  return 0;
}

function calculateGoalProgress(level, negotiation) {
  if (!negotiation.offer || !negotiation.targetTerms) return 0;
  const terms = level.negotiation.terms;
  const total = terms.reduce(
    (sum, term) =>
      sum +
      termCompletion(
        term,
        level.negotiation.counterTerms[term.key],
        negotiation.offer[term.key],
        negotiation.targetTerms[term.key],
      ),
    0,
  );
  return Math.round((total / terms.length) * 100);
}

function updateGoalProgress() {
  const negotiation = state.negotiation;
  if (!negotiation) return;
  negotiation.progress = calculateGoalProgress(
    currentLevel(),
    negotiation,
  );
}

function termsTableMarkup(level, negotiation) {
  const hasOffer = Boolean(negotiation.offer);
  const target = negotiation.targetTerms;
  return `
    <div class="term-list">
      ${level.negotiation.terms
        .map((term) => {
          const current = hasOffer
            ? term.format(negotiation.offer[term.key])
            : "尚未报价";
          const targetValue =
            term.key === "risk"
              ? target
                ? target[term.key]
                : "—"
              : target
                ? `${term.targetPrefix || ""}${term.format(target[term.key])}`
                : "—";
          const reached =
            hasOffer &&
            target &&
            isTermReached(
              term,
              negotiation.offer[term.key],
              target[term.key],
            );
          const status = !hasOffer || !target
            ? '<span class="term-status pending">待报价</span>'
            : reached
              ? '<span class="term-status met">✓ 已满足</span>'
              : '<span class="term-status unmet">未达成</span>';
          return `
            <div class="term-row">
              <div class="term-row-head">
                <span class="term-name">
                  ${escapeHtml(term.label)}
                  <small class="term-direction">${escapeHtml(term.direction)}</small>
                </span>
                ${status}
              </div>
              <div class="term-row-values">
                <span><small>当前</small><b class="current">${escapeHtml(current)}</b></span>
                <span><small>目标</small><b class="target">${escapeHtml(targetValue)}</b></span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function actionButton(act, label, description, disabled = false) {
  return `
    <button type="button" class="btn action-button" data-action="open-act" data-act="${act}" ${disabled ? "disabled" : ""}>
      <strong>${label}</strong>
      <small>${description}</small>
    </button>
  `;
}

function actionGroupMarkup(title, hint, content) {
  return `
    <section class="action-group">
      <div class="action-group-label">
        <strong>${title}</strong>
        <span>${hint}</span>
      </div>
      <div class="action-grid">${content}</div>
    </section>
  `;
}

function renderNegotiation() {
  const level = currentLevel();
  const negotiation = state.negotiation;
  if (!negotiation) {
    startNegotiation();
    return;
  }
  const npc = level.negotiation.npc;
  const phaseTwo = negotiation.phase === 2;
  const mentalScore = mentalComposite(level, negotiation.stats);
  const askRisk = riskLabel(askFailureChance(negotiation.stats));
  const pressureRisk = riskLabel(
    pressureFailureChance(level, negotiation.stats),
  );
  const trustRisk = riskLabel(trustFailureChance(negotiation.stats));
  const progressText = phaseTwo ? `${Math.round(negotiation.progress)}%` : "待交锋";

  app.innerHTML = `
    <div class="negotiation-screen">
      <div class="stage-head">
        <div>
          <div class="eyebrow">${level.location} / ${level.date}</div>
          <h2>${phaseTwo ? "双方都已亮出诉求。" : "先让对方愿意继续说下去。"}</h2>
        <p>${phaseTwo ? "现在可以使用施压、让步与条件交换。随时结束谈判，但进度不足时结果会更差。" : "第一阶段可以交流、询问和提出诉求。提出诉求同时会触发对方报价。"}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${levelTracker()}</div>
      </div>

      ${phaseNav("negotiate")}

      <div class="negotiation-layout">
        <aside class="negotiation-sidebar" aria-label="谈判对象与当前条款">
          <section class="panel npc-card" title="${escapeHtml(npc.note)}">
            <div>
              <div class="npc-profile">
                <div class="npc-avatar" aria-hidden="true">${escapeHtml(npc.avatar)}</div>
                <div>
                  <h2>${escapeHtml(npc.name)}</h2>
                  <p>${escapeHtml(npc.title)}</p>
                </div>
              </div>
              <div class="stat-row">
                ${addStatMarkup("心情", "mood", negotiation.stats.mood, "影响询问；条件变化会反向影响心情")}
                ${addStatMarkup("心理距离", "distance", negotiation.stats.distance, "影响施压与交换条件")}
                ${addStatMarkup("耐心", "patience", negotiation.stats.patience, "所有操作都会消耗")}
                ${
                  level.id === "tax"
                    ? addStatMarkup("警觉度", "alert", negotiation.stats.alert, "过高会触发上级介入")
                    : ""
                }
              </div>
              <div class="mental-summary">
                <span>综合谈判状态</span>
                <strong>${mentalLabel(mentalScore)} · ${mentalScore}</strong>
              </div>
              <button type="button" class="btn btn-wide info-archive-button" data-action="show-known-clues">
                已掌握信息 · ${state.investigation.clues.length}
              </button>
            </div>
            <p class="npc-note">${escapeHtml(npc.note)}</p>
          </section>

          <section class="panel offer-panel">
            <div class="section-heading">
              <div>
                <h3>当前条款</h3>
                <p>${phaseTwo ? "对方方案与你的目标" : "尚未形成正式报价"}</p>
              </div>
            </div>
            ${termsTableMarkup(level, negotiation)}
          </section>
        </aside>

        <div class="negotiation-main">
        <section class="panel progress-panel">
          <div class="progress-head">
            <strong>目标达成度</strong>
            <span>${progressText}</span>
          </div>
          ${
            phaseTwo
              ? `<div class="progress-track" role="meter" aria-label="谈判目标达成度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(negotiation.progress)}"><div class="progress-fill" style="width:${clamp(negotiation.progress, 0, 100)}%"></div></div>`
              : '<div class="progress-locked">双方提出诉求后解锁。阶段一只能收集对话信息，不能施压或结案。</div>'
          }
        </section>

        <section class="panel conversation-panel" aria-label="谈判对话">
          <div class="dialogue-log">
            ${renderDialogue(negotiation.log)}
          </div>
        </section>

        <section class="panel action-panel">
          <div class="action-title">
            <h3>${phaseTwo ? "选择谈判动作" : "第一阶段：接近与试探"}</h3>
            <span>${phaseTwo ? "任何行动都会改变关系或耐心" : "提出诉求后进入第二阶段"}</span>
          </div>
          <div class="action-groups">
            ${actionGroupMarkup(
              "诉求",
              "调整谈判目标",
              actionButton(
                "propose",
                phaseTwo ? "更改诉求" : "推进 · 提出诉求",
                phaseTwo
                  ? "降低诉求恢复心情，提高诉求会降低心情"
                  : "触发对方报价并进入阶段二",
              ),
            )}
            ${actionGroupMarkup(
              "关系与信息",
              "交流与试探",
              `${actionButton("chat", "交流 · 缓和", "按当前状态判断信息效果")}
               ${actionButton("ask", "询问 · 获取信息", `心情失败风险：${askRisk}`)}`,
            )}
            ${
              phaseTwo
                ? actionGroupMarkup(
                    "交锋与交换",
                    "争取条款",
                    `${actionButton("pressure", "施压", `综合失败风险：${pressureRisk}`)}
                     ${actionButton("trade", "让步与交换", `让步无风险；交换风险：${trustRisk}`)}`,
                  )
                : ""
            }
            ${
              phaseTwo
                ? actionGroupMarkup(
                    "结束",
                    "形成最终结果",
                    `${actionButton("end", "达成合意", "以当前条款结束谈判")}
                     ${actionButton("abort", "中止谈判", "结束并接受失败结果")}`,
                  )
                : ""
            }
          </div>
          ${
            !phaseTwo
              ? '<div class="phase-lock">只有双方都提出需求后，施压、让步、交换、结束和中止才会解锁。</div>'
              : ""
          }
        </section>
        </div>
      </div>
    </div>
  `;

  const logElement = document.querySelector(".dialogue-log");
  if (logElement) logElement.scrollTop = logElement.scrollHeight;
}

function say(speaker, text, effects = null) {
  state.negotiation.log.push({ speaker, text, effects });
}

function addKnownClue(clueId) {
  if (!clueId) return;
  if (!state.investigation.clues.includes(clueId)) {
    state.investigation.clues.push(clueId);
    state.investigation.lastClueId = clueId;
    showToast(`获得新信息：${clueById(clueId).title}`);
  }
}

function clampNegotiationStats(stats) {
  stats.mood = clamp(Math.round(stats.mood), 0, 100);
  stats.distance = clamp(Math.round(stats.distance), 0, 100);
  stats.patience = clamp(Math.round(stats.patience), 0, 100);
  stats.alert = clamp(Math.round(stats.alert), 0, 100);
}

function effectsToDisplay(effects, modify = {}) {
  const result = [];
  const labels = {
    mood: "心情",
    distance: "心理距离",
    patience: "耐心",
    alert: "警觉度",
  };
  Object.entries(effects || {}).forEach(([key, value]) => {
    if (!value || !labels[key]) return;
    const isBad = value < 0 && key !== "alert";
    const tone = key === "alert" ? (value > 0 ? "bad" : "good") : value > 0 ? "good" : isBad ? "bad" : "";
    result.push({
      text: `${labels[key]} ${value > 0 ? "+" : ""}${value}`,
      tone,
    });
  });
  if (state.levelIndex === 0) {
    if (modify.total)
      result.push({
        text: `合同总价 ${modify.total > 0 ? "+" : "-"}${formatMoney(Math.abs(modify.total))}`,
        tone: modify.total < 0 ? "good" : "bad",
      });
    if (modify.duration)
      result.push({
        text: `供货周期 ${modify.duration > 0 ? "+" : ""}${modify.duration} 天`,
        tone: modify.duration > 0 ? "good" : "bad",
      });
    if (modify.volume)
      result.push({
        text: `每批 ${modify.volume > 0 ? "+" : ""}${modify.volume} 箱`,
        tone: modify.volume > 0 ? "good" : "bad",
      });
  } else {
    if (modify.tax)
      result.push({
        text: `补税 ${modify.tax > 0 ? "+" : "-"}${formatMoney(Math.abs(modify.tax))}`,
        tone: modify.tax < 0 ? "good" : "bad",
      });
    if (modify.installments)
      result.push({
        text: `分期 ${modify.installments > 0 ? "+" : ""}${modify.installments}`,
        tone: modify.installments > 0 ? "good" : "bad",
      });
    if (modify.scope)
      result.push({
        text: `抽查 ${modify.scope > 0 ? "+" : ""}${modify.scope}月`,
        tone: modify.scope < 0 ? "good" : "bad",
      });
  }
  return result;
}

function applyEffects(effects, modify = {}) {
  const negotiation = state.negotiation;
  ["mood", "distance", "patience", "alert"].forEach((key) => {
    if (typeof effects[key] === "number") {
      negotiation.stats[key] += effects[key];
    }
  });
  clampNegotiationStats(negotiation.stats);
  if (negotiation.offer && modify) {
    const level = currentLevel();
    if (level.id === "supplier") {
      if (modify.total)
        negotiation.offer.total = clamp(
          Math.round(negotiation.offer.total + modify.total),
          5000,
          7500,
        );
      if (modify.duration)
        negotiation.offer.duration = clamp(
          Math.round(negotiation.offer.duration + modify.duration),
          3,
          21,
        );
      if (modify.volume)
        negotiation.offer.volume = clamp(
          Math.round(negotiation.offer.volume + modify.volume),
          80,
          240,
        );
    } else {
      if (modify.tax)
        negotiation.offer.tax = clamp(
          Math.round(negotiation.offer.tax + modify.tax),
          100000,
          128000,
        );
      if (modify.installments)
        negotiation.offer.installments = clamp(
          Math.round(negotiation.offer.installments + modify.installments),
          1,
          3,
        );
      if (modify.scope)
        negotiation.offer.scope = clamp(
          Math.round(negotiation.offer.scope + modify.scope),
          3,
          6,
        );
      if (modify.risk) negotiation.offer.risk = modify.risk;
    }
    updateGoalProgress();
  }
}

function openModal({ title, description = "", content = "" }) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal="true">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <div>
            <h2 id="modal-title">${escapeHtml(title)}</h2>
            ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          </div>
          <button type="button" class="modal-close" data-close-modal="true" aria-label="关闭">×</button>
        </div>
        ${content}
      </section>
    </div>
  `;
  window.setTimeout(() => {
    const closeButton = modalRoot.querySelector(".modal-close");
    if (closeButton) closeButton.focus();
  }, 0);
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function showRulesModal() {
  openModal({
    title: "谈判结构",
    description: "这是一个以信息为核心的文字谈判原型。",
    content: `
      <div class="modal-list">
        <div class="choice-card">
          <div class="choice-head"><strong>阶段一 · 接近与试探</strong><span class="choice-tag">交流 / 询问 / 提出诉求</span></div>
          <p>人物信息通常更容易开口，但同一句话能否缓和关系仍取决于当前心情、时机与双方距离。询问可以获取新信息，但会消耗耐心。提出诉求后，对方会给出自己的条件，双方正式进入第二阶段。</p>
        </div>
        <div class="choice-card">
          <div class="choice-head"><strong>阶段二 · 交换与交锋</strong><span class="choice-tag">缓和 / 施压 / 让步 / 交换</span></div>
          <p>施压需要选择一条能解释当前问题的证据；“让步与交换”共用一个入口，单方让步不会随机失败，互换条件受心理距离影响。</p>
        </div>
        <div class="choice-card">
          <div class="choice-head"><strong>三项心理状态</strong><span class="choice-tag">独立作用</span></div>
          <p>心情影响询问；降低诉求会恢复心情，提高诉求会降低心情。心理距离影响施压与交换条件；妥协不会触发信任失败，并能改善关系。耐心会被所有操作消耗。</p>
        </div>
        <div class="choice-card">
          <div class="choice-head"><strong>协议评级</strong><span class="choice-tag">A / B / C / D / F</span></div>
          <p>A 需要目标全部达成、综合状态稳定且没有操作失败；B 是较好协议，但关系或条款仍有缺口；C 是勉强可用；D 风险较高；F 为谈判失败。综合评级过低时，无法只靠达成目标拿到高评级。</p>
        </div>
        <div class="choice-card">
          <div class="choice-head"><strong>信息组合</strong><span class="choice-tag">调查阶段</span></div>
          <p>公开信息免费查阅；其余现场信息消耗行动点。需要调查的现场信息总比行动点多一条，因此每次都要主动放弃一个现场线索。</p>
        </div>
        <div class="choice-card">
          <div class="choice-head"><strong>矛盾推演</strong><span class="choice-tag">公开信息 vs 现场记录</span></div>
          <p>在信息档案里选择一张公开信息和一张现场记录放入推演台。两者发生冲突时，会生成更强的推断筹码。</p>
        </div>
      </div>
      <p class="modal-note">案件没有唯一解法：你可以压低金额、换到分期，也可以接受部分不利条款，换取程序风险降低。</p>
    `,
  });
}

function choiceMarkup({
  title,
  description,
  tag = "",
  tagClass = "",
  callout = "",
  disabled = false,
  attributes = "",
}) {
  return `
    <button type="button" class="choice-card" ${attributes} ${disabled ? "disabled" : ""}>
      <span class="choice-head">
        <strong>${escapeHtml(title)}</strong>
        ${tag ? `<span class="choice-tag ${tagClass}">${escapeHtml(tag)}</span>` : ""}
      </span>
      <div class="choice-card-description"><p>${escapeHtml(description)}</p></div>
      ${callout ? `<span class="clue-callout">${escapeHtml(callout)}</span>` : ""}
    </button>
  `;
}

function evaluateChatOption(option, stats) {
  if (!option.conditional) {
    return {
      conditional: false,
      active: true,
      effects: option.effects,
      response: option.response,
    };
  }

  const active = (option.conditional.requirements || []).every(
    (requirement) => {
      const value = stats[requirement.stat];
      if (typeof value !== "number") return false;
      if (
        typeof requirement.min === "number" &&
        value < requirement.min
      ) {
        return false;
      }
      if (
        typeof requirement.max === "number" &&
        value > requirement.max
      ) {
        return false;
      }
      return true;
    },
  );
  const branch = option.conditional[active ? "active" : "inactive"];
  return {
    conditional: true,
    active,
    effects: branch.effects,
    response: branch.response,
  };
}

function showChatModal() {
  const negotiation = state.negotiation;
  if (!negotiation) return;
  const level = currentLevel();
  const clues = state.investigation.clues.map((id) => clueById(id));
  openModal({
    title: "交流：选择信息",
    description:
      "同一信息能否缓和关系，取决于她此刻的心情、距离、耐心与警觉度。",
    content: `
      ${
        clues.length
          ? `<div class="modal-list">
        ${clues
          .map((clue) => {
            const used = negotiation.usedChats.includes(clue.id);
            const option = level.negotiation.chatOptions.find(
              (item) => item.clueId === clue.id,
            );
            const assessment = option
              ? evaluateChatOption(option, negotiation.stats)
              : null;
            return choiceMarkup({
              title: clue.title,
              description: clue.text,
              tag: assessment?.conditional
                ? assessment.active
                  ? "此刻有效"
                  : "时机不宜"
                : "",
              tagClass:
                assessment?.conditional && !assessment.active
                  ? "warn"
                  : "",
              callout:
                assessment?.conditional
                  ? `条件：${option.conditional.hint}。`
                  : "",
              disabled: used,
              attributes: `data-action="resolve-chat" data-choice="${escapeHtml(clue.id)}"`,
            });
          })
          .join("")}
      </div>`
          : '<div class="empty-state">你还没有掌握任何信息。</div>'
      }
    `,
  });
}

function showAskModal() {
  const level = currentLevel();
  const negotiation = state.negotiation;
  const clues = state.investigation.clues.map((id) => clueById(id));
  openModal({
    title: "询问：选择信息",
    description: `选择一条你已经掌握的信息作为提问依据。当前失败风险：${riskLabel(askFailureChance(negotiation.stats))}。`,
    content: `
      <div class="modal-list">
        ${clues
          .map((clue) => {
            const question = level.negotiation.questions.find(
              (item) => item.supportClue === clue.id,
            );
            const used =
              negotiation.usedAskClues.includes(clue.id) ||
              (question && negotiation.usedQuestions.includes(question.id));
            return choiceMarkup({
              title: clue.title,
              description: clue.text,
              disabled: used,
              attributes: `data-action="resolve-question-by-clue" data-choice="${escapeHtml(clue.id)}"`,
            });
          })
          .join("")}
      </div>
      <button
        type="button"
        class="btn btn-wide direct-ask-button"
        data-action="resolve-direct-ask"
        ${negotiation.usedDirectAsk ? "disabled" : ""}
      >
        不借助信息，直接提问
      </button>
      ${
        clues.length
          ? ""
          : '<div class="empty-state">你还没有掌握任何信息，但仍可直接提问。</div>'
      }
    `,
  });
}

function showDemandModal(isChange = false) {
  const level = currentLevel();
  const negotiation = state.negotiation;
  openModal({
    title: isChange ? "更改诉求" : "提出你的诉求",
    description: isChange
      ? "降低诉求会恢复心情，提高诉求会降低心情。"
      : "提出诉求后，对方会给出正式报价，谈判进入第二阶段。",
    content: `
      <div class="modal-list">
        ${level.negotiation.demandOptions
          .map((option) => {
            const disabled =
              isChange && negotiation.demand && negotiation.demand.id === option.id;
            return choiceMarkup({
              title: option.title,
              description: option.description,
              tag: disabled ? "当前诉求" : option.tag,
              tagClass: option.id === "strict" ? "warn" : "",
              disabled,
              attributes: `data-action="resolve-demand" data-choice="${escapeHtml(option.id)}"`,
            });
          })
          .join("")}
      </div>
      <p class="modal-note">${isChange ? "如果更改过于离谱，对方会认为你缺乏谈判诚意，心情和心理距离都会下降。" : "目标是你的理想条款，不是最终一定能够全部拿到的结果。"}</p>
    `,
  });
}

function pressureCandidates() {
  const level = currentLevel();
  return state.investigation.clues
    .map((id) => level.clues[id])
    .filter(Boolean);
}

function showPressureModal() {
  const negotiation = state.negotiation;
  const candidates = pressureCandidates();
  openModal({
    title: "施压：把事实放上桌",
    description: `选择一条你已经掌握的信息。当前综合失败风险：${riskLabel(pressureFailureChance(currentLevel(), negotiation.stats))}。`,
    content: `
      ${
        candidates.length
          ? `
            <div class="modal-list">
              ${candidates
                .map((clue) => {
                  const used = negotiation.usedPressure.includes(clue.id);
                  return choiceMarkup({
                    title: clue.title,
                    description: clue.text,
                    disabled: used,
                    attributes: `data-action="resolve-pressure" data-choice="${escapeHtml(clue.id)}"`,
                  });
                })
                .join("")}
            </div>
          `
          : '<div class="empty-state">你还没有掌握任何信息。</div>'
      }
    `,
  });
}

function showKnownCluesModal() {
  const clues = state.investigation.clues.map((id) => clueById(id));
  openModal({
    title: "已掌握的信息",
    description: `共 ${clues.length} 条`,
    content: `
      ${
        clues.length
          ? `<div class="modal-list">
              ${clues
                .map(
                  (clue) => `
                    <div class="choice-card info-readonly">
                      <div class="choice-head">
                        <strong>${escapeHtml(clue.title)}</strong>
                      </div>
                      <div class="choice-card-description">
                        <p>${escapeHtml(clue.text)}</p>
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>`
          : '<div class="empty-state">你还没有掌握任何信息。</div>'
      }
    `,
  });
}

function showTradeModal() {
  const level = currentLevel();
  const negotiation = state.negotiation;
  openModal({
    title: "让步与交换",
    description: "单方让步不会随机失败；条件交换更强势，但受心理距离影响，且每次谈判只能完成一次。",
    content: `
      <div class="modal-section-title">
        <strong>单方让步</strong>
        <span>主动让出利益，改善关系</span>
      </div>
      <div class="modal-list">
        ${level.negotiation.concessionOptions
          .map((option) => {
            const known = hasClue(option.clueId);
            const used = negotiation.usedConcessions.includes(option.id);
            return choiceMarkup({
              title: option.title,
              description: known
                ? option.description
                : "你还没有掌握足以提出这项妥协的处境线索。",
              tag: used ? "已提出" : known ? "让步" : "缺少线索",
              tagClass: known ? "" : "warn",
              callout: known
                ? `依据：${clueById(option.clueId).title}${option.extraCost ? ` · 结算支出 ${formatMoney(option.extraCost)}` : ""}`
                : "",
              disabled: !known || used,
              attributes: `data-action="resolve-trade" data-kind="concession" data-choice="${escapeHtml(option.id)}"`,
            });
          })
          .join("")}
      </div>
      <div class="modal-section-title">
        <strong>互换条件</strong>
        <span>每次一次 · 当前信任失败风险：${riskLabel(trustFailureChance(negotiation.stats))}</span>
      </div>
      <div class="modal-list">
        ${level.negotiation.exchangeOptions
          .map((option) => {
            const known = !option.requires || hasClue(option.requires);
            return choiceMarkup({
              title: option.title,
              description: known
                ? option.description
                : "你还没有找到支持这项交换的足够信息。",
              tag: known
                ? negotiation.usedExchange
                  ? "已使用"
                  : "交换"
                : "缺少依据",
              tagClass: known ? "" : "warn",
              callout:
                option.requires && known
                  ? `依据：${clueById(option.requires).title}`
                  : "",
              disabled: !known || negotiation.usedExchange,
              attributes: `data-action="resolve-trade" data-kind="exchange" data-choice="${escapeHtml(option.id)}"`,
            });
          })
          .join("")}
      </div>
      <p class="modal-note">让步偏重缓和关系；互换条件偏重同时调整多项协议条款。两者共用一个操作入口，但结算效果不同。</p>
    `,
  });
}

function showEndModal() {
  const progress = Math.round(state.negotiation.progress);
  openModal({
    title: "以当前进度结束谈判",
    description: "结束谈判不会自动变成胜利。进度不足时，对方只会接受更差的条款，甚至拒绝签约。",
    content: `
      <div class="choice-card">
        <div class="choice-head"><strong>当前目标达成度</strong><span class="choice-tag">${progress}%</span></div>
        <p>进度 55% 以上通常能形成较完整的合意；30% 至 54% 可能只得到有条件协议；低于 30% 时对方很可能拒绝签字。</p>
      </div>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn btn-primary" data-action="finish-negotiation" data-reason="end">按当前条款结案</button>
        <button class="btn btn-ghost" data-close-modal="true">继续谈判</button>
      </div>
    `,
  });
}

function showAbortModal() {
  openModal({
    title: "确定中止谈判？",
    description: "中止会立即结算失败结果。你无法再修改本次谈判的条款。",
    content: `
      <div class="choice-card">
        <div class="choice-head"><strong>中止不是保留现状</strong><span class="choice-tag warn">失败结算</span></div>
        <p>供应商会按紧急渠道处理，税务官会按原通知执行。资金和声誉都会受到影响。</p>
      </div>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn btn-danger" data-action="finish-negotiation" data-reason="abort">确认中止</button>
        <button class="btn btn-ghost" data-close-modal="true">返回谈判</button>
      </div>
    `,
  });
}

function rollFailure(chance) {
  return chance > 0 && Math.random() < chance;
}

function recordFailure() {
  if (state.negotiation) {
    state.negotiation.failures += 1;
  }
}

function resolveChat(clueId) {
  const level = currentLevel();
  const option = level.negotiation.chatOptions.find(
    (item) => item.clueId === clueId,
  );
  const negotiation = state.negotiation;
  const clue = clueById(clueId);
  if (!clue || !hasClue(clueId) || negotiation.usedChats.includes(clueId)) {
    return;
  }
  negotiation.usedChats.push(clueId);
  if (option) {
    const outcome = evaluateChatOption(option, negotiation.stats);
    say("player", option.playerLine);
    applyEffects(outcome.effects, {});
    say("npc", outcome.response, effectsToDisplay(outcome.effects));
  } else {
    const effects =
      level.id === "supplier"
        ? { mood: -7, distance: -3, patience: -7 }
        : { mood: -6, distance: -3, patience: -7, alert: 4 };
    say("player", `“我刚注意到一件事：${clue.text}”`);
    applyEffects(effects, {});
    say(
      "npc",
      level.id === "supplier"
        ? "“这和今天供货有什么关系？”邵老板把话题拉回了合同。"
        : "“这和本案没有直接关系。”沈岚低头翻回卷宗。",
      effectsToDisplay(effects),
    );
  }
  closeModal();
  render();
}

function resolveQuestionByClue(clueId) {
  const level = currentLevel();
  const negotiation = state.negotiation;
  if (
    !hasClue(clueId) ||
    negotiation.usedAskClues.includes(clueId)
  ) {
    return;
  }
  negotiation.usedAskClues.push(clueId);
  const question = level.negotiation.questions.find(
    (item) => item.supportClue === clueId,
  );
  if (!question || negotiation.usedQuestions.includes(question.id)) {
    const effects =
      level.id === "supplier"
        ? { mood: -5, distance: -3, patience: -8 }
        : { mood: -4, distance: -3, patience: -8, alert: 3 };
    const clue = clueById(clueId);
    say("player", `“关于${clue.title}，我还想确认一点：这会影响你今天给出的条件吗？”`);
    applyEffects(effects, {});
    say(
      "npc",
      level.id === "supplier"
        ? "“这件事和合同没有直接关系。”邵老板明显不想继续绕。"
        : "“这不是当前需要确认的事项。”沈岚把问题挡了回去。",
      effectsToDisplay(effects),
    );
    closeModal();
    render();
    return;
  }
  negotiation.usedQuestions.push(question.id);
  say("player", question.playerLine);
  if (rollFailure(askFailureChance(negotiation.stats))) {
    recordFailure();
    const effects =
      level.id === "supplier"
        ? { mood: -8, distance: -5, patience: -9 }
        : { mood: -7, distance: -5, patience: -9, alert: 3 };
    applyEffects(effects, {});
    say(
      "npc",
      level.id === "supplier"
        ? "“我现在不想回答这个。”邵老板把笔扣在桌上，气氛又僵了一层。"
        : "“我现在不接受这种问法。”沈岚合上卷宗，没有继续解释。",
      effectsToDisplay(effects).concat([
        { text: "询问失败", tone: "bad" },
      ]),
    );
    closeModal();
    render();
    afterDangerCheck();
    return;
  }
  const effects = question.supportedEffects;
  applyEffects(effects, {});
  if (question.supportedClue) {
    addKnownClue(question.supportedClue);
  }
  say(
    "npc",
    question.supportedResponse,
    effectsToDisplay(effects),
  );
  closeModal();
  render();
}

function resolveDirectAsk() {
  const level = currentLevel();
  const negotiation = state.negotiation;
  if (negotiation.usedDirectAsk) return;
  negotiation.usedDirectAsk = true;
  if (rollFailure(askFailureChance(negotiation.stats))) {
    recordFailure();
    const failedEffects = { mood: -7, distance: -4, patience: -8 };
    say("player", "“你现在最在意的是什么？”");
    applyEffects(failedEffects, {});
    say(
      "npc",
      "“我现在没心情从头解释。”对方明显降低了配合意愿。",
      effectsToDisplay(failedEffects).concat([
        { text: "询问失败", tone: "bad" },
      ]),
    );
    closeModal();
    render();
    afterDangerCheck();
    return;
  }
  const effects =
    level.id === "supplier"
      ? { mood: -4, distance: -2, patience: -8 }
      : { mood: -3, distance: -2, patience: -8, alert: 1 };
  say(
    "player",
    level.id === "supplier"
      ? "“你现在最在意的条件是什么？”"
      : "“你希望我今天先确认什么？”",
  );
  applyEffects(effects, {});
  say(
    "npc",
    level.id === "supplier"
      ? "“先把今天的订单说清楚。别的问题等我核完单再谈。”"
      : "“先把材料链补齐。空泛的问题不能写进结案说明。”",
    effectsToDisplay(effects),
  );
  closeModal();
  render();
}

function resolveDemand(choiceId) {
  const level = currentLevel();
  const option = level.negotiation.demandOptions.find(
    (item) => item.id === choiceId,
  );
  const negotiation = state.negotiation;
  if (!option || (negotiation.demand && negotiation.demand.id === option.id)) {
    return;
  }

  if (negotiation.phase === 2) {
    const previousIndex = level.negotiation.demandOptions.findIndex(
      (item) => dialogueDemandId(item, negotiation.demand),
    );
    const nextIndex = level.negotiation.demandOptions.findIndex(
      (item) => item.id === option.id,
    );
    const jump = Math.abs(previousIndex - nextIndex);
    const loweringDemand = nextIndex > previousIndex;
    const moodChange = loweringDemand
      ? 5 + jump * 3
      : -(5 + jump * 3);
    const patienceCost = -(5 + jump * 3);
    const effects = { mood: moodChange, patience: patienceCost };
    applyEffects(effects, {});
    say("player", option.playerLine);
    say(
      "npc",
      loweringDemand
        ? "“你愿意把条件收回来，我们可以继续谈。”"
        : "“刚谈到这里又提高要求？我已经按前一套条件算过一轮了。”",
      effectsToDisplay(effects),
    );
    negotiation.demand = option;
    negotiation.targetTerms = { ...option.terms };
    updateGoalProgress();
    closeModal();
    render();
    return;
  }

  negotiation.demand = option;
  negotiation.targetTerms = { ...option.terms };
  negotiation.offer = { ...level.negotiation.counterTerms };
  updateGoalProgress();
  negotiation.phase = 2;
  say("player", option.playerLine);
  say("npc", option.response);
  say(
    "system",
    "双方诉求都已提出。施压、让步、交换、结束与中止已解锁，目标达成度开始生效。",
  );
  closeModal();
  render();
}

function dialogueDemandId(item, demand) {
  return Boolean(demand && item.id === demand.id);
}

function resolvePressure(clueId) {
  const level = currentLevel();
  const negotiation = state.negotiation;
  if (negotiation.usedPressure.includes(clueId)) return;
  if (!hasClue(clueId)) return;
  const clue = clueById(clueId);
  const rule =
    level.negotiation.pressureRules.find((item) => item.clueId === clueId) ||
    level.negotiation.genericPressure;
  negotiation.usedPressure.push(clueId);
  say("player", rule.playerLine);
  if (
    rollFailure(
      pressureFailureChance(level, negotiation.stats),
    )
  ) {
    recordFailure();
    const effects =
      level.id === "supplier"
        ? { mood: -11, distance: -12, patience: -16 }
        : { mood: -10, distance: -12, patience: -16, alert: 10 };
    applyEffects(effects, {});
    say(
      "npc",
      level.id === "supplier"
        ? "“你这是在逼我？”邵老板把合同往回一收，原来的让步全部作废。"
        : "“请注意你的方式。”沈岚退回卷宗，不再接受这条材料。",
      effectsToDisplay(effects).concat([
        { text: "施压失败", tone: "bad" },
      ]),
    );
    say("system", "施压失败，本条信息已消耗，对方没有修改条款。");
    closeModal();
    render();
    afterDangerCheck();
    return;
  }
  applyEffects(rule.effects, rule.modify);
  say(
    "npc",
    rule.response,
    effectsToDisplay(rule.effects, rule.modify),
  );
  if (rule === level.negotiation.genericPressure) {
    say("system", `“${clue.title}”与当前争议没有形成有效连接。`);
  } else {
    say("system", `筹码“${clue.title}”生效。`);
  }
  closeModal();
  render();
  afterDangerCheck();
}

function resolveConcession(choiceId) {
  const level = currentLevel();
  const option = level.negotiation.concessionOptions.find(
    (item) => item.id === choiceId,
  );
  const negotiation = state.negotiation;
  if (
    !option ||
    !hasClue(option.clueId) ||
    negotiation.usedConcessions.includes(option.id)
  ) {
    return;
  }
  negotiation.usedConcessions.push(option.id);
  negotiation.extraCost += option.extraCost || 0;
  say("player", option.playerLine);
  applyEffects(option.effects, option.modify);
  const displayEffects = effectsToDisplay(option.effects, option.modify);
  if (option.extraCost) {
    displayEffects.push({
      text: `结算额外支出 ${formatMoney(option.extraCost)}`,
      tone: "bad",
    });
  }
  say("npc", option.response, displayEffects);
  closeModal();
  render();
  afterDangerCheck();
}

function resolveExchange(choiceId) {
  const level = currentLevel();
  const option = level.negotiation.exchangeOptions.find(
    (item) => item.id === choiceId,
  );
  const negotiation = state.negotiation;
  if (
    !option ||
    negotiation.usedExchange ||
    (option.requires && !hasClue(option.requires))
  ) {
    return;
  }
  if (rollFailure(trustFailureChance(negotiation.stats))) {
    negotiation.usedExchange = true;
    recordFailure();
    const effects = { mood: -8, distance: -12, patience: -10 };
    say("player", option.playerLine);
    applyEffects(effects, {});
    say(
      "npc",
      "“条件换来换去，我看不出你的诚意。”这次交换被当场拒绝。",
      effectsToDisplay(effects).concat([
        { text: "交换失败", tone: "bad" },
      ]),
    );
    closeModal();
    render();
    afterDangerCheck();
    return;
  }
  negotiation.usedExchange = true;
  say("player", option.playerLine);
  applyEffects(option.effects, option.modify);
  say(
    "npc",
    option.response,
    effectsToDisplay(option.effects, option.modify),
  );
  say("system", "一揽子交换已完成。本次谈判不能再次使用交换条件。");
  closeModal();
  render();
  afterDangerCheck();
}

function afterDangerCheck() {
  const negotiation = state.negotiation;
  if (!negotiation) return;
  if (state.levelIndex === 1 && negotiation.stats.alert >= 100) {
    say(
      "system",
      "警觉度过高，沈岚将案件转交上级复核。谈判被迫中止。",
    );
    window.setTimeout(() => {
      if (state.screen === "negotiate" && state.negotiation) {
        finishNegotiation("alert");
      }
    }, 800);
  } else if (negotiation.stats.patience <= 0) {
    say("system", "耐心耗尽，对方不再接受新的谈判动作。");
    window.setTimeout(() => {
      if (state.screen === "negotiate" && state.negotiation) {
        finishNegotiation("patience");
      }
    }, 800);
  }
}

function gradeNegotiation(progress, stats, outcome, level, failures = 0) {
  if (outcome === "rejected") return "F";
  const mental = mentalComposite(level, stats);
  const score =
    progress * 0.45 +
    mental * 0.45 +
    Math.min(stats.distance, 80) * 0.1 -
    failures * 7;
  if (
    progress === 100 &&
    mental >= 68 &&
    failures === 0 &&
    stats.mood >= 55 &&
    stats.distance >= 55
  ) {
    return "A";
  }
  if (progress >= 80 && mental >= 50 && score >= 60) return "B";
  if (progress >= 55 && mental >= 30) return "C";
  if (progress >= 30) return "D";
  return "D";
}

function degradeTerms(level, terms) {
  const degraded = { ...terms };
  if (level.id === "supplier") {
    degraded.total = clamp(degraded.total + 300, 5000, 7500);
    degraded.duration = clamp(degraded.duration - 2, 3, 21);
    degraded.volume = clamp(degraded.volume - 20, 80, 240);
  } else {
    degraded.tax = clamp(degraded.tax + 4000, 100000, 128000);
    degraded.installments = clamp(degraded.installments - 1, 1, 3);
    degraded.scope = clamp(degraded.scope + 3, 3, 6);
    degraded.risk = "仍需补充复核材料";
  }
  return degraded;
}

function finishNegotiation(reason) {
  if (!state.negotiation || state.screen !== "negotiate") return;
  const level = currentLevel();
  const negotiation = state.negotiation;
  let outcome;

  if (reason === "abort" || reason === "alert") {
    outcome = "rejected";
  } else if (reason === "end") {
    if (negotiation.progress >= 55) outcome = "accepted";
    else if (negotiation.progress >= 30) outcome = "conditional";
    else outcome = "rejected";
  } else if (reason === "patience") {
    outcome = negotiation.progress >= 38 ? "conditional" : "rejected";
  } else {
    outcome = "rejected";
  }

  let finalTerms = negotiation.offer
    ? { ...negotiation.offer }
    : {
        ...(level.id === "supplier"
          ? { total: 7200, duration: 7, volume: 100 }
          : { tax: 128000, installments: 1, scope: 6, risk: "按原通知执行" }),
      };
  if (outcome === "conditional") {
    finalTerms = degradeTerms(level, finalTerms);
  }
  if (outcome === "rejected") {
    finalTerms =
      level.id === "supplier"
        ? { total: 7200, duration: 3, volume: 80, emergency: true }
        : { tax: 128000, installments: 1, scope: 6, risk: "按原通知执行" };
  }

  const grade = gradeNegotiation(
    negotiation.progress,
    negotiation.stats,
    outcome,
    level,
    negotiation.failures,
  );
  let spend = 0;
  let reputationDelta = 0;
  let financialLabel = "";
  let rows = [];

  if (level.id === "supplier") {
    if (outcome === "rejected") {
      spend = 11800;
      reputationDelta = -4;
      financialLabel = "紧急补货支出";
      rows = [
        ["实际补货金额", formatMoney(spend)],
        ["供货状态", "上午九点后补满"],
        ["原合同", "未签署"],
      ];
    } else {
      spend = finalTerms.total + negotiation.extraCost;
      reputationDelta = grade === "A" ? 5 : grade === "B" ? 3 : grade === "C" ? 0 : -2;
      financialLabel = "合同总价支出";
      rows = [
        ["合同总价", formatMoney(finalTerms.total)],
        ["持续供货周期", `${finalTerms.duration} 天`],
        ["每批供货量", `${finalTerms.volume} 箱 / 次`],
        ["其他支出", formatMoney(negotiation.extraCost)],
      ];
    }
  } else {
    if (outcome === "rejected") {
      spend = 134000;
      reputationDelta = -5;
      financialLabel = "原税额与周转成本";
      rows = [
        ["补缴及罚款", formatMoney(128000)],
        ["临时周转成本", formatMoney(6000)],
        ["抽查范围", "6 个月"],
        ["后续核查", "按原通知执行"],
      ];
    } else {
      spend = finalTerms.tax + negotiation.extraCost;
      reputationDelta =
        grade === "A" ? 10 : grade === "B" ? 7 : grade === "C" ? 3 : 0;
      financialLabel = "税务结算支出";
      rows = [
        ["补缴金额", formatMoney(finalTerms.tax)],
        ["缴款期数", `${finalTerms.installments} 期`],
        ["抽查范围", `${finalTerms.scope} 个月`],
        ["后续处理", finalTerms.risk],
        ["其他支出", formatMoney(negotiation.extraCost)],
      ];
    }
  }

  state.funds -= spend;
  state.reputation = clamp(state.reputation + reputationDelta, 0, 100);
  const noteKey = grade === "F" ? "F" : grade;
  const settlement = level.settlement;
  let title = settlement.acceptedTitle;
  let summary = settlement.acceptedSummary;
  if (outcome === "conditional") {
    title = settlement.conditionalTitle;
    summary = settlement.conditionalSummary;
  }
  if (outcome === "rejected") {
    title = settlement.failedTitle;
    summary = settlement.failedSummary;
  }

  state.result = {
    levelId: level.id,
    levelIndex: state.levelIndex,
    title,
    summary,
    outcome,
    grade,
    progress: Math.round(negotiation.progress),
    mentalScore: mentalComposite(level, negotiation.stats),
    failures: negotiation.failures,
    terms: finalTerms,
    rows,
    spend,
    financialLabel,
    reputationDelta,
    note: settlement.notes[noteKey],
    reason,
  };
  state.results[state.levelIndex] = state.result;
  state.screen = "settle";
  state.negotiation = null;
  closeModal();
  render();
  app.focus({ preventScroll: true });
}

function renderSettlement() {
  const result = state.result;
  if (!result) {
    state.screen = "brief";
    render();
    return;
  }
  const isFinal = result.levelIndex === levels.length - 1;
  const outcomeLabel = {
    accepted: "达成合意",
    conditional: "有条件达成",
    rejected: "谈判破裂",
  }[result.outcome];
  const nextLabel = isFinal ? "查看本局总结" : "进入第二关 · 税务官";

  app.innerHTML = `
    ${phaseNav("settle")}
    <div class="settlement-wrap">
      <section class="panel settlement-card">
        <div class="settlement-top">
          <div class="grade-seal ${result.grade === "F" ? "fail" : ""}">${result.grade}</div>
          <div class="settlement-summary">
            <div class="eyebrow">谈判结算 / ${outcomeLabel} / 目标达成度 ${result.progress}%</div>
            <h2>${escapeHtml(result.title)}</h2>
            <p>${escapeHtml(result.summary)}</p>
            <div class="grade-factors">
              综合状态 ${mentalLabel(result.mentalScore)} · ${result.mentalScore}
              &nbsp;/&nbsp; 操作失败 ${result.failures} 次
            </div>
          </div>
        </div>

        <div class="settlement-grid">
          <div>
            <h3>最终条款</h3>
            <ul class="result-list">
              ${result.rows
                .map(
                  ([label, value]) =>
                    `<li><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></li>`,
                )
                .join("")}
            </ul>
          </div>
          <div>
            <h3>经营影响</h3>
            <ul class="result-list">
              <li><span>${escapeHtml(result.financialLabel)}</span><b class="loss">-${formatMoney(result.spend)}</b></li>
              <li><span>剩余资金</span><b>${formatMoney(state.funds)}</b></li>
              <li><span>声誉变化</span><b class="${result.reputationDelta >= 0 ? "gain" : "loss"}">${result.reputationDelta > 0 ? "+" : ""}${result.reputationDelta}</b></li>
              <li><span>当前声誉</span><b>${state.reputation}</b></li>
            </ul>
          </div>
        </div>

        <p class="change-note">${escapeHtml(result.note)}</p>

        <div class="btn-row">
          <button class="btn btn-primary" data-action="${isFinal ? "campaign-end" : "next-level"}">${nextLabel}</button>
          <button class="btn btn-ghost" data-action="restart">重新开始</button>
        </div>
      </section>
    </div>
  `;
}

function showCampaignEnd() {
  state.screen = "campaignEnd";
  render();
  app.focus({ preventScroll: true });
}

function gradeValue(grade) {
  return { A: 4, B: 3, C: 2, D: 1, F: 0 }[grade] || 0;
}

function renderCampaignEnd() {
  const gradePoints = state.results.reduce(
    (sum, result) => sum + gradeValue(result.grade),
    0,
  );
  const average = state.results.length
    ? gradePoints / state.results.length
    : 0;
  const finalGrade =
    average >= 3.5 ? "A" : average >= 2.5 ? "B" : average >= 1.5 ? "C" : "D";
  const goodSupplier = state.results[0] && ["A", "B"].includes(state.results[0].grade);
  const goodTax = state.results[1] && ["A", "B"].includes(state.results[1].grade);
  const endingTitle = goodSupplier && goodTax ? "第一天，顺利过关。" : "灯还亮着，明天继续。";
  const endingText =
    goodSupplier && goodTax
      ? "冷藏车准时驶入，税务卷宗也留下了可复核的落点。xxx服务区撑过了第一个假期高峰，邵老板和沈岚都开始把你当作一个会算账、也讲清楚条件的经营者。"
      : "服务区撑过了第一天，但留下了一些需要修补的账、关系和现金流。谈判不是一次性的胜负，它的结果会继续影响下一批货、下一次检查和下一位愿意坐下的人来说话的人。";

  app.innerHTML = `
    <section class="panel campaign-end">
      <div class="eyebrow">Day One Complete / 经营复盘</div>
      <h1>${endingTitle}</h1>
      <p class="lead">${endingText}</p>

      <div class="final-stats">
        <div class="final-stat"><span>综合评级</span><strong>${finalGrade}</strong></div>
        <div class="final-stat"><span>剩余资金</span><strong>${formatMoney(state.funds)}</strong></div>
        <div class="final-stat"><span>商业声誉</span><strong>${state.reputation}</strong></div>
      </div>

      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-primary" data-action="restart">再经营一天</button>
        <button class="btn btn-ghost" data-action="back-title">返回标题</button>
      </div>
    </section>
  `;
}

function returnToTitle() {
  if (state.screen !== "title") {
    const confirmed = window.confirm("返回标题会结束当前试玩进度，确定吗？");
    if (!confirmed) return;
  }
  state.screen = "title";
  render();
  app.focus({ preventScroll: true });
}

app.addEventListener("click", (event) => {
  const source = event.target.closest("[data-source]");
  if (source) {
    claimSource(source.dataset.source);
    return;
  }

  const clue = event.target.closest("[data-clue]");
  if (clue) {
    toggleClueSelection(clue.dataset.clue);
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === "start") beginCampaign();
  if (action === "show-rules") showRulesModal();
  if (action === "show-known-clues") showKnownCluesModal();
  if (action === "begin-investigation") beginInvestigation();
  if (action === "combine") combineClues();
  if (action === "start-negotiation") startNegotiation();
  if (action === "open-act") {
    const act = button.dataset.act;
    if (act === "chat") showChatModal();
    if (act === "ask") showAskModal();
    if (act === "propose") showDemandModal(state.negotiation.phase === 2);
    if (act === "pressure") showPressureModal();
    if (act === "trade") showTradeModal();
    if (act === "end") showEndModal();
    if (act === "abort") showAbortModal();
  }
  if (action === "next-level") openLevelBrief(state.levelIndex + 1);
  if (action === "campaign-end") showCampaignEnd();
  if (action === "restart") beginCampaign();
  if (action === "back-title") returnToTitle();
});

modalRoot.addEventListener("click", (event) => {
  const closeTarget = event.target.closest("[data-close-modal]");
  if (
    closeTarget &&
    (closeTarget === event.target ||
      closeTarget.classList.contains("modal-close") ||
      closeTarget.tagName === "BUTTON")
  ) {
    closeModal();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  const choice = button.dataset.choice;

  if (action === "resolve-chat") resolveChat(choice);
  if (action === "resolve-question-by-clue") resolveQuestionByClue(choice);
  if (action === "resolve-direct-ask") resolveDirectAsk();
  if (action === "resolve-demand") resolveDemand(choice);
  if (action === "resolve-pressure") resolvePressure(choice);
  if (action === "resolve-trade") {
    if (button.dataset.kind === "concession") resolveConcession(choice);
    if (button.dataset.kind === "exchange") resolveExchange(choice);
  }
  if (action === "finish-negotiation") finishNegotiation(button.dataset.reason);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalRoot.innerHTML) {
    closeModal();
  }
});

brandHome.addEventListener("click", (event) => {
  event.preventDefault();
  returnToTitle();
});

render();
