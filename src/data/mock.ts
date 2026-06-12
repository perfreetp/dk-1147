import { Decision, Template } from '../types/decision';

export const mockDecisions: Decision[] = [
  {
    id: '1',
    title: '周末去哪儿玩？',
    description: '天气这么好，去哪里放松一下呢',
    options: [
      {
        id: 'opt1',
        title: '去海边',
        pros: ['风景美', '可以放松'],
        cons: ['有点远', '可能会晒']
      },
      {
        id: 'opt2',
        title: '逛商场',
        pros: ['有空调', '可以购物'],
        cons: ['人多', '费钱']
      }
    ],
    voteResults: {
      opt1: 8,
      opt2: 7
    },
    voteTrends: [
      { date: '2024-12-15', votes: [{ optionId: 'opt1', count: 5 }, { optionId: 'opt2', count: 4 }] },
      { date: '2024-12-16', votes: [{ optionId: 'opt1', count: 3 }, { optionId: 'opt2', count: 2 }] },
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 0 }, { optionId: 'opt2', count: 1 }] }
    ],
    deadline: '2024-12-20',
    status: 'active',
    isPublic: true,
    voteCount: 15,
    createdAt: '2024-12-15'
  },
  {
    id: '2',
    title: '午餐吃什么？',
    description: '选择困难症又犯了',
    options: [
      {
        id: 'opt1',
        title: '吃火锅',
        pros: ['好吃', '热闹'],
        cons: ['上火', '时间长']
      },
      {
        id: 'opt2',
        title: '吃快餐',
        pros: ['快', '方便'],
        cons: ['不健康']
      },
      {
        id: 'opt3',
        title: '自己做饭',
        pros: ['健康', '省钱'],
        cons: ['麻烦', '累']
      }
    ],
    voteResults: {
      opt1: 5,
      opt2: 2,
      opt3: 1
    },
    voteTrends: [
      { date: '2024-12-16', votes: [{ optionId: 'opt1', count: 3 }, { optionId: 'opt2', count: 1 }, { optionId: 'opt3', count: 1 }] },
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 2 }, { optionId: 'opt2', count: 1 }, { optionId: 'opt3', count: 0 }] }
    ],
    deadline: '2024-12-18',
    status: 'active',
    isPublic: false,
    voteCount: 8,
    createdAt: '2024-12-16'
  },
  {
    id: '3',
    title: '买哪件衣服？',
    description: '纠结买红色还是蓝色',
    options: [
      {
        id: 'opt1',
        title: '红色连衣裙',
        pros: ['显白', '好看'],
        cons: ['难搭配']
      },
      {
        id: 'opt2',
        title: '蓝色衬衫',
        pros: ['百搭', '商务'],
        cons: ['太普通']
      }
    ],
    voteResults: {
      opt1: 12,
      opt2: 11
    },
    voteTrends: [
      { date: '2024-12-10', votes: [{ optionId: 'opt1', count: 6 }, { optionId: 'opt2', count: 5 }] },
      { date: '2024-12-11', votes: [{ optionId: 'opt1', count: 4 }, { optionId: 'opt2', count: 3 }] },
      { date: '2024-12-12', votes: [{ optionId: 'opt1', count: 2 }, { optionId: 'opt2', count: 3 }] }
    ],
    deadline: '2024-12-25',
    status: 'ended',
    isPublic: true,
    voteCount: 23,
    createdAt: '2024-12-10',
    finalChoice: 'opt1',
    satisfaction: 5
  }
];

export const mockTemplates: Template[] = [
  {
    id: '1',
    title: '周末活动选择',
    description: '适合选择周末去哪里玩',
    options: ['去公园', '逛商场', '看电影', '宅在家'],
    usageCount: 12,
    category: '生活'
  },
  {
    id: '2',
    title: '午餐选择',
    description: '适合选择吃什么',
    options: ['中餐', '西餐', '日料', '快餐'],
    usageCount: 8,
    category: '生活'
  },
  {
    id: '3',
    title: '购物二选一',
    description: '适合做购物决策',
    options: ['选项A', '选项B'],
    usageCount: 15,
    category: '购物'
  },
  {
    id: '4',
    title: '出行方式',
    description: '选择怎么出行',
    options: ['自驾', '公交', '地铁', '打车'],
    usageCount: 6,
    category: '出行'
  },
  {
    id: '5',
    title: '礼物选择',
    description: '选择送什么礼物',
    options: ['鲜花', '巧克力', '电子产品', '手工'],
    usageCount: 9,
    category: '购物'
  },
  {
    id: '6',
    title: '工作计划',
    description: '安排一周的工作计划',
    options: ['优先级高', '紧急优先', '按顺序', '灵活安排'],
    usageCount: 5,
    category: '工作'
  },
  {
    id: '7',
    title: '约会地点',
    description: '选择约会去哪里',
    options: ['餐厅', '电影院', '公园', '咖啡厅'],
    usageCount: 7,
    category: '生活'
  },
  {
    id: '8',
    title: '租房选择',
    description: '选择租在哪里',
    options: ['离公司近', '价格便宜', '交通便利', '环境好'],
    usageCount: 4,
    category: '其他'
  }
];

