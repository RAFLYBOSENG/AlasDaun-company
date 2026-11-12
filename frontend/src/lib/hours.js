import { restaurantInfo } from '../data/content';
export function isOpenNow() {
    if (restaurantInfo.openHour == null || restaurantInfo.closeHour == null) return null;
    const now = new Date();
    const hour = now.getHours();
    return hour >= restaurantInfo.openHour && hour < restaurantInfo.closeHour;
}
export function getOpenHoursText(lang) {
    if (restaurantInfo.openHour == null || restaurantInfo.closeHour == null) {
        return lang === 'id' ? 'Jam operasional belum tersedia' : 'Opening hours are not available yet';
    }
    return lang === 'id'
        ? `Setiap Hari · ${restaurantInfo.openHour}.00-${restaurantInfo.closeHour}.00 WIB`
        : `Daily · ${restaurantInfo.openHour}:00-${restaurantInfo.closeHour}:00`;
}
