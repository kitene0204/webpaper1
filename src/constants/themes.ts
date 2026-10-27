import { BoardCategory, BoardTheme, FontStyle, Sticker, ThemeConfig } from '../types';

export const CATEGORIES: { id: BoardCategory; name: string; emoji: string; subtitle: string }[] = [
  { id: 'teacher', name: '교생실습 / 선생님', emoji: '🍎', subtitle: '선생님과 학생들의 감동적인 추억' },
  { id: 'birthday', name: '생일 축하', emoji: '🎂', subtitle: '특별한 날을 빛내는 친구들의 축하' },
  { id: 'graduation', name: '졸업 / 수료', emoji: '🎓', subtitle: '함께했던 시간과 새로운 출발 응원' },
  { id: 'farewell', name: '전학 / 이별 / 송별', emoji: '👋', subtitle: '떠나는 소중한 이를 위한 따뜻한 배웅' },
  { id: 'general', name: '자유 / 감사 / 이벤트', emoji: '✨', subtitle: '다양한 모임과 기념일을 위한 롤링페이퍼' },
];

export const THEMES: Record<BoardTheme, ThemeConfig> = {
  chalkboard_green: {
    id: 'chalkboard_green',
    name: '추억의 녹색 칠판',
    category: 'teacher',
    description: '분필 감성과 나무 액자 프레임이 어우러진 정겨운 교실 칠판 테마',
    boardBgClass: 'bg-chalkboard text-emerald-100',
    textColorClass: 'text-emerald-50',
    accentColor: '#4ADE80',
    tapeColor: 'rgba(255, 255, 255, 0.45)',
    frameStyle: 'wood',
  },
  teacher_notebook: {
    id: 'teacher_notebook',
    name: '모눈 방안지 공책',
    category: 'teacher',
    description: '깔끔한 줄공책 위에 정성스럽게 적어 내려가는 단정한 테마',
    boardBgClass: 'bg-notebook text-slate-800',
    textColorClass: 'text-slate-800',
    accentColor: '#3B82F6',
    tapeColor: 'rgba(59, 130, 246, 0.25)',
    frameStyle: 'notebook',
  },
  birthday_cream: {
    id: 'birthday_cream',
    name: '달콤한 크림 파티',
    category: 'birthday',
    description: '케이크 크림처럼 부드러운 배경에 알록달록 컨페티가 흩날리는 파티 테마',
    boardBgClass: 'bg-birthday-confetti text-amber-950',
    textColorClass: 'text-amber-900',
    accentColor: '#F59E0B',
    tapeColor: 'rgba(251, 191, 36, 0.35)',
    frameStyle: 'soft',
  },
  birthday_pink: {
    id: 'birthday_pink',
    name: '베리베리 핑크 팝',
    category: 'birthday',
    description: '화사한 핑크 톤과 사랑스러운 분위기로 축하하는 테마',
    boardBgClass: 'bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 text-rose-950',
    textColorClass: 'text-rose-900',
    accentColor: '#EC4899',
    tapeColor: 'rgba(244, 114, 182, 0.35)',
    frameStyle: 'soft',
  },
  farewell_sunset: {
    id: 'farewell_sunset',
    name: '노을빛 하늘 편지',
    category: 'farewell',
    description: '따뜻한 노을 그라데이션과 잔잔한 감성을 담은 테마',
    boardBgClass: 'bg-sunset-pattern text-slate-800',
    textColorClass: 'text-slate-800',
    accentColor: '#F97316',
    tapeColor: 'rgba(249, 115, 22, 0.25)',
    frameStyle: 'soft',
  },
  farewell_letter: {
    id: 'farewell_letter',
    name: '빈티지 엽서보드',
    category: 'farewell',
    description: '편지봉투와 스탬프, 클래식 크라프트지의 따스한 질감',
    boardBgClass: 'bg-[#F5EFE6] text-amber-950',
    textColorClass: 'text-stone-800',
    accentColor: '#B45309',
    tapeColor: 'rgba(180, 83, 9, 0.2)',
    frameStyle: 'minimal',
  },
  grad_navy: {
    id: 'grad_navy',
    name: '클래식 로열 네이비',
    category: 'graduation',
    description: '학사모와 금빛 리본이 빛나는 무게감 있고 품격 있는 졸업 테마',
    boardBgClass: 'bg-grad-navy text-slate-100',
    textColorClass: 'text-amber-200',
    accentColor: '#FBBF24',
    tapeColor: 'rgba(251, 191, 36, 0.4)',
    frameStyle: 'gold',
  },
  grad_corkboard: {
    id: 'grad_corkboard',
    name: '추억의 코르크 게시판',
    category: 'graduation',
    description: '핀으로 꽂은 듯한 입체감과 정겨운 우드 프레임 테마',
    boardBgClass: 'bg-corkboard text-stone-900',
    textColorClass: 'text-stone-900',
    accentColor: '#854D0E',
    tapeColor: 'rgba(255, 255, 255, 0.55)',
    frameStyle: 'wood',
  },
  general_pastel: {
    id: 'general_pastel',
    name: '소프트 민트 메모',
    category: 'general',
    description: '어떤 목적에도 잘 어울리는 화사하고 단정한 파스텔 민트 테마',
    boardBgClass: 'bg-gradient-to-br from-emerald-50/60 via-teal-50/60 to-cyan-50/60 text-slate-800',
    textColorClass: 'text-teal-950',
    accentColor: '#0D9488',
    tapeColor: 'rgba(20, 184, 166, 0.25)',
    frameStyle: 'soft',
  },
};

