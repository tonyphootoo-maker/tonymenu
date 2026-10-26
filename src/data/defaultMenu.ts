import type { MenuPage, RestaurantConfig } from '../types';

import appetizerImg from '../assets/images/menu_thai_appetizers_1793000182904.jpg';
import mainsImg from '../assets/images/menu_thai_mains_1793000184089.jpg';
import dessertImg from '../assets/images/menu_thai_beverages_1793000184206.jpg';
import defaultLogoImg from '../assets/images/restaurant_logo_badge_1793000644957.jpg';

export const DEFAULT_RESTAURANT_CONFIG: RestaurantConfig = {
  restaurantName: 'บ้านไทย คิทเช่น (Baan Thai Kitchen)',
  tagline: 'อาหารไทยต้นตำรับ เมนูสดใหม่ทุกวัน',
  logoUrl: defaultLogoImg,
  lineId: '@baanthai_kitchen',
  phone: '089-123-4567',
  adminPin: '1234',
  accentColor: '#f59e0b',
};

export const DEFAULT_MENU_PAGES: MenuPage[] = [
  {
    id: 'page-1',
    title: 'อาหารว่าง & ของทานเล่น (Appetizers)',
    category: 'อาหารว่าง',
    imageUrl: appetizerImg,
    description: 'ปอเปี๊ยะทอด, สะเต๊ะไก่เนื้อนุ่ม, ส้มตำไทยกุ้งสดรสเด็ด',
    createdAt: Date.now() - 3000,
  },
  {
    id: 'page-2',
    title: 'อาหารจานหลัก & ต้มแกง (Main Courses)',
    category: 'จานหลัก',
    imageUrl: mainsImg,
    description: 'ต้มยำกุ้งแม่น้ำหม้อไฟ, ผัดไทยกุ้งสด, แกงเขียวหวานไก่, ข้าวกะเพราหมูสับไข่ดาวกรอบ',
    createdAt: Date.now() - 2000,
  },
  {
    id: 'page-3',
    title: 'ของหวาน & เครื่องดื่ม (Desserts & Drinks)',
    category: 'ของหวานและเครื่องดื่ม',
    imageUrl: dessertImg,
    description: 'ข้าวเหนียวมะม่วงอกร่องทอง, ชาไทยเย็นโบราณเข้มข้น, ไอศกรีมกะทิสดทรงเครื่อง',
    createdAt: Date.now() - 1000,
  },
];
