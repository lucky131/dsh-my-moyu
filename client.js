// 下班倒计时 · 客户端半边。
// 三个席位：
//   1. conversation.session.header.utilities —— 对话头部右对齐的 utilities 行（默认）；
//   2. shell.overlay —— 官方 Frame-wide floating layer，可拖动的浮动胶囊；
//   3. settings.section —— 设置页（宿主不提供自动表单）。
// 胶囊默认显示「倒计时 + 当前天气」，悬停展开详情面板（未来 24 小时横滑 + 未来 3 天）。
window.__ModuleLoader__.load({
  id: 'dsh-my-moyu',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // 配置命名空间 = cordis.patch.yml 里这一行的 id（宿主按 entry id 投影配置）
    const NS = 'work-countdown';

    // 内置字典：locale 服务未就绪时也能出中文，界面永不残留键名
    const DICT = {
      zh: {
        'label.pill': '下班倒计时',
        'label.start': '上班',
        'label.end': '下班',
        'state.before': '距上班',
        'state.down': '距下班',
        'state.done': '已下班',
        'state.rest': '休息日',
        'wx.clear': '晴',
        'wx.partly': '多云',
        'wx.cloudy': '阴',
        'wx.fog': '雾',
        'wx.drizzle': '毛毛雨',
        'wx.rain': '雨',
        'wx.snow': '雪',
        'wx.shower': '阵雨',
        'wx.snowshower': '阵雪',
        'wx.storm': '雷雨',
        'wx.unknown': '—',
        'panel.today': '今天',
        'panel.tomorrow': '明天',
        'panel.after': '后天',
        'panel.feels': '体感',
        'panel.refresh': '刷新天气',
        'panel.error': '天气更新失败：',
        'panel.empty': '暂无天气数据，请在设置里填写城市',
        'panel.stale': '天气更新失败，显示的是上次结果',
        'panel.work.start': '上班时间',
        'panel.work.end': '下班时间',
        'usage.5h': '5小时',
        'usage.week': '本周',
        'usage.month': '本月',
        'usage.hint': '未配置 OpenCode Go Key',
        'usage.loading': '正在获取用量…',
        'usage.title': 'OpenCode Go 用量情况',
        'usage.refresh': '刷新用量',
        'usage.error': '用量更新失败：',
        'fish.title': '敲一下',
        'fish.merit': '功德+1',
        'tube.title': '摇一卦',
        'tarot.title': '抽三张塔罗',
        'tarot.spread': '过去 · 现在 · 未来',
        'tarot.spread.en': 'Past · Present · Future',
        'tarot.past': '过去',
        'tarot.present': '现在',
        'tarot.future': '未来',
        'tarot.upright': '正位',
        'tarot.reversed': '逆位',
        'tarot.sum.0': '三张全正位：牌面顺，事情本身没有卡点，你缺的只是把已经决定的事做完。',
        'tarot.sum.1': '一张逆位：整体在推进，但有一处卡着——那张逆位的牌说的就是卡点在哪。',
        'tarot.sum.2': '两张逆位：阻力明显，多半先要处理自己的犹豫和回避，再谈事情本身。',
        'tarot.sum.3': '三张全逆位：现在不适合硬推。先把三张牌里反复出现的那件事想清楚，再动手。',
        'gua.num': '第',
        'gua.primary': '本卦',
        'gua.changed': '变卦',
        'gua.moves': '动爻',
        'gua.pos.0': '初爻',
        'gua.pos.1': '二爻',
        'gua.pos.2': '三爻',
        'gua.pos.3': '四爻',
        'gua.pos.4': '五爻',
        'gua.pos.5': '上爻',
        'gua.still': '六爻皆静，没有动爻，直接看本卦',
        'gua.close': '关闭',
        'gua.foot': '仅供文化娱乐，不构成任何建议',
        'settings.volume': '音量',
        'settings.volume.desc': '敲木鱼的音量（0 为静音，只保留动画）',
        'settings.usage': '显示用量',
        'settings.usage.desc': '胶囊与详情里显示 OpenCode Go 的 5 小时 / 本周 / 本月已用百分比',
        'keymap.open': '键盘农场',
        'note.title': '便笺',
        'note.ph': '写点什么…',
        'note.done': '办完了',
        'note.close': '关闭',
        'rgb.title': '颜色转换',
        'rgb.ph': '输入或粘贴吸色值',
        'rgb.bad': '格式像 65,118,230 这样（QQ 吸色复制的那串）',
        'rgb.copy': '复制',
        'rgb.copied': '已复制',
        'ts.title': '时间戳转换',
        'ts.ph': '输入或粘贴时间戳',
        'ts.bad': '只认纯数字的时间戳，秒和毫秒都行',
        'ts.tag': '时间',
        'ts.unit.sec': '按秒解析',
        'ts.unit.ms': '按毫秒解析',
        'keymap.ripe': '可收获',
        'keymap.harvest': '点击收获',
        'settings.keymap': '键盘统计',
        'settings.keyAnim': '植物摇摆',
        'settings.keySize': '键盘尺寸',
        'settings.keySize.desc': '键盘农场整体大小；屏幕不够会自动收窄',
        'settings.keySize.small': '小',
        'settings.keySize.medium': '中',
        'settings.keySize.large': '大',
        'settings.keyAnim.desc': '键盘农场里的植物轻轻摆动；关掉可以省一点显卡和电',
        'settings.keymap.desc': '只统计 DSH 窗口内按键的累计次数，数据存在本机配置里，不上传',
        'settings.keymap.reset': '清空数据',
        'settings.keymap.total': '总计',
        'settings.keymap.confirm': '确定清空所有按键次数？此操作不可恢复。',
        'settings.title': 'my Moyu',
        'settings.intro': '显示距离下班的倒计时。改完保存立即生效。',
        'settings.start': '上班时间',
        'settings.start.desc': '24 小时制，例如 09:00',
        'settings.end': '下班时间',
        'settings.end.desc': '24 小时制，例如 18:00',
        'settings.days': '工作日',
        'settings.days.desc': '0=周日 … 6=周六；可写 1,2,3,4,5 或 1-5',
        'settings.seconds': '显示秒',
        'settings.seconds.desc': '关闭后只显示到分钟',
        'settings.float': '悬浮胶囊',
        'settings.float.desc': '离开对话头部，变成可拖动的浮窗；位置拖到哪记到哪',
        'settings.city': '天气城市',
        'settings.city.desc': '中文城市名，如 杭州；留空则不显示天气',
        'settings.timeout': '请求超时（秒）',
        'settings.timeout.desc': '直连和代理两条通道都超过这个时间才算失败，默认 30 秒',
        'settings.weather': '显示天气',
        'settings.weather.desc': '胶囊上显示当前天气与温度，悬停展开 24 小时与 3 天',
        'settings.save': '保存',
        'settings.saving': '保存中…',
        'settings.saved': '已保存',
        'settings.failed': '保存失败',
        'settings.noService': '配置服务不可用，当前无法保存',
        'settings.invalid': '下班时间必须晚于上班时间',
      },
      en: {
        'label.pill': 'Work countdown',
        'label.start': 'Start',
        'label.end': 'End',
        'state.before': 'Starts in',
        'state.down': 'Ends in',
        'state.done': 'Off work',
        'state.rest': 'Day off',
        'wx.clear': 'Clear',
        'wx.partly': 'Partly cloudy',
        'wx.cloudy': 'Overcast',
        'wx.fog': 'Fog',
        'wx.drizzle': 'Drizzle',
        'wx.rain': 'Rain',
        'wx.snow': 'Snow',
        'wx.shower': 'Showers',
        'wx.snowshower': 'Snow showers',
        'wx.storm': 'Thunderstorm',
        'wx.unknown': '—',
        'panel.today': 'Today',
        'panel.tomorrow': 'Tomorrow',
        'panel.after': 'Day after',
        'panel.feels': 'Feels',
        'panel.refresh': 'Refresh weather',
        'panel.error': 'Weather update failed: ',
        'panel.empty': 'No weather data yet. Set a city in settings.',
        'panel.stale': 'Weather update failed; showing the last result',
        'panel.work.start': 'Work start',
        'panel.work.end': 'Work end',
        'usage.5h': '5h',
        'usage.week': 'Week',
        'usage.month': 'Month',
        'usage.hint': 'No OpenCode Go key configured',
        'usage.loading': 'Fetching usage…',
        'usage.title': 'OpenCode Go usage',
        'usage.refresh': 'Refresh usage',
        'usage.error': 'Usage update failed: ',
        'fish.title': 'Knock',
        'fish.merit': 'Merit +1',
        'tube.title': 'Draw a hexagram',
        'tarot.title': 'Draw three tarot cards',
        'tarot.spread': 'Past · Present · Future',
        'tarot.spread.en': 'Past · Present · Future',
        'tarot.past': 'Past',
        'tarot.present': 'Present',
        'tarot.future': 'Future',
        'tarot.upright': 'Upright',
        'tarot.reversed': 'Reversed',
        'tarot.sum.0': 'All upright: the line is clear, nothing is stuck — you just need to finish what you already decided.',
        'tarot.sum.1': 'One reversed: things are moving, with one snag; that card is where it is.',
        'tarot.sum.2': 'Two reversed: resistance is real — deal with your own hesitation before the matter itself.',
        'tarot.sum.3': 'All reversed: do not force it now. Get clear on the thing that keeps repeating, then move.',
        'gua.num': 'No.',
        'gua.primary': 'Primary',
        'gua.changed': 'Changed',
        'gua.moves': 'Moving lines',
        'gua.pos.0': 'line 1',
        'gua.pos.1': 'line 2',
        'gua.pos.2': 'line 3',
        'gua.pos.3': 'line 4',
        'gua.pos.4': 'line 5',
        'gua.pos.5': 'line 6',
        'gua.still': 'No moving line — read the primary hexagram as it stands',
        'gua.close': 'Close',
        'gua.foot': 'For cultural entertainment only; not advice of any kind',
        'settings.volume': 'Volume',
        'settings.volume.desc': 'Knock volume (0 = silent, animation only)',
        'settings.usage': 'Show usage',
        'settings.usage.desc': 'Show OpenCode Go usage (5h / week / month, used %) in the pill and the panel',
        'keymap.open': 'Keyboard farm',
        'note.title': 'Sticky note',
        'note.ph': 'Jot something down…',
        'note.done': 'Done',
        'note.close': 'Close',
        'rgb.title': 'Color converter',
        'rgb.ph': 'Paste a picked color',
        'rgb.bad': 'Format like 65,118,230 (what the eyedropper copies)',
        'rgb.copy': 'Copy',
        'rgb.copied': 'Copied',
        'ts.title': 'Timestamp',
        'ts.ph': 'Paste a timestamp',
        'ts.bad': 'Digits only — seconds or milliseconds',
        'ts.tag': 'Time',
        'ts.unit.sec': 'Read as seconds',
        'ts.unit.ms': 'Read as milliseconds',
        'keymap.ripe': 'Ripe',
        'keymap.harvest': 'Click to harvest',
        'settings.keymap': 'Keyboard stats',
        'settings.keyAnim': 'Plant sway',
        'settings.keySize': 'Keyboard size',
        'settings.keySize.desc': 'Overall size of the keyboard farm; it shrinks automatically if the screen is too narrow',
        'settings.keySize.small': 'Small',
        'settings.keySize.medium': 'Medium',
        'settings.keySize.large': 'Large',
        'settings.keyAnim.desc': 'Plants in the keyboard farm sway gently; turning it off saves a little GPU and battery',
        'settings.keymap.desc': 'Counts key presses inside this DSH window only; stored locally as plugin config',
        'settings.keymap.reset': 'Reset all',
        'settings.keymap.total': 'Total',
        'settings.keymap.confirm': 'Clear all key counts? This cannot be undone.',
        'settings.title': 'my Moyu',
        'settings.intro': 'Shows the remaining time until the end of the workday. Changes apply as soon as you save.',
        'settings.start': 'Start time',
        'settings.start.desc': '24-hour clock, for example 09:00',
        'settings.end': 'End time',
        'settings.end.desc': '24-hour clock, for example 18:00',
        'settings.days': 'Workdays',
        'settings.days.desc': '0 = Sunday … 6 = Saturday; accepts 1,2,3,4,5 or 1-5',
        'settings.seconds': 'Show seconds',
        'settings.seconds.desc': 'When off, the countdown shows hours and minutes only',
        'settings.float': 'Floating capsule',
        'settings.float.desc': 'Detach from the conversation header into a draggable pill',
        'settings.city': 'Weather city',
        'settings.city.desc': 'Chinese city name, for example 杭州; leave empty to hide weather',
        'settings.timeout': 'Request timeout (s)',
        'settings.timeout.desc': 'Fail only when both the direct and proxied request exceed this; 30s by default',
        'settings.weather': 'Show weather',
        'settings.weather.desc': 'Current condition and temperature in the pill; hover to expand 24 hours and 3 days',
        'settings.save': 'Save',
        'settings.saving': 'Saving…',
        'settings.saved': 'Saved',
        'settings.failed': 'Save failed',
        'settings.noService': 'The settings service is unavailable, so nothing can be saved',
        'settings.invalid': 'The end time must be later than the start time',
      },
    };

    // 六十四卦：卦序 / 卦名 / 六爻（自下而上，1=阳）/ 上下卦象 / 卦辞 / 白话总述
    // 卦辞为《周易》原文（公有领域）；白话为本次自撰。原始数据集按综卦位反转校正后逐卦核验。
    var GUA = [
      [1, "乾", "111111", "天天", "元亨，利贞。", "六爻全阳，天上只有一条龙在跑，从头到尾没歇过。这卦讲的是劲头：想法多、动作快，开新局、抢主位、扛硬活都是你的场子。但龙的毛病也在劲上——冲得太急容易越级顶撞，亮得太足容易招人眼红。真正难的不是往前跑多久，而是知道哪一步该收。心里有底气，嘴上留三分；夜里翻来覆去想的那些事，白天别拿去跟人争。撑得住的人，最后才笑。"],
      [2, "坤", "000000", "地地", "元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。", "六爻全阴，像大地一样只承受、不争夺。这卦不催你出头，而是让你把根扎在别人看不见的地方：上面的意思你能落地，下面的人你能带住，节奏别自己去抢。感情里多照顾、少主张，钱上踏实攒、别赌，跟人相处跟对人比争第一有用。坤的难处在于容易委屈自己，忍着忍着就成了没有声音的人。厚不是没有边界，是知道自己能让，也知道什么时候不让。"],
      [3, "屯", "100010", "水雷", "元亨，利贞，勿用有攸往，利建侯。", "雷在水下，万物刚冒头，什么都别扭。新工作、新关系、新项目的第一段路都是这个样子：计划赶不上变化，问谁都说不上话，钱也周转不开。这卦不是让你放弃，而是让你别急着开花。先把眼前最小的一件麻烦解决掉，再去找一个真能搭手的人。起步期最怕两件事，一是硬扛，二是乱许诺。扛过这一段，后面反而顺，因为根已经扎下去了。"],
      [4, "蒙", "010001", "山水", "亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。", "山下有雾，看不清路，这卦说的就是不懂。不懂不丢人，装懂才要命。该请教就请教，找一个真在行的人带一带，比你自己瞎摸半年强。但有个分寸：同一个问题问到第三遍，人家就懒得理你了，问之前先自己想过。感情上还没看清对方，别急着投入；钱上不懂的东西一律别碰，该花的咨询费别省。雾散不散不全看天，也看你愿不愿意往前走一步。"],
      [5, "需", "111010", "水天", "有孚，光亨，贞吉。利涉大川。", "云在天上，雨还没落下来。这卦的功课只有一个字，等。等批复、等回音、等对方先表态，急着催反而坏事。能力你有，条件也差不多，缺的就是那个时间点。等的时候别闲着：把材料备齐，把手感练热，关系别断。感情上别急着表白或者摊牌，火候没到，说了就是逼人。钱上等得起的才是你的，提前透支的都是别人的。"],
      [6, "讼", "010111", "天水", "有孚，窒。惕中吉。终凶。利见大人，不利涉大川。", "天往上走，水往下流，两边越走越远，这就是争。争端起来了，第一件事不是争赢，是留证据、找中间人、把话摊在明面上。撕破脸最简单，也最贵，就算赢了官司，人情、时间、心气全搭进去。感情里吵架别翻旧账，翻一次少一分。钱上有纠纷早清算，拖着的利息比本金还狠。这一卦真正教的是：有时候少说一句，比说对一百句都值。"],
      [7, "师", "010000", "地水", "贞，丈人，吉无咎。", "地里有水，是藏着的兵。带队伍、做项目、扛一件事，靠的不是你最能打，而是规矩清、赏罚明、有人服。谁负责什么先说清楚，出了问题就按事先讲好的办，别临时讲情面。感情也一样，关系要有分工，一个人全包早晚会累垮。钱上大额支出要提前计划，别拍脑袋。最怕队伍里搞小圈子，人心一散，仗就没法打了。"],
      [8, "比", "000010", "水地", "吉。原筮元永贞，无咎。不宁方来，后夫凶。", "水在地上，一滴一滴汇成一片。这卦讲的是靠近：找人合伙、找靠山、找同伴，都要趁早，来得晚的，位置已经被人坐了。选人要选正的，别因为对方热情就贴上去，热情最容易变。合伙的账要清楚，越亲近越要写明白。感情上该主动就主动，别等别人先动了手再后悔。这卦最实在的一句是：你对谁好，要早一点让人知道。"],
      [9, "小畜", "111011", "风天", "亨。密云不雨，自我西郊。", "风在天上吹，云聚起来了却下不成雨。方向没错，就是火候和资源都差一口气。这时候能做小事，不能接大活：先把流程跑顺、把手感练熟、把人脉铺开，别硬上大项目。感情上小摩擦不断，别每件都上纲上线，忍一忍就过去了，忍不住就成了大吵。钱上正是攒的时候，别看着别人赚就跟着下重注。"],
      [10, "履", "110111", "天泽", "履虎尾，不咥人，亨。", "踩在老虎尾巴上，老虎却没回头咬你。这卦说的是一种很窄的处境：位置不对、靠得太近、随时可能出事，但只要守着规矩、把话说得客气、把事做得周全，就能平安过去。这种时候最忌讳创新和逞能，越想显本事越容易翻车。感情上措辞要小心，一句话说重了就是一道疤。钱上别碰擦边的事。礼数到位，麻烦自然就少。"],
      [11, "泰", "111000", "地天", "小往大来，吉亨。", "地在上面，天在下面，阴阳换了个位置，反而通了。上下通气、里外顺畅，这是难得的好时候：该争取的争取，该推进的推进，别因为怕出错而错过窗口。感情顺的时候正适合谈未来，钱上可以适度扩张，人际正是攒情分的时候。但泰后面跟着否，顺到极处就要转，所以顺的时候留一手，别把话说满，也别把力气用尽。"],
      [12, "否", "000111", "天地", "否之匪人，不利君子贞，大往小来。", "天在上面自顾自往上，地在下面自顾自往下，中间就断了。想推的事推不动，想见的人见不着，说什么都被误读。这时候硬推，只会把自己耗干。该做的是守：守住现金流，守住身体，守住在意的那点关系，把内功练起来。感情冷下来了别追问，越追越远，各自安静几天反而好。社交也收一收，别硬凑热闹。"],
      [13, "同人", "101111", "天火", "同人于野，亨。利涉大川，利君子贞。", "火在天上，照着所有人，不分远近。这卦讲的是把事摆在公处：合作、结盟、做事，要公开、要讲公心，别在底下去拉扯算计。你越透明，人越敢跟你合伙。感情上朋友圈里可能真有戏，但暧昧不清最伤人，也最耗时间。钱上一起赚可以，账要晒出来。这一卦的底气来自一句：我不占你便宜，你也别想占我的。"],
      [14, "大有", "111101", "火天", "元亨。", "火在天上，照得万物都亮。收获、成绩、被看见，这卦是顺的，但顺得越明显，越要会分。功劳别独占，钱别独吞，人情让出去一点，位置才坐得稳。你可能会被捧着，被夸多了人就容易飘，一飘就开始做错判断。感情上对方在仰视你，记得蹲下来一点。钱上分出去的那部分不是损失，是保险。"],
      [15, "谦", "001000", "地山", "亨，君子有终。", "山藏在地底下，明明有高度却不露出来。这是六十四卦里最少凶险的一卦：有本事不显摆，机会自己会来；让一步，路反而宽。感情上低姿态有优势，越不急越有人愿意靠近。钱上稳中有进，别暴进暴退。跟人相处，这一卦几乎不会得罪人。但谦不是自卑，心里得真知道自己有本事，只是不必说出口。"],
      [16, "豫", "000100", "雷地", "利建侯，行师。", "雷从地里冒出来，先闷响一声，接着万物都松快了。顺势、顺心、顺人意的时期，适合布局，也适合把拖了很久的事办掉。但乐容易过头：一高兴就许诺，一热闹就忘了正事，手上有点闲钱就乱花。这一卦真正的提醒是，趁现在高兴，把后面的坑先填了。感情里轻松愉快是好事，但别许下自己做不到的承诺。"],
      [17, "随", "100110", "泽雷", "元亨利贞，无咎。", "泽里藏着雷，秋天该收的收，冬天该藏的藏。这卦讲的是跟着走：势头往哪边去，你就往哪边站，别在别人都转身的时候自己另起炉灶。但跟随不是盲从，动身之前先把规矩说清楚，谁说了算、做到什么份上、出问题怎么办。感情里顺着对方的节奏，硬掰只会掰断。钱上随大流可以，但先看清大流到底去哪。跟对人，比说对话更重要。"],
      [18, "蛊", "011001", "山风", "元亨，利涉大川。先甲三日，后甲三日。", "山下起风，东西放久了生虫。这卦讲的是积弊：拖着的旧账、放坏的流程、将就了很久的关系，现在到了该动手的时候。不修它会继续烂，修的时候疼，但修完就是新的。感情里旧账该谈一次谈清，谈完别再翻。钱上该止损的止损，该舍的舍。最忌讳的是知道了还捂着，捂着只会更烂，烂到最后连根都要挖掉。"],
      [19, "临", "110000", "地泽", "元，亨，利，贞。至于八月有凶。", "地上面是泽，土厚水润，万物往上长。你正站在一个有势的位置上，说话有人听、做事有人跟。这时候的功课是往下看：对下面的人厚道一点，别拿位置压人。感情上主动靠近是好事，但别居高临下。钱上进项在涨，注意别冲太快，涨的时候最容易把风险看小。你现在说的话权重比以前大，慎言就是修行。"],
      [20, "观", "000011", "风地", "盥而不荐，有孚顒若。", "风吹过大地，什么都看得见。这卦讲的是观察：先看，再动。看别人怎么做，别只听他怎么说；看自己哪里虚，别光看哪里强。感情上多观察对方的行为习惯，那比甜言蜜语准得多。钱上还在观察期，别下重注。跟人相处，你的示范比你的嘴更有说服力，别人学的是你怎么做，不是你怎么讲。"],
      [21, "噬嗑", "100101", "火雷", "亨。利用狱。", "雷声底下夹着电，嘴里咬着硬东西，得使劲咬断。这卦讲的是卡点：有个问题绕不过去，讲情面讲不通，只能按规矩硬啃下来。该讲道理就讲道理，该走程序就走程序，拖一天多一天的利息。感情上有疙瘩就说开，说开可能会疼，但总比耗着强。钱上该清算的清算，别指望它自己消失。把话说到透，比绕一百个弯子都省事。"],
      [22, "贲", "101001", "山火", "亨。小利有攸往。", "山下有火，光照在石头上，好看但不深。这卦讲的是包装：适度的修饰能加分，能让人愿意靠近你；但装得太过，反而盖住了里面真正的东西。感情上仪式感有用，但只靠仪式撑不住关系。钱上别把钱花在面子上，面子是最不保值的资产。跟人相处，体面重要，真诚更重要，两样都有才稳。"],
      [23, "剥", "000001", "山地", "不利有攸往。", "山压在地上，一层一层往下剥。这卦讲的是消退：手里的东西正在变少，位置正在被削弱，说不上是谁的错，就是时候到了。这时候别争、别冒头、别硬撑，越挣扎掉得越快。感情上关系在掉温，硬拉只会更凉。钱上别投、别借出。要做的事只有一件：把自己稳住，等这一阵风过去，风过去了你还在，就是赢。"],
      [24, "复", "100000", "地雷", "亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。", "雷在地底下动了一下，一阳回来了。最冷的时候过去了，转机已经出现，但还很小，像刚冒头的芽。这时候最该做的是回头：把之前丢下的功课补上，把断掉的联系接回去，把错过的道歉补上。感情上分开的还有可能，但别急，急就毁了。钱上慢慢回血，别一看见回暖就一把梭。转机是给有耐心的人准备的。"],
      [25, "无妄", "100111", "天雷", "元亨，利贞。其匪正有眚，不利有攸往。", "天下打雷，万物各按各的本分长。这卦讲的是不妄为：该做的做，不该伸手的地方别伸。耍小聪明最伤，因为小聪明总在关键处露馅。感情上别试探、别演，真诚是最省力的活法。钱上意外之财别贪，意外之灾也不全是你的错。跟人相处，不惹事，事也不来惹你，这就是最大的顺。"],
      [26, "大畜", "111001", "山天", "利贞，不家食吉，利涉大川。", "山里有天，藏得下很大的东西。这卦讲的是蓄：攒本事、攒资源、攒信用，都到了该往深处走的时候。这段时间不适合出手，适合变强，因为出手的机会只有那么几次，你现在的分量还不够。感情上把关系往深里做，别求快。钱上存得住才是你的，存不住的都只是路过。平时多帮人，关键时刻才有人帮你。"],
      [27, "颐", "100001", "山雷", "贞吉。观颐，自求口实。", "山下有雷，嘴在动，边吃边说。这卦讲的是养：靠自己的本事吃饭，别指望别人喂你；嘴上也要有分寸，不该说的话咽回去。感情上日常的照顾比豪言壮语管用得多，一碗热汤胜过十句承诺。钱上量入为出，挣多少花多少最稳。跟人相处，管住嘴，不传话，很多麻烦本来就不该发生。"],
      [28, "大过", "011110", "泽风", "栋桡，利有攸往，亨。", "泽水淹过树顶，梁已经弯了。这卦讲的是超载：担子已经比你能扛的重，硬撑下去只会塌。要么减负，要么换方法，要么认输重来，三条路都比硬扛强。感情上关系正在承压，别再加码，先把多余的要求放下。钱上杠杆太高，先降下来。非常时期可以用非常办法，别怕破一次例，规矩是为人服务的。"],
      [29, "坎", "010010", "水水", "习坎，有孚，维心亨，行有尚。", "水一个坑接一个坑，坑里还是水。这卦讲的是险：麻烦不是一件事，是一串事，处理完一个马上来下一个。这时候唯一的办法是一次只解决一个，别想着一把全清。感情上反复摩擦，别在情绪最上头的时候做决定，等心平了再说。钱上现金为王，别冒险。跟人相处少承诺、多守约，信用是险中唯一能带走的东西。"],
      [30, "离", "101101", "火火", "利贞，亨。畜牝牛，吉。", "火在火上，两团火互相照着，才烧得久。这卦讲的是依附：你一个人亮不了太久，得靠平台、靠团队、靠一个能托住你的东西。但依附不等于寄生，你得先自己有光，别人才愿意让你靠。感情上热烈是好事，可光靠激情烧不久，得有日常的柴。钱上靠主业稳一点，别指望偏财。你的光要能照到别人，才有人愿意跟。"],
      [31, "咸", "001110", "泽山", "咸，亨，利贞，取女吉。", "山上有泽，山是硬的，泽是软的，一硬一软之间就通了。这卦讲的是感应：不是靠道理说服，是靠气场和默契。有些事你按流程推不动，换成私下聊一次反而通了。感情上正是来电的时候，顺势而为，别用力过猛。钱上跟着直觉走可以，但别全押。跟人相处，真诚的感染力比技巧强得多。"],
      [32, "恒", "011100", "雷风", "亨，无咎，利贞，利有攸往。", "雷在风里响，风一直在吹，雷一直在响。这卦讲的是恒：不是某一次做对，是每一次都还愿意做。长期主义最枯燥，也最值钱，换赛道换得勤的人，永远在起跑线上。感情上稳定压倒一切，别折腾，折腾一次要修很久。钱上是定投式的耐心，别追求一夜翻倍。老朋友比新人脉值钱，因为时间已经替你们筛过了。"],
      [33, "遁", "001111", "天山", "亨，小利贞。", "天在上，山在下，山往后退，天还在。这卦讲的是退：不是败退，是主动退出。位置不对、势头不对、人心不对的时候，退一步反而是保全。留着力气，才有下一次出手的机会。感情上给彼此空间，别死盯着，盯得越紧跑得越快。钱上落袋为安，别贪最后一口。退场要退得体面，别撕破脸，日后的路还长。"],
      [34, "大壮", "111100", "雷天", "利贞。", "雷在天上，声势大得吓人。这卦讲的是壮：势头正猛，力气正足，做什么都有底气。但壮有两面，用得好是威慑，用不好是伤人伤己。最容易犯的错是仗着强就横冲直撞，撞到最后自己先断。感情上你太强势，对方会一点点往后退。钱上别加杠杆。赢了道理、输了关系，这笔账永远不划算。"],
      [35, "晋", "000101", "火地", "康侯用锡马蕃庶，昼日三接。", "太阳从地上升起来，光照得越来越远。这卦讲的是上：上升期，适合主动争取，适合露脸，别缩在后面等被看见。但上升要靠正当，光明正大地来，别走后门，因为上升期做的每件事都会被翻出来看。感情上关系适合往前推一步，别停在原地。钱上收入在涨，可以规划，但别把未来说得太满。"],
      [36, "明夷", "101000", "地火", "利艰贞。", "太阳掉进地里，光被埋住了。这卦讲的是藏：环境不好，说了没人听，出头就被打。这时候不是认输，是把锋芒收起来，把证据留好，把话咽下去，等天再亮。感情上被误解了别急着辩，越辩越像有鬼。钱上别露财，别显摆。跟人相处低调一点，等这一阵过去，你现在忍住没说的那些话，将来都会算数。"],
      [37, "家人", "101011", "风火", "利女贞。", "风从火里生出来，火在屋里烧，光只照自己家。这卦讲的是内：家里的事、团队的事，先安排明白。谁负责什么，什么能做、什么不能做，先立规矩，规矩立好了，日子就太平。感情上家内事讲和睦，别翻旧账，翻一次薄一分。钱上家庭账目要清，糊涂账最伤感情。内部稳了，外面再大的风也吹不动。"],
      [38, "睽", "110101", "火泽", "小事吉。", "火往上烧，泽往下流，两个背对着走。这卦讲的是分歧：想法不一样，走不到一处去。这时候别指望说服对方，也别说「我们本来可以」，先把能一起做的事做了，做不了的就各干各的。感情上三观有差就是有差，别骗自己能改得动谁。钱上各管各的更省事。求同存异不是妥协，是承认人和人本来就不一样。"],
      [39, "蹇", "001010", "水山", "利西南，不利东北；利见大人，贞吉。", "山上有水，路断了，前面走不过去。这卦讲的是阻：硬要往前闯，只会把自己弄得满身伤。这时候正确的做法是往回走，不是逃，是重新找路，或者找明白人问一句，一句话可能省你半年。感情上别硬来，先冷一冷。钱上别投。这一卦最珍贵的是那句老话：行有不得，反求诸己。"],
      [40, "解", "010100", "雷水", "利西南，无所往，其来复吉。有攸往，夙吉。", "雷在雨里，雨落下来，结的疙瘩松开了。这卦讲的是解：憋着的事终于有出口，僵住的局终于能动。松开之后最要紧的是收尾，别拖出第二波，也别人一松就又回头去碰旧账。感情上误会解开了就往前看，别反复提，反复提等于把它又系上。钱上解套了就别再回去。该道歉的赶早道歉，迟了就变味。"],
      [41, "损", "110001", "山泽", "损：有孚，元吉，无咎，可贞，利有攸往。曷之用，二簋可用享。", "山下有泽，泽往上升，山往下让，损了上面补了下面。这卦讲的是舍：舍掉低效的事、舍掉不必要的关系、舍掉撑场面的花销，换来的是真正重要的东西。舍的时候要真心，边舍边算账，那就白舍了。感情上让一步不是输，是换一条更长的路。钱上该花的钱别省，该省的别乱花。"],
      [42, "益", "100011", "风雷", "利有攸往，利涉大川。", "风雷相益，上面让利给下面，下面长出力气。这卦讲的是益：势头在往好的方向走，趁这个时候多做一点，收益会放大。但你拿了好处，别忘分出去，只顾自己拿的人，下一次就没人愿意一起做。感情上你正被爱着，记得回馈，别把对方的好当理所当然。钱上进项好，记得留一部分，别全花在当下。"],
      [43, "夬", "111110", "泽天", "扬于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。", "泽水漫到天上，水气顶不住了要决口。这卦讲的是决：该断的事必须断，该说的话必须说，拖着只会让事情发酵成更大的祸。但决也有分寸，把人逼到墙角，他反手就是一刀。留一条退路给对方，也是留给自己。感情上该断的关系要断，但要体面。钱上别一冲动就清仓或者梭哈，决断不等于赌博。"],
      [44, "姤", "011111", "天风", "女壮，勿用取女。", "天下有风，风吹到哪儿都遇得上。这卦讲的是遇：不期而遇的机会，或者不请自来的诱惑。看着好的人和事，先查底细，热情来得太快的东西，往往凉得也快。感情上有诱惑出现，先想清楚后果再靠近。钱上看上去稳的局，多问一句。跟人相处，突然热络起来的，观察一阵再说。"],
      [45, "萃", "000110", "泽地", "亨。王假有庙，利见大人，亨，利贞。用大牲吉，利有攸往。", "泽在地上，水聚成一片。这卦讲的是聚：人聚起来了，资源凑齐了，正是办事的时候。但人一多，没有主事的人就会散，规矩要在聚之前定，别等起了争执再立规矩。感情上朋友多不是坏事，但别乱了分寸。钱上合伙、集资要走规范，越熟越要有字据。人心聚起来很慢，散起来很快。"],
      [46, "升", "011000", "地风", "元亨，用见大人，勿恤，南征吉。", "地上面长树，一寸一寸往上。这卦讲的是升：一步一步往上走，别跳级。跳级看起来快，实际上把该打的基础都跳过去了，迟早要回来补。感情上慢慢加深，别急着一步到位。钱上稳步增长最可靠，别赌。跟人相处靠口碑一点点攒，口碑是一寸一寸长出来的，也是最不容易塌的。"],
      [47, "困", "010110", "泽水", "亨，贞，大人吉，无咎，有言不信。", "泽里的水漏光了，只剩下困。这卦讲的是困：卡住了，说什么都没人信，做什么都被怀疑。这时候最忌讳的是拼命解释，越说越乱。正确做法是少说多做，用结果说话，把能控制的一点点做好。感情上说什么都像在吵架，先安静几天。钱上现金吃紧，别外借。困到极处会转过，但转之前你得撑住。"],
      [48, "井", "011010", "水风", "改邑不改井，无丧无得，往来井井。汔至，亦未繘井，羸其瓶，凶。", "木在水的下面，井打在很深的地方。这卦讲的是井：把自己这口井淘干净，别老想着换地方。换个地方还是那口井，问题不在环境，在你有没有把水淘清。感情上日常的养护比激情重要，激情会退，井水不会。钱上稳定的造血比一夜暴富可靠。有用的人，永远有人来找，这就是最稳的资本。"],
      [49, "革", "101110", "泽火", "巳日乃孚，元亨利贞，悔亡。", "泽里有火，水火相争，非得变个样子才能共存。这卦讲的是革：该改就改，但变革最讲究时机，早了没人跟，晚了来不及。改之前先把人沟通好，把规矩说清楚，别一边改一边解释。感情上要么改模式，要么散，反复横跳最伤。钱上该调整结构就调整，别硬撑着老路子。"],
      [50, "鼎", "011101", "火风", "元吉，亨。", "木上有火，架锅煮饭，把生的煮成熟的。这卦讲的是鼎：换了新锅，也得先把底下的火点稳。进新局、换新岗、起新项目，先打地基，再用人。人放错位置，锅再好也煮不熟。感情上关系升级，双方都得让出一点位置来。钱上新项目起步期别铺太大，火还没稳就摊大，容易糊。"],
      [51, "震", "100100", "雷雷", "亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。", "雷声突然炸开，震得人腿软。这卦讲的是震：突发的变故，谁都躲不开。第一反应不该是恐慌，而是稳住，先站稳，再看清了，再动。被吓一跳的误会，别越扩越大。钱上别被消息吓着乱操作，慌里慌张做的决定，九成是错的。你惊到的人，先去安抚，镇得住场的人才配得上机会。"],
      [52, "艮", "001001", "山山", "艮其背，不获其身，行其庭，不见其人，无咎。", "两座山叠在一起，谁也过不去。这卦讲的是止：该停就停，停不是懒，是看清。一直往前冲的人，往往不知道自己已经冲到了什么地方。感情上别追得太紧，给个暂停，暂停之后再看还剩下什么。钱上暂停投入。跟人相处，该拒绝就拒绝，痛快地说不，比拖着答应省事。"],
      [53, "渐", "001011", "风山", "女归吉，利贞。", "山上有木，树一点一点长高。这卦讲的是渐：按部就班，别想着一夜成事。渐的力量在于不停，慢不要紧，停了才要紧。感情上慢慢来，急了会散，散得比慢慢来还快。钱上慢慢积累，别指望暴富。跟人相处，关系是一步步处出来的，跳过的步骤迟早要补回来。"],
      [54, "归妹", "110100", "雷泽", "征凶，无攸利。", "泽上有雷，姑娘出嫁了，位置却不太对。这卦讲的是位：你进了一个局，位置比你想要的低，或者名分还没定下来。这时候别急着上位，越急越被看轻。感情上别为了凑合而凑合，凑合出来的关系最耗人。钱上别拿未来的钱办现在的事。名分没定之前，别投入太多。"],
      [55, "丰", "101100", "雷火", "亨，王假之，勿忧，宜日中。", "雷在火上，火在雷上，光盛到了极点。这卦讲的是丰：正当年景最好的时候，该办的大事抓紧办。但丰后面跟着的是旅，盛极就要转，所以越是旺越要想回落，把该留的后路留好。感情上热得发烫的时候留一点余地，别把话说死。钱上赚得到不算本事，守得住才算。热闹的时候别忘了老朋友，散场时只有他们还在。"],
      [56, "旅", "001101", "火山", "小亨，旅贞吉。", "山上有火，火烧得快，走得也快。这卦讲的是旅：人在外头，客居他乡，没有根基。这时候守规矩、客气、别越位，走到哪儿都方便；一旦逞能，就是给自己找麻烦。感情上异地或者漂泊期，别许兑现不了的承诺。钱上出门在外别露财。人在别人地盘上，姿态低一点不吃亏。"],
      [57, "巽", "011011", "风风", "小亨，利攸往，利见大人。", "风跟着风，一层一层往里钻。这卦讲的是入：不用硬碰，用渗透，把话说软，把事做硬，慢慢渗进去，比正面冲撞有效得多。感情上顺毛捋比讲道理管用，人是被顺出来的，不是被说服的。钱上慢慢渗透市场，别猛推，猛推只会把人推远。跟人相处，说软话，办硬事。"],
      [58, "兑", "110110", "泽泽", "亨，利贞。", "两片泽连在一起，水相互滋润，看着就让人高兴。这卦讲的是悦：开心、受欢迎、气氛好。但悦有两面，靠讨好换来的笑维持不久，靠嘴皮子撑起来的关系一戳就破。感情上开心就好，别把话说得太重。钱上别因为开心就乱花。跟人相处，会说话的人缘好，但别飘，飘起来就没人敢跟你说真话了。"],
      [59, "涣", "010011", "风水", "亨。王假有庙，利涉大川，利贞。", "风在水上吹，水被吹散了。这卦讲的是涣：人心散了，钱散了，力气散了。这时候别急着办事，先聚拢：把人找回来，把话说开，把隔阂化掉。感情上隔阂要主动去化，别等对方先低头。钱上散了先收口，别再往外撤。该组的局，主动组一次，很多事就在一顿饭里解开了。"],
      [60, "节", "110010", "水泽", "亨。苦节，不可贞。", "泽上有水，水满则溢，所以要有个度。这卦讲的是节：有节奏、有节制，别一阵猛一阵停，也别省到把自己省垮。感情上给关系定个度，太黏会窒息，太远会凉。钱上该省省，但别省出病来。跟人相处也要有距离感，距离感不是生分，是让彼此都喘得动气。"],
      [61, "中孚", "110011", "风泽", "豚鱼吉，利涉大川，利贞。", "风吹在泽上，水面有波纹，是里面在动。这卦讲的是孚：诚信。说到的做到，答应过的兑现，时间久了别人信你，很多事就不用反复解释了。感情上真心换真心，玩心眼的早晚被发现。钱上信誉就是资产，急用钱的时候，能借到的都是过去攒下的信用。被人信任，比什么都值钱。"],
      [62, "小过", "001100", "雷山", "亨，利贞，可小事，不可大事。飞鸟遗之音，不宜上，宜下，大吉。", "山上有雷，雷声不大，却停不下来。这卦讲的是小过：小事上可以稍微过一点，大事上千万别。越了界的小事是好意，越了界的大事是祸。飞得低比飞得高安全，姿态放低比强出头安全。感情上小的让步可以有，原则别丢。钱上小钱可以花，大钱别动。跟人相处低调一点，别越级说话。"],
      [63, "既济", "101010", "水火", "亨，小利贞，初吉终乱。", "水在火上，水火各归其位，事情成了。这卦讲的是既济：办成了、安顿好了。但成了之后才是最危险的时候，因为人会松。松一次，之前所有的功夫都在收尾处翻车。感情上稳了就更要用心，别觉得稳了就不用管。钱上保住比扩张重要。跟人相处别因为熟了就不客气，最容易出事的恰恰是自己人。"],
      [64, "未济", "010101", "火水", "亨，小狐汔济，濡其尾，无攸利。", "火在水上，水火还没遇上，事情还没成。这卦讲的是未济：就差最后一步，却始终差着。这时候最怕两件事，一是急，二是松。急的人在最后一步摔，松的人在最后一步漏。感情上还没到定局的时候，别急着摊牌。钱上别在最后一刻冒险。最后一步别失礼，很多关系毁在一句不客气的话上。"],
    ];

    // WMO 天气码 → 文案组（组名对应字典 wx.*）
    const WX_GROUP = {
      0: 'clear', 1: 'clear', 2: 'partly', 3: 'cloudy',
      45: 'fog', 48: 'fog',
      51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 56: 'drizzle', 57: 'drizzle',
      61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
      71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
      80: 'shower', 81: 'shower', 82: 'shower', 85: 'snowshower', 86: 'snowshower',
      95: 'storm', 96: 'storm', 99: 'storm',
    };

    // 24 小时时段底色：深夜深、白天淡蓝、黄昏橙黄；每格纯色，相邻格自然连成过渡
    const HOUR_TINT = [
      '#1c2438', '#1e263c', '#212a42', '#243049', '#283550', '#2d3a58',
      '#4a5a7d', '#a9bcd8',
      '#cfe0f5', '#dceaf9', '#e6f0fb', '#edf4fd', '#f1f7fe', '#f3f8ff',
      '#eef5fd', '#e6effa', '#f6e6c8', '#f9ddb6', '#f2c59a', '#b9a6c4',
      '#5f5878', '#33324d', '#252a40', '#1f2338',
    ];
    function hourTint(h) {
      var n = ((Number(h) || 0) % 24 + 24) % 24;
      return HOUR_TINT[n] || '#f3f8ff';
    }
    // 清晨前与入夜后的底色偏深，文字必须换浅色，否则看不见
    function hourTone(h) {
      var n = ((Number(h) || 0) % 24 + 24) % 24;
      return n <= 6 || n >= 20 ? 'night' : 'day';
    }


    // 配置读不到时的缺省值，与 index.js 的 schema 默认值保持一致
    const FALLBACK = {
      workStart: '09:00',
      workEnd: '18:00',
      workdays: '1,2,3,4,5',
      showSeconds: true,
      float: false,
      anchorX: 'right',
      anchorY: 'top',
      offsetX: 16,
      offsetY: 56,
      city: '',
      requestTimeoutSeconds: 30,
      weatherVisible: true,
      weather: null,
      usageVisible: true,
      usage: null,
      almanac: null,
      volume: 70,
      keyStats: '',
      keyAnim: true,
      keySize: 'medium',
      keyCrops: '',
      cropStock: '',
      notes: '',
      keyPanelDX: 0,
      keyPanelDY: 0,
    };

    // 只用 Theme 服务列出的 --dsw-alias-* 令牌：跟随亮色 / 暗色主题，不写死颜色
    const CSS = [
      // —— 胶囊：状态点 + 倒计时 + 天气 ——
      // 按需求统一成纯白卡面：这套配色是本组件自带的浅色主题，不随宿主亮暗翻转，
      // 白底必须配固定的深色文字，否则暗色主题下会白字白底。
      '.wcd-pill,.wcd-panel,.wcd-mask,.wcd-kbd-win{--wcd-bg:#fff;--wcd-fg:#1f2328;--wcd-muted:#6b7280;',
      '--wcd-line:#e8eaed;--wcd-hover:#f4f5f7;--wcd-blue:#4c8dff;--wcd-green:#16a34a;',
      // 键盘田园配色：土 / 叶 / 花 / 果实
      '--wcd-soil:#d3a066;--wcd-soil-dark:#b07f4c;--wcd-leaf:#6fbf5c;--wcd-leaf-dark:#4e9a44;',
      '--wcd-flower:#f6c445;--wcd-fruit:#ef7a3d;--wcd-plot:#f4f0e5}',
      '.wcd-pill{position:relative;display:inline-flex;align-items:center;gap:8px;height:28px;',
      'padding:0 12px;border-radius:999px;font-size:13px;line-height:20px;white-space:nowrap;',
      'color:var(--wcd-muted);background:var(--wcd-bg);border:1px solid var(--wcd-line);',
      'font-variant-numeric:tabular-nums;user-select:none;-webkit-user-select:none;',
      'cursor:pointer;transition:box-shadow .16s ease,border-color .16s ease}',
      '.wcd-dot{flex:none;width:6px;height:6px;border-radius:50%;',
      'background:#d1d5db;transition:background-color .2s ease}',
      '.wcd-pill[data-kind="before"] .wcd-dot{background:#9ca3af}',
      '.wcd-pill[data-kind="work"] .wcd-dot{background:var(--wcd-blue)}',
      '.wcd-count{display:inline-flex;align-items:baseline;gap:6px}',
      // 胶囊内部两组：左边倒计时、右边天气
      '.wcd-left,.wcd-right{display:inline-flex;align-items:center;gap:5px}',
      '.wcd-row1{display:flex;align-items:center;justify-content:space-between;gap:6px}',
      // 只有卡片形态才把第一行撑满；头部形态保持收缩到内容宽度
      '.wcd-float .wcd-row1{width:100%}',
      '.wcd-label{letter-spacing:.1px}',
      '.wcd-num{font-size:14px;font-weight:600;letter-spacing:.3px;color:var(--wcd-fg)}',
      '.wcd-sep{flex:none;width:1px;height:13px;background:var(--wcd-line)}',
      '.wcd-wx-temp{font-size:13px;font-weight:600;color:var(--wcd-fg)}',
      // 用量三环：夹在倒计时与天气中间，环心是整数百分比，环下是小标签
      '.wcd-usage{display:inline-flex;align-items:center;gap:6px;flex:none}',
      '.wcd-usage-item{display:inline-flex;flex-direction:column;align-items:center;gap:1px}',
      '.wcd-usage-label{font-size:10px;line-height:12px;color:var(--wcd-muted);letter-spacing:.2px}',
      '.wcd-usage-reset{font-size:11px;line-height:14px;color:var(--wcd-muted)}',
      '.wcd-ring{display:block}',
      '.wcd-almanac{padding-bottom:10px;margin:0;border-bottom:1px solid var(--wcd-line)}',
      '.wcd-al-top{display:flex;align-items:baseline;gap:8px}',
      '.wcd-al-date{font-size:14px;font-weight:600;color:var(--wcd-fg)}',
      '.wcd-al-lunar{font-size:11px;color:var(--wcd-muted)}',
      '.wcd-al-meta{display:flex;flex-wrap:wrap;gap:10px;font-size:11px;color:var(--wcd-muted);margin-top:4px}',
      '.wcd-al-row{display:flex;gap:6px;margin-top:8px;align-items:flex-start}',
      '.wcd-al-tag{flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:5px;',
      'font-size:11px;font-weight:600}',
      '.wcd-al-tag[data-k="yi"]{color:#15803d;background:rgba(21,128,61,.12)}',
      '.wcd-al-tag[data-k="ji"]{color:#b91c1c;background:rgba(185,28,28,.12)}',
      '.wcd-al-items{display:flex;flex-wrap:wrap;gap:4px;font-size:11.5px;color:var(--wcd-fg);line-height:18px}',
      '.wcd-al-item{padding:0 5px;border-radius:4px;background:var(--wcd-hover)}',
      '.wcd-usage-block{display:block}',
      '.wcd-usage-title{display:flex;align-items:center;gap:6px;',
      'font-size:12px;line-height:16px;font-weight:600;color:var(--wcd-muted);',
      'text-align:left;margin-bottom:10px}',
      '.wcd-usage-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;',
      'padding-bottom:10px;margin:0;border-bottom:1px solid var(--wcd-line)}',
      '.wcd-usage-row .wcd-usage-item{gap:3px}',
      '.wcd-usage-row .wcd-usage-label{font-size:12px;line-height:15px}',
      // 工具横排：一行 5 个，第 6 个起自动换到第二行（这是默认排版，用户不再单独交代）
      // space-evenly 让「左缘-图标1」「图标之间」「图标N-右缘」的间隙全部相等
      '.wcd-fish-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-evenly;gap:4px 0;padding-top:2px}',
      '.wcd-fish-break{flex:0 0 100%;width:100%;height:0;margin:0;padding:0;pointer-events:none}',
      // 浮窗里的工具行由「详情页是否活着」驱动，而不是纯 :hover——
      // 这样它和详情页共用同一套 200ms 防抖，收起时两者一起淡出
      '.wcd-float > .wcd-fish-row{margin-top:0;padding-top:0;max-height:0;opacity:0;overflow:hidden;',
      'transition:max-height .16s ease,padding-top .16s ease,margin-top .16s ease,opacity .16s ease}',
      // 两行图标的高度上限：32 + 4 + 零高分隔行 + 4 + 32 + 2 padding = 74，留 4px 余量
      '.wcd-float[data-expand="true"] > .wcd-fish-row{max-height:78px;padding-top:2px;margin-top:12px;opacity:1;',
      // 展开后放开裁剪：功德 +1 要往上飘到三环上面，overflow:hidden 会把它切掉
      'overflow:visible}',
      // 工具按钮统一 32×32 盒子：像素图 16×16 正好整数 2 倍放大，不会出现像素粗细不均
      // 一行固定 5 个：靠 .wcd-fish-break 硬换行，不依赖容器宽度，图标再小也不会挤进第 6 个
      '.wcd-tool{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;',
      'position:relative;transition:transform .12s ease;width:32px;height:32px;flex:none}',
      '.wcd-tool-dot{position:absolute;top:-2px;right:-2px;pointer-events:none}',
      '.wcd-tool:hover{transform:translateY(-1px)}',
      '.wcd-tool:active{transform:translateY(0) scale(.96)}',
      '.wcd-tool[data-shake="true"] svg,.wcd-tool[data-shake="true"] img{animation:wcd-shake .5s ease-in-out}',
      '.wcd-tarot[data-spin="true"] svg,.wcd-tarot[data-spin="true"] img{animation:wcd-spin .55s cubic-bezier(.32,.72,.32,1);transform-origin:50% 50%}',
      '@keyframes wcd-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
      '@keyframes wcd-shake{0%,100%{transform:rotate(0)}20%{transform:rotate(-7deg)}',
      '45%{transform:rotate(6deg)}70%{transform:rotate(-3deg)}}',
      // 木鱼「功德+1」飘字：定位在图标上方，随机横向偏移，连敲时各自独立上浮
      '.wcd-fish-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center}',
      '.wcd-merit-layer{position:absolute;left:0;right:0;bottom:calc(100% - 14px);height:0;pointer-events:none;z-index:2}',
      '.wcd-merit{position:absolute;left:calc(50% + var(--dx,0px));bottom:2px;white-space:nowrap;',
      'font-size:12px;font-weight:700;letter-spacing:.2px;color:#c08a2e;',
      'text-shadow:0 1px 0 rgba(255,255,255,.75);',
      'transform:translate(-50%,0);animation:wcd-merit .9s cubic-bezier(.22,.61,.36,1) forwards}',
      '@keyframes wcd-merit{',
      '0%{opacity:0;transform:translate(-50%,6px) scale(.75)}',
      '16%{opacity:1;transform:translate(-50%,-2px) scale(1)}',
      '100%{opacity:0;transform:translate(-50%,-28px) scale(.98)}}',
      '@keyframes wcd-merit-fade{0%{opacity:0}20%{opacity:1}100%{opacity:0}}',
      '@media (prefers-reduced-motion:reduce){.wcd-merit{animation:wcd-merit-fade .9s ease-out forwards}}',
      '.wcd-fish{display:inline-flex;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.wcd-tool svg,.wcd-tool img{display:block}',
      // 图标铺满盒子；红点是绝对定位的小圆，不能被撑成 32×32
      '.wcd-tool > svg:not(.wcd-tool-dot),.wcd-tool > img{width:100%;height:100%}',
      '.wcd-tool .wcd-tool-dot{width:10px;height:10px}',
      // 便笺层：整层不吃鼠标事件，只有便笺本体接收；层级在主面板之上、弹窗之下
      '.wcd-note-layer{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:44}',
      '.wcd-note{position:absolute;width:240px;pointer-events:auto;box-sizing:border-box;',
      'background:#fff6bf;border:1px solid #ecd98d;border-radius:10px;',
      // 阴影跟主面板同一档（.07），便笺小、叠在内容上，收紧模糊半径别让它看着比面板还重
      'box-shadow:0 10px 20px rgba(15,23,42,.07);display:flex;flex-direction:column;overflow:hidden}',
      '.wcd-note-head{position:relative;height:26px;flex:none;display:flex;align-items:center;justify-content:center;',
      'cursor:grab;touch-action:none;border-bottom:1px solid rgba(196,168,74,.22)}',
      '.wcd-note-head:active{cursor:grabbing}',
      '.wcd-note-grip{display:flex;flex-direction:column;align-items:center;gap:2px}',
      '.wcd-note-grip-bar{display:block;width:14px;height:1.5px;border-radius:1px;background:rgba(120,96,30,.45)}',
      '.wcd-note-close{position:absolute;right:3px;top:2px;width:21px;height:21px;border:0;padding:0;',
      'background:transparent;color:#a08a4a;font-size:15px;line-height:21px;cursor:pointer;border-radius:6px}',
      '.wcd-note-close:hover{background:rgba(160,138,74,.16);color:#7a6528}',
      '.wcd-note-body{width:100%;box-sizing:border-box;border:0;background:transparent;resize:none;overflow:hidden;',
      'padding:6px 11px 12px;font:inherit;font-size:12.5px;line-height:19px;color:#5b4a1d;outline:none;min-height:52px;',
      'font-family:inherit}',
      '.wcd-note-body::placeholder{color:rgba(120,96,30,.4)}',
      // —— 颜色转换小窗：屏幕正中的小卡片，输入 QQ 截图吸到的 r,g,b ——
      '.wcd-rgb{box-sizing:border-box;width:300px;max-width:calc(100vw - 32px);padding:16px 18px 14px;',
      'border-radius:16px;background:var(--wcd-bg);border:1px solid var(--wcd-line);',
      'box-shadow:0 20px 48px rgba(15,23,42,.28);color:var(--wcd-fg);cursor:default;animation:wcd-pop .18s ease-out}',
      '.wcd-rgb-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}',
      '.wcd-rgb-title{font-size:13px;font-weight:600}',
      '.wcd-rgb-close{width:22px;height:22px;border:none;background:transparent;color:var(--wcd-muted);font-size:16px;',
      'line-height:1;cursor:pointer;border-radius:6px;padding:0}',
      '.wcd-rgb-close:hover{background:var(--wcd-hover);color:var(--wcd-fg)}',
      '.wcd-rgb-top{display:flex;align-items:center;gap:8px}',
      '.wcd-rgb-input{flex:1;min-width:0;box-sizing:border-box;height:32px;padding:0 9px;border-radius:8px;',
      'border:1px solid var(--wcd-line);background:var(--wcd-hover);color:var(--wcd-fg);font-size:13px;',
      'font-family:inherit;font-variant-numeric:tabular-nums;outline:none}',
      '.wcd-rgb-input:focus{border-color:var(--wcd-blue)}',
      '.wcd-rgb-chip{width:32px;height:32px;flex:none;border-radius:8px;border:1px solid var(--wcd-line)}',
      '.wcd-rgb-row{display:flex;align-items:center;gap:8px;margin-top:9px}',
      '.wcd-rgb-tag{flex:none;width:32px;font-size:11px;color:var(--wcd-muted)}',
      '.wcd-rgb-val{flex:1;min-width:0;font-size:12.5px;font-variant-numeric:tabular-nums;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.wcd-rgb-val[data-empty="true"]{color:var(--wcd-muted)}',
      '.wcd-rgb-copy{flex:none;height:24px;padding:0 9px;border-radius:7px;border:1px solid var(--wcd-line);',
      'background:transparent;color:var(--wcd-fg);font-size:11.5px;cursor:pointer}',
      '.wcd-rgb-copy:hover{background:var(--wcd-hover)}',
      '.wcd-rgb-copy[data-done="true"]{color:#2f9e44;border-color:rgba(47,158,68,.5)}',
      '.wcd-rgb-bad{margin-top:8px;font-size:11px;line-height:15px;color:#d14343}',
      '.wcd-ts-unit{margin-top:7px;font-size:11px;line-height:15px;color:var(--wcd-muted)}',
      '.wcd-fish svg,.wcd-fish img{transform-origin:50% 85%}',
      '.wcd-fish[data-bonk="true"] svg,.wcd-fish[data-bonk="true"] img{animation:wcd-bonk .26s cubic-bezier(.2,.9,.3,1)}',
      '@keyframes wcd-bonk{0%{transform:scale(1)}28%{transform:scale(.85) translateY(2px)}',
      '62%{transform:scale(1.08) translateY(-2px)}100%{transform:scale(1)}}',
      '@media (prefers-reduced-motion:reduce){.wcd-fish[data-bonk="true"] svg,.wcd-fish[data-bonk="true"] img{animation:none}}',
      '.wcd-usage-hint{display:block;font-size:11px;color:var(--wcd-muted);text-align:center;',
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'padding:4px 0 10px;margin:0;border-bottom:1px solid var(--wcd-line)}',
      // —— 浮动形态：两行「简单页」卡片（280 宽），与详情页水平居中；位移只走 transform ——
      '.wcd-float{position:fixed;z-index:30;pointer-events:auto;cursor:default;touch-action:none;',
      'box-sizing:border-box;display:flex;flex-direction:column;align-items:stretch;gap:0;',
      'width:240px;height:auto;padding:16px 12px 10px;border-radius:14px;',
      'border:1px solid var(--wcd-line);box-shadow:0 10px 24px rgba(15,23,42,.07)}',
      // 顶部拖拽把手：只在浮窗形态里出现，hover 淡入；拖动只认这一小块
      '.wcd-grip{position:absolute;top:3px;left:50%;width:40px;height:12px;transform:translateX(-50%);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;',
      'cursor:grab;opacity:0;transition:opacity .16s ease;touch-action:none}',
      '.wcd-grip-bar{display:block;width:14px;height:1.5px;border-radius:1px;background:var(--wcd-muted)}',
      '.wcd-float:hover .wcd-grip,.wcd-float[data-dragging="true"] .wcd-grip{opacity:.6}',
      '.wcd-float[data-dragging="true"] .wcd-grip{cursor:grabbing}',
      // 第二行：三环三等分整行
      '.wcd-float .wcd-usage{display:grid;grid-template-columns:repeat(3,1fr);width:100%;gap:0;margin-top:12px}',
      '.wcd-float:hover,.wcd-float[data-open="true"]{box-shadow:0 14px 31px rgba(15,23,42,.07)}',
      '.wcd-float[data-dragging="true"]{box-shadow:0 18px 36px rgba(15,23,42,.07)}',
      // —— 详情面板：同一张白卡的下半部分 ——
      '.wcd-panel{position:fixed;z-index:40;box-sizing:border-box;padding:12px 14px;border-radius:14px;',
      'background:var(--wcd-bg);border:1px solid var(--wcd-line);',
      'box-shadow:0 20px 37px rgba(15,23,42,.07);color:var(--wcd-fg);font-size:13px;line-height:1.45;',
      'user-select:none;-webkit-user-select:none;cursor:default;animation:wcd-pop .14s ease-out}',
      '@keyframes wcd-pop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
      // 关闭：蒙版淡出、卡片往回缩一点，方向和时间都跟打开对称
      '.wcd-mask[data-closing="true"]{animation:wcd-fade-out .16s ease-in forwards;pointer-events:none}',
      '.wcd-mask[data-closing="true"] > *{animation:wcd-pop-out .16s ease-in forwards}',
      '@keyframes wcd-pop-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-4px)}}',
      // 淡出：先挂 data-out 播完动画再卸载，不做「瞬间消失」
      '.wcd-panel[data-out="true"]{animation:wcd-fade-out .16s ease-in forwards;pointer-events:none}',
      '@keyframes wcd-fade-out{from{opacity:1}to{opacity:0}}',
      '@media (prefers-reduced-motion:reduce){.wcd-panel,.wcd-panel[data-out="true"]{animation:none}}',
      // 块间距统一：相邻块之间只靠 margin-top 10px，块自身不再写 margin-bottom
      '.wcd-panel > * + *{margin-top:10px}',
      // 手动刷新按钮：两个半圆弧箭头，转圈表示请求还在飞
      // 对勾和按钮包在一组里：组靠右，对勾自然落在按钮左边
      '.wcd-refresh-group{display:inline-flex;align-items:center;gap:2px;flex:none;margin-left:auto}',
      '.wcd-refresh{flex:none;display:inline-flex;align-items:center;justify-content:center;',
      'width:18px;height:18px;padding:0;border:0;border-radius:5px;background:transparent;',
      'color:var(--wcd-muted);cursor:pointer;transition:background-color .16s ease,color .16s ease}',
      '.wcd-refresh:hover{background:var(--wcd-hover);color:var(--wcd-fg)}',
      '.wcd-refresh:active{color:var(--wcd-blue)}',
      '.wcd-panel-head .wcd-refresh-group{margin-right:-2px}',
      // 刷新成功：按钮左侧一枚绿色对勾，一秒后由组件卸载掉
      '.wcd-refresh-ok{color:#2f9e44;animation:wcd-ok-pop .22s ease-out}',
      '@keyframes wcd-ok-pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}',
      '@media (prefers-reduced-motion:reduce){.wcd-refresh-ok{animation:none}}',
      '.wcd-refresh[data-spin="true"] .wcd-refresh-ico{animation:wcd-refresh-spin .9s linear infinite}',
      '@keyframes wcd-refresh-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.wcd-refresh[data-spin="true"] .wcd-refresh-ico{animation:none}}',
      // 宿主写下的失败原因：红字一行，成功后 error 变空自动消失
      '.wcd-err{font-size:11px;line-height:15px;color:#d14343;margin-top:5px;word-break:break-word}',
      '.wcd-panel-head{display:flex;align-items:center;gap:6px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.wcd-city{font-weight:600;color:var(--wcd-fg)}',
      '.wcd-head-wx{color:var(--wcd-muted)}',
      '.wcd-head-temp{font-weight:600;color:var(--wcd-fg);font-variant-numeric:tabular-nums}',
      '.wcd-head-dim{color:var(--wcd-muted);font-variant-numeric:tabular-nums}',
      // 未来 24 小时：滚动条隐藏，滚轮 / 按住拖动都能滑；右侧渐隐提示「后面还有」
      '.wcd-strip-wrap{position:relative}',
      // 右缘渐隐改用 mask：横条本身是彩色格，白色遮罩会糊成一片白雾
      '.wcd-strip{display:flex;gap:2px;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;',
      'scrollbar-width:none;-ms-overflow-style:none;touch-action:pan-y;',
      '-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 26px),transparent);',
      'mask-image:linear-gradient(to right,#000 calc(100% - 26px),transparent)}',
      '.wcd-strip::-webkit-scrollbar{display:none;width:0;height:0}',
      '.wcd-cell{flex:none;width:46px;display:flex;flex-direction:column;align-items:center;gap:1px;',
      'padding:6px 0;border-radius:8px;transition:filter .12s ease}',
      '.wcd-cell:hover{filter:brightness(.96)}',
      '.wcd-cell-time{font-size:12px;color:var(--wcd-muted);font-variant-numeric:tabular-nums}',
      '.wcd-cell-temp{font-size:14px;font-weight:600;color:var(--wcd-fg);font-variant-numeric:tabular-nums}',
      '.wcd-cell-wx{font-size:12px;color:var(--wcd-muted)}',
      // 每格底色按小时给纯色（见 HOUR_TINT），不再给「当前小时」单独铺底
      '.wcd-cell[data-light="night"] .wcd-cell-time{color:rgba(232,238,252,.78)}',
      '.wcd-cell[data-light="night"] .wcd-cell-temp{color:#f4f7ff}',
      '.wcd-cell[data-light="night"] .wcd-cell-wx{color:rgba(232,238,252,.72)}',
      // 当前小时只保留时间加粗高亮，不铺底色
      '.wcd-cell[data-first="true"] .wcd-cell-time{color:var(--wcd-blue);font-weight:600}',
      '.wcd-cell[data-light="night"][data-first="true"] .wcd-cell-time{color:#9db9ff}',
      // 工作时段：最近整点加 1px 内描边，上班蓝、下班绿，不改变格子尺寸
      '.wcd-cell[data-work="start"]{box-shadow:inset 0 0 0 1px var(--wcd-blue)}',
      '.wcd-cell[data-work="end"]{box-shadow:inset 0 0 0 1px var(--wcd-green)}',
      '.wcd-glyph{display:block;margin-top:2px}',
      '.wcd-right .wcd-glyph,.wcd-panel-head .wcd-glyph{margin:0}',
      '.wcd-day .wcd-glyph{margin-top:1px}',
      // 未来 3 天：三列，不滚动
      '.wcd-days{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding-top:10px;',
      'border-top:1px solid var(--wcd-line)}',
      '.wcd-day{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;',
      'white-space:nowrap;padding:2px 0}',
      '.wcd-day-name{font-size:12px;color:var(--wcd-muted)}',
      '.wcd-day-temp{font-size:14px;font-weight:600;color:var(--wcd-fg);font-variant-numeric:tabular-nums}',
      '.wcd-day-wx{font-size:12px;color:var(--wcd-muted)}',
      '.wcd-empty{padding:16px 0 6px;text-align:center;color:var(--wcd-muted)}',
      '.wcd-stale{font-size:11px;color:#b45309}',
      // 键盘入口（详情面板底部，面板保持 320 宽不撑肿）
      // 独立键盘浮窗：右下角常驻，24px 格子，够放五位数
      '.wcd-kbd-wrap{position:fixed;right:24px;bottom:24px;z-index:45}',
      // 键盘底部：每种作物的库存，横向排开（在田埂内部，不另起背景）
      '.wcd-stock{display:flex;align-items:center;justify-content:center;gap:18px;padding:0}',
      '.wcd-stock-item{display:inline-flex;align-items:center;gap:5px;font-size:12px;line-height:1;color:#3d4a33}',
      '.wcd-stock-emoji{font-size:14px;line-height:1}',
      '.wcd-stock-num{font-variant-numeric:tabular-nums;font-weight:600;color:#2f3d27}',
      '.wcd-kbd-win{position:relative;box-sizing:border-box;max-width:calc(100vw - 48px);',
      'padding:24px 22px 22px;border:0;background:transparent;color:var(--wcd-fg);',
      'user-select:none;-webkit-user-select:none;transform-origin:bottom right;',
      'animation:wcd-fade .16s ease-out}',
      // 关闭按钮：absolute 落在小键盘第一行最右列的空位
      '.wcd-kbd-close{position:absolute;z-index:3;top:44px;right:38px;width:24px;height:24px;border:0;border-radius:8px;',
      'background:transparent;color:var(--wcd-muted);font-size:18px;line-height:1;cursor:pointer}',
      '.wcd-kbd-close:hover{background:var(--wcd-hover);color:var(--wcd-fg)}',
      // 拖动把手：在叉号左边一格，三横线，按住拖整块浮窗
      '.wcd-kbd-grip{position:absolute;z-index:3;top:44px;right:69px;width:24px;height:24px;border-radius:8px;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;',
      'cursor:grab;color:var(--wcd-muted);touch-action:none}',
      '.wcd-kbd-grip:hover{background:var(--wcd-hover);color:var(--wcd-fg)}',
      '.wcd-kbd-grip:active{cursor:grabbing}',
      '.wcd-kbd-grip-bar{display:block;width:12px;height:1.5px;border-radius:1px;background:currentColor}',
      '.wcd-keymap{position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;overflow:visible;',
      'padding:12px 12px 14px;background:#e9f1dc;border:1px solid #d9e5c7;border-radius:12px;',
      'box-shadow:0 18px 48px rgba(15,23,42,.12)}',
      '.wcd-kb-rows{display:flex;gap:12px;align-items:flex-start}',
      // 主键区：容器宽固定 15 单位；特殊键定宽、其余键 flex:1 均分，六行左右两端都齐
      '.wcd-kb-main{--u:30px;width:calc(var(--u) * 15 + 14 * 3px);display:flex;flex-direction:column;gap:3px}',
      '.wcd-kb-row{display:flex;gap:3px;width:100%}',
      // 辅助区与小键盘：严格 grid，列宽固定
      '.wcd-kb-nav{display:grid;grid-template-columns:repeat(3,32px);grid-auto-rows:40px;gap:3px}',
      '.wcd-kb-pad{display:grid;grid-template-columns:repeat(4,32px);grid-auto-rows:40px;gap:3px}',
      '.wcd-key{flex:1 1 0;min-width:0;height:40px;border-radius:6px;background:var(--wcd-plot);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;',
      'overflow:hidden;box-sizing:border-box;font-variant-numeric:tabular-nums}',
      '.wcd-key-ghost,.wcd-key-ghost[data-on="true"]{background:transparent}',
      // grid 区里的键交给单元格拉伸：跨行的 + 和回车才能真正占满两行
      '.wcd-kb-nav .wcd-key,.wcd-kb-pad .wcd-key{height:auto;min-height:40px}',
      // 每一格 = 一块立方体土地：下层是前壁（放键名），上层是土壤面（作物种在上面）
      '.wcd-key.wcd-plot{display:block;position:relative;overflow:visible;background:transparent;',
      'cursor:pointer;border-radius:6px;transition:box-shadow .15s ease}',
      '.wcd-key.wcd-plot:hover{z-index:20;box-shadow:0 3px 8px rgba(0,0,0,.14)}',
      // 果冻：移入轻弹一下，按下幅度更大
      '@keyframes wcd-jelly-soft{0%{transform:scale(1)}35%{transform:scale(1.05)}70%{transform:scale(.99)}100%{transform:scale(1)}}',
      '@keyframes wcd-jelly{0%{transform:scale(1)}25%{transform:scale(.9)}55%{transform:scale(1.08)}80%{transform:scale(.97)}100%{transform:scale(1)}}',
      '.wcd-plot:hover{animation:wcd-jelly-soft .28s ease}',
      '.wcd-plot:active{animation:wcd-jelly .36s cubic-bezier(.2,.9,.3,1)}',
      // 自定义气泡提示（不用原生 title）
      '.wcd-plot::after{content:attr(data-tip);position:absolute;left:50%;top:100%;transform:translateX(-50%);',
      'margin-top:4px;background:rgba(28,24,18,.92);color:#fff;font-size:10px;line-height:14px;',
      'padding:2px 6px;border-radius:5px;white-space:nowrap;pointer-events:none;opacity:0;z-index:5}',
      '.wcd-plot:hover::after{opacity:1}',
      '.wcd-key-ghost::after{display:none}',
      '.wcd-plot-side{position:absolute;left:0;right:0;top:calc(100% - 18px);bottom:0;border-radius:0 0 6px 6px;',
      'background:var(--plot-side,#8a6642)}',
      '.wcd-plot-top{position:absolute;left:0;right:0;top:0;height:calc(100% - 12px);border-radius:6px;',
      'background-color:var(--plot-top,#ccd89a);',
      // 底部一条 6px 深绿边框 = 草根与土层的分界（草地的厚度感）
      'box-shadow:inset 0 -6px 0 color-mix(in srgb, var(--plot-top,#ccd89a) 55%, #2c5a22)}',
      // 作物画布统一 30x60、根统一落在画布底部；整体上移到土壤面中心（上移上层高度的 50%）
      // 固定 30x66 的渲染尺寸，宽键（空格、0）也按同一比例画，所有植物一样大
      '.wcd-sway{position:absolute;left:50%;bottom:calc(6px + 50%);width:30px;height:66px;',
      'transform:translateX(calc(-50% + var(--cx,0px))) translateY(var(--cy,0px)) var(--flip,scaleX(1));',
      'pointer-events:none;z-index:4}',
      '.wcd-crop{display:block;width:100%;height:100%;transform-origin:50% 100%;animation:none}',
      // 只有开启动画时才有名字；具体周期/延时由每格的 inline style 错开
      // 满级植物：金色光晕呼吸，提醒可以点击收获
      '.wcd-sway[data-ripe="true"]{animation:wcd-ripe-pulse 2.4s ease-in-out infinite}',
      '@keyframes wcd-ripe-pulse{',
      '0%,100%{filter:drop-shadow(0 0 3px rgba(255,204,51,.75)) drop-shadow(0 0 1px rgba(255,242,160,.7))}',
      '50%{filter:drop-shadow(0 0 11px rgba(255,204,51,1)) drop-shadow(0 0 3px rgba(255,246,190,.95))}}',
      '@media (prefers-reduced-motion:reduce){.wcd-sway[data-ripe="true"]{animation:none;',
      'filter:drop-shadow(0 0 6px rgba(255,204,51,.9)) drop-shadow(0 0 2px rgba(255,246,190,.8))}}',
      '.wcd-kbd-win[data-anim="true"] .wcd-crop{animation-name:wcd-sway-tilt;',
      'animation-iteration-count:infinite;animation-timing-function:ease-in-out}',
      '@keyframes wcd-sway-tilt{',
      '0%,100%{transform:rotate(calc(-1 * var(--amp,1.8deg)))}50%{transform:rotate(var(--amp,1.8deg))}}',
      '@media (prefers-reduced-motion:reduce){.wcd-crop{animation:none !important}}',
      // 田埂外的小装饰：只做氛围，不吃鼠标
      '.wcd-kbd-deco{position:absolute;inset:0;pointer-events:none}',
      '.wcd-deco{position:absolute;display:block}',
      '.wcd-deco-grass{left:22px;top:4px;width:34px;height:30px;z-index:2}',
      // 栅栏 + 稻草人：卡在右上角，下半截被田埂盖住
      '.wcd-deco-farm{right:10px;top:-6px;width:84px;height:50px}',
      '.wcd-plot-key{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:3;',
      'font-size:9px;line-height:10px;color:#fff;font-weight:700;pointer-events:none;white-space:nowrap;',
      'text-shadow:0 1px 1px rgba(0,0,0,.28)}',
      // 满级：键名换「可收获」，纯金色文字，不发光、不带动画
      '.wcd-plot-key[data-ripe="true"]{color:#e8b31e;font-size:7.5px;letter-spacing:-.2px}',
      '.wcd-nav-deco{position:relative;overflow:hidden;border-radius:6px}',
      '.wcd-nav-svg{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:100%;height:100%;display:block}',
      '.wcd-sprite{position:absolute;width:0;height:0;overflow:hidden}',
      // —— 卦象弹窗 ——
      '.wcd-mask{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;',
      'background:rgba(15,23,42,.28);animation:wcd-fade .16s ease-out}',
      '@keyframes wcd-fade{from{opacity:0}to{opacity:1}}',
      '.wcd-gua{box-sizing:border-box;width:400px;max-width:calc(100vw - 32px);padding:18px 22px 14px;',
      'max-height:86vh;overflow-y:auto;',
      'border-radius:16px;background:var(--wcd-bg);border:1px solid var(--wcd-line);',
      'box-shadow:0 20px 48px rgba(15,23,42,.28);color:var(--wcd-fg);',
      'user-select:none;-webkit-user-select:none;cursor:default;animation:wcd-pop .18s ease-out}',
      '.wcd-gua-head{display:flex;align-items:baseline;gap:8px;margin-bottom:14px}',
      '.wcd-gua-num{font-size:12px;color:var(--wcd-muted)}',
      '.wcd-gua-name{font-size:18px;font-weight:600;letter-spacing:1px}',
      '.wcd-gua-close{margin-left:auto;width:24px;height:24px;border:0;border-radius:8px;background:transparent;',
      'color:var(--wcd-muted);font-size:18px;line-height:1;cursor:pointer}',
      '.wcd-gua-close:hover{background:var(--wcd-hover);color:var(--wcd-fg)}',
      // 卦象：本卦 / 变卦两张爻图并排在上，卦辞与白话在下
      '.wcd-gua-body{display:flex;flex-direction:column;gap:12px}',
      '.wcd-gua-pair{display:flex;gap:32px;align-items:flex-start;justify-content:center}',
      '.wcd-gua-half{display:flex;flex-direction:column;align-items:center;gap:6px}',
      '.wcd-gua-tag{font-size:11px;color:var(--wcd-muted);letter-spacing:1px}',
      '.wcd-gua-move{font-size:12px;line-height:1.6;color:var(--wcd-blue);margin-bottom:8px}',
      '.wcd-gua-change{margin-top:12px;padding-top:10px;border-top:1px solid var(--wcd-line)}',
      '.wcd-yao-row[data-move="true"] .wcd-yao-line,.wcd-yao-row[data-move="true"] .wcd-yao-split i{background:var(--wcd-blue)}',
      '.wcd-yao{display:flex;flex-direction:column;gap:7px;flex:none}',
      '.wcd-yao-row{height:7px}',
      '.wcd-yao-line{display:block;width:76px;height:7px;border-radius:2px;background:var(--wcd-fg)}',
      '.wcd-yao-split{display:flex;gap:12px}',
      '.wcd-yao-split i{display:block;width:32px;height:7px;border-radius:2px;background:var(--wcd-fg)}',
      '.wcd-gua-text{flex:1;min-width:0}',
      '.wcd-gua-judgment{font-size:13px;line-height:1.7;letter-spacing:.3px}',
      '.wcd-gua-gloss{margin-top:10px;font-size:13px;line-height:1.85;color:var(--wcd-muted);',
      'text-align:justify}',
      '.wcd-tarot-en{margin-left:2px;font-size:11px;color:var(--wcd-muted)}',
      // 三张牌阵：横向三列，每列「位置 / 牌面 / 牌名 / 正逆 / 位置专属解读」
      '.wcd-tarot-modal{max-height:86vh;overflow:auto}',
      '.wcd-tarot-spread{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start;margin-top:4px}',
      '.wcd-tarot-slot{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}',
      '.wcd-tarot-slot-name{font-size:11px;color:var(--wcd-muted);letter-spacing:1px}',
      '.wcd-tarot-slot-card{font-size:13px;font-weight:600;line-height:1.3;text-align:center}',
      '.wcd-tarot-slot-text{font-size:11.5px;line-height:1.7;color:var(--wcd-muted);text-align:left}',
      '.wcd-tarot-sum{margin-top:12px;padding-top:10px;border-top:1px solid var(--wcd-line);',
      'font-size:12px;line-height:1.7;color:var(--wcd-fg)}',
      '.wcd-tarot-badge{padding:1px 8px;border-radius:999px;font-size:11px;',
      'color:#8a5a1f;background:rgba(185,128,63,.14);border:1px solid rgba(185,128,63,.35)}',
      '.wcd-tarot-badge[data-rev="true"]{color:#7a4a8a;background:rgba(126,86,158,.14);',
      'border-color:rgba(126,86,158,.35)}',
      '.wcd-tarot-face{flex:none;display:flex;align-items:center;justify-content:center;',
      'width:70px;height:90px}',
      '.wcd-tarot-img{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;',
      'border-radius:8px;user-select:none;-webkit-user-drag:none}',
      '.wcd-tarot-img[data-rev="true"]{transform:rotate(180deg)}',
      '.wcd-gua-foot{margin-top:14px;padding-top:10px;border-top:1px solid var(--wcd-line);',
      'font-size:11px;color:var(--wcd-muted);text-align:center}',
      '@media (prefers-reduced-motion:reduce){.wcd-mask,.wcd-gua,.wcd-mask[data-closing="true"],.wcd-mask[data-closing="true"] > *{animation:none}}',
      // —— 设置页 ——
      '.wcd-form{display:flex;flex-direction:column;gap:18px;max-width:560px}',
      '.wcd-head{display:flex;flex-direction:column;gap:4px}',
      '.wcd-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary);margin:0}',
      '.wcd-intro{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);margin:0}',
      '.wcd-field{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}',
      '.wcd-meta{display:flex;flex-direction:column;gap:2px;min-width:0}',
      '.wcd-name{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary)}',
      '.wcd-desc{font-size:12px;line-height:1.4;color:var(--dsw-alias-label-secondary)}',
      '.wcd-ctl{flex:none;display:flex;align-items:center;gap:8px}',
      '.wcd-input{height:30px;width:112px;padding:0 8px;border-radius:8px;',
      'border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);',
      'color:var(--dsw-alias-label-primary);font-size:13px;font-variant-numeric:tabular-nums;outline:none}',
      '.wcd-input[data-wide="true"]{width:168px}',
      '.wcd-input:focus{border-color:var(--dsw-alias-brand-primary)}',
      '.wcd-range{width:160px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.wcd-range-value{min-width:36px;text-align:right;font-size:12px;',
      'color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.wcd-check{width:16px;height:16px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}',
      '.wcd-actions{display:flex;align-items:center;gap:12px;padding-top:2px}',
      '.wcd-btn{height:30px;padding:0 14px;border-radius:8px;font-size:13px;cursor:pointer;',
      'border:1px solid var(--dsw-alias-brand-primary);background:transparent;color:var(--dsw-alias-brand-primary)}',
      '.wcd-btn:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}',
      '.wcd-btn:disabled{opacity:.45;cursor:default}',
      '.wcd-status{font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.wcd-status[data-kind="saved"]{color:var(--dsw-alias-state-success-primary)}',
      '.wcd-status[data-kind="failed"]{color:var(--dsw-alias-state-error-primary)}',
    ].join('');

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    // 秒 → HH:MM[:SS]
    function fmtDur(sec, withSeconds) {
      var s = Math.max(0, Math.round(sec));
      var out = pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor(s / 60) % 60);
      return withSeconds ? out + ':' + pad2(s % 60) : out;
    }

    // 分钟数 → HH:MM
    function fmtHM(min) {
      return pad2(Math.floor(min / 60)) + ':' + pad2(min % 60);
    }

    // 'HH:MM' / '9:30' / 全角冒号都能认；非法返回 -1
    function parseHM(text) {
      if (typeof text !== 'string') return -1;
      var m = /^\s*(\d{1,2})\s*[:：]\s*(\d{1,2})\s*$/.exec(text);
      if (!m) return -1;
      var hh = Number(m[1]);
      var mm = Number(m[2]);
      if (!(hh <= 23) || !(mm <= 59)) return -1;
      return hh * 60 + mm;
    }

    // '1,2,3' 或 '1-5' → 星期号数组；解析不出任何值就退回周一到周五
    function parseDays(text) {
      var days = [];
      var parts = typeof text === 'string' ? text.split(/[,，\s]+/) : [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!p) continue;
        var r = /^(\d)\s*[-~至]\s*(\d)$/.exec(p);
        if (r) {
          var a = Number(r[1]);
          var b = Number(r[2]);
          for (var d = Math.min(a, b); d <= Math.max(a, b); d++) days.push(d);
        } else if (/^\d$/.test(p)) {
          days.push(Number(p));
        }
      }
      return days.length ? days : [1, 2, 3, 4, 5];
    }

    function toNumber(value, fallback) {
      return typeof value === 'number' && isFinite(value) ? value : fallback;
    }

    function normalizeWeather(value) {
      var w = value && typeof value === 'object' ? value : {};
      return {
        city: typeof w.city === 'string' ? w.city : '',
        code: typeof w.code === 'number' ? w.code : -1,
        temp: toNumber(w.temp, 0),
        feels: toNumber(w.feels, 0),
        high: toNumber(w.high, 0),
        low: toNumber(w.low, 0),
        at: typeof w.at === 'string' ? w.at : '',
        error: typeof w.error === 'string' ? w.error : '',
        hours: Array.isArray(w.hours) ? w.hours : [],
        days: Array.isArray(w.days) ? w.days : [],
      };
    }

    function normalizeAlmanac(value) {
      var a = value && typeof value === 'object' ? value : {};
      var str = function (v) { return typeof v === 'string' ? v : ''; };
      var arr = function (v) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }) : []; };
      return {
        date: str(a.date), lunar: str(a.lunar), ganzhi: str(a.ganzhi),
        zhiXing: str(a.zhiXing), xiu: str(a.xiu), xiuLuck: str(a.xiuLuck),
        tianShen: str(a.tianShen), tianShenType: str(a.tianShenType),
        chong: str(a.chong), sha: str(a.sha),
        yi: arr(a.yi), ji: arr(a.ji),
      };
    }

    function normalizeUsage(value) {
      var u = value && typeof value === 'object' ? value : {};
      function win(w) {
        var x = w && typeof w === 'object' ? w : {};
        return {
          percent: typeof x.percent === 'number' ? Math.max(0, Math.min(100, Math.round(x.percent))) : 0,
          resetsAt: typeof x.resetsAt === 'string' ? x.resetsAt : '',
        };
      }
      return {
        rolling: win(u.rolling),
        weekly: win(u.weekly),
        monthly: win(u.monthly),
        at: typeof u.at === 'string' ? u.at : '',
        keyStatus: typeof u.keyStatus === 'string' ? u.keyStatus : '',
        error: typeof u.error === 'string' ? u.error : '',
      };
    }

    function normalize(value) {
      var v = value && typeof value === 'object' ? value : {};
      return {
        workStart: typeof v.workStart === 'string' ? v.workStart : FALLBACK.workStart,
        workEnd: typeof v.workEnd === 'string' ? v.workEnd : FALLBACK.workEnd,
        workdays: typeof v.workdays === 'string' ? v.workdays : FALLBACK.workdays,
        showSeconds: v.showSeconds === undefined ? FALLBACK.showSeconds : v.showSeconds !== false,
        float: v.float === true,
        anchorX: v.anchorX === 'left' ? 'left' : 'right',
        anchorY: v.anchorY === 'bottom' ? 'bottom' : 'top',
        offsetX: toNumber(v.offsetX, FALLBACK.offsetX),
        offsetY: toNumber(v.offsetY, FALLBACK.offsetY),
        city: typeof v.city === 'string' ? v.city : '',
        requestTimeoutSeconds: clamp(toNumber(v.requestTimeoutSeconds, 30), 5, 120),
        weatherVisible: v.weatherVisible !== false,
        weather: normalizeWeather(v.weather),
        usageVisible: v.usageVisible !== false,
        almanac: normalizeAlmanac(v.almanac),
        usage: normalizeUsage(v.usage),
        volume: clamp(toNumber(v.volume, 70), 0, 100),
        keyStats: typeof v.keyStats === 'string' ? v.keyStats : '',
        keyAnim: v.keyAnim !== false,
        keySize: v.keySize === 'small' || v.keySize === 'large' ? v.keySize : 'medium',
        keyCrops: typeof v.keyCrops === 'string' ? v.keyCrops : '',
        cropStock: typeof v.cropStock === 'string' ? v.cropStock : '',
        notes: typeof v.notes === 'string' ? v.notes : '',
        keyPanelDX: toNumber(v.keyPanelDX, 0),
        keyPanelDY: toNumber(v.keyPanelDY, 0),
      };
    }

    // 设置页只写这几个字段。锚点与偏移必须原样保留 —— 否则用户拖好的位置会被一次保存冲回默认角。
    function editable(value) {
      var cfg = normalize(value);
      return {
        workStart: cfg.workStart,
        workEnd: cfg.workEnd,
        workdays: cfg.workdays,
        showSeconds: cfg.showSeconds,
        float: cfg.float,
        city: cfg.city,
        requestTimeoutSeconds: cfg.requestTimeoutSeconds,
        weatherVisible: cfg.weatherVisible,
        usageVisible: cfg.usageVisible,
        keyAnim: cfg.keyAnim,
        keySize: cfg.keySize,
        volume: cfg.volume,
      };
    }

    // <input type="time"> 只认 HH:MM，配置里写了 9:00 也要能显示出来
    function timeInputValue(text) {
      var min = parseHM(text);
      return min < 0 ? '' : fmtHM(min);
    }

    function viewport() {
      return {
        w: typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 0,
        h: typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 0,
      };
    }

    // 浮窗席位可用性：'overlay' = 浮层登记成功；'header' = 浮层登记失败，改由头部席位出画浮窗
    var floatSeat = 'overlay';

    function clamp(v, lo, hi) {
      return Math.min(Math.max(v, lo), hi < lo ? lo : hi);
    }

    // 桌面版标题栏高度（win32 上 40px）：窗口按钮画在网页之上，浮窗不能落进这条带子
    function titlebarHeight() {
      try {
        var raw = getComputedStyle(document.documentElement).getPropertyValue('--dsh-windows-titlebar-height');
        var n = parseFloat(raw);
        return isFinite(n) && n > 0 ? n : 0;
      } catch (e) {
        return 0;
      }
    }

    // 纯锚边定位：只算 left/right + top/bottom 与偏移，拖动位移另用 transform 叠加
    function anchorStyle(cfg) {
      var s = {};
      var x = Math.round(cfg.offsetX) + 'px';
      var y = Math.round(cfg.offsetY) + 'px';
      if (cfg.anchorX === 'left') s.left = x;
      else s.right = x;
      if (cfg.anchorY === 'bottom') s.bottom = y;
      else s.top = 'calc(var(--dsh-windows-titlebar-height, 0px) + ' + y + ')';
      return s;
    }

    // 自检：把「席位登记 / 浮窗挂载」的结果写回配置，宿主侧直接可读，不依赖控制台
    function reportDiag(ctx, text) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var current = hit.value && typeof hit.value.diag === 'string' ? hit.value.diag : '';
        if (current === text) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { diag: text }, hit.revision).then(function () {}, function () {});
      }).catch(function () { /* 自检写不进去也不能影响主流程 */ });
    }

    function getRemote(ctx) {
      try {
        return ctx.get('remote') || null;
      } catch (e) {
        return null;
      }
    }

    // 读本插件这一行的配置投影（含 revision，保存时要带上）
    function describeNamespace(ctx) {
      var remote = getRemote(ctx);
      if (!remote || !remote.settings || typeof remote.settings.describe !== 'function') {
        return Promise.resolve(null);
      }
      return remote.settings.describe().then(function (res) {
        if (!res || !res.ok) return null;
        var list = (res.value && res.value.namespaces) || [];
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].ns === NS) return list[i];
        }
        return null;
      });
    }

    // 拖动结束后回写锚边偏移。revision 过期就重读再试一次；失败也只是位置没记住。
    function persistOffsets(ctx, offsetX, offsetY, retried) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { offsetX: offsetX, offsetY: offsetY }, hit.revision).then(function (res) {
          if (res && res.ok) return;
          var msg = (res && res.error && res.error.message) || '';
          if (!retried && /revision|conflict/i.test(msg)) persistOffsets(ctx, offsetX, offsetY, true);
        }).catch(function () { /* 位置没记住不影响本次拖动 */ });
      }).catch(function () { /* 读不到配置就只移动这一次 */ });
    }

    // —— 键盘统计：只数 DSH 窗口内的按键，按 event.code 累计，节流写回配置 ——
    var KEY_STATS = {};
    var KEY_STATS_DIRTY = false;
    var KEY_STATS_LOADED = false;
    // 每格植物的外观（作物/翻转/偏移/幅度）：第一次按下时随机定下，与次数一起持久化
    var KEY_LOOKS = {};
    var LOOKS_DIRTY = false;
    // 满级阈值：到了就能收获，主面板入口挂红点提醒
    var RIPE_AT = 1000;

    // 每种作物的库存：跨会话累计，键盘底部和设置页都读这里
    var CROP_STOCK = {};
    var STOCK_DIRTY = false;

    function parseStock(raw) {
      var map = parseCrops(raw);
      var out = {};
      for (var k in map) {
        var n = Number(map[k]) || 0;
        if (CROP_KINDS.indexOf(k) >= 0 && n > 0) out[k] = Math.floor(n);
      }
      return out;
    }

    function addStock(crop, n) {
      if (CROP_KINDS.indexOf(crop) < 0) return;
      CROP_STOCK[crop] = (CROP_STOCK[crop] || 0) + Math.max(1, Math.floor(Number(n) || 1));
      STOCK_DIRTY = true;
    }

    function stockTotal() {
      var sum = 0;
      for (var k in CROP_STOCK) sum += Number(CROP_STOCK[k]) || 0;
      return sum;
    }

    // —— 便笺 ——
    // 每张便笺自己记 id / 正文 / 固定定位的 left,top；改一次写一次配置（打字节流 500ms）
    var NOTES = [];
    var NOTES_LOADED = false;
    var NOTES_DIRTY = false;
    var NOTES_TIMER = null;
    var NOTE_SUBS = [];

    function noteId() {
      return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function noteNotify() {
      for (var i = 0; i < NOTE_SUBS.length; i++) {
        try {
          NOTE_SUBS[i]();
        } catch (e) {
          /* 某个订阅者挂了不影响别人 */
        }
      }
    }

    function parseNotes(raw) {
      if (typeof raw !== 'string' || raw === '') return [];
      try {
        var arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        var out = [];
        for (var i = 0; i < arr.length; i++) {
          var it = arr[i];
          if (!it || typeof it !== 'object' || typeof it.id !== 'string') continue;
          out.push({
            id: it.id,
            text: typeof it.text === 'string' ? it.text : '',
            x: Number(it.x) || 0,
            y: Number(it.y) || 0,
          });
        }
        return out;
      } catch (e) {
        return [];
      }
    }

    // 便笺写入走和统计同一套 revision 重试
    function persistNotes(ctx, json, retried) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { notes: json }, hit.revision).then(function (res) {
          if (res && res.ok) return;
          var msg = (res && res.error && res.error.message) || '';
          if (!retried && /revision|conflict/i.test(msg)) persistNotes(ctx, json, true);
        }).catch(function () { /* 没存上就等下一次改动再写 */ });
      }).catch(function () { /* 配置读不到就只在内存里 */ });
    }

    function flushNotes(ctx) {
      if (!NOTES_DIRTY || !NOTES_LOADED) return;
      NOTES_DIRTY = false;
      persistNotes(ctx, JSON.stringify(NOTES), false);
    }

    // 打字时别一个字符写一次盘
    function scheduleFlushNotes(ctx) {
      if (NOTES_TIMER) clearTimeout(NOTES_TIMER);
      NOTES_TIMER = setTimeout(function () {
        NOTES_TIMER = null;
        flushNotes(ctx);
      }, 500);
    }

    // 主面板点一次就新建一张，位置错开叠放
    function addNote(ctx) {
      var win = typeof window !== 'undefined' ? window : null;
      var vw = (win && win.innerWidth) || 1280;
      var vh = (win && win.innerHeight) || 800;
      var step = (NOTES.length % 6) * 22;
      NOTES.push({
        id: noteId(),
        text: '',
        x: Math.max(12, Math.round(vw / 2 - 120 + step)),
        y: Math.max(56, Math.round(vh / 2 - 140 + step)),
      });
      NOTES_DIRTY = true;
      noteNotify();
      flushNotes(ctx);
    }

    function findNote(id) {
      for (var i = 0; i < NOTES.length; i++) {
        if (NOTES[i].id === id) return NOTES[i];
      }
      return null;
    }

    function setNoteText(ctx, id, text) {
      var n = findNote(id);
      if (!n || n.text === text) return;
      n.text = text;
      NOTES_DIRTY = true;
      scheduleFlushNotes(ctx);
    }

    function setNotePos(ctx, id, x, y) {
      var n = findNote(id);
      if (!n || (n.x === x && n.y === y)) return;
      n.x = x;
      n.y = y;
      NOTES_DIRTY = true;
      flushNotes(ctx);
    }

    // × 表示这件事办完：直接把这张便笺扔掉
    function doneNote(ctx, id) {
      for (var i = 0; i < NOTES.length; i++) {
        if (NOTES[i].id !== id) continue;
        NOTES.splice(i, 1);
        NOTES_DIRTY = true;
        noteNotify();
        flushNotes(ctx);
        return;
      }
    }

    function keyStatsHasRipe() {
      for (var k in KEY_STATS) {
        if (Number(KEY_STATS[k]) >= RIPE_AT) return true;
      }
      return false;
    }

    function parseKeyStats(raw) {
      if (typeof raw !== 'string' || raw === '') return {};
      try {
        var obj = JSON.parse(raw);
        return obj && typeof obj === 'object' ? obj : {};
      } catch (e) {
        return {};
      }
    }

    // 与拖动回写同一套 revision 重试；失败只是这一次没存上
    function persistKeyStats(ctx, json, looksJson, stockJson, retried) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { keyStats: json, keyCrops: looksJson, cropStock: stockJson }, hit.revision).then(function (res) {
          if (res && res.ok) return;
          var msg = (res && res.error && res.error.message) || '';
          if (!retried && /revision|conflict/i.test(msg)) persistKeyStats(ctx, json, looksJson, stockJson, true);
        }).catch(function () { /* 没存上不影响当前统计 */ });
      }).catch(function () { /* 配置读不到就只在内存里累计 */ });
    }

    function flushKeyStats(ctx) {
      if (!KEY_STATS_DIRTY && !LOOKS_DIRTY && !STOCK_DIRTY) return;
      // 历史数据还没读回来就先不写，否则会把之前的累计覆盖掉
      if (!KEY_STATS_LOADED) return;
      KEY_STATS_DIRTY = false;
      LOOKS_DIRTY = false;
      STOCK_DIRTY = false;
      persistKeyStats(ctx, JSON.stringify(KEY_STATS), JSON.stringify(KEY_LOOKS), JSON.stringify(CROP_STOCK), false);
    }

    // 定时器被系统睡眠打断时，客户端会写这个字段让宿主补刷
    function persistPing(ctx, retried) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { ping: String(Date.now()) }, hit.revision).then(function (res) {
          if (res && res.ok) return;
          var msg = (res && res.error && res.error.message) || '';
          if (!retried && /revision|conflict/i.test(msg)) persistPing(ctx, true);
        }).catch(function () { /* 补刷失败不影响渲染 */ });
      }).catch(function () {});
    }

    // 键盘浮窗拖动结束后回写偏移；和拖动胶囊一样带 revision 重试
    function persistKeyPanel(ctx, dx, dy, retried) {
      describeNamespace(ctx).then(function (hit) {
        if (!hit) return;
        var remote = getRemote(ctx);
        if (!remote || !remote.settings || typeof remote.settings.update !== 'function') return;
        remote.settings.update(NS, { keyPanelDX: dx, keyPanelDY: dy }, hit.revision).then(function (res) {
          if (res && res.ok) return;
          var msg = (res && res.error && res.error.message) || '';
          if (!retried && /revision|conflict/i.test(msg)) persistKeyPanel(ctx, dx, dy, true);
        }).catch(function () { /* 没记住也不影响本次拖动 */ });
      }).catch(function () { /* 读不到配置就只移动这一次 */ });
    }

    function keyStatsTotal() {
      var n = 0;
      for (var k in KEY_STATS) n += Number(KEY_STATS[k]) || 0;
      return n;
    }

    // 清空统计（设置页的重置按钮用）
    function resetKeyStats(ctx) {
      KEY_STATS = {};
      KEY_LOOKS = {};
      CROP_STOCK = {};
      KEY_STATS_DIRTY = true;
      LOOKS_DIRTY = true;
      STOCK_DIRTY = true;
      flushKeyStats(ctx);
    }

    // 天气码 → 本地化文案
    function weatherText(code, t) {
      var group = WX_GROUP[code];
      return group ? t('wx.' + group) : t('wx.unknown');
    }

    function tempText(n) {
      return Math.round(Number(n) || 0) + '°C';
    }

    // 用量环：浅灰底环 + 进度弧，弧长按「已用百分比」画；颜色按档位变
    function usageColor(pct) {
      if (pct >= 90) return '#ef4444';
      if (pct >= 70) return '#f59e0b';
      return '#4c8dff';
    }

    function UsageRing(props) {
      var pct = Math.max(0, Math.min(100, Math.round(props.percent || 0)));
      var size = props.size || 26;
      var stroke = props.stroke || 2.6;
      var r = (size - stroke) / 2;
      var c = 2 * Math.PI * r;
      var color = usageColor(pct);
      return h(
        'svg',
        {
          className: 'wcd-ring',
          viewBox: '0 0 ' + size + ' ' + size,
          width: size,
          height: size,
          'aria-hidden': true,
          focusable: false,
        },
        h('circle', { cx: size / 2, cy: size / 2, r: r, fill: 'none', stroke: '#e8eaed', strokeWidth: stroke }),
        h('circle', {
          cx: size / 2,
          cy: size / 2,
          r: r,
          fill: 'none',
          stroke: color,
          strokeWidth: stroke,
          strokeLinecap: 'round',
          strokeDasharray: c,
          strokeDashoffset: c * (1 - pct / 100),
          transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')',
        }),
        h(
          'text',
          {
            x: size / 2,
            y: size / 2,
            textAnchor: 'middle',
            dominantBaseline: 'central',
            fontSize: props.fontSize || (size >= 32 ? 12 : 10),
            fontWeight: 600,
            fill: '#1f2328',
          },
          String(pct),
        ),
      );
    }

    // 重置时间：今天只显示时刻，别的日子带上月/日
    function resetText(iso) {
      if (typeof iso !== 'string' || !iso) return '';
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      var now = new Date();
      var sameDay =
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      return (sameDay ? '' : (d.getMonth() + 1) + '/' + d.getDate() + ' ') + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    }

    // 木鱼音源：freesound.org/people/Sadiquecat/sounds/742279/
    // 「Temple block - Lunarlander 1969」by Sadiquecat，CC0 1.0 公共领域，时长 1.206s。
    // 高质量预览版（30KB）内嵌成 base64，运行时零网络请求、零额外路由；
    // 原始文件同时留在 assets/knock.mp3，换音色时替换它并重新编码即可。
    var KNOCK_B64 = "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";

    var audioCtx = null;
    var knockBuffer = null;
    var knockDecoding = null;

    function base64ToArrayBuffer(input) {
      var bin = window.atob(input);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes.buffer;
    }

    // 解码只做一次，之后所有敲击共用同一个 AudioBuffer
    function ensureKnock(ac, done) {
      if (knockBuffer) {
        done(knockBuffer);
        return;
      }
      if (!knockDecoding) {
        knockDecoding = ac
          .decodeAudioData(base64ToArrayBuffer(KNOCK_B64))
          .then(function (buffer) {
            knockBuffer = buffer;
            return buffer;
          })
          .catch(function () {
            knockDecoding = null;
            return null;
          });
      }
      knockDecoding.then(done, function () {
        done(null);
      });
    }

    function playKnock(volume) {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        var ac = audioCtx;
        if (ac.state === "suspended" && ac.resume) ac.resume();
        // 音量 0~100：0 时只留动画，不出声
        var vol = clamp(toNumber(volume, 70), 0, 100) / 100;
        if (!vol) return;
        // 首次敲击时才解码（毫秒级），期间静默；解码失败退回合成音
        ensureKnock(ac, function (buffer) {
          if (!buffer) {
            playKnockSynth(ac, vol);
            return;
          }
          var t = ac.currentTime;
          var dur = Math.min(1.15, buffer.duration);
          var src = ac.createBufferSource();
          src.buffer = buffer;
          var g = ac.createGain();
          // 尾部做个 60ms 淡出，避免波形被硬切出"啪"的一声
          g.gain.setValueAtTime(vol, t);
          g.gain.setValueAtTime(vol, t + Math.max(0, dur - 0.06));
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          src.connect(g);
          g.connect(ac.destination);
          src.start(t);
          src.stop(t + dur + 0.01);
        });
      } catch (e) {
        /* 没有音频设备或被策略拦截：静默即可 */
      }
    }

    // 兜底音色：内嵌音源解码失败时用（实时合成，无素材）
    function playKnockSynth(ac, vol) {
      try {
        var t = ac.currentTime;
        var sr = ac.sampleRate;
        if (!knockNoise || knockNoise.sampleRate !== sr) {
          var n = Math.max(1, Math.floor(sr * 0.14));
          knockNoise = ac.createBuffer(1, n, sr);
          var d = knockNoise.getChannelData(0);
          for (var i = 0; i < n; i++) {
            var p = i / n;
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 3.2);
          }
        }
        var master = ac.createGain();
        master.gain.value = 0.9 * (typeof vol === "number" ? vol : 1);
        master.connect(ac.destination);
        function layer(type, freq, q, level, decay) {
          var src = ac.createBufferSource();
          src.buffer = knockNoise;
          var f = ac.createBiquadFilter();
          f.type = type;
          f.frequency.value = freq;
          if (q) f.Q.value = q;
          var g = ac.createGain();
          g.gain.setValueAtTime(level, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
          src.connect(f);
          f.connect(g);
          g.connect(master);
          src.start(t);
          src.stop(t + decay + 0.03);
        }
        layer("highpass", 1200, 0, 0.8, 0.014);
        layer("bandpass", 2800, 3, 0.8, 0.05);
        layer("bandpass", 1500, 2.6, 0.55, 0.08);
      } catch (e) {
        /* 静默 */
      }
    }

    var knockNoise = null;

    // 木鱼 + 敲棍：渐变木色、鱼口阴线、木纹、底部投影
        // 七个工具图标：用户自绘 16×16 像素 PNG，转成 data URI 内联。
    // 客户端模块没有可用的插件目录 URL（页面里没有独立请求），只能内联。
    var ICON_BUTTON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABqUlEQVR4AYyQu0vDUBTGvyqJVvCBD7AgIj4QUXQQHBRxcRNxVMFR3BRxc1fxT5Di4FREXDq0XboIdlBw0RYdbKUtClKLjxapbfV6v6QJSWvBkN+95xzO+eXm1qDqowqgnMrmKgJVfOxvgjxMd8JAF9olfwj0YbalfcfcTCgql5QJqg/TojS0crNhEahiLRAHv0psXZZkbNEtM96N3ORbEujDMsdNmqsdfpn1nfAncjUqBpePZIMukQJVzPuSsgBEbh/hzArcxwWCiYJJ4O4Z/vd6rYdLobEevWu8H1VIAUs6xfQrVpRJPbGsdT+Klp18NeHt0gslk9Ng0SZggSwXB7jZOBVdUJr7bDUmmiDiDTFGKpVBz9IqnO0j2C4MmWx996PW2aH1GEv67FALNQEj/v/wwhScLhfQNYy2mVUbLRMLMDCGOWcKmPAkUX8I3bPjcE2NVsAe6zBzKcg7Yu4l8AJZIIngFaJut0nM40F4bwPW4Zenc9mad0iB3JF3XOzOMfgXxjCbSwKG+kkYlSOyWbNkHWbRImCadyT969C4PkDSAgcJ5GnZafALAAD//9EFIk4AAAAGSURBVAMAiom6SctIojgAAAAASUVORK5CYII=";
    var ICON_TUBE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABt0lEQVR4AXyRXShDYRzGn7lArpQoXyVRSnFBEbUkRa5InWvtgpKi3blxq3xFuZALKXe74Wa+c7GUj5haxjKy5nOWkc1ktR3neW1v+zhZ53nP+/8/z//3vu1kIf6LxVR19OhVZZmXXa7qiV66JMB84hceB9+2JhA4mkLizf2Z0gZ6IpS0SMBcc5Fhydgghm4sx7ibtcKzvC3e3FeYOnFs6smASADpPCmwfoD5NRtmdh1wOd1S1vEVVClNGRAJ4K2U8C0K+tsw0mtEriEH1qdvqe7hPtQ73OhxhBiVSgGwS0j1QCumN8xY2ByTarkOIWrxMpIiCQhH7g177YsIfH7AnG/HeWUxBqOHULRb1dmuENy6FIPPp3tgVhTaIgHaXj6FailWA1a8/xQJYMJIH2ZfF0DD4VLFsK1rEsZ2hS1d6QL8hkcZHrj4uzobxY0d/3/GkiETc+DpPLmmrB+2fYuQMHQW3Rswl3zylz2CWpOZ7QylANQTL1528kTI9bACKubRSp8K5/Kstsl8JICfhv9yAkIQxTo36BOT9JkTRXyRANY0GeJQQuxT7NPnPlkpABoMMZwu9umn6xcAAP//WG1oVQAAAAZJREFUAwBzJfT9QrJKDwAAAABJRU5ErkJggg==";
    var ICON_TAROT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABzUlEQVR4AYySSyisYRjH/99hFseZ4+RQyKVkQVZSSEqspJRIFiRFRGEhK3sLyiVJMqxYiIWUjWIvQqa+ciuaGbcyLs0YMaPx/R+9nxkzyjS/5/mey/eb3rf5hc9P0Hj8Ccba51cJgrkJ/1Ccmgzr7xR0Fg1Fpbt0jm/yR5gFCuRlVnExAaYwGvKWzDrgvxWx0TAlFBg10FzwF2NNGfLsjtFATm9n8T/5DXaXTfqxliTJoUEE5VnxmN/zoH/5yZw5zkcwUZcudW1akkh0l46jmxvpqSCCBd0t9dvrneRDtw79QUONzYPFlUzMHAdgv/fK7GugQPO++KRvtcRKZsjKqMTVqwvrD0HJFTntbEdAQURTNSg58eygKr9PWtaEP5jq3UJngdyVXGSYwOsPyGJooIRHOvc5MNy8KaPS7DjJDGGC1pLIW+aSYm7ZCXLg/Dgy+6agOiceXWuP7OHMuR6V6QM/FLJoBFPAgVHDvtZj4tgfALnQJxCK9/maqxqDKWBRmOhHW8soRptW4RvcQEWjQyir34aituOEqyZKoNG647aAqOnLmQ1fudwdVmPJSsBCJBSxIIf3j4gGZ4pQAXtyrsnrbYzr8q9k/R3cxzsAAAD//0/l8/sAAAAGSURBVAMA/5LfyAXvklMAAAAASUVORK5CYII=";
    var ICON_TOMATO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABaElEQVR4AZSRzytEURzFj2eGbFjMTEaJiEJTyuwxe6kpFH+AlIWysJg/wEKyU0opNVmQZi0LJMWOMllopiGFZzSIpgk9nW/u7c7wXs2rc398v+d87reeBZfPX9vkKLlYpOwKYHd8o5+bp/4A+Gp8PeqMrHUhs/8iYd6nNgdlIikYSxmA4Wi9H/dzNzhcyIptYLIdpwkbZ9PnaPM5oEcav4sGsHEVCSPZHRANL3Uiv5MTxZY7MBMIiRabg2UQAahwXV8ErSuraBiKIbv9gb2eFlE6aSMe8on4sAkRAIsMByfiPKJ4dIBd25EzF/NMEGtKlnqdYasxjLv5WdXz3NUUeoLSRQbF4xMJ9V4+yK6Wyruqc9eA59QWKBarkQZUEzK91uf3a03liPydpsm8p56+pJV4zINZPcH1e0kaXosKmx4BkDSaKyD95g4xw+p1ggTAAyFjtwXQ+J/oocww7xrACyE0eIkeepV+AAAA//9qxFWYAAAABklEQVQDALeuq9FZBupHAAAAAElFTkSuQmCC";
    var ICON_NOTE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABZklEQVR4AaSSzStEURjGn7kaH4mNjSzkT6B8xCTNShY2slLSZKN87JRkrUFRGmWDblNE003JQulKE6XIZGuFxahZyCDlu+fUezrXvTVTc+vX+zznvO9zzz1dCyU+noBwWe1vMZjv9ARw4/1tD+TxdERVapNMPAK+hL3EF8BFsrN8zOLj4+sF2atJHRIYMDq8jopwOY7WtkEtSFroNS8SgQEbyTHE7AX0jg+BWtBThggMMPZxvZVSp7g/SZvLWgcGzE+sgrCrJTaoTtEY7ab1oQN4s7xtdswmpkCoC6ECzOGDJQdEBvkJoh/shEhdLXOYq/3TAyDUhJ/A+nx5iM3ULaUHdQJukqeMA1ZiavrzpOsZFGN9fudD9T02yP7KBfgDkd3FtNb0d7kf9HXUqDn2co5GnUBMV2sDop1NikhbHYjpq6or4bg5mI8K4AJDmmfOILTP3YD893E3C/ZyhugAGm4UA3uFPwAAAP//8pe+5AAAAAZJREFUAwDnjtQhv1w0IAAAAABJRU5ErkJggg==";
    var ICON_PALETTE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB10lEQVR4AWyRSyh0cRjGn5n6sPgu8y1mvmw+JdHEAqMoSZEohcWUlUkSwmIWVthYsSOhREmULMnGZWFyHbktGJRQU5oxriNyieF5c/6dGXOa3znv/3nf55n3dIyIcsX+MIf0RBlR0rcAGp9eLqCHmnJEFGEBHKSRM7vuAAhrauxpUNNQAWx6dvZEpzEnLxVEhM8bQzQ4+ynJTwIo+JuLYHLk49pmxe+fIWnqbwwl1BhED2sji6P/8XhzbfMszBVkgNsQCif7F7INN4qLsVBSyAZDNz64fY+Is8cKDqcZiakWQU1GFAznn0sAe7aiEGJqrQpqGgxbX9qXI9eX4usmAVUFf/HHHv8lRX+kZ5vl00Z2JWAwoUvpNacPII6NMtR7l5Vu0F0DGW6lS8D93SMOzDNocJ2pBovbcwOq164EnvV09izI0fj8GjCMjTrRPzwPW1IuViYDwubWL1zOmuCd9wmukpZQk7VD8DzPgh56ZQMWFLb7MxE8Dgr/3lvhP7hRNJrK4bn3CsPHfaCHK0gACwoMqbC0gXRnWTDdnozg4aIw7kxBemUpVv1TykyfCuBBC2EQX6lvZBXFWYmwF6bJKw701oWZ6QkLoMAQwhAatKdxYuWbmfMfAAAA//8iE605AAAABklEQVQDAOWp+3ux9SxJAAAAAElFTkSuQmCC";
    var ICON_CLOCK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwElEQVR4AYyTTSiDcRzHv15vThQlIRcXN5RSO4mDlwM5aMkFNwc5UEgkpRy8lEKSkxDRiFrIS6wlL4dlq51W29iGvRRm9dj3n+e/zZ6V1Wf/3/P7/b7f3+959iwdGp/szFwl6DpQvkMWxbddr0zUFivMabRC00BtdG/1q2HKU9MgHPGl5RZ1Ym7BiuGRe0zchMAcXbgJYUySDFgkPsc6Rg0LmD5Zhcc6BeaIx7YI+3KVuE4yYEPQuw/vYx+CW+N4P5oXBM53hMi1UYmKmjGxGcVEbkAxp345jfCbrpHXewp/6RAyll4x99KC1pUMOMzP2O/KxuxDQN6SNKAbCRkPkd+xw1DS1lAHXXMjei4LZU4NhAGnc3WuzMks3j05kWWxMRTQpLG9S5js6Qu0n4HojH5RHD1Q0TeIErOdYUrEBqzy3nn+h2A4ItukgZpRp/P64tYEwjgV0oBPnk3HZ3c8kmDesLcLfY41oSYM+JaVdZvhe3Kj2TkJNv+F4qbwlRDrN73JPyNNqmccsDk+UG4ahmFzLUZ0ss5/LcQDxjcpZkJswIDQhO5maxi6T0uMX3H8f4L9JMGACZrwTdOCNfbE8wMAAP//ozQ2GAAAAAZJREFUAwBGge/J07SIDwAAAABJRU5ErkJggg==";

    // 像素图标统一 32×32 盒子（16×16 的整数 2 倍）；pixelated 防止浏览器用插值抹平像素边界
    function pixelIcon(src) {
      return function PixelIcon() {
        return h('img', {
          src: src,
          width: 32,
          height: 32,
          alt: '',
          'aria-hidden': true,
          draggable: false,
          style: { imageRendering: 'pixelated' },
        });
      };
    }
    var FishIcon = pixelIcon(ICON_BUTTON);
    var TubeIcon = pixelIcon(ICON_TUBE);
    var TarotIcon = pixelIcon(ICON_TAROT);
    var FarmIcon = pixelIcon(ICON_TOMATO);
    var NoteIcon = pixelIcon(ICON_NOTE);
    var RgbIcon = pixelIcon(ICON_PALETTE);
    var ClockIcon = pixelIcon(ICON_CLOCK);
    // 签筒图标：竹筒 + 三支露出筒口的签（红头）。比木鱼高一点、筒身加宽，视觉上才不显小。
        // 塔罗 22 张大阿卡那：牌名 / 英文 / 正位解读 / 逆位解读
    // 解读为本次自撰的白话（不抄任何现有塔罗译本），语气与卦辞白话一致。
    var TAROT = [
      ["愚者", "The Fool", "牌面上一只脚已经踏出悬崖，手里拎个小包袱，天上太阳正亮，脚边小狗还在叫。这张牌讲的是开始：什么都没准备好，但就是该走了。想得太周全的人反而迈不出第一步，先动起来，路是一边走一边长出来的。感情上心动就去，别先算结果；钱上小试可以，别押身家。你现在最值钱的资产是轻，别急着背上太重的东西。", "牌还是那张，气氛却不对了。想得美却一步没动，或者准备不足就冲出去，摔了还不知道为什么。逆位讲的是不落地：计划停在嘴上，冲动当成了勇气。感情上别信听着很美的承诺，也别说自己做不到的话。钱上花得没谱，先记账。跟人相处，说得比做得好听的人早晚露馅，别学他，也别信他。"],
      ["魔术师", "The Magician", "桌上摆满家伙，星币宝剑权杖圣杯都在，手举起来指着天。这张牌说：资源你其实都有，缺的是动手。会做事的人不缺机会，缺机会的人往往是不敢开场。现在正适合把本事摆到台面上，主动一点，回应比你想象的快。感情上主动出击有回音，钱上靠本事挣别指望运气。你能说服人，但别拿这份说服力去投机。", "同样的牌，能量走岔了。有本事却用错地方，或者光会说，一到动手就散。逆位提醒你：小心被漂亮话绕进去，也小心自己变成说漂亮话的人。感情上遇到特别会说的，先看对方做过什么。钱上所有稳赚的局都别碰。跟人相处，讲得越顺口的越要验一下，包括你自己的说辞。"],
      ["女祭司", "The High Priestess", "她坐在两根柱子中间，身后一层薄纱，手里握着卷轴却不打开。这张牌讲的是还没到时候：答案你心里有，只是被外面的声音盖住了。现在最该做的是安静，多看少表态，让人先说。感情上对方没说的往往比说的重要，别急着逼问。钱上信息不够，别下注。跟人相处，沉默有时比表态有分量。", "纱被掀开一半，露出的是自欺。你在骗自己，或者被情绪牵着走；明知有问题还装作看不见。逆位让你把眼睛睁开：那些让你不太舒服的细节，通常就是答案。感情上别再替对方找理由。钱上直觉失灵期，别凭感觉操作。跟人相处，有事瞒着别人，也有事瞒着自己，先对自己诚实。"],
      ["皇后", "The Empress", "她坐在麦田里，身边是熟透的果实，脚边还有水在流。这张牌讲的是滋养：养一个项目、养一段关系、养自己的身体，都需要时间。现在不是催结果的时候，是把水和肥给足的时候。感情上温柔和照顾是主线，别急着要回报。钱上适合享受，也适合投资自己。你的亲和力本身就是资源。", "果实没人收，麦子开始倒。付出过头变成讨好，或者干脆懒散到什么都不管。逆位提醒你：先把自己喂饱。感情上单向付出该停了，停不是绝情，是保住自己。钱上容易冲动消费，尤其在情绪低的时候。跟人相处，别用讨好换关系，换来的最不牢。"],
      ["皇帝", "The Emperor", "他端坐在石座上，身后是荒山，手里握着权杖。这张牌讲的是规矩：该拍板就拍板，该划边界就划边界。一个团队、一段关系、一笔钱，没有规矩都会慢慢散掉。现在最该做的是把话说清楚：谁负责什么，什么能做什么不能做。感情上关系需要结构，钱上要做预算。你是主心骨，但别硬到没人敢靠近。", "宝座空了，或者坐上去的人在乱挥权杖。控制过头，或者完全没人管，两个极端都会出事。逆位让你检查：是不是在用权威压人？是不是该你负责时躲了？感情上要么太霸道，要么谁都不担责。钱上要么抠死，要么乱花。跟人相处，靠位置压人只能压一时。"],
      ["教皇", "The Hierophant", "他坐在两根柱子之间，脚下放着钥匙，两个弟子跪着听。这张牌讲的是正统：有现成的路、有懂行的人、有既定的规矩，跟着走不吃亏。现在别急着发明新方法，先找个真在行的人带一带。感情上传统路子更稳，别玩花样。钱上走正规渠道。跟人相处，进对圈子比单打独斗快。", "钥匙被扔在地上，弟子们散了。旧规矩不合用了，或者有人拿权威压你。逆位是让你质疑：这条规矩是为谁定的？感情上别被应该怎样绑架。钱上别迷信权威推荐。跟人相处，你不想再被代表，那就自己开口说清楚想要什么。"],
      ["恋人", "The Lovers", "两个人站在园子里，头顶是天使，身后是知识树。这张牌讲的是选择：不是喜欢哪个选哪个，是按你真正在意的东西选。选之前问自己，五年后回看会不会后悔。感情上这是关系的关键节点，别骑墙。钱上两个机会挑一个，贪心会两个都丢。跟人相处，合作能不能成，看信任够不够。", "树倒了，天使也背过身。两头都想抓，结果两头都没抓住。逆位讲的是不对等：要么你付出太多，要么对方一直吊着你。感情上有第三方，或者有说不出口的隔阂。钱上犹犹豫豫错过窗口。跟人相处，貌合神离比明着散更耗人，该谈谈了。"],
      ["战车", "The Chariot", "一个人驾着两匹马，一黑一白，往同一个方向冲。这张牌讲的是执行力：目标清楚就往前，别回头，关键是抓稳缰绳，两匹马不听话车就散了。现在适合推进、适合拿下、适合做那个带头冲的人。感情上主动推进但别控制。钱上靠执行力赚。跟人相处，节奏是你在带，别带偏。", "车翻了，或者马各跑各的。方向乱、内耗、被人牵着走，用力越多离得越远。逆位让你先停下：是不是在跟人较劲，而不是在沟通？感情上硬推只会更快散。钱上用力过猛。跟人相处，先弄清自己想往哪去，再谈带不带人。"],
      ["力量", "Strength", "一个姑娘轻轻按着狮子的嘴，狮子反而安静了。这张牌讲的是柔劲：不是压倒对方，是让对方愿意。真正有力量的人不需要喊，耐心、稳住、不急，事情反而按你的节奏走。感情上包容比争胜有用。钱上稳。跟人相处，能压住脾气的人最有威信，因为稀缺。", "狮子挣脱了，或者姑娘自己先崩了。硬撑、失控、自尊心打架，都在这一张上。逆位提醒你：先承认自己也会怕。感情上别用冷战较劲。钱上别在情绪上头时做决策。跟人相处，压不住脾气的人说什么都没人听。"],
      ["隐士", "The Hermit", "老人独自站在山顶，提着一盏灯，灯里是一颗星。这张牌讲的是独处：该退出来想一想了。不是逃避，是把外面的噪音关掉，听见自己真正的判断。现在少社交多思考，很多答案只有安静时才浮出来。感情上各自留点空间，别黏。钱上低调期。跟人相处，少而深比广而浅值钱。", "灯灭了，老人还蹲在山顶不肯下来。躲太久就成了拖延，孤僻让关系一点点降温。逆位让你下山：该见人见人，该开口开口。感情上别把自己关起来。钱上别闭门造车。跟人相处，长期不出现的人，慢慢就没人想起你了。"],
      ["命运之轮", "Wheel of Fortune", "轮子在天上转，四角各有一只动物，中间是个读书的胡狼。这张牌讲的是周期：机会在转，转到了你面前就要伸手。运气来的时候不打招呼，走的时候也不。感情上缘分到了。钱上轮到你。跟人相处，圈子该换一轮了，旧的散场，新的登场。", "轮子卡住了，转不动。低谷期别硬推，越推越费力。逆位讲的是等：不是躺平，是蓄力。感情上时机没到，别强求。钱上别赌翻盘，翻盘的心态最容易输光。跟人相处，现在没人接你的话，不代表以后也没人。"],
      ["正义", "Justice", "一个人一手天平一手剑，身后是帷幕。这张牌讲的是公平：讲证据、签合同、算清账，该你的一分不少，该担的责任一分不逃。现在适合把模糊的事说清楚，把口头约定落到纸上。感情上对等才长久。钱上该清算的清算。跟人相处，公平二字最让人服气。", "天平歪了，剑也钝了。有人对你不公，或者你在替自己开脱。逆位让你直面：这事到底谁欠谁？感情上付出和回报不对等，别装没看见。钱上有纠纷早处理，拖着的利息比本金狠。跟人相处，最容易出问题的是你不愿承认的那部分。"],
      ["倒吊人", "The Hanged Man", "一个人倒挂在树上，脸上却带着笑。这张牌讲的是暂停：主动停下来，换个角度看。不是失败，是暂时放下，把力气攒着。很多事你现在看不懂，倒过来看就懂了。感情上暂时放下别死磕。钱上牺牲短期换长期。跟人相处，先让一步，退的人往往最后赢。", "绳子松了，人还在原地。白牺牲、僵局、无谓的等待。逆位提醒你算账：这段时间的付出换回了什么？感情上别一直等一个不表态的人。钱上警惕沉没成本。跟人相处，该止损就止损，止损不丢人。"],
      ["死神", "Death", "白马上骑着骷髅，远处太阳正在升起。这张牌讲的是结束：一段关系、一份工作、一种活法，真的要结束了。别怕，结束是在腾地方，旧的清空，新的才进得来。感情上关系要转型或者收场。钱上旧模式结束。跟人相处，该告别的告别，别拖着。", "马停住了，骷髅迟迟不走。明知道该结束，还在拖。逆位讲的是拖延：拖着不散的感情更痛，拖着不改的模式更贵。感情上别用时间麻痹自己。钱上割不掉的最亏。跟人相处，舍不得的那个人，往往是你自己。"],
      ["节制", "Temperance", "天使一只脚在水里一只在岸上，两个杯子来回倒水。这张牌讲的是调和：把两头的资源倒匀，别走极端。工作与休息、付出与索取、花钱与存钱，都要有个动态的平衡。感情上是磨合期，各让一步。钱上均衡配置。跟人相处，你常常是那个润滑剂。", "杯子倒了，水洒了一地。用力过猛，或者彻底放开，两个方向都在破坏平衡。逆位让你先恢复节奏：该睡睡，该吃吃，该停停。感情上失衡了，先说出来。钱上别做极端操作。跟人相处，节奏乱的时候说什么都不对。"],
      ["恶魔", "The Devil", "两个人被链子锁在恶魔脚下，仔细看，链子是松的。这张牌讲的是捆住你的东西：瘾、欲望、一段不健康的关系、一份不敢辞的工作。最要紧的是看清——链子没锁，是你自己没走。感情上关系不健康，先承认。钱上贪念在作祟。跟人相处，互相利用的关系迟早要还。", "有人在挣链子，锁开始松动。逆位是好消息：你正在挣脱，或者已经看清只是还没走。感情上断得慢，但方向对了。钱上是戒断期，会难受一阵。跟人相处，松手的那一下最疼，也最必要。"],
      ["塔", "The Tower", "闪电打在塔顶，塔上的人往下掉。这张牌讲的是崩塌：外部突然塌一块，计划被推翻，关系被击中。但塌掉的往往是本来就该塌的部分。别急着重建，先看清地基。感情上外力击中了关系。钱上意外损失。跟人相处，旧结构散了，剩下的才是真的。", "闪电没落下，塔还在晃。早该发生的崩盘被硬撑住了，雷没炸，但还在。逆位提醒你：拖着不等于安全，只是把痛分期。感情上问题都在，只是没人先开口。钱上那颗雷迟早要响。跟人相处，忍着不是解决。"],
      ["星星", "The Star", "一个女人跪在水边，把水倒进池子又倒进土地，天上有八颗星。这张牌讲的是希望：不是兴奋的那种，是经过很长时间之后还愿意相信的那种。现在适合慢慢养、慢慢好，不急着证明什么。感情上是疗愈期。钱上长期看好，别急。跟人相处，真诚会替你说话。", "星星暗了，水也不流了。信心掉了，或者期待太高，失望就来得重。逆位让你把期待落回地上：不是不抱希望，是别把希望架太高。感情上别用想象填补空白。钱上别太乐观。跟人相处，失望多半来自预设。"],
      ["月亮", "The Moon", "一只狗一只狼对着月亮叫，水里有东西在游。这张牌讲的是看不清：信息不全，真假难辨，最容易自己吓自己。这时候别做决定，尤其是夜里。感情上猜疑在发酵，当面问清楚比脑补一百遍强。钱上看不清就别下注。跟人相处，模棱两可的话直接问。", "月亮开始退，水面平静了。迷雾在散，真相正在露出来，也可能是你终于不再自欺。感情上该说清的说清楚。钱上逐步明朗。跟人相处，误会解除后别急着算旧账。"],
      ["太阳", "The Sun", "一个孩子骑着白马，身后是向日葵，太阳照得正亮。这张牌讲的是明朗：事情顺、心情好、看得清楚。这时候该高调就高调，该庆祝就庆祝，藏着掖着反而浪费了这股气。感情上明朗坦荡。钱上进项好。跟人相处，人气正旺，多攒点情分。", "太阳被云挡了一半。好事打了折扣，或者你太得意，把好局面说漏了。逆位提醒你收着点：低调一点，事情反而更长。感情上热度降了一些，别慌。钱上别太乐观。跟人相处，风光的时候少说两句。"],
      ["审判", "Judgement", "天使吹响号角，棺材里的人站起来。这张牌讲的是了结：该复盘就复盘，该下结论就下结论，该重新出发就重新出发。拖着不判的事，永远悬在那儿。感情上旧事需要一个了结。钱上该清算清算。跟人相处，和解要主动，主动的人才掌握节奏。", "号角吹不响，人还躺着。回避结论，翻旧账，拖着不算。逆位让你面对：这事的结论到底是什么？感情上别老翻过去。钱上拖着不算只会更乱。跟人相处，不肯放下的人，最先累的是自己。"],
      ["世界", "The World", "一个人站在花环中间，四角各有一个形象。这张牌讲的是完整：一个周期真的走完了，可以验收、可以庆祝、可以放下。接下来是新的循环。感情上圆满。钱上阶段性收割。跟人相处，圈子完整，该道谢的道谢。", "花环缺了一角。就差最后一步，却始终差着。逆位让你补收尾：把没做的做完，把没说的话说完，别带着尾巴进下一个周期。感情上还差临门一脚。钱上收尾没做完。跟人相处，没做完的告别会一直回响。"],
    ];

    // 22 张大阿卡那牌面：取自游戏资源仓库 Derugon/TBoIR-resources 的
    // resources/gfx/ui/ui_cardfronts.png（128×144 整版）+ ui_cardfronts.anm2 的裁切定义，
    // 每张 14×18 像素、去掉 ICC 配置块后约 400 字节。逆位直接旋转 180°。仅本机自用。
    var TAROT_IMG = [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABTElEQVR42p2TIW/CQBzFf5CKyQlSOXNJEzq/Zh9h+wAoBBYBQaEmFwSKBIGt4DOArSOt7zUhXAIIQhoEArlkE1tvd10R49xd7vfe+7/L1e7gkxuWAzCYvv8LmvTevsHyUtmaPFZ67wYC0fRYhUueOy+/jlXQpNuh4fucpGQwCwE0BFAvgyYEMJiFTLodK0ElCNDwfdq9IQDz6ViLXAVVtgbgJCXz6RiAdm/IScrqVsuF5Jm0Y2byumMeK/otD4BRlJBnUkOjKMENhE6kHVfhkn7LY7M96PpHUQJR8qc40fTsqJvtgd3xDDiW+2Z7YJFc/vTgFA6LWAEObiDIY2UBjw8fpLHCDYQdtbAXTU8r7o5nXp/u2R3PpHunulWVrS0IIN07pPuLlcI0qZtOxWER34xWnlE/RwHnP7OYIoWQ6eiYKuVZq/bF3dqtH/kLzxuwp3RRGbkAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABWUlEQVR42p1TvW7CMBi8RAzpc7CwB5ohoPAAWZAydsrEUhKhqkMfoBMDdGklUFUpUqeKLDwAEj9SGiTEQlmY2Kq+w3Vo7TrgLpxk2Y59332+fJ9hAcQZKAFAlqcAgP1uhkE/AwBEsYNypaElObUWTLERpDDwEQY+Bv0MnXYP+91MEjrtXlFRhzDwAQCD/gRRDJQrDTw83chz8zhFHXTqJXEgFJ7fJlrl4++GBfA16UrFu+Yl7qfvchaYruZyfWEYgAVwk6fc5CnHSZee7XI9GvKwXHA9GtKzXY6TLknSs12SpAWwdOwqAMSPL9q3qqpSUURWFQ/LBT3bLYxNntICaOoif35s8bXd4ur6VhaD+iukObrK+U3NAIBmtU61kpxaq1gAgiQIaoAfMiTZ1BggVdR5upobajYnRPWiLtC/xCh2Cpea1TrFG0/aSkA4F8V/CsX2yoquntPI33eeynT/148mAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABqElEQVR42p2TMUgjURCGvwQxQUIqtzp4hVhoYDtJk8DayB0HpjVioYWNGggc2ihsYSGIjcetd42FVxyurUGInYHdwiVWAUkRc7AQOAhcEUSITSzWfdmVDYjTzHs/88/Mm39eLAkDPmBjANcrq1wufiGfzWE5dqQHsBybQqXK5z+/ifsZCpVqKOittxybk+JyuGLQLMce2d71ymo0sVCpyrPebLE/Mz0ySTwK1Jstfux9RW+23k/0SUAk+b79MCTetx8kMMr8mFZ5C4BYEgZb5jkA099PMJ89WXfnsxzcOAAUx2OSkM/mWJ4S3nB8vcznAafmGY+1GyYzGY5nM6S0edaLa8wFpImUA2Dj6i+/Xr3SSHFqnrFeXIOdITnua1c/MgD4ZtRRhOqRhCqxyJWrHxmk8yUJ/lwSgGDzwpVYOl/yku8wHM5C+VwG7KuPYXkaqdC9Zxnc3tlexa7bIOHW6AsNHZXSmDfN5L//dJ8+oQiVnmXQFxqJYKuKUOkCCbfG9kQnVOFwooNueUkVoYJQ4c72htN1GwD0hSYXIbgUfaERjJNv/MhHfgHATK4mctuQugAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABlUlEQVR42p2TP0gCURzHP4lxDRERVFM3eXAGNxUIFUiESNHUFAhCa4TgHDTc0NASZbRWkhARjUU5hGDCgdvBKTx00FFpaLsIash73ak09IPHe+/3+31/f77v90bG4It/SBjg8el4wCDqljxreixgW09mCQ2LJuoWhXxbLi/IejIbzNifoZBvk0mOoi0mENUip/k2qTScnmwHgV4Gv3ggbTEBTw/Snkr/2ENeBlOPYOoRAHL7G4hq8aeSapHc/gYAph6RAcLDery8fSZmaIF7vwwlJ2ZonN/XWFrd4fy+FgjyJxDgOndE13G4zh1JndNsDLLqV1q2YPLtjpnoPJWXCyxb4KpxrgClVRrs8ebjC1eNI2YNxCdgA6zB7BrTPZ/3HjAEsKCFmdrU2d2KsqS8/jlqEyt7v8Bs5jBAjF86LXvoPQTQdRwsW8j++p38u+Iv9cAel6CKu0ynZUsnz5EeMan0XJCcirvMtGqglM9w1ThKqyQn6aBeogMo/e/olfJePsPUIxLkNBs4zYbUuWpcjtzIfz/yN3EmtGRu2DYmAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABk0lEQVR42p2Tv0vDQBTHP9YMksGqg4YOpQhRqqBO4lDaUijBUSj4LxREUAIdnHRxKIjiD8zo4Fitm5RA0S46OqVCoJRMRQriIiiIDjFnz6qob7nj3fu8971373r64JV/mAJwXtn+EzRvrBLqdKyvlbqCapc2tUu761zphLa2NEyzRMYIA1CtPHSksFnfzMlgAAHvcEvsAzPNFsnURxoh1XUb0prPP4p9p2wJzBhhLEvFdRtYlgpAYnKfods0ptnqSiDAZCoLgK6PioO24zAcn2AtPYtlqWSMsIgTdwwk+JlVijubPL8HDIyPUbgPUaxcA7aAlaB7x3tFAPqnTyVJVxu76NEYhek5AUvNaTsOzkkJ12tytbFLpFch0qugR2O+Gq/JwqAmnkgJmrNyeEQ+/0j5QuVFmyLlONzVHVzP+37kfN02luU74zNJlss1AJYWG1LjEmgk0sgjB/CiTQn4Jwt95azf1Kjf+BUPzuakweia1WQqS7VSIvd0hx6N4XrN31fMGGHK9y0JGvl0x8B6/vuR3wDw8Ja7xEPHugAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABhklEQVR42p2Tv0tCURTHP2qEQ1BTSVBoRD1dGqKyH1BbLbVEgZtrS2RCLZFLBAUvlf6FIKhcssGmHIzIaH3vTSlvqYaGwCkQG/Je3jV18Ez3fs893+/3HM51eaFGB9EFcPlmK2DuqYh1lgRA242xMjut5CMjw7idwJAdA8A6S6LrPnTdJwmG7BipjYh86260kHsq0grbub5sXSjURDhVUxsRSeJu1Xw8/sFA965yd5K4hRWnxapnm9RWFCNzQ9WzDcDF+alC1CXsAcSBtd4BAH7Gx+gbH4M6ZmRu6A+G1B7FBAE0f4BCIi0fFBJpNH+A43yR6mhOVRQ97E2EAdg8inN1oEuiZqEMxyqXGJzT5F3zB7DKJaxyqX3h7fcn1dEc6bsv3sNRHnyLvIejLB66pCsRLi/UZibnmVreb7ubpmkQDIZ4uT/h+fVRVTRNA9M0mhY1XXKRrNjZvzMQrI++EVesFvLrcjNELz3DqwBU7KyC67qPhaXM/5UTyYqdlUXOoSiKnXzkX8YvoZwdHN2mAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABwklEQVR42p2TPUhbURiGH2OQOwgBEQQdWhK6ZZBKVBCiU6+btEPpkMHVIY0gJFEpFIT6A0LVwUEFB4c0FCEVhwiFcuWGqIiLXIdwgxIMklwCARWXch30nPbmZvJdzsc53/N+3/lrUcDmBfICHE0vOybragZfdswVCw3MT+Fp5ubLjlFXM464rmb4fLDrrCicRSLAl6m/wC5zy61ybvUdbvD/dupqhlU+yDabtett3JswMbU8aF34wjSFJSgSA+FBTC3PykMZgJiWJxAebF6xMXHloczO2hIAkWhcwqaWl2CLAvZA35AjUcRCkWicmNItzY9OdVDALuV0u5TT7eG+ITmebW44RrFWyum2ArYHwDIMLMPg+8Q4lmEAULkwmBnpZ3J9G4CdtSUi0bjsotULX8+va7xtb+POqjL7c5+QmuDH7zSHl9eE1ARlUyf8uofRUC/31Spbv/aeDifpD/Ltz7F0M4tXhNQEACfZRZL+IJPr28yM9LuvI+kPArBQPKdWSAGfCPhfAVCs3LjMvY3vVBo8w0ICBnh/qjvBYuUGgPStRcebf1D61uJje6ejgEcAAhKqFVLUCiliSrfLWD6Al3zkR6Jb3QIcjScrAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABZElEQVR42p2TMWvCUBSFP6WDiF27dO7QbqZghyJ16ZbOFXEQiqABwUEc/AEO4iAEoiAFBwl2brYuFulQoXFLB2eX4qZ0K3aIec1LrINnu+e+83LevSeRGGw4AEcAE1unVhzR7mcBsGeWdEhJqlKdViqu0A97ZmEaa5nULJSkKl0uhO1+VohKpW9Oz44BWMxX9AxX7IkkoR+9Xhz42VZxwYe+6CcAhnpLuihfqQtXHqLBt3XKBXHQE3XKBUxjLQ0tGrT59emwj6sVR3/CnJbANNbktATN8ZRGJsXScVg6Do1MiuZ4Sk5LSGuRhuNZrXYHMJ4KvlMuUDUGYrJp5c0VKkkVkxFDvUW+UqeRSXFyfiFsVrsD0UNz3xmJwWZi67sXH4BnVyTHv/h98IKwMwBeYoJYzFdSHYnB5uryWiJDkevFpf77x3Y4T8+PUuP+7oFSaSXid3OrhoTRoOA/vL5YYauH/Mi/FUSdfoQ6kxAAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABmElEQVR42p2TMUgCYRTHf1mIDW6RtIlI1IEXXFBIS0u1JUVDg0MOgQ5GYCeUswZdQ1SD4HBL4ZYETbXYEFJQS3CCQrRFzkLRoA3nfZ16Lb7l8f35/9/73vt/35AH2gwQIwB6sUgwGGQvvktBj1AzSkxKa33ZCllO4+qtVDNKaJrLMW/HrgWvT6hpLgp6xDGraut/oT3sHRxndBJcnB2JczSW7uM4djxJbBFNmuRoMt1VxIohD7TnZxe6wIPFOcanJXFuVA1y5ScAVLXFxmbFFOrFIoCwxC62RKra4uxihe+POx6fH8wZ88fnorpnYolUs062/ASdLhmvH780Q0ie4hWAjvAkscWYJBFNpkk16+JKdtNrRgnYJyQr3N90ttqoGjSqhiD9xN9w5wN8hYcB+Ky84CbAYvwQdz7AuWVHznYlX1hhVJoRIgBfWAH4w8uXptAzsWQymnV2bq/g9m/Dp8vrJgZduPAxJCsCVNUWBT3SZVEv1vdyMl4/We0duCbj9Ttiq9ZWncT22XxhhUzFNm/50nwAg3zkX0ASoE7yjdSFAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABBElEQVR42p2TsWoCQRCGPw8L3+PeYBcsD1/grFNY2CorIoKFTbBJEQgacvgEFtbeC8iVgikvlS8Q8g5amFluN7cGnWaWmfln/vl3t9GCMw9YE2C7O9wFeuq2iULJ4+fJ8QDLxcSeoxCoyDPrxSbPyzCwWlzkGUlqwjsKHa1iijxj8/FqC3qjGWDQKnaAkXQWalL8U5b0RjNWg76Tc4Bv70MnOO+0AVgN+nx/lWGqvr3sD8x/PUCSGoo8QytPnOl4bQMihoBkd/9qmiKzL73fKEhVqxit/ja4ns3/OwqoblL1SmrFETFuWXQrmaTGTvYZ1E68Uqq+lsDLqVOxWuiDABqPfuQLI99r7Wr1z38AAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAA+klEQVR42p2TMQrCQBBFn4uKtb2FlYWdbCNoq6DoPXKFCEoEvYL3EBS0TWET7Cy0SWGvvY1WG3Y2G0EHAtk/+ZM/f2ZLNXjzR5QBzrv9T6TOeITyJYL5Kntc3IQqqrpZzr5ignhPEu5JIqqbsxvKJq23B1F90W+y3h685FIN3ufdXuhf9JvioyhOAQinQxpa580xfwE4Xa6cLleRsxUp1zVTHUD3Jl5Hc0TXyYbWmXQ3p4rm5DoazFeE02GeaMBB/QVAt92i8rxl/doKBNEGbVPsd1uB8oHuGEyfha7+fDvM1tiDj+JUzDSKU785RRIBjo9qtjVi5f6R+gEmcXIc5f9/iQAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABWklEQVR42p2Tv0sCYRjHP8oNbkEU2CbELSmNNXZLg1trIhSBZIKCCDc4xIuDg4thIEJTIP4Lrrc0KLRIvQ0Hh5uit/gX2HDddeedRL7wwvs+vJ/nx/d53lgC1uywFIBP4+NfUFrLEP8PcFe7986xBKz9EW1zFgIO1KNQRMVvsM0Zek9ERmsVRcCBsgm99muslhKASnVIp51l7/CEm7wIwMqm59VSUqkOvbsDb1HVvyrVIf3nVsCWL+uhVONRtdlSki/rHgSg90RAuEA7Ou0sAIsvydPDLbaU1LWz7QPgT1OcnyKMMRhjz96oF5yoTUegQB/ddNvXV79CWRaL4326A4NSTiOZUnlsvjB6f4tQ1bIAEKOJ97iUg+7AAAxaRcFF4TIMitHEOydTKvOp+QP90Q63BlflZEqlUXcc+O3xbfMIMJ+a3gYn3ZA4bj9dB1Fz6w5BWss44C4f+Ru72pkeOQ/03QAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAA9ElEQVR42p2TMQrCQBBFn0sKD2BpEUwqDyCkCeI5FBQrC8FGEQ8goo1gYSUKeg6RNAseIJVKCkvvoFUkJpMYnSbLJp95+yZbKMKTP8oA2IyHXMrWx4vjdk+j00oE7PuV7myB+qXLcbt/r8Xg7Xr5eIYVJVBSKPA0AIGnE+HUYMWyMV0HANN1UsOZZww8jek6VCw7XzBEzcJVaWKWvTaH1Tx7jpKYwXqXIIgiq3goFBPtKElScZuBp1n22pSqVQAOq7koSZQTxWz2R/nmCDCp13j4Pg/fZ1KvfZcTokxPGk7n9740S0P6c/LsGRKG9GG8Cv9e5Bf5nGbJMX4eIwAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABKklEQVR42p2TMUvDQBTH/w0Z8iUcRUfhNjPclCnBrA5Sijf0EwiC0EEQBz9Bh9DSUVwi3qKTgwXBQMeWYC30g7xO77xLrmL7llyO+3Hv9967TgQQ9ogQAJ71dCfoLD1FsAtwN7hyb2zGrJo7/yfiGABwc/uwHZxVc+iyaOwqA3MEPkgmGQBAJhlkkkGXRSsLr+NyVRv4/e1le1V9wcDB4RHW9aLlH7aLoBzHdb1AmisDseufjgwAgC4L1zUCSIqYXvWUpIhpcH1PF+eXJEVMUsT08/VtvryOAAqa/Vmu6v+PnC1tF2I8nKDX7yLNFXr9rkn/s/r4dWTpNFeOG/txX3kd+qZFlwXGwwlGT4+mUNwivjG0DwIwKTV9uS2cmXcAbCd7z57Xzr4PeQNkY5cE7YguDAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAB3klEQVR42p2TP2hTURTGfykNPAohgyYdKhhCFyVkSXCJEDGIm+BQQjEFwaGIBERtGoQgRSlB3OpopldaQ4Y3tRlsHzpooXSQElKFEBqsQt/LG4p/KAgeh/hum77aoQcu954/3/edcy/Xp4FwChsE0E0HgNWNPTLJIKsbe31FmWSQl1M3uJDVySSDTFw90wO6oK3qBKD/2w9sqwpPnr5gptTLK0UX5CZL9y97WpspPToEBjSQdCIl5vKapBMpWdGnZUWflnQipdbhmLm8JhrI4FHmb51PVIwu83PPVSyXL3i6GPjfreXyBbrNJrl8QRGeCKwYXQAeX7nUtx/7HACfOx9V8M7Ns8wa6/B2XfkuoVvnmXE8EKJi2PgjcR4O/AGgbDQoRmOU2w1vq69fzTMeCHE+NIw/Eudc9CLVSIwfd2cpRmN07N1+BQ3kevaapBMp+fLhvdRMR25PzUnNdKRmOlIfm5Sa6ah8OpESDcSngYw9uIX11WK/9Qt/JM7kvWcs1RcAyG436Ni7LH63e0KjQ7yrvvHOCLBUX2Cn3QSg4xy0qI0OER4JH385ADvtJr+3N3tOIHTyc4RHwlhY7Lc2FTvAYsumGI2hDf9Uah5FF+yeASwsyq2GInLNd9qP/BdrN82nVBNnnAAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABLklEQVR42p1TvWqEQBD+7vDgwB8sRAs7XyFFhBQprgr4Aj5F3iNdyCsEfIGDVBYpAlrkFeyuuMVC1t3K4lIcs+yoaZxqmPlmvm8+dndH4IYN4QDA6/MLGiVRZiGqbkDuBYhcHwDQ63HRe//+wh4bgw0KpVFmIRol0euRsQmll1Ij10cOoBYSJ9wBjZJsYS0mdoJDTTYcHxB77r9DRirJoqjFtJrbOGcuCwBO8YHltZgWGMcGkLyqG8yttZhQZiGTbQZzL2DGzCWSo3Rru+YqBbFU3WCW2AbtbVepSSzERDXbVQcAztcL2AIlmVSq2TjD+PnxxlzLvcAwrWF2R+D2+PBkCkWSotcje+SR6zO29vfnLrVIUtiS7VvsnHDt/JEXSWqGz9cLy2mISd3yrf4ApIGsKUZln/YAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABfElEQVR42p2TvUvDUBTFfw1FuxWhDuJHXwI6BAdB0aGDUuIg2RVExEWqg+Ck6B+gq4uKuIj4B7gUBEtphg4tCqWDQhFNCg52KR3tYB1iYp6tH3imy3v3vHPfufeGItDiHwgDLGzvYWfSzOpj/kXl2cFp1BGGiaYKAB6fbDRVsL+26BKDqDw7ADiNunT++GRjZ9JgmACEItCaGk8Qj/ZIBGGY7LxlfGIq++rHhdu8qygM033tIwbQVEHq9DN5ual8Er0/aqrwS/CQPT2UkgHOu95kczx4qp0SAU6S3X7JbebEoz2M9Mfb7L++K7GvGCRXBYXbPMp3feorlX/sowKQuzppu7B6o78TB7QB6X99pbJf7ldlT0QBqFo2TTFBU0zgNOqSWjCuPLzIikF4ZA+djPJdHZoWVK0bydlOY3g0N0pMn2f4MuESq5bNwfoKMV1naWNLSg4+tnl8xu7MpNzH2v0dMV3vOOBBXLRqcql7uSLkiiiD4T/tY+i/i/wOeRqCFED3YXkAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABq0lEQVR42p2TPUjDQBiGn5QiXQqW0kEoNu3QwTGLi4OKihbFv00Edai4CIKgSHEUQRAEFYW4COJmVSpBStHFxaWbChlMUgIOWhTcpFCHkjMnBcEXQo77vid57707JQR1/qEgwNrhKZZTYXm8Rr6c+hPaXJgiAGA5Faxige3zIACjL45o8o9v9H0xboDFAn3ZDFaxgOVUuGxLMKE9M6E9c9mWEM17B0My6MkPN5N/GQEP8GuppU6+nCJfTgmroy+O9EHxx3TVEpM7XwqAZHXnS5HcSFbTVUuy61nzwvNqAizpBgBmNElJN0gOjJBMtEvQbykhqOeyg2KiVP4EIDkwgkhcC5NW46JnJnfUOACAKKRVMG2XUrHQiH+8sQUX+p0EB/yQabs/W6OFaa31iGcs2yXVRTim7WLYUTr6VWbn1pmdW2d6cQVAvP1w0A9FYnHmc08sdduYtkufFgbgZHeLD26lcAKAgAAisTjHD1EMO8pw5yRvj48AtNZ6pHUqIaj3Tq02PWLvry4ZtQrAcOckAFf3Z2zo1z+pNlMkFsewIaNWubo/k9JX/nuRvwHrmbquWVg6egAAAABJRU5ErkJggg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABMUlEQVR42p2TIWvDQBiGn46JwSCyOu5Edd10Cx2Moz9gPrCKMhGYKTGDiLlB/GBiLgw66HTdKgrJxLnIEFmo3sR6Xy9tItYXInJ3z73fvfdd5wJ+OEHnAHcP7/+Cnh9vOGubNMbIZ/W1iOuOTdCmSPf/aJRS9IdhO2ihIEzodi8BiO5vBbaSUkeDXg0CqKotALOnFzZFWitbQLvIKokDGT+cE9AYw2pdyGCWl+KaxAFZXjaDtgylFJ6vWc4jsrwkiQOurmcs5xGer5lOxnWwPwwbYUAgpRRVtZVzSqqer//gXXoGLbtPJ2M+Pr95fVvINTU2wGjQk+hdp02R4vm6vQHcha7zUTiHWq0LOatSquZmKxHQXej2pdufR6+jSTYscW1rOevq9qskvbsmV51TH/IvkUmrJHJWh4IAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABQElEQVR42p1ToW7DMBB9aQZMAyvtL6qNFBQ3K09IpYCQSM0XZDDhk1KpZGBSyVow1CZf0IKMLVJJYCOVTCpsSXUj882ZM7Ae8bPPz/fu2TYEQLgibgDgvYi1BNUGAMC41c+9u39E5z9VJkHOuJUoLKcVT2fDduLqMGYcJhnCJOP5ZW3qPcoYdeffcnKkkQ0A8F1Pq9aoKCyHZUmSitU8E6k2cCqX8F0PaWQ3JIZJhjSy4bseTuWS3W41p62i7iBAZRFTVVVUVRUNen36eEto0Os3sMyXRUwCIDbnfFxo8iT+nddcvaxNTGdDCMthN59fX3A+LrA6jDHqztuJ5sPlz95UUsNVNVRZKlb3dWQfVBuYBDm/R/VK1N75vQqA9tsNuyixHMsiprKIeW2/3fy4+rnbAQCeAo+xHNVQ14xrP/IXXQyxHy5G6UMAAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAABa0lEQVR42p2TP2sCQRDFf2eOcJaWJo1gYZXqjEJO0Cr5BDYpQqpgSCNcERCCHAG7gzTBQFJICj+ElUUUDIEUgYMDEUHUxl4QwqbQO2/9kwQHFmZ231vezL5VNBDsECrARb0BQDoW/RXc6Y8BeD0/nRNd25qfmOWt5E5/vMQBigZiKuZqc8kMiQXZu93LXdui+fEGQFhRQAMRjKxuiKt6Q2R1Q8qDoYHwiASWyOqGGLRbYtBuBUk+RgOhLiRKk324vpTyXDIDK9MPASTMMgDHZ7cAFKs1Jo7DxHEoVmvSmYdVN02wlEv5hFIuRaX5voYJBYtut0cknpeAleY7kXiebrcnERUNxGP7a+2d7u09AO7Mb3/Pe6qbk6Ol1HQsCgv9rm0xHE05PAhLfQXNEVrV7toWBXMGwHA0pWDOJCWSV1fjyd7/n8mDBvZkbfOrJ1ddNXAi0Oem2psDGoisbojPl2ffYn/VGghl14/8Axur4K3CFLZmAAAAAElFTkSuQmCC",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAASCAYAAABrXO8xAAAByUlEQVR42p2TP2vbQBjGf44zCNKx+DskdCiIuKUCy2BwyGLwaJOPkEKETQMCT4GCS0IKHSpIhg7CWVIM2hQIGINFEtGkg1GXbvYkPEajeTsEXaQ0U97p5e65u+fPewUNhJeUBjILJjILJmLqhjhuLLfTRLq2J+NRRW6niThuLKZuyN3picyCiWggKwDRz3MWUaQuu19sE/p9ep0lg8GlWt/7/kPhChrIO90AoGUN+RtdEfp9WtYQgLPjJgdHRaL5OWfHTQCuf00eqKb0xqOKomvqRq7v2p44biyOG4sGggZKUxb4VLepG0qzBlLQQIJpwv1im15nCYD77UvOwJ2PnwDY3Nqn3a7x4c0aqwCDwSWhv1TArFHZCv0+jfrhYxyptlkwkbvTEzF1Q/yOJX7HysWQalVUd22P0O+rm+1qmc+jm/96gIOjIvXqmBVAPZ9GUFrfwK6WsatlSusbuT3vovtINetqSvm5PuuqOpjVmUaQjSbVl4vjqxsD5Kam/HYNgJvfSW56APZ2Sg9xpKPUsoY06kV6nSZkRm5za59o/l7hlMas3Y4b5/SOR5Vnf8cqQPwnH3i7XaNRP8S76PLqdQ3mCU9xhZd+5H/j5miGlCprsgAAAABJRU5ErkJggg==",
    ];

    // 塔罗牌图标：一张稍稍倾斜的牌背（只画牌框与星纹，不用任何图片）
        // 键盘农场入口图标：一块草方块 + 一株小苗，和键盘里的地块同款
        // 三张牌阵：每张牌在「过去 / 现在 / 未来」各写正逆两段，纯离线、不联网、不依赖模型。
    // 结构：[ { past: [正位, 逆位], present: [正位, 逆位], future: [正位, 逆位] } ]，索引与 TAROT 对齐。
    var TAROT_POS = [
      {
        past: ['你当初就是凭一股没算成本的劲走进来的。回头看，那一步不算聪明，但确实把你带到了现在的位置——路是走出来的，不是想出来的。', '当年那一步是冲动加准备不足，摔过跤才学会看脚下。这段来路留下的不是教训本身，是你现在谨慎得过头的习惯。'],
        present: ['你手上没多少包袱，正适合开新局。别等万事俱备，先把最小的一步踏出去，边做边补。', '你想得多做得少，计划停在嘴上。今天挑一件最小的事做完，就能把这种悬浮感压下去。'],
        future: ['照现在这个走法，你会在不长的时间里踏进一个新阶段：新项目、新关系，或者干脆换个环境。轻装上阵就是优势。', '再拖下去，机会会先走。你会在原地反复权衡，然后看着别人把你想过的路走完，还得给自己找理由。'],
      },
      {
        past: ['你曾经靠会来事、能调动资源把一摊事撑起来。那时候你确实有本事，也让人记住了这一点。', '你走过一段光说不练的路，或者本事用错了地方。吃过亏之后，才开始挑什么事值得出手。'],
        present: ['你手上的资源、人脉、手艺都够，现在缺的是开口和动手。主动约人、主动提案，回应比你想的快。', '你有能力，但方向散了，或者把聪明用在绕路上。先停一下，问自己在做的事是不是真正想要的。'],
        future: ['接下来会拿到一次展示自己的机会，能不能接住，看你敢不敢把成果摆到台面上。', '再这样耗着，你会变成什么都懂一点、什么都不精的人，机会来找时拿不出硬东西。'],
      },
      {
        past: ['你来路上一段最关键的成长，是安静下来的那段时间。你学会了先看、先听、不急着表态，因此少踩了很多坑。', '你曾经过度压抑自己，把该说的话咽下去，或者反过来被情绪牵着走。这段经历让你现在对「忍」这个字很敏感。'],
        present: ['答案你心里有，只是被外面的噪音盖住了。现在适合少说多观察，等对方先亮牌。', '你在自欺，明知有问题还装作看不见。那些让你不太舒服的细节，就是答案。'],
        future: ['接下来会浮出一些你原本不知道的信息，可能是个秘密被揭开，或者你想通了一件一直别扭的事。', '继续装睡的话，你会在一个已经有答案的问题上耗很久，最后是被迫知道真相。'],
      },
      {
        past: ['你来路上有过一段被滋养、也滋养别人的时期。你把时间和耐心投进了某个人或某件事，那段时间是有效的。', '你曾经付出过头，把自己耗空了；或者反过来长期懒散、什么都没经营。这段经历让你对值不值得有了自己的尺子。'],
        present: ['现在适合养，不适合催。把水肥给足：该休息休息，该陪的人陪一陪，成果是等出来的。', '你在用付出换认可，或者干脆什么都不想管。先把自己喂饱，再谈照顾别人。'],
        future: ['照现在的养护节奏，接下来会看到具体成果——身体、关系，或一件慢慢做成的事。', '再这么单向付出下去，你会累到连自己想要什么都说不清。'],
      },
      {
        past: ['你来路上有一次靠立规矩、扛责任站住了位置。那段经历给了你结构感，也让你知道自己能拍板。', '你在一个控制过度的环境里待过，或者该你负责时躲了。那段经历让你现在对「权威」两个字有点警惕。'],
        present: ['现在该把话说清楚：谁的活、什么边界、什么时候交。规则立住，事情自然顺。', '你要么太硬，要么完全不管。检查一下：是在解决问题，还是在用位置压人？'],
        future: ['接下来你会被推到需要负责的位置上，可能是带人，也可能独立扛一个项目。接住它。', '继续模糊下去，会变成谁都不担责、谁都能插嘴的局面，最后收不了场。'],
      },
      {
        past: ['你来路上的关键一步，是找了懂行的人带、或者进了对的圈子。跟着成熟的路子走，让你少绕了几年弯。', '你待过一个规矩不合时宜的地方，或者被「应该怎样」绑过。那段经历让你现在对正统路径带着怀疑。'],
        present: ['现在别急着发明新方法，先找一个真在行的人问清楚。现成的路最省事。', '旧规矩已经不合用了，或者有人拿权威压你。该质疑就质疑，但先想清楚你要的是什么。'],
        future: ['接下来会有一个靠谱的引路人或成熟的框架出现，跟着走，别自己硬试。', '继续照旧规矩做事，你会越来越别扭，最后要么被动改变，要么被甩下。'],
      },
      {
        past: ['你来路上有过一次重要的选择，你按自己真正在意的选了，这个选择塑造了现在的你。', '你曾经在该选的时候骑墙，两头都想留，最后两头都没抓住。这段经历让你现在对「确定」格外在意。'],
        present: ['现在摆在面前的是取舍题，不是好坏题。问自己五年后回看会不会后悔，然后选。', '你在回避一个必须做的决定，或者关系里不对等。要么摊开谈，要么认清。'],
        future: ['接下来会出现一次能改变走向的合流：一段关系、一个合作，或者一个明确的取舍点。', '继续悬着，你会被拖进一段貌合神离的关系，或者把两个机会都丢掉。'],
      },
      {
        past: ['你曾经靠执行力和推进力拿下过一件事。目标清楚、闷头往前，那段经历证明了你把事做成过。', '你曾经过度用力，方向却乱了，或者被人牵着跑。内耗的那个阶段让你现在很在意节奏。'],
        present: ['现在适合推进，不适合再论证。定好方向，抓住缰绳，往前走。', '你在跟人较劲，不是在解决问题；或者方向没定就猛踩油门。先停下校准。'],
        future: ['接下来会进入一段快节奏的推进期，你能拿下想拿的，前提是别分心。', '再这么硬推会翻车：要么关系崩，要么项目烂尾，力气全花在内耗上。'],
      },
      {
        past: ['你来路上靠耐心和克制稳住过一次局面。不是硬碰硬，是慢慢把火气压下去，那段经历让你知道自己兜得住。', '你有过一次失控，情绪或者冲动先动了手。那之后你才开始练克制。'],
        present: ['现在需要的是稳住，不是爆发。软一点、慢一点，局面会留在你手里。', '你在硬撑，或者压抑到快炸。承认自己会累，比装没事有用。'],
        future: ['接下来会有一场需要耐心收尾的仗，赢的方式是耗得住，不是赢在声量。', '再不给自己留出口，情绪会在最不该爆的时候爆。'],
      },
      {
        past: ['你来路上有一段独处的时期，你在那段时间想清楚了很多事，也学会了不靠热闹活着。', '你曾经孤立过自己，或者反过来不敢一个人待着。这两种极端你都体验过。'],
        present: ['现在适合退一步，把注意力收回自己身上。答案不在别人的意见里。', '你在躲，用独处当借口回避该面对的事。别把逃避包装成沉淀。'],
        future: ['接下来会有一段需要你独自消化、独立判断的时间，熬过去会长一层。', '再躲下去，会错过该出现的连接，也会把小事拖成心结。'],
      },
      {
        past: ['你来路上有一次运气型的转折，不是你争来的，是碰上的。那次让你明白：有些机会真不是努力换的。', '你经历过一段背运，连着几件事都不顺，或者被一个你控制不了的变故推着走。'],
        present: ['现在正处在转动里，别跟趋势较劲。顺水推一下，比逆流划十下有用。', '你觉得自己卡在一个循环里，同一个问题换着花样来。这次得从根上改，不然还会再来一次。'],
        future: ['接下来会有一个明显的转折点，主动的、被动的都有，方向是往开阔处走的。', '如果不打破循环，接下来的剧本还是老样子，只是换个人名。'],
      },
      {
        past: ['你来路上做过一个讲公道、守规矩的决定，哪怕当时不讨喜。这个选择后来替你省了很多麻烦。', '你经历过一次不公平：要么被亏待，要么做了亏心事没被追究。那段让你对公平格外敏感。'],
        present: ['现在该讲事实、讲规则，别用情绪判断。该谁的责任就是谁的。', '局面有偏，或者你在给自己找借口。把该认的认了，才能往前。'],
        future: ['接下来会有一个明确的结算：承诺兑现，或者该算的账算清。', '拖着不处理，后面会用更贵的方式跟你结算。'],
      },
      {
        past: ['你来路上有过一段卡住的时期，什么也推不动。但正是那段停顿让你换了看问题的角度。', '你曾经为了不值得的人或事白白耗着，或者该停的时候硬撑。'],
        present: ['现在动不了，是因为该换个角度了。暂停不是失败，是等一个更清楚的视角。', '你在拖延，把停滞美化成等待。该动的时候不动，机会会溜。'],
        future: ['接下来会有一段需要你放手的时期，放下执念后，路会自己显出来。', '再耗下去，你会为一个已经没意义的东西继续付代价。'],
      },
      {
        past: ['你来路上经历过一次实打实的结束：一段关系、一份工作、一种活法。结束后你才走到这里。', '你抗拒过一个已经该结束的东西，拖了很久才断，代价更大。'],
        present: ['现在该结束了。不是失败，是给下一个阶段腾位置。', '你还在给一个已经死掉的事续命。放手比硬撑难，但早晚得放。'],
        future: ['接下来会有一场干净的了结，之后是重新开始。', '不肯结束，会拖成一场慢性消耗，最后被强行结束。'],
      },
      {
        past: ['你来路上靠调和与耐心，把两件本来对立的事捏在了一起：工作与生活、理想与现实。', '你曾经过度：要么太满要么太空，拼命和摆烂都试过。'],
        present: ['现在讲的是比例：别拉满，也别躺平，找到中间那个能持续的节奏。', '你在失衡，某一头吃掉了全部时间。先承认，再调。'],
        future: ['接下来会慢慢调到一个舒服的节奏，是一个长期向好的位置。', '继续失衡下去，短期还能撑，长期一定塌。'],
      },
      {
        past: ['你来路上被某个东西牢牢绑过：一份放不下的工作、一段离不开的关系、一个戒不掉的习惯。你明知道，还是留着。', '你曾经试图挣脱却没成功，或者反过来，那段时间你根本没意识到自己被绑着。'],
        present: ['现在有一样东西在消耗你，你可能还在说服自己没事。先承认它，才有机会动。', '束缚开始松了，你在犹豫要不要真的走。这一步得你自己迈。'],
        future: ['不处理的话，这段消耗会更深，越拖越难抽身。', '接下来会出现一个松绑的契机，可能是外部事件把你推出来。'],
      },
      {
        past: ['你来路上经历过一次突然的崩塌，可能是计划黄了、关系断了、信任没了。那次把你打散了，也打醒了。', '你差点经历崩塌却没崩，或者把崩塌推迟了，隐患一直留着。'],
        present: ['现在有东西在动摇，别硬撑。早爆比晚爆好，爆完才谈重建。', '你在粉饰太平，明明裂了还不想承认。'],
        future: ['接下来会有一场躲不过的震荡，之后是真正的重来。', '暂时躲过去了，但那根裂缝还在，下次动静会更大。'],
      },
      {
        past: ['你来路上有一段被希望托着的时期，你可能不信，但那时候确实有人或事给了你光。', '你曾经对什么都提不起期待，或者期待落空后彻底冷了下来。'],
        present: ['现在适合疗愈和恢复，别急着证明什么。先把自己修好。', '你的期待又在落空，或者你在用幻想替现实挡枪。'],
        future: ['接下来会慢慢好起来，不是爆发式的好，是慢慢回血。', '再这么失望下去，你会连想都不敢想。'],
      },
      {
        past: ['你来路上经历过一段看不清的时期：信息不全、真假难辨，你靠直觉摸过来的。', '你曾经过度多疑，把小事想成阴谋；或者反过来，忽略了明显的危险信号。'],
        present: ['现在不要在雾里下重注。信息不够就等，情绪强的时候先别做决定。', '雾在散，但你还被情绪牵着。先分清哪些是事实、哪些是你脑补的。'],
        future: ['接下来会有一段迷雾期，会有让你不安的猜测，别急着信。', '继续自己吓自己，会把一件普通的事拖成心病。'],
      },
      {
        past: ['你来路上有过一段真正舒展的日子：状态好、事情顺、人也愿意靠近你。', '你曾经有过一段被压住的时期，明明有光却没走出来。'],
        present: ['现在是好的时候，别自己吓自己。该展示就展示，该享受就享受。', '你在自我怀疑，或者把一件本可以轻松的事想复杂了。'],
        future: ['接下来会走向明朗：结果是好的，至少过程是舒服的。', '再自我消耗下去，会把一手好牌打得没滋味。'],
      },
      {
        past: ['你来路上有一次被叫醒的时刻：一个提醒、一次复盘、一句难听但真的话，让你重新看了自己。', '你曾经躲开过一次该有的反省，或者被评判伤过，之后很久不敢正视自己。'],
        present: ['现在需要一次诚实的复盘，不是自责，是把该认的认清楚，然后放过自己。', '你在回避一个该做的决定，或者对自己判得太重。松一点，看清就好。'],
        future: ['接下来会有一个明确的召唤或定论，可能是结果公布，也可能是你终于下了决心。', '继续拖着不面对，会在一个地方反复卡住，直到你愿意回头看。'],
      },
      {
        past: ['你来路上完整地做完过一件事，从头到尾，有始有终。那次的经验是你现在的底气。', '你有过一件差一点就完成的事，最后一步没走完，那份遗憾一直跟着你。'],
        present: ['一个阶段正在收尾，把它收干净，再开下一段。', '你有一件事已经走到九成，卡在最后一成。别让它烂尾。'],
        future: ['接下来会完整地画上句号，是一个阶段的圆满结束，也是新循环的起点。', '如果收尾收不干净，你会带着一个未完成的尾巴进入下一段。'],
      },
    ];

    // 抽牌：洗 22 张取 3 张不重复，每张五五开决定正/逆
    function pickSpread() {
      var buf = new Uint32Array(1);
      function rand(n) {
        try {
          if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(buf);
          else buf[0] = Math.floor(Math.random() * 4294967296);
        } catch (e) {
          buf[0] = Math.floor(Math.random() * 4294967296);
        }
        return buf[0] % n;
      }
      // Fisher–Yates：洗到第三个位置就够
      var deck = [];
      for (var i = 0; i < 22; i++) deck.push(i);
      var picks = [];
      for (var k = 0; k < 3; k++) {
        var j = k + rand(22 - k);
        var t = deck[k];
        deck[k] = deck[j];
        deck[j] = t;
        picks.push(deck[k]);
      }
      return {
        slots: ['past', 'present', 'future'],
        cards: picks.map(function (idx) {
          return { index: idx, card: TAROT[idx], reversed: rand(2) === 1 };
        }),
      };
    }

    // 关闭也要走完动画：先打 data-closing 让蒙版和卡片淡出，过 160ms 再真卸载
    var MODAL_EXIT_MS = 160;

    function useModalDismiss(onClose) {
      var closingState = React.useState(false);
      var closing = closingState[0];
      var setClosing = closingState[1];
      var timerRef = React.useRef(null);
      function requestClose() {
        if (timerRef.current) return;
        setClosing(true);
        timerRef.current = setTimeout(function () {
          timerRef.current = null;
          onClose();
        }, MODAL_EXIT_MS);
      }
      React.useEffect(function () {
        return function () {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        };
      }, []);
      return { closing: closing, requestClose: requestClose };
    }

    // 蒙版关闭的正确判据：按下和松开都要落在蒙版上。
    // 在窗口里按下、拖到外面松开（比如框选文字）不能算关闭——那只是想拖出去
    function useMaskClose(onClose) {
      var downRef = React.useRef(false);
      return {
        onMouseDown: function (e) {
          downRef.current = e.target === e.currentTarget;
        },
        onMouseUp: function (e) {
          var hit = downRef.current && e.target === e.currentTarget;
          downRef.current = false;
          if (hit) onClose();
        },
        onMouseLeave: function () {
          downRef.current = false;
        },
      };
    }

    function TarotModal(props) {
      var spread = props.spread;
      var t = props.t;
      var dismiss = useModalDismiss(props.onClose);
      var mask = useMaskClose(dismiss.requestClose);
      var SLOT = { past: t("tarot.past"), present: t("tarot.present"), future: t("tarot.future") };
      // 位置专属解读优先；表里缺项时退回牌义本体
      function meaning(index, slot, reversed) {
        var pos = TAROT_POS[index];
        var pair = pos && pos[slot];
        if (pair && pair[0]) return String(reversed ? pair[1] : pair[0]);
        return String(reversed ? TAROT[index][3] : TAROT[index][2]);
      }
      var rev = 0;
      for (var i = 0; i < spread.cards.length; i++) {
        if (spread.cards[i].reversed) rev++;
      }
      return h(
        "div",
        Object.assign({ className: "wcd-mask", "data-closing": dismiss.closing ? "true" : "false" }, mask),
        h(
          "div",
          { className: "wcd-gua wcd-tarot-modal", onClick: function (e) { e.stopPropagation(); } },
          h(
            "div",
            { className: "wcd-gua-head" },
            h("span", { className: "wcd-gua-name" }, t("tarot.spread")),
            h("span", { className: "wcd-tarot-en" }, t("tarot.spread.en")),
            h(
              "button",
              { className: "wcd-gua-close", type: "button", onClick: dismiss.requestClose },
              "×",
            ),
          ),
          h(
            "div",
            { className: "wcd-tarot-spread" },
            spread.cards.map(function (it, i) {
              var slot = spread.slots[i];
              return h(
                "div",
                { className: "wcd-tarot-slot", key: "slot" + i },
                h("span", { className: "wcd-tarot-slot-name" }, SLOT[slot]),
                h(
                  "div",
                  { className: "wcd-tarot-face" },
                  it.index !== undefined && TAROT_IMG[it.index]
                    ? h("img", {
                        className: "wcd-tarot-img",
                        src: TAROT_IMG[it.index],
                        alt: "",
                        draggable: false,
                        "data-rev": it.reversed ? "true" : "false",
                      })
                    : h(TarotIcon),
                ),
                h("span", { className: "wcd-tarot-slot-card" }, it.card[0]),
                h("span", { className: "wcd-tarot-badge", "data-rev": it.reversed ? "true" : "false" },
                  it.reversed ? t("tarot.reversed") : t("tarot.upright")),
                h("span", { className: "wcd-tarot-slot-text" }, meaning(it.index, slot, it.reversed)),
              );
            }),
          ),
          h("div", { className: "wcd-tarot-sum" }, t("tarot.sum." + rev)),
          h("div", { className: "wcd-gua-foot" }, t("gua.foot")),
        ),
      );
    }

    // 起卦：三枚铜钱摇六次。每爻正面数 0~3，对应 1/8 老阴、3/8 少阴、3/8 少阳、1/8 老阳；
    // 老阴 / 老阳为动爻，翻转后得到变卦。纯本地随机（系统熵池），用完即弃。
    function pickGua() {
      var buf = new Uint32Array(1);
      function rand(n) {
        try {
          if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(buf);
          else buf[0] = Math.floor(Math.random() * 4294967296);
        } catch (e) {
          buf[0] = Math.floor(Math.random() * 4294967296);
        }
        return buf[0] % n;
      }
      function find(pattern) {
        for (var i = 0; i < GUA.length; i++) {
          if (GUA[i][2] === pattern) return GUA[i];
        }
        return null;
      }
      var bits = [];
      var next = [];
      var moves = [];
      for (var i = 0; i < 6; i++) {
        var k = rand(2) + rand(2) + rand(2);
        // 正面数为奇是阳爻（少阴 / 少阳以外的那两档），为偶是阴爻
        var yang = k % 2 === 1;
        var move = k === 0 || k === 3;
        bits.push(yang ? "1" : "0");
        next.push(move ? (yang ? "0" : "1") : (yang ? "1" : "0"));
        if (move) moves.push(i);
      }
      var pattern = bits.join("");
      var changedPattern = next.join("");
      return {
        gua: find(pattern) || GUA[0],
        changed: find(changedPattern) || GUA[0],
        moves: moves,
      };
    }

    // 六爻图：自下而上的位串，画的时候从上往下；动爻把爻线染蓝
    function GuaLines(props) {
      var pattern = props.pattern || "000000";
      var moves = props.moves || [];
      var rows = [];
      for (var i = 5; i >= 0; i--) {
        var yang = pattern.charAt(i) === "1";
        rows.push(
          h(
            "div",
            {
              className: "wcd-yao-row",
              key: "y" + i,
              "data-move": moves.indexOf(i) >= 0 ? "true" : "false",
            },
            yang
              ? h("span", { className: "wcd-yao-line" })
              : h("span", { className: "wcd-yao-split" }, h("i"), h("i")),
          ),
        );
      }
      return h("div", { className: "wcd-yao" }, rows);
    }

    function GuaModal(props) {
      var spread = props.spread;
      var t = props.t;
      var dismiss = useModalDismiss(props.onClose);
      var mask = useMaskClose(dismiss.requestClose);
      var gua = spread.gua;
      var changed = spread.changed;
      var moves = spread.moves || [];
      var still = !changed || changed[2] === gua[2];
      var moveText = still
        ? t("gua.still")
        : t("gua.moves") + "：" + moves.map(function (i) { return t("gua.pos." + i); }).join("、");
      return h(
        "div",
        Object.assign({ className: "wcd-mask", "data-closing": dismiss.closing ? "true" : "false" }, mask),
        h(
          "div",
          { className: "wcd-gua", onClick: function (e) { e.stopPropagation(); } },
          h(
            "div",
            { className: "wcd-gua-head" },
            h("span", { className: "wcd-gua-num" }, t("gua.num") + " " + gua[0]),
            h("span", { className: "wcd-gua-name" }, gua[3] + gua[1]),
            h(
              "button",
              { className: "wcd-gua-close", type: "button", onClick: dismiss.requestClose, title: t("gua.close") },
              "×",
            ),
          ),
          h(
            "div",
            { className: "wcd-gua-body" },
            h(
              "div",
              { className: "wcd-gua-pair" },
              h(
                "div",
                { className: "wcd-gua-half" },
                h("span", { className: "wcd-gua-tag" }, t("gua.primary")),
                h(GuaLines, { pattern: gua[2], moves: moves }),
              ),
              still
                ? null
                : h(
                    "div",
                    { className: "wcd-gua-half" },
                    h("span", { className: "wcd-gua-tag" }, t("gua.changed") + " · " + changed[3] + changed[1]),
                    h(GuaLines, { pattern: changed[2] }),
                  ),
            ),
            h(
              "div",
              { className: "wcd-gua-text" },
              h("div", { className: "wcd-gua-move" }, moveText),
              h("div", { className: "wcd-gua-judgment" }, gua[4]),
              h("div", { className: "wcd-gua-gloss" }, gua[5]),
              still
                ? null
                : h(
                    "div",
                    { className: "wcd-gua-change" },
                    h("div", { className: "wcd-gua-judgment" }, changed[4]),
                    h("div", { className: "wcd-gua-gloss" }, changed[5]),
                  ),
            ),
          ),
          h("div", { className: "wcd-gua-foot" }, t("gua.foot")),
        ),
      );
    }

    // 每秒一拍的「现在」。每拍都读 Date.now()，后台标签页被节流后回到前台也不会累计误差。
    function useNow() {
      var state = React.useState(function () { return Date.now(); });
      var now = state[0];
      var setNow = state[1];
      React.useEffect(function () {
        var id = setInterval(function () { setNow(Date.now()); }, 1000);
        return function () { clearInterval(id); };
      }, []);
      return now;
    }

    // 读配置；remote 可能晚于挂载就绪，前 20 秒按 500ms 补读，期间先用缺省值
    function useConfig(ctx) {
      var state = React.useState(FALLBACK);
      var cfg = state[0];
      var setCfg = state[1];
      React.useEffect(function () {
        var alive = true;
        var retry = null;
        var tries = 0;
        var off = null;

        function readOnce() {
          if (!getRemote(ctx)) return false;
          describeNamespace(ctx).then(function (hit) {
            if (alive && hit) setCfg(normalize(hit.value));
          }).catch(function () { /* 配置读不到就继续用缺省值 */ });
          return true;
        }

        if (!readOnce()) {
          retry = setInterval(function () {
            tries += 1;
            if (readOnce() || tries >= 40) {
              clearInterval(retry);
              retry = null;
            }
          }, 500);
        }

        var remote = getRemote(ctx);
        if (remote && typeof remote.$on === 'function') {
          try {
            off = remote.$on('settings/document-updated', function () { readOnce(); });
          } catch (e) {
            off = null;
          }
        }

        return function () {
          alive = false;
          if (retry) clearInterval(retry);
          if (typeof off === 'function') {
            try {
              off();
            } catch (e) {
              /* 退订失败不影响其它清理 */
            }
          }
        };
      }, []);
      return cfg;
    }

    // 把「现在」换算成一段可渲染的状态。纯函数，每秒重算一次，不缓存、不漂移。
    function describe(cfg, now, t) {
      var start = parseHM(cfg.workStart);
      var end = parseHM(cfg.workEnd);
      // 时间非法或倒挂（下班早于上班）时退回默认班次，避免出现永远「已下班」的假状态
      if (start < 0 || end < 0 || end <= start) {
        start = 9 * 60;
        end = 18 * 60;
      }
      var title = t('label.start') + ' ' + fmtHM(start) + ' · ' + t('label.end') + ' ' + fmtHM(end);

      var d = new Date(now);
      if (parseDays(cfg.workdays).indexOf(d.getDay()) < 0) {
        return { kind: 'rest', tone: '', label: t('state.rest'), num: '', title: title };
      }
      var nowSec = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
      var startSec = start * 60;
      var endSec = end * 60;
      if (nowSec < startSec) {
        return {
          kind: 'before',
          tone: '',
          label: t('state.before'),
          num: fmtDur(startSec - nowSec, cfg.showSeconds),
          title: title,
        };
      }
      if (nowSec < endSec) {
        var left = endSec - nowSec;
        return {
          kind: 'work',
          tone: '',
          label: t('state.down'),
          num: fmtDur(left, cfg.showSeconds),
          title: title,
        };
      }
      return { kind: 'done', tone: '', label: t('state.done'), num: '', title: title };
    }

    // 主键区：每行右端分别是 F12 / 退格 / 反斜杠 / 回车 / 右 Shift / 右 Ctrl，行宽统一 15 单位
    var KEY_MAIN = [
      [['Escape', 'Esc', 1.5], ['F1', 'F1'], ['F2', 'F2'], ['F3', 'F3'], ['F4', 'F4'],
        ['F5', 'F5'], ['F6', 'F6'], ['F7', 'F7'], ['F8', 'F8'], ['F9', 'F9'],
        ['F10', 'F10'], ['F11', 'F11'], ['F12', 'F12']],
      [['Backquote', '`'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'],
        ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'],
        ['Digit0', '0'], ['Minus', '-'], ['Equal', '='], ['Backspace', '⌫', 2]],
      [['Tab', 'Tab', 1.5], ['KeyQ', 'Q'], ['KeyW', 'W'], ['KeyE', 'E'], ['KeyR', 'R'],
        ['KeyT', 'T'], ['KeyY', 'Y'], ['KeyU', 'U'], ['KeyI', 'I'], ['KeyO', 'O'],
        ['KeyP', 'P'], ['BracketLeft', '['], ['BracketRight', ']'], ['Backslash', '\\', 1.5]],
      [['CapsLock', 'Caps', 1.75], ['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'], ['KeyF', 'F'],
        ['KeyG', 'G'], ['KeyH', 'H'], ['KeyJ', 'J'], ['KeyK', 'K'], ['KeyL', 'L'],
        ['Semicolon', ';'], ['Quote', "'"], ['Enter', '↵', 2.25]],
      [['ShiftLeft', 'Shift', 2.25], ['KeyZ', 'Z'], ['KeyX', 'X'], ['KeyC', 'C'],
        ['KeyV', 'V'], ['KeyB', 'B'], ['KeyN', 'N'], ['KeyM', 'M'], ['Comma', ','],
        ['Period', '.'], ['Slash', '/'], ['ShiftRight', 'Shift', 2.75]],
      [['ControlLeft', 'Ctrl', 1.25], ['MetaLeft', 'Win', 1.25], ['AltLeft', 'Alt', 1.25],
        ['Space', 'Space'], ['AltRight', 'Alt', 1.25], ['MetaRight', 'Win', 1.25],
        ['ContextMenu', 'Menu', 1.25], ['ControlRight', 'Ctrl', 1.25]],
    ];

    // 辅助区：严格 3 列 grid，共 6 行，与主键区等高
    var KEY_NAV = [
      ['PrintScreen', 'Prt'], ['ScrollLock', 'Scr'], ['Pause', 'Pau'],
      ['Insert', 'Ins'], ['Home', 'Home'], ['PageUp', 'PgUp'],
      ['Delete', 'Del'], ['End', 'End'], ['PageDown', 'PgDn'],
      { deco: 'pond', w: 2 }, { deco: 'rock', w: 1 },
      null, ['ArrowUp', '↑'], null,
      ['ArrowLeft', '←'], ['ArrowDown', '↓'], ['ArrowRight', '→'],
    ];

    // 小键盘：严格 4 列 grid，第一行留空、整体下移一行；+ 与 ↵ 各占 1 列 2 行，0 占 1 行 2 列
    var KEY_PAD = [
      { g: 1, col: 1, row: 1 },
      { g: 1, col: 2, row: 1 },
      { g: 1, col: 3, row: 1 },
      { g: 1, col: 4, row: 1 },
      { c: 'NumLock', l: 'Num', col: 1, row: 2 },
      { c: 'NumpadDivide', l: '/', col: 2, row: 2 },
      { c: 'NumpadMultiply', l: '*', col: 3, row: 2 },
      { c: 'NumpadSubtract', l: '-', col: 4, row: 2 },
      { c: 'Numpad7', l: '7', col: 1, row: 3 },
      { c: 'Numpad8', l: '8', col: 2, row: 3 },
      { c: 'Numpad9', l: '9', col: 3, row: 3 },
      { c: 'NumpadAdd', l: '+', col: 4, row: 3, h: 2 },
      { c: 'Numpad4', l: '4', col: 1, row: 4 },
      { c: 'Numpad5', l: '5', col: 2, row: 4 },
      { c: 'Numpad6', l: '6', col: 3, row: 4 },
      { c: 'Numpad1', l: '1', col: 1, row: 5 },
      { c: 'Numpad2', l: '2', col: 2, row: 5 },
      { c: 'Numpad3', l: '3', col: 3, row: 5 },
      { c: 'NumpadEnter', l: '↵', col: 4, row: 5, h: 2 },
      { c: 'Numpad0', l: '0', col: 1, row: 6, w: 2 },
      { c: 'NumpadDecimal', l: '.', col: 3, row: 6 },
    ];

    // 次数太长就缩写，格子只有 12px 宽
    function keyCountText(n) {
      var v = Number(n) || 0;
      if (v >= 1000000) return Math.round(v / 1000000) + 'm';
      if (v >= 1000) return Math.round(v / 1000) + 'k';
      return String(v);
    }

    // 键盘作物图：6 档，扁平田园风。画布 30x60，底部对齐格子底，
    // 高等级的植物会向上长出格子边界，做出生长和立体感。
    // 草地色：越贫瘠越接近枯草/灰绿，越肥沃越饱和的绿
    var PLOT_TINT = ['#e3dfcc', '#dbe0b4', '#ccd89a', '#b8cf7c', '#9ec25e', '#83b348'];
    // 下层泥土：越肥沃越深
    var PLOT_SIDE = ['#9c7b52', '#957349', '#8c6a41', '#836039', '#785530', '#6d4b28'];

    // 每格种什么、朝哪边、偏多少：这一格的外观在「从 0 次到第一次按下」时
    // 随机定下来并存进 keyCrops，之后只长不换，跟按键次数一起持久化。
    var CROP_KINDS = ['carrot', 'tomato', 'cabbage', 'corn', 'potato'];

    function parseCrops(raw) {
      if (typeof raw !== 'string' || raw === '') return {};
      try {
        var obj = JSON.parse(raw);
        return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
      } catch (e) {
        return {};
      }
    }

    function randomLook() {
      return {
        crop: CROP_KINDS[Math.floor(Math.random() * CROP_KINDS.length)],
        flip: Math.random() < 0.5 ? -1 : 1,
        dx: Math.round(Math.random() * 4 - 2),
        dy: Math.round(Math.random() * 4 - 2),
        // 摆动幅度 1.0 ~ 3.0 度，步进 0.1
        amp: Number((1 + Math.random() * 2).toFixed(1)),
      };
    }

    function normalizeLook(look) {
      var l = look && typeof look === 'object' ? look : {};
      function num(v, lo, hi, fallback) {
        var n = Number(v);
        return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : fallback;
      }
      return {
        crop: CROP_KINDS.indexOf(l.crop) >= 0 ? l.crop : 'carrot',
        flip: l.flip === -1 ? -1 : 1,
        dx: Math.round(num(l.dx, -2, 2, 0)),
        dy: Math.round(num(l.dy, -2, 2, 0)),
        amp: Number(num(l.amp, 1, 3, 1.8).toFixed(1)),
      };
    }

    // 兼容两种历史格式：字符串（只有作物名）/ 对象（完整外观）
    function parseLooks(raw) {
      var map = parseCrops(raw);
      var out = {};
      for (var k in map) {
        var v = map[k];
        out[k] = normalizeLook(typeof v === 'string' ? { crop: v } : v);
      }
      return out;
    }

    function lookOf(code, map) {
      var hit = map && map[code];
      return hit ? normalizeLook(hit) : normalizeLook(null);
    }

    // 作物六档 = 六个生长阶段，全部画在统一画布 30x60、根贴画布底（= 键中心土面）。
    // 萝卜埋在土里的部分画超出画布底边，被裁掉，只留露出的上半截。
    function CropSprite() {
      function sym(id, kids) {
        return h('symbol', { id: id, viewBox: '0 0 30 60' }, kids);
      }
      return h(
        'svg',
        { className: 'wcd-sprite', 'aria-hidden': 'true' },
        h(
          'defs',
          null,
          // 0 荒地：什么都不长
          sym('wcd-crop-0', []),
          // 1 独苗：刚破土，只有一根茎，没有叶
          sym('wcd-crop-1', [
            h('path', { d: 'M15 60V55C15 52.4 13.5 50.8 11 51.4', stroke: '#3f7f34', strokeWidth: 1.9, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M11 51.4c-.9 .2-1.5 .8-1.8 1.5', stroke: '#5aa94a', strokeWidth: 1.3, strokeLinecap: 'round', fill: 'none' }),
          ]),
          // 2 幼苗：主苗长出真叶，周围再冒几根刚破土的小茎
          sym('wcd-crop-2', [
            h('path', { d: 'M9.6 60C9.6 57.4 8.8 55 7.7 53.3', stroke: '#4e9a44', strokeWidth: 1.5, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M5.9 60C6 57.8 5.6 56.2 4.9 55.3', stroke: '#5aa94a', strokeWidth: 1.3, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M20.9 60C20.9 57.6 21.6 55.3 22.5 53.6', stroke: '#4e9a44', strokeWidth: 1.5, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M24.2 60C24.1 58 24.5 56.6 25.2 55.8', stroke: '#5aa94a', strokeWidth: 1.3, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 60C15 55 14.4 51.2 14.9 47', stroke: '#3f7f34', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 50c-3 0-5.2-1.9-5.2-4.5 3 .4 5.2 2.3 5.2 4.5z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 51.8c3 0 5.2-1.9 5.2-4.5-3 .4-5.2 2.3-5.2 4.5z', fill: '#5aa94a' }),
          ]),
          // 3 草丛：五根草叶高低错落 + 一根亮色细草 + 第一朵小花
          sym('wcd-crop-3', [
            h('path', {
              d: 'M9 60C9 54 8 49 6.5 45M12.5 60C12.5 53 11.5 47.5 10 42.5M15.5 60C16 52 16 45.5 15.5 39.5M19 60C20 54 21 48.5 22.5 44.5M22.5 60C23 56 24 53 25 50',
              stroke: '#4e9a44', strokeWidth: 1.7, strokeLinecap: 'round', fill: 'none',
            }),
            h('path', { d: 'M10.8 60C10.8 55 10 51 9 47.8', stroke: '#7fcf6a', strokeWidth: 1.1, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M6.5 45V43', stroke: '#4e9a44', strokeWidth: 1.1, strokeLinecap: 'round', fill: 'none' }),
            h('circle', { cx: 6.5, cy: 41.2, r: 2, fill: '#f6c445' }),
            h('circle', { cx: 6.5, cy: 41.2, r: 0.7, fill: '#e39a1c' }),
          ]),
          // 4 结果：羽状叶丛散开，萝卜肩刚顶出土面一点点
          sym('wcd-crop-4-carrot', [
            h('path', {
              d: 'M14.5 53C13.2 45 11 37.5 8.8 31.5M15.5 53C16.8 45 19 37.5 21.2 31.5M14 53C13.2 48.5 11.6 43.5 9.6 39.5M16 53C16.8 48.5 18.4 43.5 20.4 39.5',
              stroke: '#4e9a44', strokeWidth: 1.7, strokeLinecap: 'round', fill: 'none',
            }),
            h('path', { d: 'M15 53C15 46.5 14.7 38 14.3 30', stroke: '#6fbf5c', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' }),
            // 萝卜肩：只有 7px 冒出土面
            h('path', {
              d: 'M15 53c-2.7 0-4.6 1.7-4.6 4.2 0 1 .3 1.9 .9 2.8h7.4c.6-.9 .9-1.8 .9-2.8 0-2.5-1.9-4.2-4.6-4.2z',
              fill: '#ef7a3d',
            }),
            h('path', { d: 'M15 53c-1.7 0-3.1.7-3.9 1.9.7.5 2.1.8 3.9.8s3.2-.3 3.9-.8c-.8-1.2-2.2-1.9-3.9-1.9z', fill: '#f7a06b' }),
            h('path', { d: 'M7 60C6.7 56 6 52.5 4.8 49.6', stroke: '#4e9a44', strokeWidth: 1.1, strokeLinecap: 'round', fill: 'none' }),
            h('circle', { cx: 4.8, cy: 47.8, r: 1.8, fill: '#f6c445' }),
            h('circle', { cx: 4.8, cy: 47.8, r: 0.7, fill: '#e39a1c' }),
          ]),
          // 5 成熟：大半截萝卜露出土面，带横纹和亮面，大叶冠 + 两侧草花
          sym('wcd-crop-5-carrot', [
            h('path', {
              d: 'M14.5 36C13 30.5 11 26 8.5 22.5M15.5 36C17 30.5 19 26 21.5 22.5M14 36C13.1 32 11.7 28.5 9.7 25.5M16 36C16.9 32 18.3 28.5 20.3 25.5',
              stroke: '#4e9a44', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none',
            }),
            h('path', { d: 'M15 36C15 30 14.8 25 14.5 22', stroke: '#6fbf5c', strokeWidth: 1.9, strokeLinecap: 'round', fill: 'none' }),
            // 萝卜露出 24px，底部到画布底边为止
            h('path', {
              d: 'M15 36c-3 0-5.2 1.9-5.2 4.8 0 3.6 1.7 9 5.2 19.2 3.5-10.2 5.2-15.6 5.2-19.2 0-2.9-2.2-4.8-5.2-4.8z',
              fill: '#ef7a3d', transform: 'rotate(-5 15 52)',
            }),
            h('path', { d: 'M15 36c-2.2 0-4 1.2-4.8 3.1 1 .6 2.6 1 4.8 1s3.8-.4 4.8-1c-.8-1.9-2.6-3.1-4.8-3.1z', fill: '#f7a06b', transform: 'rotate(-5 15 52)' }),
            h('path', {
              d: 'M11.2 47c2.5.8 5.1.8 7.6 0M12 53.5c2 .6 4 .6 6 0',
              stroke: '#c9552a', strokeWidth: 0.8, strokeLinecap: 'round', fill: 'none', opacity: 0.55,
              transform: 'rotate(-5 15 52)',
            }),
            h('path', { d: 'M7 60C6.6 54.5 5.6 49.5 4.2 45.2', stroke: '#4e9a44', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
            h('circle', { cx: 4.2, cy: 43.2, r: 2, fill: '#f6c445' }),
            h('circle', { cx: 4.2, cy: 43.2, r: 0.8, fill: '#e39a1c' }),
            h('path', { d: 'M23 60C23.4 55 24.4 50.5 25.8 46.8', stroke: '#4e9a44', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
            h('circle', { cx: 25.8, cy: 44.8, r: 2, fill: '#f6c445' }),
            h('circle', { cx: 25.8, cy: 44.8, r: 0.8, fill: '#e39a1c' }),
            // 旁边的小萝卜：只露出一点肩头
            h('path', {
              d: 'M8.2 54c-2.4 0-4.1 1.4-4.1 3.4 0 .9 .3 1.8 .9 2.8h6.4c.6-1 .9-1.9 .9-2.8 0-2-1.7-3.4-4.1-3.4z',
              fill: '#ef7a3d',
            }),
            h('path', { d: 'M8.2 54c-1.5 0-2.7.5-3.4 1 .6.4 1.8.7 3.4.7s2.8-.3 3.4-.7c-.7-.5-1.9-1-3.4-1z', fill: '#f7a06b' }),
            h('path', { d: 'M6.4 53.8C5.9 50.8 5.1 48.2 4.2 46', stroke: '#4e9a44', strokeWidth: 1.2, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M22.8 56.4c-1.6 0-2.7 1-2.7 2.3 0 .6 .2 1.2 .6 1.7h4.4c.4-.5 .6-1.1 .6-1.7 0-1.3-1.1-2.3-2.7-2.3z', fill: '#ef7a3d', transform: 'rotate(4 22.8 58)' }),
            h('path', { d: 'M22.8 56.4c-.9 0-1.7.3-2.2.6 .4.3 1.2.4 2.2.4s1.8-.1 2.2-.4c-.5-.3-1.3-.6-2.2-.6z', fill: '#f7a06b', transform: 'rotate(4 22.8 58)' }),
            h('path', { d: 'M24.6 56.1C25.1 54.2 25.7 52.5 26.4 51', stroke: '#4e9a44', strokeWidth: 1.1, strokeLinecap: 'round', fill: 'none' }),
          ]),
          // 4/5 档的番茄
          sym('wcd-crop-4-tomato', [
            h('path', { d: 'M15 60V45', stroke: '#3f7f34', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 50c-3.4 0-5.8-2-5.8-4.6 3.4 .5 5.8 2.4 5.8 4.6z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 52.2c3.4 0 5.8-2 5.8-4.6-3.4 .5-5.8 2.4-5.8 4.6z', fill: '#5aa94a' }),
            h('path', { d: 'M15 47c-2.6 0-4.4-1.6-4.4-3.6 2.6 .4 4.4 1.8 4.4 3.6z', fill: '#7fcf6a' }),
            // 果实坐在茎顶上
            h('circle', { cx: 15, cy: 40, r: 5.6, fill: '#e2503f' }),
            h('circle', { cx: 13.2, cy: 38.2, r: 1.9, fill: '#f39180', opacity: 0.9 }),
            h('path', {
              d: 'M15 34.2 16.1 37.2 19.2 37.6 16.8 39.5 17.5 42.4 15 40.7 12.5 42.4 13.2 39.5 10.8 37.6 13.9 37.2z',
              fill: '#4f9a3e',
            }),
          ]),
          sym('wcd-crop-5-tomato', [
            h('path', { d: 'M15 60V36', stroke: '#3f7f34', strokeWidth: 1.9, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 48c-4 0-6.8-2.4-6.8-5.4 4 .6 6.8 2.8 6.8 5.4z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 50.6c4 0 6.8-2.4 6.8-5.4-4 .6-6.8 2.8-6.8 5.4z', fill: '#5aa94a' }),
            h('path', { d: 'M15 43c-3.2 0-5.4-2-5.4-4.4 3.2 .5 5.4 2.2 5.4 4.4z', fill: '#7fcf6a' }),
            // 主果
            h('circle', { cx: 15, cy: 29, r: 7, fill: '#e2503f' }),
            h('circle', { cx: 12.8, cy: 26.8, r: 2.4, fill: '#f39180', opacity: 0.9 }),
            h('path', {
              d: 'M15 22.4 16.3 25.9 19.9 26.4 17.1 28.6 17.9 32 15 30 12.1 32 12.9 28.6 10.1 26.4 13.7 25.9z',
              fill: '#4f9a3e',
            }),
            // 侧果：贴着主果右下方长出
            h('circle', { cx: 23.4, cy: 42, r: 3.8, fill: '#d9483a' }),
            h('circle', { cx: 22.4, cy: 40.8, r: 1.3, fill: '#f39180', opacity: 0.85 }),
            h('path', {
              d: 'M23.4 38.4 24 40.4 26 40.7 24.4 42 24.8 44 23.4 42.9 22 44 22.4 42 20.8 40.7 22.8 40.4z',
              fill: '#4f9a3e',
            }),
          ]),
          // 4/5 档的卷心菜
          sym('wcd-crop-4-cabbage', [
            // 外层翻开的叶子
            h('path', { d: 'M15 59c-5.2 0-9.4-2.4-10.8-6.2 5.2 .8 9.4 3.2 10.8 6.2z', fill: '#7fb350' }),
            h('path', { d: 'M15 59c5.2 0 9.4-2.4 10.8-6.2-5.2 .8-9.4 3.2-10.8 6.2z', fill: '#6da545' }),
            h('path', { d: 'M15 59c-3.8-1.4-6.4-4.2-7.4-7.8 4 1.8 6.8 4.6 7.4 7.8z', fill: '#8fbf5e' }),
            h('path', { d: 'M15 59c3.8-1.4 6.4-4.2 7.4-7.8-4 1.8-6.8 4.6-7.4 7.8z', fill: '#7fb350' }),
            // 菜球
            h('ellipse', { cx: 15, cy: 49, rx: 9.6, ry: 8.6, fill: '#b8d98a' }),
            h('ellipse', { cx: 15, cy: 48, rx: 7.6, ry: 6.9, fill: '#cfe8a8' }),
            h('ellipse', { cx: 15, cy: 47, rx: 5, ry: 4.4, fill: '#e0f0c0' }),
            // 叶脉：菜心 + 向外发散的弧线（不闭合）
            h('circle', { cx: 15, cy: 44.6, r: 1.5, fill: '#c9e39f' }),
            h('path', {
              d: 'M15 46.2c-1.7 1.9-2.9 4.2-3.5 6.6M15 46.2c1.7 1.9 2.9 4.2 3.5 6.6',
              stroke: '#9dc46a', strokeWidth: 0.7, strokeLinecap: 'round', fill: 'none',
            }),
            h('path', {
              d: 'M13.4 47.6c-.6 1.9-.9 4-.9 6.2M16.6 47.6c.6 1.9 .9 4 .9 6.2',
              stroke: '#aed383', strokeWidth: 0.6, strokeLinecap: 'round', fill: 'none',
            }),
          ]),
          sym('wcd-crop-5-cabbage', [
            // 外层翻开的叶子
            h('path', { d: 'M12 60c-6.2 0-11.4-2.8-12.8-6.8 6.2 .8 10.8 3.4 12.8 6.8z', fill: '#7fb350' }),
            h('path', { d: 'M12 60c6.2 0 11.4-2.8 12.8-6.8-6.2 .8-10.8 3.4-12.8 6.8z', fill: '#6da545' }),
            // 主球
            h('ellipse', { cx: 11.5, cy: 46, rx: 10.8, ry: 9.8, fill: '#b8d98a' }),
            h('ellipse', { cx: 11.5, cy: 45, rx: 8.4, ry: 7.6, fill: '#cfe8a8' }),
            h('ellipse', { cx: 11.5, cy: 44, rx: 5.4, ry: 4.8, fill: '#e0f0c0' }),
            h('circle', { cx: 11.5, cy: 42.4, r: 1.7, fill: '#c9e39f' }),
            h('path', {
              d: 'M11.5 44.2c-2 2.2-3.4 5-4.1 7.8M11.5 44.2c2 2.2 3.4 5 4.1 7.8',
              stroke: '#9dc46a', strokeWidth: 0.8, strokeLinecap: 'round', fill: 'none',
            }),
            h('path', {
              d: 'M9.6 45.9c-.7 2.2-1.1 4.7-1.1 7.3M13.4 45.9c.7 2.2 1.1 4.7 1.1 7.3',
              stroke: '#aed383', strokeWidth: 0.7, strokeLinecap: 'round', fill: 'none',
            }),
            // 旁边的小卷心菜
            h('path', { d: 'M25 59c-2.8 0-5.2-1.4-6-3.6 2.8 .5 5.2 1.8 6 3.6z', fill: '#7fb350' }),
            h('ellipse', { cx: 24.4, cy: 53.5, rx: 5.4, ry: 4.8, fill: '#b8d98a' }),
            h('ellipse', { cx: 24.4, cy: 52.8, rx: 4, ry: 3.5, fill: '#cfe8a8' }),
            h('circle', { cx: 24.4, cy: 51.6, r: 0.9, fill: '#c9e39f' }),
            h('path', {
              d: 'M24.4 52.4c-1.1 1.1-1.9 2.4-2.3 3.9M24.4 52.4c1.1 1.1 1.9 2.4 2.3 3.9',
              stroke: '#9dc46a', strokeWidth: 0.6, strokeLinecap: 'round', fill: 'none',
            }),
          ]),
          // 4/5 档的玉米
          sym('wcd-crop-4-corn', [
            h('path', { d: 'M15 60V33', stroke: '#5f9a3c', strokeWidth: 2, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 47c-4-1-7.2-3.8-8.6-7.6 3.6 1 6.6 3.4 8.6 7.6z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 43c4-1 7.2-3.8 8.6-7.6-3.6 1-6.6 3.4-8.6 7.6z', fill: '#5aa94a' }),
            h('path', { d: 'M15 51c-3.4-.6-6-2.4-7.4-5 3 .2 5.6 1.8 7.4 5z', fill: '#7fcf6a' }),
            // 玉米棒
            h('ellipse', { cx: 15, cy: 38, rx: 4, ry: 7.6, fill: '#f0d987' }),
            h('path', {
              d: 'M13 35.4c1.4 .5 2.6 .5 4 0M12.6 38.4c1.6 .5 3.2 .5 4.8 0M12.6 41.4c1.6 .5 3.2 .5 4.8 0M13 44.2c1.4 .4 2.6 .4 4 0',
              stroke: '#d4b24a', strokeWidth: 0.6, fill: 'none',
            }),
            // 苞叶包住棒的下半截
            h('path', { d: 'M15 48c-2.6-1.4-4-4-4-7.4 2.4 1.6 3.8 4.2 4 7.4z', fill: '#6da545' }),
            h('path', { d: 'M15 48c2.6-1.4 4-4 4-7.4-2.4 1.6-3.8 4.2-4 7.4z', fill: '#7fb350' }),
          ]),
          sym('wcd-crop-5-corn', [
            h('path', { d: 'M15 60V26', stroke: '#5f9a3c', strokeWidth: 2.1, strokeLinecap: 'round', fill: 'none' }),
            // 顶部雄花
            h('path', { d: 'M15 26c-3-2-5-5-5.5-8M15 26c3-2 5-5 5.5-8M15 26v-9', stroke: '#8fbf5e', strokeWidth: 0.8, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 48c-4.6-1.2-8.2-4.4-9.6-8.8 4 1.2 7.6 4 9.6 8.8z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 42c4.6-1.2 8.2-4.4 9.6-8.8-4 1.2-7.6 4-9.6 8.8z', fill: '#5aa94a' }),
            h('path', { d: 'M15 53c-3.8-.8-6.6-2.8-8-5.8 3.4 .4 6.2 2.2 8 5.8z', fill: '#7fcf6a' }),
            // 主棒
            h('path', { d: 'M15 30c-2.8 0-4.6 2.2-4.6 5.6 0 4.4 2 8.4 4.6 10.4 2.6-2 4.6-6 4.6-10.4 0-3.4-1.8-5.6-4.6-5.6z', fill: '#f0d987' }),
            h('path', {
              d: 'M12 34c2 .6 4 .6 6 0M11.8 38c2.2 .7 4.4 .7 6.6 0M11.8 42c2.2 .7 4.4 .7 6.6 0M12.4 46c1.8 .6 3.6 .6 5.4 0M13.6 49.4c1 .3 2 .3 3 0',
              stroke: '#d4b24a', strokeWidth: 0.65, fill: 'none',
            }),
            // 苞叶
            h('path', { d: 'M15 51c-3-1.6-4.6-4.6-4.6-8.4 2.8 1.8 4.4 4.8 4.6 8.4z', fill: '#6da545' }),
            h('path', { d: 'M15 51c3-1.6 4.6-4.6 4.6-8.4-2.8 1.8-4.4 4.8-4.6 8.4z', fill: '#7fb350' }),
            // 侧边小玉米棒
            h('ellipse', { cx: 22, cy: 44, rx: 2.6, ry: 4.6, fill: '#f0d987', transform: 'rotate(18 22 44)' }),
            h('path', {
              d: 'M21 41.5c.7 .2 1.4 .2 2.1 0M20.6 44c.9 .3 1.8 .3 2.7 0M21 46.5c.7 .2 1.4 .2 2.1 0',
              stroke: '#d4b24a', strokeWidth: 0.5, fill: 'none', transform: 'rotate(18 22 44)',
            }),
          ]),
          // 4/5 档的土豆
          sym('wcd-crop-4-potato', [
            h('path', { d: 'M15 47V42', stroke: '#4e9a44', strokeWidth: 1.6, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 45c-2.6 0-4.4-1.4-4.8-3.4 2.6 .4 4.4 1.6 4.8 3.4z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 44c2.6 0 4.4-1.4 4.8-3.4-2.6 .4-4.4 1.6-4.8 3.4z', fill: '#5aa94a' }),
            // 土豆大半埋在土里，只露顶
            h('ellipse', { cx: 15, cy: 54, rx: 8, ry: 6.5, fill: '#d4a24a' }),
            h('ellipse', { cx: 13.5, cy: 52.4, rx: 4.6, ry: 3, fill: '#e0b566', opacity: 0.8 }),
            h('circle', { cx: 11.8, cy: 54.6, r: 0.9, fill: '#b08030', opacity: 0.7 }),
            h('circle', { cx: 17.6, cy: 52.8, r: 0.8, fill: '#b08030', opacity: 0.7 }),
            h('circle', { cx: 15.4, cy: 56.2, r: 0.7, fill: '#b08030', opacity: 0.6 }),
          ]),
          sym('wcd-crop-5-potato', [
            h('path', { d: 'M15 45V38', stroke: '#4e9a44', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' }),
            h('path', { d: 'M15 43c-3.2 0-5.4-1.8-5.8-4.2 3.2 .5 5.4 2 5.8 4.2z', fill: '#6fbf5c' }),
            h('path', { d: 'M15 41c3.2 0 5.4-1.8 5.8-4.2-3.2 .5-5.4 2-5.8 4.2z', fill: '#5aa94a' }),
            h('path', { d: 'M15 46c-2.4 0-4-1.4-4.4-3.2 2.4 .4 4 1.6 4.4 3.2z', fill: '#7fcf6a' }),
            // 主土豆
            h('ellipse', { cx: 12, cy: 52, rx: 10, ry: 8.5, fill: '#d4a24a' }),
            h('ellipse', { cx: 10, cy: 50, rx: 5.5, ry: 4, fill: '#e0b566', opacity: 0.75 }),
            h('circle', { cx: 8, cy: 54, r: 1, fill: '#b08030', opacity: 0.65 }),
            h('circle', { cx: 15, cy: 50.5, r: 0.9, fill: '#b08030', opacity: 0.65 }),
            h('circle', { cx: 12, cy: 57, r: 0.8, fill: '#b08030', opacity: 0.6 }),
            // 旁边的小土豆
            h('ellipse', { cx: 23, cy: 56.5, rx: 5, ry: 4.2, fill: '#c99b45' }),
            h('ellipse', { cx: 22, cy: 55.2, rx: 2.8, ry: 2.2, fill: '#d9ad5c', opacity: 0.8 }),
            h('circle', { cx: 24.6, cy: 57.6, r: 0.7, fill: '#a87a2e', opacity: 0.6 }),
          ]),
        ),
      );
    }

    // 辅助区空白格里的小景：水塘、石头
    function navDeco(kind) {
      if (kind === 'pond') {
        return h(
          'svg',
          { viewBox: '0 0 60 30', 'aria-hidden': 'true', className: 'wcd-nav-svg' },
          h('ellipse', { cx: 30, cy: 18, rx: 27, ry: 10, fill: '#8fd3f0' }),
          h('ellipse', { cx: 30, cy: 16, rx: 23, ry: 7.5, fill: '#a9dff7' }),
          h('ellipse', { cx: 21, cy: 14, rx: 7, ry: 2.2, fill: '#e6f7ff', opacity: 0.85 }),
        );
      }
      return h(
        'svg',
        { viewBox: '0 0 30 30', 'aria-hidden': 'true', className: 'wcd-nav-svg' },
        h('ellipse', { cx: 10, cy: 20, rx: 8, ry: 5.5, fill: '#b9b4a8' }),
        h('ellipse', { cx: 12, cy: 18.5, rx: 6, ry: 4, fill: '#cbc6b9' }),
        h('ellipse', { cx: 22, cy: 23, rx: 5.5, ry: 3.6, fill: '#a9a49a' }),
      );
    }

    function KeyBoard(props) {
      var stats = props.stats || {};
      var t = props.t || function (key) { return key; };

      // 收获后立刻重渲染：父级每秒才 tick 一次，点完等一秒才变荒地手感太差
      var tickState = React.useState(0);
      var bump = function () { tickState[1](function (v) { return v + 1; }); };

      // 点一下格子分两种：满级 → 收获（库存 +1、清零回荒地）；没满级 → 次数 +1
      // 手动 +1 沿用同一套初始化：荒地被点第一下时才随机选作物和姿态
      function tap(code) {
        var n = Number(KEY_STATS[code]) || 0;
        if (n >= RIPE_AT) {
          var look = KEY_LOOKS[code];
          addStock(look && look.crop ? look.crop : randomLook().crop, 1);
          delete KEY_STATS[code];
          delete KEY_LOOKS[code];
        } else {
          KEY_STATS[code] = n + 1;
          if (!KEY_LOOKS[code]) KEY_LOOKS[code] = randomLook();
        }
        KEY_STATS_DIRTY = true;
        LOOKS_DIRTY = true;
        flushKeyStats(props.ctx);
        bump();
      }

      // 生长阶段按固定次数阈值分档：0 / 1 / 10 / 50 / 200 / 1000
      // 固定阈值是「满级后收获」玩法的前提，等级不再随总量漂移
      function tierOf(n) {
        var v = Number(n) || 0;
        if (v <= 0) return 0;
        if (v < 10) return 1;
        if (v < 50) return 2;
        if (v < 200) return 3;
        if (v < 1000) return 4;
        return 5;
      }

      // 外观全部来自这一格初始化时定下的 look，不再按 code 哈希
      function plot(n, code, look) {
        var l = look || normalizeLook(null);
        var dx = l.dx;
        var dy = l.dy;
        var flip = l.flip === -1 ? 'scaleX(-1)' : 'scaleX(1)';
        var amp = l.amp.toFixed(1) + 'deg';
        // 摆动相位由外观派生：同格永远一致，不同格错开
        var phase = Math.abs(Math.round(l.dx * 37 + l.dy * 61 + l.amp * 100)) || 1;
        var tier = tierOf(n);
        // 4/5 档按作物种类取图形，其它档位共用
        var symId = tier >= 4 ? 'wcd-crop-' + tier + '-' + l.crop : 'wcd-crop-' + tier;
        return h(
          'span',
          {
            className: 'wcd-sway',
            // 满级（>=1000 次）挂金色呼吸光，提示可以收获
            'data-ripe': tier >= 5 ? 'true' : 'false',
            style: { '--cx': dx + 'px', '--cy': dy + 'px', '--flip': flip },
          },
          h(
            'svg',
            {
              className: 'wcd-crop',
              viewBox: '0 0 30 60',
              preserveAspectRatio: 'xMidYMax meet',
              'aria-hidden': 'true',
              style: {
                animationDuration: (2.8 + (phase % 900) / 1000) + 's',
                animationDelay: '-' + (phase % 3000) + 'ms',
                '--amp': amp,
              },
            },
            h('use', { href: '#' + symId }),
          ),
        );
      }

      function keyCell(item, idx, inGrid) {
        if (!item) return h('span', { className: 'wcd-key wcd-key-ghost', key: 'g' + idx });
        var code = item[0];
        var label = item[1];
        var w = item[2];
        var fixed = typeof w === 'number' && w > 0;
        var n = Number(stats[code]) || 0;
        var tier = tierOf(n);
        var cellStyle = inGrid || !fixed ? {} : { flex: '0 0 calc(var(--u) * ' + w + ')' };
        cellStyle['--plot-top'] = PLOT_TINT[tier];
        cellStyle['--plot-side'] = PLOT_SIDE[tier];
        return h(
          'span',
          {
            className: 'wcd-key wcd-plot',
            key: code,
            style: cellStyle,
            'data-tip': label + ' · ' + n + (tier >= 5 ? ' · ' + t('keymap.harvest') : ''),
            onClick: function () { tap(code); },
            'data-on': n > 0 ? 'true' : 'false',
          },
          h('span', { className: 'wcd-plot-side' }),
          h('span', { className: 'wcd-plot-top' }),
          plot(n, code, lookOf(code, KEY_LOOKS)),
          h(
            'span',
            { className: 'wcd-plot-key', 'data-ripe': tier >= 5 ? 'true' : 'false' },
            tier >= 5 ? t('keymap.ripe') : label,
          ),
        );
      }

      function padCell(item, idx) {
        if (!item) return h('span', { className: 'wcd-key wcd-key-ghost', key: 'pg' + idx });
        if (item.g) {
          return h('span', {
            className: 'wcd-key wcd-key-ghost',
            key: 'pg' + idx,
            style: { gridColumn: item.col, gridRow: item.row },
          });
        }
        var n = Number(stats[item.c]) || 0;
        var tier = tierOf(n);
        return h(
          'span',
          {
            className: 'wcd-key wcd-plot',
            key: item.c,
            style: {
              gridColumn: item.col + ' / span ' + (item.w || 1),
              gridRow: item.row + ' / span ' + (item.h || 1),
              '--plot-top': PLOT_TINT[tier],
              '--plot-side': PLOT_SIDE[tier],
            },
            'data-tip': item.l + ' · ' + n + (tier >= 5 ? ' · ' + t('keymap.harvest') : ''),
            onClick: function () { tap(item.c); },
            'data-on': n > 0 ? 'true' : 'false',
          },
          h('span', { className: 'wcd-plot-side' }),
          h('span', { className: 'wcd-plot-top' }),
          plot(n, item.c, lookOf(item.c, KEY_LOOKS)),
          h(
            'span',
            { className: 'wcd-plot-key', 'data-ripe': tier >= 5 ? 'true' : 'false' },
            tier >= 5 ? t('keymap.ripe') : item.l,
          ),
        );
      }

      return h(
        'div',
        { className: 'wcd-keymap' },
        h(
          'div',
          { className: 'wcd-kb-rows' },
          h(CropSprite),
          h(
            'div',
            { className: 'wcd-kb-main' },
            KEY_MAIN.map(function (row, i) {
              return h(
                'div',
                { className: 'wcd-kb-row', key: 'r' + i },
                row.map(function (item, j) { return keyCell(item, j, false); }),
              );
            }),
          ),
          h(
            'div',
            { className: 'wcd-kb-nav' },
            KEY_NAV.map(function (item, i) {
              if (item && item.deco) {
                return h(
                  'div',
                  { className: 'wcd-nav-deco', key: 'nd' + i, style: { gridColumn: 'span ' + (item.w || 1) } },
                  navDeco(item.deco),
                );
              }
              return keyCell(item, i, true);
            }),
          ),
          h(
            'div',
            { className: 'wcd-kb-pad' },
            KEY_PAD.map(function (item, i) { return padCell(item, i); }),
          ),
        ),
        h(StockBar),
      );
    }

    // 田埂外的装饰：一簇草、一汪水塘、几块石头。纯装饰，不吃鼠标事件。
    function FarmDeco() {
      return h(
        'div',
        { className: 'wcd-kbd-deco', 'aria-hidden': 'true' },
        h(
          'svg',
          { className: 'wcd-deco wcd-deco-grass', viewBox: '0 0 34 30' },
          h('path', {
            d: 'M6 29C6 22 5 17 3 12M11 29C11 21 10 15 8 10M16 29C16.5 21 16.5 14 16 8',
            stroke: '#4e9a44', strokeWidth: 2, strokeLinecap: 'round', fill: 'none',
          }),
          h('path', {
            d: 'M22 29C22.5 23 23.5 18 25 14M27 29C27 24 28 20 29.5 17',
            stroke: '#6fbf5c', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none',
          }),
        ),
        h(
          'svg',
          { className: 'wcd-deco wcd-deco-farm', viewBox: '0 0 84 50' },
          // 栅栏
          h('rect', { x: 6, y: 12, width: 3, height: 38, rx: 1.2, fill: '#c9a06a' }),
          h('rect', { x: 23, y: 10, width: 3, height: 40, rx: 1.2, fill: '#c9a06a' }),
          h('rect', { x: 40, y: 12, width: 3, height: 38, rx: 1.2, fill: '#c9a06a' }),
          h('rect', { x: 4.5, y: 19, width: 40, height: 2.2, rx: 1.1, fill: '#b98f5c' }),
          h('rect', { x: 4.5, y: 29, width: 40, height: 2.2, rx: 1.1, fill: '#b98f5c' }),
          // 稻草人：帽子 → 头 → 身体 连在一起，底部被田埂遮住
          h('rect', { x: 62, y: 16, width: 2.4, height: 34, rx: 1.2, fill: '#8a6642' }),
          h('rect', { x: 50, y: 24, width: 26, height: 2.4, rx: 1.2, fill: '#8a6642' }),
          h('path', { d: 'M53 9 63 3 73 9z', fill: '#c9a06a' }),
          h('rect', { x: 55, y: 9, width: 16, height: 2.4, rx: 1.2, fill: '#b98f5c' }),
          h('circle', { cx: 63, cy: 15, r: 6, fill: '#e8c27a' }),
          h('circle', { cx: 60.5, cy: 15, r: 0.9, fill: '#5b4a36' }),
          h('circle', { cx: 65.5, cy: 15, r: 0.9, fill: '#5b4a36' }),
          h('path', { d: 'M57 19h12l-2 22h-8z', fill: '#c97a3d' }),
          h('path', { d: 'M57 19 63 25 69 19z', fill: '#e08a4a' }),
        ),
      );
    }

    // 键盘浮窗：独立开关，右下角常驻，格子比详情面板宽得多
    // 库存行的图标用 emoji：和农场主题贴合，也省得自己画
    var STOCK_EMOJI = { carrot: '🥕', tomato: '🍅', cabbage: '🥬', corn: '🌽', potato: '🥔' };

    // 键盘底部居中：每种作物各有几颗
    function StockBar() {
      return h(
        'div',
        { className: 'wcd-stock' },
        CROP_KINDS.map(function (kind) {
          var n = Number(CROP_STOCK[kind]) || 0;
          return h(
            'span',
            { className: 'wcd-stock-item', key: kind, 'data-kind': kind },
            h(
              'span',
              { className: 'wcd-stock-emoji', 'aria-hidden': 'true' },
              STOCK_EMOJI[kind] || '🌱',
            ),
            h('span', { className: 'wcd-stock-num' }, String(n)),
          );
        }),
      );
    }

    // 色环图标：六个 60° 的色块拼成一圈，中间镂空（外径 9.4、内径 4.3，圆心 12,12）

        // QQ 截图吸色复制出来的是「65,118,230」，逗号可能是全角，也可能带空格，都认
    function parseRgbInput(text) {
      var m = String(text || '').match(/(\d{1,3})\s*[,，\s]\s*(\d{1,3})\s*[,，\s]\s*(\d{1,3})/);
      if (!m) return null;
      var out = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (out[0] > 255 || out[1] > 255 || out[2] > 255) return null;
      return out;
    }

    function hexOf(rgb) {
      return (
        '#' +
        rgb
          .map(function (n) {
            var s = n.toString(16);
            return s.length === 1 ? '0' + s : s;
          })
          .join('')
      );
    }

    // 优先用异步剪贴板；被权限拦了退回 textarea + execCommand
    function copyText(text) {
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) {
        // 落到兜底方案
      }
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }

    var RGB_LAST = '';

    function RgbModal(props) {
      var t = props.t;
      var dismiss = useModalDismiss(props.onClose);
      var mask = useMaskClose(dismiss.requestClose);
      var rawState = React.useState(props.initial || '');
      var raw = rawState[0];
      var setRaw = rawState[1];
      var doneState = React.useState('');
      var done = doneState[0];
      var setDone = doneState[1];
      var rgb = parseRgbInput(raw);
      var css = rgb ? 'rgb(' + rgb.join(', ') + ')' : '';
      var hex = rgb ? hexOf(rgb) : '';

      // 「已复制」两个字停一秒半自己退回去
      React.useEffect(
        function () {
          if (!done) return undefined;
          var id = setTimeout(function () {
            setDone('');
          }, 1400);
          return function () {
            clearTimeout(id);
          };
        },
        [done],
      );

      // Esc 关窗
      React.useEffect(function () {
        function onKey(e) {
          if (e.key === 'Escape') dismiss.requestClose();
        }
        document.addEventListener('keydown', onKey, true);
        return function () {
          document.removeEventListener('keydown', onKey, true);
        };
      }, []);

      function copy(kind, value) {
        if (!value) return;
        copyText(value);
        setDone(kind);
      }

      function copyBtn(kind, value) {
        var hit = done === kind;
        return h(
          'button',
          {
            key: 'copy-' + kind,
            type: 'button',
            className: 'wcd-rgb-copy',
            'data-done': hit ? 'true' : 'false',
            disabled: !value,
            onClick: function (e) {
              e.stopPropagation();
              copy(kind, value);
            },
          },
          hit ? t('rgb.copied') : t('rgb.copy'),
        );
      }

      return h(
        'div',
        Object.assign({ className: 'wcd-mask', 'data-closing': dismiss.closing ? 'true' : 'false' }, mask),
        h(
          'div',
          {
            className: 'wcd-rgb',
            onClick: function (e) {
              e.stopPropagation();
            },
          },
          h(
            'div',
            { className: 'wcd-rgb-head' },
            h('span', { className: 'wcd-rgb-title' }, t('rgb.title')),
            h(
              'button',
              {
                type: 'button',
                className: 'wcd-rgb-close',
                title: t('note.close'),
                onClick: function (e) {
                  e.stopPropagation();
                  dismiss.requestClose();
                },
              },
              '×',
            ),
          ),
          h(
            'div',
            { className: 'wcd-rgb-top' },
            h('input', {
              className: 'wcd-rgb-input',
              value: raw,
              placeholder: t('rgb.ph'),
              spellCheck: false,
              autoFocus: true,
              onChange: function (e) {
                RGB_LAST = e.target.value;
                setRaw(e.target.value);
                setDone('');
              },
            }),
            h('span', {
              className: 'wcd-rgb-chip',
              style: { background: rgb ? 'rgb(' + rgb.join(',') + ')' : 'transparent' },
            }),
          ),
          raw !== '' && !rgb ? h('div', { className: 'wcd-rgb-bad' }, t('rgb.bad')) : null,
          h(
            'div',
            { className: 'wcd-rgb-row' },
            h('span', { className: 'wcd-rgb-tag' }, 'RGB'),
            h('span', { className: 'wcd-rgb-val', 'data-empty': rgb ? 'false' : 'true' }, css || '—'),
            copyBtn('css', css),
          ),
          h(
            'div',
            { className: 'wcd-rgb-row' },
            h('span', { className: 'wcd-rgb-tag' }, 'HEX'),
            h('span', { className: 'wcd-rgb-val', 'data-empty': hex ? 'false' : 'true' }, hex || '—'),
            copyBtn('hex', hex),
          ),
        ),
      );
    }

    // 时钟图标：圆表盘 + 时针分针
        function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }

    // 统一成「2026-01-01 11:11:11」，用本地时区——时间戳本身没有时区，按机器的来最符合直觉
    function formatStamp(ms) {
      var d = new Date(ms);
      if (isNaN(d.getTime())) return '';
      return (
        d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
        ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())
      );
    }

    // 秒与毫秒按长度判断：秒到 2286 年才 11 位，毫秒从 1973 年起就是 13 位，1e11 是干净的分界
    function parseStamp(raw) {
      var s = String(raw || '').trim();
      if (!/^\d{1,16}$/.test(s)) return null;
      var n = Number(s);
      var isMs = n >= 1e11;
      var text = formatStamp(isMs ? n : n * 1000);
      if (!text) return null;
      return { ms: isMs, text: text };
    }

    var TS_LAST = '';

    function TsModal(props) {
      var t = props.t;
      var dismiss = useModalDismiss(props.onClose);
      var mask = useMaskClose(dismiss.requestClose);
      var rawState = React.useState(props.initial || '');
      var raw = rawState[0];
      var setRaw = rawState[1];
      var doneState = React.useState(false);
      var done = doneState[0];
      var setDone = doneState[1];
      var parsed = parseStamp(raw);

      React.useEffect(
        function () {
          if (!done) return undefined;
          var id = setTimeout(function () {
            setDone(false);
          }, 1400);
          return function () {
            clearTimeout(id);
          };
        },
        [done],
      );

      React.useEffect(function () {
        function onKey(e) {
          if (e.key === 'Escape') dismiss.requestClose();
        }
        document.addEventListener('keydown', onKey, true);
        return function () {
          document.removeEventListener('keydown', onKey, true);
        };
      }, []);

      return h(
        'div',
        Object.assign({ className: 'wcd-mask', 'data-closing': dismiss.closing ? 'true' : 'false' }, mask),
        h(
          'div',
          {
            className: 'wcd-rgb',
            onClick: function (e) {
              e.stopPropagation();
            },
          },
          h(
            'div',
            { className: 'wcd-rgb-head' },
            h('span', { className: 'wcd-rgb-title' }, t('ts.title')),
            h(
              'button',
              {
                type: 'button',
                className: 'wcd-rgb-close',
                title: t('note.close'),
                onClick: function (e) {
                  e.stopPropagation();
                  dismiss.requestClose();
                },
              },
              '×',
            ),
          ),
          h(
            'div',
            { className: 'wcd-rgb-top' },
            h('input', {
              className: 'wcd-rgb-input',
              value: raw,
              placeholder: t('ts.ph'),
              spellCheck: false,
              autoFocus: true,
              onChange: function (e) {
                TS_LAST = e.target.value;
                setRaw(e.target.value);
                setDone(false);
              },
            }),
          ),
          raw !== '' && !parsed ? h('div', { className: 'wcd-rgb-bad' }, t('ts.bad')) : null,
          parsed
            ? h('div', { className: 'wcd-ts-unit' }, parsed.ms ? t('ts.unit.ms') : t('ts.unit.sec'))
            : null,
          h(
            'div',
            { className: 'wcd-rgb-row' },
            h('span', { className: 'wcd-rgb-tag' }, t('ts.tag')),
            h(
              'span',
              { className: 'wcd-rgb-val', 'data-empty': parsed ? 'false' : 'true' },
              parsed ? parsed.text : '—',
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'wcd-rgb-copy',
                'data-done': done ? 'true' : 'false',
                disabled: !parsed,
                onClick: function (e) {
                  e.stopPropagation();
                  if (!parsed) return;
                  copyText(parsed.text);
                  setDone(true);
                },
              },
              done ? t('rgb.copied') : t('rgb.copy'),
            ),
          ),
        ),
      );
    }


    // 便笺图标：黄色便利贴，右下角折起
        // 一张便笺：顶栏中间三横能拖、右上角 × 表示办完、正文多高它就多高
    function NoteCard(props) {
      var note = props.note;
      var ctx = props.ctx;
      var t = props.t;
      var posState = React.useState({ x: Number(note.x) || 0, y: Number(note.y) || 0 });
      var pos = posState[0];
      var setPos = posState[1];
      var startRef = React.useRef(null);
      var posRef = React.useRef(pos);
      var taRef = React.useRef(null);
      posRef.current = pos;

      // 正文变长变短，输入框跟着长高，不出现内部滚动条
      React.useEffect(function () {
        var el = taRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.max(52, el.scrollHeight) + 'px';
      }, [note.text]);

      function onDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        startRef.current = { x: e.clientX, y: e.clientY, px: posRef.current.x, py: posRef.current.y };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
          /* 没有指针捕获也能拖，只是移出把手会断 */
        }
      }
      function onMove(e) {
        var s = startRef.current;
        if (!s) return;
        var vw = (typeof window !== 'undefined' && window.innerWidth) || 1280;
        var vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
        var nx = Math.min(Math.max(0, s.px + (e.clientX - s.x)), Math.max(0, vw - 240));
        var ny = Math.min(Math.max(0, s.py + (e.clientY - s.y)), Math.max(0, vh - 40));
        var next = { x: nx, y: ny };
        posRef.current = next;
        setPos(next);
      }
      function onUp() {
        if (!startRef.current) return;
        startRef.current = null;
        // 松手才落盘，拖动过程不写配置
        setNotePos(ctx, note.id, Math.round(posRef.current.x), Math.round(posRef.current.y));
      }

      return h(
        'div',
        { className: 'wcd-note', style: { left: Math.round(pos.x) + 'px', top: Math.round(pos.y) + 'px' } },
        h(
          'div',
          {
            className: 'wcd-note-head',
            onPointerDown: onDown,
            onPointerMove: onMove,
            onPointerUp: onUp,
            onPointerCancel: onUp,
          },
          h(
            'span',
            { className: 'wcd-note-grip', 'aria-hidden': 'true' },
            h('span', { className: 'wcd-note-grip-bar' }),
            h('span', { className: 'wcd-note-grip-bar' }),
            h('span', { className: 'wcd-note-grip-bar' }),
          ),
          h(
            'button',
            {
              className: 'wcd-note-close',
              type: 'button',
              title: t('note.done'),
              'aria-label': t('note.done'),
              onPointerDown: function (e) { e.stopPropagation(); },
              onClick: function (e) {
                e.stopPropagation();
                doneNote(ctx, note.id);
              },
            },
            '×',
          ),
        ),
        h('textarea', {
          className: 'wcd-note-body',
          ref: taRef,
          value: note.text,
          placeholder: t('note.ph'),
          spellCheck: false,
          onChange: function (e) {
            setNoteText(ctx, note.id, e.target.value);
            noteNotify();
          },
        }),
      );
    }

    function NoteLayer(props) {
      return h(
        'div',
        { className: 'wcd-note-layer' },
        props.notes.map(function (n) {
          return h(NoteCard, { key: n.id, note: n, ctx: props.ctx, t: props.t });
        }),
      );
    }

    function KbdPanel(props) {
      // 位置记在配置里：打开时从 props 读回上次拖到的偏移
      var dragState = React.useState({
        dx: Number(props.initialX) || 0,
        dy: Number(props.initialY) || 0,
      });
      var drag = dragState[0];
      var setDrag = dragState[1];
      var startRef = React.useRef(null);
      var dragRef = React.useRef(drag);
      dragRef.current = drag;

      // 配置可能晚于组件就绪：到位后把记忆位置补上，避免先停在右下角
      React.useEffect(function () {
        if (startRef.current) return;
        setDrag({ dx: Number(props.initialX) || 0, dy: Number(props.initialY) || 0 });
      }, [props.initialX, props.initialY]);

      function onDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        startRef.current = {
          x: e.clientX,
          y: e.clientY,
          dx: dragRef.current.dx,
          dy: dragRef.current.dy,
        };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
          /* 没有指针捕获也能拖，只是移出把手会断 */
        }
      }
      function onMove(e) {
        var s = startRef.current;
        if (!s) return;
        var next = { dx: s.dx + (e.clientX - s.x), dy: s.dy + (e.clientY - s.y) };
        dragRef.current = next;
        setDrag(next);
      }
      function onUp() {
        var s = startRef.current;
        startRef.current = null;
        if (!s) return;
        // 松手才落盘，拖动过程不写配置
        if (props.onDrop) {
          props.onDrop(Math.round(dragRef.current.dx), Math.round(dragRef.current.dy));
        }
      }

      var shift = 'translate(' + Math.round(drag.dx) + 'px,' + Math.round(drag.dy) + 'px)';

      // 尺寸档：small 0.85 / medium 1 / large 1.5；屏幕放不下时按视口自动收窄
      var size = props.size || 'medium';
      var scale = size === 'large' ? 1.5 : size === 'small' ? 0.85 : 1;
      if (typeof window !== 'undefined' && window.innerWidth > 0) {
        var maxK = (window.innerWidth - 60) / 780;
        if (maxK > 0 && maxK < scale) scale = maxK;
      }
      return h(
        'div',
        { className: 'wcd-kbd-wrap', style: { transform: shift } },
        h(
          'div',
          {
            className: 'wcd-kbd-win',
            'data-anim': props.animate ? 'true' : 'false',
            style: { transform: 'scale(' + scale.toFixed(3) + ')' },
          },
        // 关闭按钮浮在小键盘第一行最右列，三横线把手在它左边一格
        h('button', { className: 'wcd-kbd-close', type: 'button', onClick: props.onClose }, '×'),
        h(
          'div',
          {
            className: 'wcd-kbd-grip',
            onPointerDown: onDown,
            onPointerMove: onMove,
            onPointerUp: onUp,
            onPointerCancel: onUp,
          },
          h('span', { className: 'wcd-kbd-grip-bar' }),
          h('span', { className: 'wcd-kbd-grip-bar' }),
          h('span', { className: 'wcd-kbd-grip-bar' }),
        ),
          h(FarmDeco),
          h(KeyBoard, { stats: KEY_STATS, t: props.t, ctx: props.ctx }),
        ),
      );
    }

    // 未来 24 小时 / 未来 3 天：详情面板
    function WeatherPanel(props) {
      var wx = props.wx;
      var t = props.t;
      var open = props.open;
      var panelRef = props.panelRef;
      var stripRef = props.stripRef;
      var usageBlock = props.usageBlock;
      var has = wx && wx.code >= 0 && wx.city !== '';

      // 「今天 11-20」这种缩写不好认，展开成「11月20日」；英文界面给 Nov 20 这类月名
      function dayLabel(s) {
        var p = String(s || '').split('-');
        if (p.length !== 2) return s || '';
        var m = Number(p[0]);
        var d = Number(p[1]);
        if (/[\u4e00-\u9fa5]/.test(t('panel.today'))) return m + '月' + d + '日';
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] + ' ' + d;
      }

      // 内容永远是数组：空态（没有天气）也要能展开，绝不能拿单个元素去 spread
      var body = [];
      if (props.almanacBlock) body.push(props.almanacBlock);
      if (usageBlock) body.push(usageBlock);
      if (!has) {
        body.push(h('div', { className: 'wcd-empty', key: 'empty' }, t('panel.empty')));
      } else {
        body.push(
          h(
            'div',
            { className: 'wcd-panel-head', key: 'head' },
            h(WeatherGlyph, { code: wx.code, size: 14 }),
            h('span', { className: 'wcd-city' }, wx.city),
            h('span', { className: 'wcd-head-wx' }, weatherText(wx.code, t)),
            h('span', { className: 'wcd-head-temp' }, tempText(wx.temp)),
            h('span', { className: 'wcd-head-dim' }, t('panel.feels') + ' ' + tempText(wx.feels)),
            h('span', { className: 'wcd-head-dim' }, tempText(wx.low) + '~' + tempText(wx.high)),
            h(RefreshBtn, {
              label: t('panel.refresh'),
              spin: props.spin === true,
              ok: props.ok === true,
              onClick: props.onRefreshWx,
            }),
          ),
          wx.error
            ? h('div', { className: 'wcd-err', key: 'wxerr' }, t('panel.error') + wx.error)
            : null,
          h(
            'div',
            { className: 'wcd-strip-wrap', key: 'stripwrap' },
            h(
              'div',
              { className: 'wcd-strip', ref: stripRef },
              wx.hours.map(function (item, i) {
                var hh = Number(String(item.t || '').slice(0, 2));
                var mark = (props.workMarks && props.workMarks[hh]) || '';
                return h(
                  'div',
                  {
                    className: 'wcd-cell',
                    key: 'h' + i,
                    style: { background: hourTint(hh) },
                    'data-light': hourTone(hh),
                    'data-first': i === 0 ? 'true' : 'false',
                    'data-work': mark || 'false',
                    title: mark ? t('panel.work.' + mark) : undefined,
                  },
                  h('span', { className: 'wcd-cell-time' }, String(item.t || '')),
                  h('span', { className: 'wcd-cell-temp' }, tempText(item.temp)),
                  h('span', { className: 'wcd-cell-wx' }, weatherText(item.code, t)),
                  h(WeatherGlyph, { code: item.code, size: 14 }),
                );
              }),
            ),
          ),
          h(
            'div',
            { className: 'wcd-days', key: 'days' },
            wx.days.slice(0, 3).map(function (day, i) {
              var name = i === 0 ? t('panel.today') : i === 1 ? t('panel.tomorrow') : t('panel.after');
              return h(
                'div',
                { className: 'wcd-day', key: 'd' + i },
                h('span', { className: 'wcd-day-name' }, name + ' ' + dayLabel(day.d)),
                h('span', { className: 'wcd-day-temp' }, tempText(day.min) + '~' + tempText(day.max)),
                h('span', { className: 'wcd-day-wx' }, weatherText(day.code, t)),
                h(WeatherGlyph, { code: day.code, size: 14 }),
              );
            }),
          ),
        );
        if (wx.error) body.push(h('div', { className: 'wcd-stale', key: 'stale' }, t('panel.stale')));
      }


      return h(
        'div',
        {
          className: 'wcd-panel',
          ref: panelRef,
          'data-out': props.leaving ? 'true' : 'false',
          style: { left: open.left + 'px', top: open.top + 'px', width: open.width + 'px' },
          // 鼠标停在详情页里不收起；挪出去重新起 200ms 计时
          onPointerEnter: props.onEnter,
          onPointerLeave: props.onLeave,
        },
        ...body,
      );
    }

    // 彩色天气图标：形状 + 固定色值（图标属于美术素材，不跟主题令牌走）
    const WX_COLOR = {
      clear: '#F2A93B',
      partly: '#E8A33D',
      cloudy: '#8B98A5',
      fog: '#9AA6B2',
      drizzle: '#6FA8E8',
      rain: '#4C8DFF',
      snow: '#8FD0FF',
      shower: '#4C8DFF',
      snowshower: '#8FD0FF',
      storm: '#A66BFF',
      unknown: '#9AA6B2',
    };

    // 两个半圆弧 + 两个箭头的手动刷新图标；spinning 时整枚图标匀速转
    function RefreshIcon() {
      return h(
        'svg',
        { className: 'wcd-refresh-ico', viewBox: '0 0 16 16', width: 13, height: 13, 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M2.4 8.6A6 6 0 0 1 12 4.2', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { d: 'M13.6 7.4A6 6 0 0 1 4 11.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        h('path', { d: 'M12.1 1.9v3.2H8.9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M3.9 14.1v-3.2h3.2', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }),
      );
    }

    // 刷新成功的绿色对勾：只在 props.ok 为真时出现，靠 setTimeout 一秒后卸载
    function RefreshOk() {
      return h(
        'svg',
        { className: 'wcd-refresh-ok', viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': 'true', focusable: 'false' },
        h('path', {
          d: 'M3.2 8.4l3.1 3.1 6.5-6.8',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    // 首行最右侧的小按钮：点一下让宿主立刻补刷一次；成功时左边先闪一枚对勾
    function RefreshBtn(props) {
      return h(
        'span',
        { className: 'wcd-refresh-group' },
        props.ok ? h(RefreshOk) : null,
        h(
          'button',
          {
            className: 'wcd-refresh',
            type: 'button',
            title: props.label,
            'aria-label': props.label,
            'data-spin': props.spin ? 'true' : 'false',
            onClick: function (e) {
              e.stopPropagation();
              e.preventDefault();
              if (props.onClick) props.onClick();
            },
          },
          h(RefreshIcon),
        ),
      );
    }

    function WeatherGlyph(props) {
      var kind = WX_GROUP[props.code] || 'unknown';
      var size = props.size || 14;
      var color = WX_COLOR[kind] || WX_COLOR.unknown;

      function cloud(dx, dy, fill) {
        return h('path', {
          d: 'M4.9 10.9h5.9a2.3 2.3 0 0 0 .2-4.6 3.3 3.3 0 0 0-6.3-.7 2.2 2.2 0 0 0 .2 5.3Z',
          fill: fill || color,
          transform: 'translate(' + (dx || 0) + ',' + (dy || 0) + ')',
        });
      }

      function drops(y, n) {
        var list = [];
        for (var i = 0; i < n; i++) {
          list.push(h('path', {
            d: 'M' + (5.6 + i * 2.1) + ' ' + y + 'v1.6',
            stroke: color,
            strokeWidth: 1.5,
            strokeLinecap: 'round',
          }));
        }
        return list;
      }

      var kids;
      if (kind === 'clear') {
        kids = [
          h('circle', { cx: 8, cy: 8, r: 3.1, fill: '#F2A93B' }),
          h(
            'g',
            { stroke: '#F2A93B', strokeWidth: 1.5, strokeLinecap: 'round' },
            h('path', { d: 'M8 1.5v1.7' }),
            h('path', { d: 'M8 12.8v1.7' }),
            h('path', { d: 'M1.5 8h1.7' }),
            h('path', { d: 'M12.8 8h1.7' }),
            h('path', { d: 'M3.4 3.4l1.2 1.2' }),
            h('path', { d: 'M11.4 11.4l1.2 1.2' }),
            h('path', { d: 'M12.6 3.4l-1.2 1.2' }),
            h('path', { d: 'M4.6 11.4l-1.2 1.2' }),
          ),
        ];
      } else if (kind === 'partly') {
        kids = [
          h('circle', { cx: 10.6, cy: 5.4, r: 2.4, fill: '#F2A93B' }),
          h(
            'g',
            { stroke: '#F2A93B', strokeWidth: 1.3, strokeLinecap: 'round' },
            h('path', { d: 'M10.6 1.6v1.1' }),
            h('path', { d: 'M14.4 5.4h-1.1' }),
            h('path', { d: 'M13.3 2.7l-.8.8' }),
            h('path', { d: 'M13.3 8.1l-.8-.8' }),
          ),
          cloud(0, 2.4, '#8B98A5'),
        ];
      } else if (kind === 'cloudy') {
        kids = [cloud(0, 0, '#8B98A5')];
      } else if (kind === 'fog') {
        kids = [
          cloud(0, -1.2, '#9AA6B2'),
          h(
            'g',
            { stroke: '#9AA6B2', strokeWidth: 1.4, strokeLinecap: 'round' },
            h('path', { d: 'M4.6 12.4h6.4' }),
            h('path', { d: 'M6 14.2h5' }),
          ),
        ];
      } else if (kind === 'drizzle') {
        kids = [cloud(0, -0.8, '#8FA9C4'), h('g', null, ...drops(11.6, 2))];
      } else if (kind === 'snow' || kind === 'snowshower') {
        kids = [
          cloud(0, -0.8, '#9FB6C9'),
          h(
            'g',
            { fill: '#8FD0FF' },
            h('circle', { cx: 5.6, cy: 12.4, r: 0.9 }),
            h('circle', { cx: 8, cy: 12.4, r: 0.9 }),
            h('circle', { cx: 10.4, cy: 12.4, r: 0.9 }),
          ),
        ];
      } else if (kind === 'storm') {
        kids = [
          cloud(0, 0, '#8B98A5'),
          h('path', { d: 'M8.6 10.4 6.7 13.6h1.6l-.6 2 2.4-3.1H8.7l.7-2.1Z', fill: '#A66BFF' }),
        ];
      } else if (kind === 'rain' || kind === 'shower') {
        kids = [cloud(0, -0.8, '#8FA9C4'), h('g', null, ...drops(11.6, 3))];
      } else {
        kids = [h('circle', { cx: 8, cy: 8, r: 3, fill: color })];
      }

      return h(
        'svg',
        {
          className: 'wcd-glyph',
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          'aria-hidden': true,
          focusable: false,
        },
        ...kids,
      );
    }

    // 同一个组件服务两个席位：seat='header' 走布局内的胶囊，seat='float' 走可拖动浮窗。
    function WorkCountdown(props) {
      var ctx = props.ctx;
      var t = props.t;
      var cfg = useConfig(ctx);
      var now = useNow();
      var dragState = React.useState(null);
      var drag = dragState[0];
      var setDrag = dragState[1];
      var openState = React.useState(null);
      var open = openState[0];
      var setOpen = openState[1];
      var leavingState = React.useState(false);
      var leaving = leavingState[0];
      var setLeaving = leavingState[1];
      var leaveTimerRef = React.useRef(null);
      var exitTimerRef = React.useRef(null);
      var closeRef = React.useRef(null);
      var placeRef = React.useRef(null);
      var openRef = React.useRef(null);
      var startRef = React.useRef(null);
      var movedRef = React.useRef(false);
      var pendingRef = React.useRef(null);
      var pillRef = React.useRef(null);
      var panelRef = React.useRef(null);
      var stripRef = React.useRef(null);
      var bonkState = React.useState(0);
      var bonk = bonkState[0];
      var setBonk = bonkState[1];
      // 便笺列表存在模块级（配置回读后直接可见），这里只用一个自增版本号触发重渲染
      var noteVersion = React.useState(0);
      // 颜色小窗：记住上一次输入，重新打开还在（QQ 吸色常常连着转好几个值）
      var rgbOpenState = React.useState(false);
      var rgbOpen = rgbOpenState[0];
      var setRgbOpen = rgbOpenState[1];
      // 时间戳小窗
      var tsOpenState = React.useState(false);
      var tsOpen = tsOpenState[0];
      var setTsOpen = tsOpenState[1];
      var setNoteVersion = noteVersion[1];
      React.useEffect(function () {
        var fn = function () { setNoteVersion(function (n) { return n + 1; }); };
        NOTE_SUBS.push(fn);
        return function () {
          var i = NOTE_SUBS.indexOf(fn);
          if (i >= 0) NOTE_SUBS.splice(i, 1);
          flushNotes(ctx);
        };
      }, []);
      // 木鱼上飘的「功德+1」：每条一个 id，动画结束自己摘掉，最多留 8 条
      var meritState = React.useState([]);
      var merits = meritState[0];
      var setMerits = meritState[1];
      var meritSeq = React.useRef(0);
      var guaState = React.useState(null);
      var gua = guaState[0];
      var setGua = guaState[1];
      var shakeState = React.useState(false);
      var shaking = shakeState[0];
      var setShaking = shakeState[1];
      var spinState = React.useState(0);
      var spin = spinState[0];
      var setSpin = spinState[1];
      var tarotState = React.useState(null);
      // 键盘浮窗的开关：独立于详情面板，开了就一直挂着
      var keyWinState = React.useState(false);
      var keyWin = keyWinState[0];
      var setKeyWin = keyWinState[1];
      // 场上有没有可收获的植物：定时看内存里的统计，出现/消失才重渲染
      var ripeState = React.useState(false);
      var ripeOn = ripeState[0];
      var setRipeOn = ripeState[1];
      // 手动刷新：写 ping 让宿主立刻补刷。天气和用量各有一套转圈 / 对勾，互不打断；
      // 转圈值就是「这次开始转的时间戳」（0 = 没在转），30 秒兜底用它计时
      var spinState = React.useState({ wx: 0, usage: 0 });
      var spinMap = spinState[0];
      var setSpinMap = spinState[1];
      var okState = React.useState({ wx: false, usage: false });
      var okMap = okState[0];
      var setOkMap = okState[1];
      var sigRef = React.useRef({ wx: null, usage: null });
      // 只改其中一边，另一边原样保留——这是「互不影响」的关键
      function patchSide(setter, which, value) {
        setter(function (prev) {
          var next = Object.assign({}, prev);
          next[which] = value;
          return next;
        });
      }
      function manualRefresh(which) {
        patchSide(setSpinMap, which, Date.now());
        // 先清掉旧对勾，连点两次也能各闪一次
        patchSide(setOkMap, which, false);
        persistPing(ctx);
      }
      // 快照指纹：at 变了＝这次成功了，errorAt 变了＝这次失败了。天气、用量各看各的
      function snapSig(snap) {
        if (!snap) return '';
        return String(snap.at || '') + '|' + String(snap.errorAt || '') + '|' + String(snap.error || '');
      }
      React.useEffect(function () {
        var wxSig = snapSig(cfg.weather);
        var usageSig = snapSig(cfg.usage);
        var prev = sigRef.current;
        sigRef.current = { wx: wxSig, usage: usageSig };
        // 首次挂载只记基线，不当作「请求回来了」
        var doneWx = spinMap.wx > 0 && prev.wx !== null && wxSig !== prev.wx;
        var doneUsage = spinMap.usage > 0 && prev.usage !== null && usageSig !== prev.usage;
        if (!doneWx && !doneUsage) return;
        if (doneWx) {
          patchSide(setSpinMap, 'wx', 0);
          if (!((cfg.weather && cfg.weather.error) || '')) patchSide(setOkMap, 'wx', true);
        }
        if (doneUsage) {
          patchSide(setSpinMap, 'usage', 0);
          if (!((cfg.usage && cfg.usage.error) || '')) patchSide(setOkMap, 'usage', true);
        }
      }, [cfg.weather, cfg.usage, spinMap]);
      // 兜底：按设置里的请求超时（默认 30 秒）停转圈，和宿主那边的判定窗口对齐
      var spinLimitMs = (Number(cfg.requestTimeoutSeconds) || 30) * 1000;
      React.useEffect(function () {
        if (!(spinMap.wx > 0)) return undefined;
        var id = setTimeout(function () { patchSide(setSpinMap, 'wx', 0); }, spinLimitMs);
        return function () { clearTimeout(id); };
      }, [spinMap.wx]);
      React.useEffect(function () {
        if (!(spinMap.usage > 0)) return undefined;
        var id = setTimeout(function () { patchSide(setSpinMap, 'usage', 0); }, spinLimitMs);
        return function () { clearTimeout(id); };
      }, [spinMap.usage]);
      // 对勾各管各的：一秒后自己消失，不影响另一边
      React.useEffect(function () {
        if (!okMap.wx) return undefined;
        var id = setTimeout(function () { patchSide(setOkMap, 'wx', false); }, 1000);
        return function () { clearTimeout(id); };
      }, [okMap.wx]);
      React.useEffect(function () {
        if (!okMap.usage) return undefined;
        var id = setTimeout(function () { patchSide(setOkMap, 'usage', false); }, 1000);
        return function () { clearTimeout(id); };
      }, [okMap.usage]);
      React.useEffect(function () {
        setRipeOn(keyStatsHasRipe());
        var id = setInterval(function () { setRipeOn(keyStatsHasRipe()); }, 3000);
        return function () { clearInterval(id); };
      }, []);
      var tarot = tarotState[0];
      var setTarot = tarotState[1];

      var isFloat = cfg.float === true;
      var seatIsFloat = props.seat === 'float';
      var wx = cfg.weather || normalizeWeather(null);
      var showWx = cfg.weatherVisible !== false && wx.code >= 0 && wx.city !== '';
      var usage = cfg.usage || normalizeUsage(null);
      // 只有真正拉到过用量才出环（缺 Key / 从没成功过时整组不画）
      var usageReady = cfg.usageVisible !== false && usage.at !== '' && usage.keyStatus !== 'missing';

      function usageItems(size, withReset) {
        var rows = [
          ['usage.5h', usage.rolling],
          ['usage.week', usage.weekly],
          ['usage.month', usage.monthly],
        ];
        return rows.map(function (row, i) {
          var reset = withReset ? resetText(row[1].resetsAt) : '';
          return h(
            'span',
            { className: 'wcd-usage-item', key: 'u' + i },
            h(UsageRing, { percent: row[1].percent, size: size }),
            h('span', { className: 'wcd-usage-label' }, t(row[0])),
            reset ? h('span', { className: 'wcd-usage-reset' }, reset) : null,
          );
        });
      }

      // 今日黄历：面板最顶上的一块，像日历页
      var al = cfg.almanac || normalizeAlmanac(null);
      function alDate(iso) {
        var p = String(iso || '').split('-');
        if (p.length !== 3) return iso || '';
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        var wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()] || '';
        return Number(p[1]) + '月' + Number(p[2]) + '日 ' + wd;
      }
      function alRow(kind, text, items) {
        if (!items.length) return null;
        return h(
          'div',
          { className: 'wcd-al-row' },
          h('span', { className: 'wcd-al-tag', 'data-k': kind }, text),
          h(
            'span',
            { className: 'wcd-al-items' },
            items.map(function (x, i) { return h('span', { className: 'wcd-al-item', key: kind + i }, x); }),
          ),
        );
      }
      var almanacBlock = al.date
        ? h(
            'div',
            { className: 'wcd-almanac', key: 'almanac' },
            h(
              'div',
              { className: 'wcd-al-top' },
              h('span', { className: 'wcd-al-date' }, alDate(al.date)),
              h('span', { className: 'wcd-al-lunar' }, al.lunar),
            ),
            h(
              'div',
              { className: 'wcd-al-meta' },
              h('span', null, al.ganzhi),
              al.tianShen
                ? h('span', null, al.tianShen + (al.tianShenType ? ' · ' + al.tianShenType : ''))
                : null,
            ),
            (function () {
              // 「冲(壬辰)龙」→「冲龙」：去掉括号里的干支，只留生肖，好读
              var chongText = String(al.chong || '').replace(/^\([^)]*\)/, '').trim();
              var parts = [
                chongText ? '冲' + chongText : '',
                al.sha ? '煞' + al.sha : '',
                al.zhiXing ? al.zhiXing + '日' : '',
                al.xiu ? al.xiu + '宿' + (al.xiuLuck || '') : '',
              ].filter(Boolean);
              return parts.length ? h('div', { className: 'wcd-al-meta' }, parts.join(' · ')) : null;
            })(),
            alRow('yi', '宜', al.yi),
            alRow('ji', '忌', al.ji),
          )
        : null;

      // 详情面板顶部的用量块：没数据时按真实原因给提示，开关关掉则整块不出现
      var usageHint =
        usage.keyStatus === 'missing'
          ? t('usage.hint')
          : usage.error
            ? usage.error
            : t('usage.loading');
      var usageBlock =
        cfg.usageVisible === false
          ? null
          : usageReady
            ? h(
                'div',
                { className: 'wcd-usage-block', key: 'usage' },
                h(
                  'div',
                  { className: 'wcd-usage-title' },
                  t('usage.title'),
                  h(RefreshBtn, {
                    label: t('usage.refresh'),
                    spin: spinMap.usage > 0,
                    ok: okMap.usage === true,
                    onClick: function () { manualRefresh('usage'); },
                  }),
                ),
                usage.error
                  ? h('div', { className: 'wcd-err', key: 'usageerr' }, t('usage.error') + usage.error)
                  : null,
                h('div', { className: 'wcd-usage-row' }, usageItems(34, true)),
              )
            : h('div', { className: 'wcd-usage-hint', key: 'usage', title: usageHint }, usageHint);

      // 客户端每秒重渲染时顺带检查快照是否过期：超过 1 小时就写 ping 让宿主补刷，
      // 这是系统睡眠导致宿主定时器停摆时的兜底
      var pingAtRef = React.useRef(0);
      React.useEffect(function () {
        var at = cfg.weather && cfg.weather.at ? Date.parse(cfg.weather.at) : 0;
        if (!at || Date.now() - at < 1200000) return;
        if (Date.now() - pingAtRef.current < 300000) return;
        pingAtRef.current = Date.now();
        persistPing(ctx);
      });

      // 浮窗挂上后回报一次自检（每个页面会话一次）
      React.useEffect(function () {
        if (!isFloat) return;
        reportDiag(
          ctx,
          'b' + Date.now().toString(36).slice(-3) + ';seat=' + floatSeat + ';mount=' + (seatIsFloat ? 'overlay' : 'fallback'),
        );
      }, [isFloat, seatIsFloat]);

      // 配置追上落点：这本就是同一次渲染（caughtUp 已让位移失效），这里只清状态
      React.useEffect(function () {
        var p = pendingRef.current;
        if (!p) return;
        if (Math.round(cfg.offsetX) === p.x && Math.round(cfg.offsetY) === p.y) {
          pendingRef.current = null;
          setDrag(null);
        }
      }, [cfg.offsetX, cfg.offsetY]);

      // 兜底：写入失败时别把位移永远挂在屏幕上
      React.useEffect(function () {
        if (!drag || !pendingRef.current) return undefined;
        var id = setTimeout(function () {
          if (pendingRef.current) {
            pendingRef.current = null;
            setDrag(null);
          }
        }, 1600);
        return function () { clearTimeout(id); };
      }, [drag]);

      // 卦象弹窗：Esc 关闭
      React.useEffect(function () {
        if (!gua && !tarot) return undefined;
        function onKey(e) {
          if (e.key === "Escape") {
            setGua(null);
            setTarot(null);
          }
        }
        document.addEventListener("keydown", onKey);
        return function () { document.removeEventListener("keydown", onKey); };
      }, [gua, tarot]);

      // 点击面板外面 / 按 Esc 收起
      React.useEffect(function () {
        if (!open) return undefined;
        function onDown(e) {
          var panel = panelRef.current;
          var pill = pillRef.current;
          if (panel && panel.contains(e.target)) return;
          if (pill && pill.contains(e.target)) return;
          if (closeRef.current) closeRef.current(false);
        }
        function onKey(e) {
          if (e.key === 'Escape' && closeRef.current) closeRef.current(false);
        }
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('keydown', onKey);
        return function () {
          document.removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('keydown', onKey);
        };
      }, [open]);

      // 浮窗会随 hover 展开 / 收起改变高度：详情页跟着重算位置，别被工具行顶住
      React.useEffect(function () {
        if (!open) return undefined;
        if (typeof ResizeObserver === "undefined") return undefined;
        var el = pillRef.current;
        if (!el) return undefined;
        var raf = null;
        var ro = new ResizeObserver(function () {
          if (raf) return;
          raf = requestAnimationFrame(function () {
            raf = null;
            if (!openRef.current || !placeRef.current || !pillRef.current) return;
            setOpen(placeRef.current(pillRef.current));
          });
        });
        ro.observe(el);
        return function () {
          ro.disconnect();
          if (raf) cancelAnimationFrame(raf);
        };
      }, [open ? 1 : 0]);

      // 卸载时清掉防抖与淡出计时器，避免在已卸载的组件上 setState
      React.useEffect(function () {
        return function () {
          if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
          if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
          leaveTimerRef.current = null;
          exitTimerRef.current = null;
        };
      }, []);

      // 24 小时横条：滚轮左右滑 + 按住鼠标拖拽滑（都挂原生监听，React 的 onWheel 是被动的）
      React.useEffect(function () {
        if (!open) return undefined;
        var el = stripRef.current;
        if (!el) return undefined;

        function onWheel(e) {
          if (el.scrollWidth <= el.clientWidth) return;
          var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (!d) return;
          el.scrollLeft += d;
          e.preventDefault();
        }

        // 拖拽：按下记录起点，移动时反向改 scrollLeft；指针捕获保证移出面板也跟手
        var pan = { active: false, x: 0, left: 0 };
        function onDown(e) {
          if (e.button !== 0) return;
          if (el.scrollWidth <= el.clientWidth) return;
          pan.active = true;
          pan.x = e.clientX;
          pan.left = el.scrollLeft;
          try {
            el.setPointerCapture(e.pointerId);
          } catch (err) {
            /* 没有指针捕获也能拖，只是移出面板会断 */
          }
        }
        function onMove(e) {
          if (!pan.active) return;
          var dx = e.clientX - pan.x;
          if (dx) el.scrollLeft = pan.left - dx;
          e.preventDefault();
        }
        function onUp() {
          pan.active = false;
        }

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        return function () {
          el.removeEventListener('wheel', onWheel);
          el.removeEventListener('pointerdown', onDown);
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerup', onUp);
          el.removeEventListener('pointercancel', onUp);
        };
      }, [open]);

      // 浮窗模式下：浮层席位出画；浮层席位登记失败时由头部席位兜底出画。
      // 头部模式下：只有头部席位出画。
      if (isFloat) {
        if (!seatIsFloat && floatSeat === 'overlay') return null;
      } else if (seatIsFloat || props.seat !== 'header') {
        return null;
      }

      var info = describe(cfg, now, t);

      // 24 小时横条里的工作时段标记：取最近的整点，等距时落到较早那格（8:30 → 8:00）
      var workMarks = (function () {
        var map = {};
        function mark(hhmm, kind) {
          var p = String(hhmm || '').split(':');
          if (p.length < 2) return;
          var h = Number(p[0]);
          var mm = Number(p[1]);
          if (!isFinite(h) || !isFinite(mm)) return;
          var target = (mm > 30 ? h + 1 : h) % 24;
          if (!map[target]) map[target] = kind;
        }
        mark(cfg.workStart, 'start');
        mark(cfg.workEnd, 'end');
        return map;
      })();

      var pending = pendingRef.current;
      var caughtUp = !!pending
        && Math.round(cfg.offsetX) === pending.x
        && Math.round(cfg.offsetY) === pending.y;
      var dragging = !!drag && !caughtUp;

      // 详情面板生命周期：hover 基础面板即展开；离开基础面板与详情页累计 200ms 才收起；
      // 收起先播淡出动画（160ms）再卸载，避免「瞬间消失」
      var HOVER_HIDE_MS = 200;
      var FADE_OUT_MS = 160;

      function stopTimers() {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }
      }

      // 面板位置：与胶囊同宽并水平居中，下方放不下就翻到上方
      function panelPlacement(el) {
        var rect = el.getBoundingClientRect();
        var vp = viewport();
        // 面板宽度 320：键盘挪到独立浮窗后，这里不需要再撑宽
        var W = Math.min(320, Math.max(240, vp.w - 24));
        // 用量块 + 天气块 + 键盘块的高度估算，用来决定向下展开还是向上翻
        var H = (almanacBlock ? 130 : 0) + (usageBlock ? 122 : 0) + (wx.hours.length ? 250 : 130);
        // 与卡片水平居中：卡片比面板窄（280 vs 320），以中线对齐
        var left = clamp(rect.left + rect.width / 2 - W / 2, 12, Math.max(12, vp.w - W - 12));
        var below = rect.bottom + 8;
        var top = below + H > vp.h - 12 ? Math.max(12, rect.top - 8 - H) : below;
        return { left: left, top: top, width: W };
      }

      // 展开
      function openPanel(el) {
        if (!el) return;
        stopTimers();
        // 已经在显示（含淡出中途）：撤销淡出，保留原位置
        if (open) {
          if (leaving) setLeaving(false);
          return;
        }
        // 浮窗拖动中不弹面板，避免拖拽过程里闪一下
        if (isFloat && drag) return;
        setOpen(panelPlacement(el));
      }

      // 关：immediate=true 用于拖拽/点击外部这类「必须马上没」的场景
      function closePanel(immediate) {
        if (!open) return;
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        if (immediate) {
          stopTimers();
          setOpen(null);
          setLeaving(false);
          return;
        }
        if (!leaving) setLeaving(true);
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(function () {
          exitTimerRef.current = null;
          setOpen(null);
          setLeaving(false);
        }, FADE_OUT_MS);
      }

      // 指针离开：起一个 200ms 的计时；期间回到基础面板或详情页就作废
      function scheduleClose() {
        if (!open) return;
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = setTimeout(function () {
          leaveTimerRef.current = null;
          // 走 ref：200ms 内组件可能已重渲染，不能拿旧闭包里的 open 判断
          if (closeRef.current) closeRef.current(false);
        }, HOVER_HIDE_MS);
      }

      function cancelClose() {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
      }

      // 事件监听器挂在 document 上、只注册一次，必须拿到最新闭包里的关闭函数
      closeRef.current = closePanel;
      placeRef.current = panelPlacement;
      openRef.current = open;

      // 木鱼：敲一下飘一条「功德+1」，随机左右偏移，连敲时不会完全叠在一起
      function addMerit() {
        var id = meritSeq.current++;
        var dx = Math.round(Math.random() * 24 - 12);
        setMerits(function (prev) {
          return prev.concat([{ id: id, dx: dx }]).slice(-8);
        });
      }
      function dropMerit(id) {
        setMerits(function (prev) {
          return prev.filter(function (m) { return m.id !== id; });
        });
      }

      var style;
      var handlers = null;
      if (isFloat) {
        style = anchorStyle(cfg);
        if (dragging) {
          style.transform = 'translate(' + Math.round(drag.dx) + 'px,' + Math.round(drag.dy) + 'px)';
        }
      }
      handlers = {
        onPointerDown: function (e) {
          if (e.button !== 0) return;
          // 把手是独立元素：几何量胶囊、捕获给把手，拖动只从这里开始
          var pillEl = pillRef.current;
          var gripEl = e.currentTarget;
          if (!pillEl) return;
          var rect = pillEl.getBoundingClientRect();
          var vp = viewport();
          var tb = titlebarHeight();
          startRef.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX: cfg.offsetX,
            offsetY: cfg.offsetY,
            minDx: -rect.left,
            maxDx: Math.max(-rect.left, vp.w - rect.right),
            minDy: Math.max(-rect.top, tb - rect.top),
            maxDy: Math.max(tb - rect.top, vp.h - rect.bottom),
          };
          movedRef.current = false;
          setDrag({ dx: 0, dy: 0 });
          try {
            gripEl.setPointerCapture(e.pointerId);
          } catch (err) {
            /* 没有指针捕获也能拖，只是移出把手会断 */
          }
        },
        onPointerMove: function (e) {
          var s = startRef.current;
          if (!s) return;
          var dx = e.clientX - s.x;
          var dy = e.clientY - s.y;
          // 超过 3px 才算拖动：纯点击不再负责展开（改为 hover）
          if (!movedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            movedRef.current = true;
            if (open) closePanel(true);
          }
          if (!isFloat || !drag || !movedRef.current) return;
          setDrag({ dx: clamp(dx, s.minDx, s.maxDx), dy: clamp(dy, s.minDy, s.maxDy) });
        },
        onPointerUp: function (e) {
          var s = startRef.current;
          startRef.current = null;
          if (!s) return;
          var wasDrag = movedRef.current;
          movedRef.current = false;
          if (!wasDrag) {
            // 纯点击不再开合面板（展开已改为 hover），只复位拖动状态
            if (isFloat) setDrag(null);
            return;
          }
          if (!isFloat || !drag) {
            setDrag(null);
            return;
          }
          // 位移 → 到锚边的距离：锚线不变，窗口缩放时继续贴同一条边
          var nextX = cfg.anchorX === 'left' ? s.offsetX + drag.dx : s.offsetX - drag.dx;
          var nextY = cfg.anchorY === 'bottom' ? s.offsetY - drag.dy : s.offsetY + drag.dy;
          var x = Math.round(Math.max(0, nextX));
          var y = Math.round(Math.max(0, nextY));
          pendingRef.current = { x: x, y: y };
          persistOffsets(ctx, x, y, false);
        },
        onPointerCancel: function () {
          startRef.current = null;
          movedRef.current = false;
          pendingRef.current = null;
          setDrag(null);
        },
      };

      var attrs = {
        className: isFloat ? 'wcd-pill wcd-float' : 'wcd-pill',
        ref: pillRef,
        'data-kind': info.kind,
        'data-tone': info.tone,
        'data-dragging': dragging ? 'true' : 'false',
        'data-open': open ? 'true' : 'false',
        // 工具行与详情页同一生命周期：淡出（leaving）时一起收起
        'data-expand': open && !leaving ? 'true' : 'false',
        title: info.title,
        // 展开/收起全交给 hover：进入即开，离开起 200ms 防抖
        onPointerEnter: function (e) { openPanel(e.currentTarget); },
        onPointerLeave: function () { scheduleClose(); },
      };
      if (isFloat) attrs.style = style;

      var pill = h(
        'div',
        attrs,
        isFloat
          ? h(
              'div',
              // 拖动把手：主面板唯一能拖的地方，其余区域只响应 hover
              Object.assign({ className: 'wcd-grip', key: 'grip' }, handlers),
              h('span', { className: 'wcd-grip-bar' }),
              h('span', { className: 'wcd-grip-bar' }),
              h('span', { className: 'wcd-grip-bar' }),
            )
          : null,
        h(
          'div',
          { className: 'wcd-row1' },
          h(
            'span',
            { className: 'wcd-left' },
            h('span', { className: 'wcd-dot' }),
            h(
              'span',
              { className: 'wcd-count' },
              h('span', { className: 'wcd-label' }, info.label),
              info.num ? h('span', { className: 'wcd-num' }, info.num) : null,
            ),
          ),
          showWx
            ? h(
                'span',
                { className: 'wcd-right' },
                h('span', { className: 'wcd-sep' }),
                h(WeatherGlyph, { code: wx.code, size: 16 }),
                h('span', { className: 'wcd-wx-text' }, weatherText(wx.code, t)),
                h('span', { className: 'wcd-wx-temp' }, tempText(wx.temp)),
              )
            : null,
        ),
        isFloat && usageReady ? h('div', { className: 'wcd-usage' }, usageItems(26, false)) : null,
        isFloat
          ? h(
              'div',
              { className: 'wcd-fish-row' },
              h(
                'span',
                { className: 'wcd-fish-wrap' },
                h(
                  'span',
                  {
                    className: 'wcd-tool wcd-fish',
                    // 每次敲击换 key 触发重挂，让 CSS 动画从头播一遍
                    key: 'fish' + bonk,
                    'data-bonk': bonk > 0 ? 'true' : 'false',
                    role: 'button',
                    title: t('fish.title'),
                    // 阻断冒泡：敲木鱼不能顺带开合详情面板，也不能启动拖动
                    onPointerDown: function (e) { e.stopPropagation(); },
                    onPointerUp: function (e) { e.stopPropagation(); },
                    onClick: function (e) {
                      e.stopPropagation();
                      playKnock(cfg.volume);
                      setBonk(bonk + 1);
                      addMerit();
                    },
                  },
                  h(FishIcon),
                ),
                // 飘字层：不吃鼠标事件，每条动画结束自己摘掉
                h(
                  'span',
                  { className: 'wcd-merit-layer', 'aria-hidden': 'true' },
                  merits.map(function (m) {
                    return h(
                      'span',
                      {
                        className: 'wcd-merit',
                        key: 'merit' + m.id,
                        style: { '--dx': m.dx + 'px' },
                        onAnimationEnd: function () { dropMerit(m.id); },
                      },
                      t('fish.merit'),
                    );
                  }),
                ),
              ),
              h(
                'span',
                {
                  className: 'wcd-tool wcd-tube',
                  'data-shake': shaking ? 'true' : 'false',
                  role: 'button',
                  title: t('tube.title'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    setGua(pickGua());
                    setTarot(null);
                    setShaking(true);
                    setTimeout(function () { setShaking(false); }, 520);
                  },
                },
                h(TubeIcon),
              ),
              h(
                'span',
                {
                  className: 'wcd-tool wcd-tarot',
                  key: 'tarot' + spin,
                  'data-spin': spin > 0 ? 'true' : 'false',
                  role: 'button',
                  title: t('tarot.title'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    setGua(null);
                    setTarot(pickSpread());
                    setSpin(spin + 1);
                  },
                },
                h(TarotIcon),
              ),
              // 便笺：每点一次就新开一张，所以不做开关
              h(
                'span',
                {
                  className: 'wcd-tool wcd-note-btn',
                  role: 'button',
                  title: t('note.title'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    addNote(ctx);
                  },
                },
                h(NoteIcon),
              ),
              h(
                'span',
                {
                  className: 'wcd-tool wcd-farm',
                  role: 'button',
                  title: t('keymap.open'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    setKeyWin(!keyWin);
                  },
                },
                h(FarmIcon),
                ripeOn
                  ? h(
                      'svg',
                      {
                        className: 'wcd-tool-dot',
                        width: 10,
                        height: 10,
                        viewBox: '0 0 10 10',
                        'aria-hidden': 'true',
                      },
                      h('circle', { cx: 5, cy: 5, r: 4, fill: '#e5484d', stroke: '#fff', strokeWidth: 1.5 }),
                    )
                  : null,
              ),
              // 强制换行：占满整行、零高度的分隔块，保证第一行恰好 5 个工具
              h('span', { key: 'fishBreak', className: 'wcd-fish-break' }, null),
              // 颜色转换：第六个工具，落在第二行
              h(
                'span',
                {
                  className: 'wcd-tool wcd-rgb-btn',
                  role: 'button',
                  title: t('rgb.title'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    setRgbOpen(true);
                  },
                },
                h(RgbIcon),
              ),
              // 时间戳转换：第七个工具，也在第二行
              h(
                'span',
                {
                  className: 'wcd-tool wcd-ts-btn',
                  role: 'button',
                  title: t('ts.title'),
                  onPointerDown: function (e) { e.stopPropagation(); },
                  onPointerUp: function (e) { e.stopPropagation(); },
                  onClick: function (e) {
                    e.stopPropagation();
                    setTsOpen(true);
                  },
                },
                h(ClockIcon),
              ),
            )
          : null,
      );

      var panel = open
        ? h(WeatherPanel, {
            wx: wx,
            t: t,
            open: open,
            panelRef: panelRef,
            stripRef: stripRef,
            spin: spinMap.wx > 0,
            ok: okMap.wx,
            onRefreshWx: function () { manualRefresh('wx'); },
            usageBlock: usageBlock,
            almanacBlock: almanacBlock,
            workMarks: workMarks,
            // 淡出中挂 data-out；进入详情页取消关闭计时，离开重新计 200ms
            leaving: leaving,
            onEnter: cancelClose,
            onLeave: scheduleClose,
          })
        : null;

      return h(
        React.Fragment,
        null,
        pill,
        panel,
        NOTES.length ? h(NoteLayer, { notes: NOTES, ctx: ctx, t: t }) : null,
        gua ? h(GuaModal, { spread: gua, t: t, onClose: function () { setGua(null); } }) : null,
        rgbOpen
          ? h(RgbModal, {
              t: t,
              initial: RGB_LAST,
              onClose: function () {
                setRgbOpen(false);
              },
            })
          : null,
        tsOpen
          ? h(TsModal, {
              t: t,
              initial: TS_LAST,
              onClose: function () {
                setTsOpen(false);
              },
            })
          : null,
        keyWin
          ? h(KbdPanel, {
              t: t,
              ctx: ctx,
              animate: cfg.keyAnim !== false,
              size: cfg.keySize,
              initialX: cfg.keyPanelDX,
              initialY: cfg.keyPanelDY,
              onClose: function () { setKeyWin(false); },
              onDrop: function (dx, dy) { persistKeyPanel(ctx, dx, dy, false); },
            })
          : null,
        tarot
          ? h(TarotModal, { spread: tarot, t: t, onClose: function () { setTarot(null); } })
          : null,
      );
    }

    // 设置页：字段 + 保存。写入走 settings.update（带 revision，冲突时重读一次再试）。
    function SettingsPage(props) {
      var ctx = props.ctx;
      var t = props.t;
      var viewState = React.useState(null);
      var view = viewState[0];
      var setView = viewState[1];
      var draftState = React.useState(editable(FALLBACK));
      var draft = draftState[0];
      var setDraft = draftState[1];
      var statusState = React.useState('idle'); // idle | saving | saved | failed
      var status = statusState[0];
      var setStatus = statusState[1];
      var errorState = React.useState('');
      var errorText = errorState[0];
      var setErrorText = errorState[1];

      function sync(hit) {
        if (hit) setView(hit);
      }

      React.useEffect(function () {
        var alive = true;
        var retry = null;
        var tries = 0;
        var off = null;

        function load(force) {
          if (!getRemote(ctx)) return false;
          describeNamespace(ctx).then(function (hit) {
            if (!alive || !hit) return;
            sync(hit);
            if (force) setDraft(editable(hit.value));
          }).catch(function () { /* 读不到就保持缺省值 */ });
          return true;
        }

        if (!load(true)) {
          retry = setInterval(function () {
            tries += 1;
            if (load(true) || tries >= 40) {
              clearInterval(retry);
              retry = null;
            }
          }, 500);
        }

        var remote = getRemote(ctx);
        if (remote && typeof remote.$on === 'function') {
          try {
            off = remote.$on('settings/document-updated', function () { load(false); });
          } catch (e) {
            off = null;
          }
        }

        return function () {
          alive = false;
          if (retry) clearInterval(retry);
          if (typeof off === 'function') {
            try {
              off();
            } catch (e) {
              /* 退订失败不影响其它清理 */
            }
          }
        };
      }, []);

      function patch(part) {
        setDraft(Object.assign({}, draft, part));
        setStatus('idle');
      }

      function save() {
        var remote = getRemote(ctx);
        if (!view || !remote || !remote.settings || typeof remote.settings.update !== 'function') {
          setStatus('failed');
          setErrorText(t('settings.noService'));
          return;
        }
        var start = parseHM(draft.workStart);
        var end = parseHM(draft.workEnd);
        if (start < 0 || end < 0 || end <= start) {
          setStatus('failed');
          setErrorText(t('settings.invalid'));
          return;
        }
        setStatus('saving');
        setErrorText('');
        // 只写可编辑字段：锚点 / 偏移留给拖动，保存不能把它们冲掉
        remote.settings.update(NS, editable(draft), view.revision).then(function (res) {
          if (res && res.ok) {
            setStatus('saved');
            setErrorText('');
            describeNamespace(ctx).then(function (hit) { if (hit) setView(hit); }).catch(function () {});
            return;
          }
          var msg = (res && res.error && res.error.message) || '';
          setStatus('failed');
          setErrorText(msg || t('settings.failed'));
          // revision 过期是最常见的失败原因：重读一次，用户再点保存即可
          describeNamespace(ctx).then(function (hit) { if (hit) setView(hit); }).catch(function () {});
        }).catch(function (e) {
          setStatus('failed');
          setErrorText((e && e.message) || t('settings.failed'));
        });
      }

      var stored = editable(view && view.value);
      var dirty = JSON.stringify(stored) !== JSON.stringify(editable(draft));

      function field(nameKey, descKey) {
        var controls = Array.prototype.slice.call(arguments, 2);
        return h(
          'div',
          { className: 'wcd-field' },
          h(
            'div',
            { className: 'wcd-meta' },
            h('div', { className: 'wcd-name' }, t(nameKey)),
            h('div', { className: 'wcd-desc' }, t(descKey)),
          ),
          h('div', { className: 'wcd-ctl' }, ...controls),
        );
      }

      return h(
        'div',
        { className: 'wcd-form' },
        h(
          'div',
          { className: 'wcd-head' },
          h('h3', { className: 'wcd-title' }, t('settings.title')),
          h('p', { className: 'wcd-intro' }, t('settings.intro')),
        ),
        field(
          'settings.start',
          'settings.start.desc',
          h('input', {
            className: 'wcd-input',
            type: 'time',
            value: timeInputValue(draft.workStart),
            onChange: function (e) { patch({ workStart: e.target.value }); },
          }),
        ),
        field(
          'settings.end',
          'settings.end.desc',
          h('input', {
            className: 'wcd-input',
            type: 'time',
            value: timeInputValue(draft.workEnd),
            onChange: function (e) { patch({ workEnd: e.target.value }); },
          }),
        ),
        field(
          'settings.days',
          'settings.days.desc',
          h('input', {
            className: 'wcd-input',
            'data-wide': 'true',
            type: 'text',
            value: draft.workdays,
            spellCheck: false,
            onChange: function (e) { patch({ workdays: e.target.value }); },
          }),
        ),
        field(
          'settings.seconds',
          'settings.seconds.desc',
          h('input', {
            className: 'wcd-check',
            type: 'checkbox',
            checked: draft.showSeconds === true,
            onChange: function (e) { patch({ showSeconds: !!e.target.checked }); },
          }),
        ),
        field(
          'settings.float',
          'settings.float.desc',
          h('input', {
            className: 'wcd-check',
            type: 'checkbox',
            checked: draft.float === true,
            onChange: function (e) { patch({ float: !!e.target.checked }); },
          }),
        ),
        field(
          'settings.city',
          'settings.city.desc',
          h('input', {
            className: 'wcd-input',
            'data-wide': 'true',
            type: 'text',
            value: draft.city,
            spellCheck: false,
            placeholder: '杭州',
            onChange: function (e) { patch({ city: e.target.value }); },
          }),
        ),
        field(
          'settings.timeout',
          'settings.timeout.desc',
          h('input', {
            className: 'wcd-range',
            type: 'range',
            min: '5',
            max: '120',
            step: '5',
            value: String(draft.requestTimeoutSeconds),
            onChange: function (e) { patch({ requestTimeoutSeconds: Number(e.target.value) }); },
          }),
          h('span', { className: 'wcd-range-value' }, draft.requestTimeoutSeconds + 's'),
        ),
        field(
          'settings.weather',
          'settings.weather.desc',
          h('input', {
            className: 'wcd-check',
            type: 'checkbox',
            checked: draft.weatherVisible !== false,
            onChange: function (e) { patch({ weatherVisible: !!e.target.checked }); },
          }),
        ),
        field(
          'settings.usage',
          'settings.usage.desc',
          h('input', {
            className: 'wcd-check',
            type: 'checkbox',
            checked: draft.usageVisible !== false,
            onChange: function (e) { patch({ usageVisible: !!e.target.checked }); },
          }),
        ),
        field(
          'settings.volume',
          'settings.volume.desc',
          h('input', {
            className: 'wcd-range',
            type: 'range',
            min: '0',
            max: '100',
            step: '5',
            value: String(draft.volume),
            onChange: function (e) { patch({ volume: Number(e.target.value) }); },
          }),
          h('span', { className: 'wcd-range-value' }, draft.volume + '%'),
        ),
        field(
          'settings.keyAnim',
          'settings.keyAnim.desc',
          h('input', {
            className: 'wcd-check',
            type: 'checkbox',
            checked: draft.keyAnim !== false,
            onChange: function (e) { patch({ keyAnim: !!e.target.checked }); },
          }),
        ),
        field(
          'settings.keySize',
          'settings.keySize.desc',
          h('select', {
            className: 'wcd-input',
            value: draft.keySize || 'medium',
            onChange: function (e) { patch({ keySize: e.target.value }); },
          },
            h('option', { value: 'small' }, t('settings.keySize.small')),
            h('option', { value: 'medium' }, t('settings.keySize.medium')),
            h('option', { value: 'large' }, t('settings.keySize.large')),
          ),
        ),
        field(
          'settings.keymap',
          'settings.keymap.desc',
          h(
            'button',
            {
              className: 'wcd-btn',
              type: 'button',
              onClick: function () {
                if (window.confirm && !window.confirm(t('settings.keymap.confirm'))) return;
                resetKeyStats(ctx);
                // 重新渲染一次，让总计立刻归零
                setDraft(Object.assign({}, draft));
              },
            },
            t('settings.keymap.reset'),
          ),
          h('span', { className: 'wcd-status' }, t('settings.keymap.total') + ' ' + keyStatsTotal()),
        ),
        h(
          'div',
          { className: 'wcd-actions' },
          h(
            'button',
            {
              className: 'wcd-btn',
              type: 'button',
              disabled: status === 'saving' || !dirty,
              onClick: save,
            },
            status === 'saving' ? t('settings.saving') : t('settings.save'),
          ),
          h(
            'span',
            { className: 'wcd-status', 'data-kind': status },
            status === 'saved' ? t('settings.saved') : status === 'failed' ? errorText : '',
          ),

        ),
      );
    }

    function SettingsIcon() {
      // 设置导航图标：单色随 currentColor 着色（宿主按主题派生颜色）
      return h(
        'svg',
        { viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': true, fill: 'none' },
        h('circle', {
          cx: 8, cy: 8, r: 6.1,
          stroke: 'currentColor', strokeWidth: 1.5,
        }),
        h('path', {
          d: 'M8 4.6V8l2.5 1.7',
          stroke: 'currentColor', strokeWidth: 1.5,
          strokeLinecap: 'round', strokeLinejoin: 'round',
        }),
      );
    }

    function apply(ctx) {
      // 语言服务：不在 inject 里就取不到，文案会整体退回内置中文
      var locale = null;
      try {
        locale = (ctx.locale && typeof ctx.locale.register === 'function') ? ctx.locale : ctx.get('locale');
      } catch (e) {
        locale = null;
      }
      if (locale && typeof locale.register === 'function') {
        ctx.effect(function () { return locale.register(NS, DICT); });
      }

      var bound = null;
      if (locale && typeof locale.bind === 'function') {
        try {
          bound = locale.bind(NS);
        } catch (e) {
          bound = null;
        }
      }
      // 查不到词条时退回内置中文；组件每秒重算一次，切语言后最迟一秒内跟手
      function t(key) {
        if (bound) {
          try {
            var v = bound(key);
            if (v && v !== key) return v;
          } catch (e) {
            /* 退回内置字典 */
          }
        }
        return DICT.zh[key] || key;
      }

      ctx.effect(function () {
        var tag = document.createElement('style');
        tag.setAttribute('data-plugin', NS);
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return function () {
          if (tag.parentNode) tag.parentNode.removeChild(tag);
        };
      });

      // 键盘统计：只数本窗口内的按键，按 event.code 累计；停手 5 秒或页面隐藏时落盘。
      try {
        var statsTimer = null;
        function flushSoon() {
          if (statsTimer) return;
          statsTimer = setTimeout(function () {
            statsTimer = null;
            flushKeyStats(ctx);
          }, 5000);
        }
        function onKeyDown(e) {
          if (!e || e.repeat) return;
          var code = typeof e.code === 'string' ? e.code : '';
          if (!code) return;
          KEY_STATS[code] = (KEY_STATS[code] || 0) + 1;
          KEY_STATS_DIRTY = true;
          // 0 次 → 第一次按下：这一格的作物和姿态从此定型
          if (!KEY_LOOKS[code]) {
            KEY_LOOKS[code] = randomLook();
            LOOKS_DIRTY = true;
          }
          flushSoon();
        }
        function onVisibility() {
          if (document.visibilityState === 'hidden') {
            flushKeyStats(ctx);
          }
        }
        function loadOnce(tries) {
          if (KEY_STATS_LOADED) return;
          describeNamespace(ctx).then(function (hit) {
            if (!hit || !hit.value) {
              // 远程还没就绪：最多重试约 10 秒，期间先不写盘
              if (tries < 20) setTimeout(function () { loadOnce(tries + 1); }, 500);
              return;
            }
            KEY_STATS_LOADED = true;
            var parsed = parseKeyStats(hit.value.keyStats);
            for (var k in parsed) {
              // 与本次会话已累计的合并，别把历史冲掉
              KEY_STATS[k] = (KEY_STATS[k] || 0) + (Number(parsed[k]) || 0);
            }
            KEY_LOOKS = parseLooks(hit.value.keyCrops);
            CROP_STOCK = parseStock(hit.value.cropStock);
            // 便笺只在启动时读一次，之后以内存里的为准（避免边打字边被回读覆盖）
            NOTES = parseNotes(hit.value.notes);
            NOTES_LOADED = true;
            noteNotify();
            // 老数据只有次数、没有外观：统一随机一次，次数保留
            var filled = false;
            for (var kk in KEY_STATS) {
              if (Number(KEY_STATS[kk]) > 0 && !KEY_LOOKS[kk]) {
                KEY_LOOKS[kk] = randomLook();
                filled = true;
              }
            }
            if (filled) {
              // 迁移出来的随机外观立刻落盘，下次启动就不会再抽一次
              LOOKS_DIRTY = true;
              flushKeyStats(ctx);
            }
            KEY_STATS_DIRTY = true;
          }).catch(function () {
            if (tries < 20) setTimeout(function () { loadOnce(tries + 1); }, 500);
          });
        }
        loadOnce(0);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('visibilitychange', onVisibility);
        ctx.effect(function () {
          return function () {
            document.removeEventListener('keydown', onKeyDown, true);
            document.removeEventListener('visibilitychange', onVisibility);
            if (statsTimer) {
              clearTimeout(statsTimer);
              statsTimer = null;
            }
            flushKeyStats(ctx);
          };
        });
      } catch (e) {
        /* 统计挂了也不能影响倒计时 */
      }

      ctx.slots.inject('conversation.session.header.utilities', function () {
        try {
          return ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: NS,
              order: 40,
              label: function () { return t('label.pill'); },
            },
            function (ownerProps) {
              return h(WorkCountdown, { ctx: ctx, t: t, seat: 'header', ownerProps: ownerProps });
            },
          );
        } catch (e) {
          console.warn('[work-countdown] 倒计时席位注册失败：' + ((e && e.message) || e));
          return function () {};
        }
      });

      // 席位二：官方浮层（Frame-wide floating layer）。float 为假时这份返回 null，等于不占位。
      ctx.slots.inject('shell.overlay', function () {
        try {
          var off = ctx.slots.register(
            {
              name: 'shell.overlay',
              id: NS + '-float',
              order: 45,
              label: function () { return t('label.pill'); },
            },
            function (ownerProps) {
              return h(WorkCountdown, { ctx: ctx, t: t, seat: 'float', ownerProps: ownerProps });
            },
          );
          floatSeat = 'overlay';
          reportDiag(ctx, 'b' + Date.now().toString(36).slice(-3) + ';seat=overlay;mount=pending');
          return off;
        } catch (e) {
          // 浮层席位不可用：记下来，由头部席位兜底出画浮窗（只在有会话时可见）
          floatSeat = 'header';
          reportDiag(ctx, 'seat=header;reason=' + String((e && e.message) || e).slice(0, 80));
          console.warn('[work-countdown] 浮窗席位注册失败，改由头部席位兜底：' + ((e && e.message) || e));
          return function () {};
        }
      });

      // 席位三：设置页（设置 → 下班倒计时）
      ctx.slots.inject('settings.section', function () {
        try {
          return ctx.slots.register(
            {
              name: 'settings.section',
              id: NS,
              order: 60,
              label: function () { return t('settings.title'); },
            },
            function (ownerProps) {
              return h(SettingsPage, { ctx: ctx, t: t, ownerProps: ownerProps });
            },
          );
        } catch (e) {
          console.warn('[work-countdown] 设置页注册失败：' + ((e && e.message) || e));
          return function () {};
        }
      });

      // 设置导航图标（id 必须与 settings.section 一致）
      ctx.slots.inject('settings.section.icon', function () {
        try {
          return ctx.slots.register(
            { name: 'settings.section.icon', id: NS, order: 60 },
            function () { return h(SettingsIcon); },
          );
        } catch (e) {
          return function () {};
        }
      });
    }

    return {
      name: 'work-countdown',
      inject: ['slots', 'locale', 'remote', 'remote.settings'],
      apply: apply,
    };
  },
});
