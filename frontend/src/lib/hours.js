import { restaurantInfo } from '../data/content';
export function isOpenNow() {
    const now = new Date();
    const hour = now.getHours();
    // [jam buka: 10.00-21.00] — placeholder jam operasional, ganti setelah dikonfirmasi
    return hour >= restaurantInfo.openHour && hour < restaurantInfo.closeHour;
}
export function getOpenHoursText(lang) {
    // [jam buka: 10.00-21.00] — placeholder jam operasional, ganti setelah dikonfirmasi
    return lang === 'id'
        ? `Setiap Hari · ${restaurantInfo.openHour}.00-${restaurantInfo.closeHour}.00 WIB`
        : `Daily · ${restaurantInfo.openHour}:00-${restaurantInfo.closeHour}:00`;
}
