export type BoardCategory = 'birthday' | 'teacher' | 'graduation' | 'farewell' | 'general';

export type BoardTheme = 
  | 'chalkboard_green' 
  | 'teacher_notebook' 
  | 'birthday_cream' 
  | 'birthday_pink' 
  | 'farewell_sunset' 
  | 'farewell_letter' 
  | 'grad_navy' 
  | 'grad_corkboard' 
  | 'general_pastel';

export interface Board {
  board_id: string;
  target_name: string;
  title: string;
  category: BoardCategory;
  theme_id: BoardTheme;
  password: string; // 4-6 digits
  is_locked: boolean;
  open_at: string; // ISO string
  created_at: string;
  description?: string;
  gas_url?: string;
}

export type FontStyle = 'NanumPen' | 'Gaegu' | 'GowunDodum';

export interface Message {
  message_id: string;
  board_id: string;
  author: string;
  is_anonymous?: boolean;
  content: string;
  card_color: string;
  font_style: FontStyle;
  sticker_id: string;
  password: string; // 4 digits
  is_deleted: boolean;
  created_at: string;
  pos_x?: number; // percentage (0-100) or px for free placement
  pos_y?: number;
  rotation?: number; // tilt angle in degrees (-5 to 5)
}

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  category: 'all' | BoardCategory;
}

export interface ThemeConfig {
  id: BoardTheme;
  name: string;
  category: BoardCategory;
  description: string;
  boardBgClass: string;
  textColorClass: string;
  accentColor: string;
  tapeColor: string;
  frameStyle: 'wood' | 'gold' | 'soft' | 'notebook' | 'minimal';
}