export const POSTIT_COLORS = [
  { id: '#FFF9C4', name: '레몬 옐로우', border: '#FDE047', text: '#713F12' },
  { id: '#FCE4EC', name: '러블리 핑크', border: '#F9A8D4', text: '#831843' },
  { id: '#E0F2F1', name: '상쾌한 민트', border: '#99F6E4', text: '#134E4A' },
  { id: '#EDE7F6', name: '소프트 라벤더', border: '#DDD6FE', text: '#4C1D95' },
  { id: '#E0F7FA', name: '하늘 스카이블루', border: '#BAE6FD', text: '#0C4A6E' },
  { id: '#FFF3E0', name: '살구 피치', border: '#FED7AA', text: '#7C2D12' },
  { id: '#FFFFFF', name: '모던 퓨어화이트', border: '#E2E8F0', text: '#1E293B' },
  { id: '#EFEBE9', name: '빈티지 크라프트', border: '#D7CCC8', text: '#3E2723' },
];

export const FONTS: { id: FontStyle; name: string; sample: string; cssClass: string }[] = [
  { id: 'NanumPen', name: '나눔 손글씨 펜체', sample: '따뜻한 마음을 담아 써요', cssClass: 'font-nanum' },
  { id: 'Gaegu', name: '개구체 (동글동글)', sample: '귀엽고 사랑스러운 글씨', cssClass: 'font-gaegu' },
  { id: 'GowunDodum', name: '고운 돋움 (깔끔한 고딕)', sample: '단정하고 또박또박한 글씨', cssClass: 'font-gowun' },
];

export const STICKERS: Sticker[] = [
  // Teacher / School
  { id: 'carnation', emoji: '💐', name: '카네이션 꽃다발', category: 'teacher' },
  { id: 'apple', emoji: '🍎', name: '감사 사과', category: 'teacher' },
  { id: 'chalk', emoji: '✏️', name: '연필/분필', category: 'teacher' },
  { id: '100pts', emoji: '💯', name: '100점 만점', category: 'teacher' },
  { id: 'teacher_book', emoji: '📖', name: '교과서', category: 'teacher' },

  // Birthday
  { id: 'cake', emoji: '🎂', name: '생일 케이크', category: 'birthday' },
  { id: 'party_popper', emoji: '🎉', name: '폭죽 파티', category: 'birthday' },
  { id: 'gift', emoji: '🎁', name: '선물 상자', category: 'birthday' },
  { id: 'balloons', emoji: '🎈', name: '풍선', category: 'birthday' },
  { id: 'crown', emoji: '👑', name: '생일 왕관', category: 'birthday' },

  // Graduation
  { id: 'grad_cap', emoji: '🎓', name: '학사모', category: 'graduation' },
  { id: 'ribbon_bouquet', emoji: '🌸', name: '축하 꽃', category: 'graduation' },
  { id: 'diploma', emoji: '📜', name: '졸업장', category: 'graduation' },
  { id: 'trophy', emoji: '🏆', name: '영광의 트로피', category: 'graduation' },

  // Farewell
  { id: 'airplane', emoji: '✈️', name: '새로운 여정', category: 'farewell' },
  { id: 'letter', emoji: '💌', name: '진심 편지', category: 'farewell' },
  { id: 'crying', emoji: '🥹', name: '아쉬운 눈물', category: 'farewell' },
  { id: 'clover', emoji: '🍀', name: '행운의 네잎클로버', category: 'farewell' },
  { id: 'hug', emoji: '🫂', name: '따뜻한 포옹', category: 'farewell' },

  // Universal
  { id: 'heart', emoji: '💖', name: '반짝 하트', category: 'all' },
  { id: 'star', emoji: '⭐', name: '빛나는 별', category: 'all' },
  { id: 'thumbs_up', emoji: '👍', name: '최고 엄지척', category: 'all' },
  { id: 'fire', emoji: '🔥', name: '열정 불꽃', category: 'all' },
  { id: 'sparkles', emoji: '✨', name: '반짝임', category: 'all' },
  { id: 'coffee', emoji: '☕', name: '따뜻한 커피 한 잔', category: 'all' },
];