export const mockSquareDecisions: Decision[] = [
  {
    id: 'sq1',
    title: '送给女朋友什么生日礼物好？',
    description: '预算1000以内，求推荐',
    options: [
      { id: 'opt1', title: '香水', pros: ['精致', '实用'], cons: ['怕不喜欢味道'] },
      { id: 'opt2', title: '包包', pros: ['大牌', '保值'], cons: ['预算可能不够'] },
      { id: 'opt3', title: '首饰', pros: ['好看', '有意义'], cons: ['要挑款式'] }
    ],
    voteResults: {
      opt1: 15,
      opt2: 18,
      opt3: 9
    },
    voteTrends: [
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 8 }, { optionId: 'opt2', count: 10 }, { optionId: 'opt3', count: 5 }] },
      { date: '2024-12-18', votes: [{ optionId: 'opt1', count: 7 }, { optionId: 'opt2', count: 8 }, { optionId: 'opt3', count: 4 }] }
    ],
    deadline: '2024-12-22',
    status: 'active',
    isPublic: true,
    voteCount: 42,
    createdAt: '2024-12-17'
  },
  {
    id: 'sq2',
    title: '年底旅行去日本还是韩国？',
    description: '假期有限，只能选一个地方',
    options: [
      { id: 'opt1', title: '日本', pros: ['美食多', '购物天堂'], cons: ['签证麻烦'] },
      { id: 'opt2', title: '韩国', pros: ['距离近', '签证简单'], cons: ['购物不比日本便宜'] }
    ],
    voteResults: {
      opt1: 35,
      opt2: 32
    },
    voteTrends: [
      { date: '2024-12-16', votes: [{ optionId: 'opt1', count: 18 }, { optionId: 'opt2', count: 15 }] },
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 10 }, { optionId: 'opt2', count: 9 }] },
      { date: '2024-12-18', votes: [{ optionId: 'opt1', count: 7 }, { optionId: 'opt2', count: 8 }] }
    ],
    deadline: '2024-12-28',
    status: 'active',
    isPublic: true,
    voteCount: 67,
    createdAt: '2024-12-16'
  },
  {
    id: 'sq3',
    title: '换工作还是继续坚持？',
    description: '现在的公司钱少事多，但稳定',
    options: [
      { id: 'opt1', title: '跳槽', pros: ['薪资高', '发展好'], cons: ['风险大'] },
      { id: 'opt2', title: '坚持', pros: ['稳定', '熟悉'], cons: ['看不到希望'] }
    ],
    voteResults: {
      opt1: 45,
      opt2: 44
    },
    voteTrends: [
      { date: '2024-12-15', votes: [{ optionId: 'opt1', count: 20 }, { optionId: 'opt2', count: 18 }] },
      { date: '2024-12-16', votes: [{ optionId: 'opt1', count: 15 }, { optionId: 'opt2', count: 14 }] },
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 10 }, { optionId: 'opt2', count: 12 }] }
    ],
    deadline: '2024-12-30',
    status: 'active',
    isPublic: true,
    voteCount: 89,
    createdAt: '2024-12-15'
  },
  {
    id: 'sq4',
    title: '买房还是租房？',
    description: '在大城市首付不够，但不想一直租房',
    options: [
      { id: 'opt1', title: '买房', pros: ['资产', '归属感'], cons: ['压力大'] },
      { id: 'opt2', title: '租房', pros: ['灵活', '轻松'], cons: ['不稳定'] }
    ],
    voteResults: {
      opt1: 68,
      opt2: 66
    },
    voteTrends: [
      { date: '2024-12-14', votes: [{ optionId: 'opt1', count: 25 }, { optionId: 'opt2', count: 22 }] },
      { date: '2024-12-15', votes: [{ optionId: 'opt1', count: 20 }, { optionId: 'opt2', count: 18 }] },
      { date: '2024-12-16', votes: [{ optionId: 'opt1', count: 15 }, { optionId: 'opt2', count: 16 }] },
      { date: '2024-12-17', votes: [{ optionId: 'opt1', count: 8 }, { optionId: 'opt2', count: 10 }] }
    ],
    deadline: '2025-01-05',
    status: 'active',
    isPublic: true,
    voteCount: 134,
    createdAt: '2024-12-14'
  }
];
