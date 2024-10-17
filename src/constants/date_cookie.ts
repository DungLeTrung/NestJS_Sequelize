import { parse } from 'date-fns'; // Thư viện để phân tích thời gian

export function parseExpirationTime(time: string): number {
  const unit = time.slice(-1); // Lấy ký tự cuối cùng để xác định đơn vị
  const value = parseInt(time.slice(0, -1)); // Lấy phần số

  switch (unit) {
    case 'd': // ngày
      return value * 24 * 60 * 60 * 1000; // chuyển đổi sang milliseconds
    case 'h': // giờ
      return value * 60 * 60 * 1000; // chuyển đổi sang milliseconds
    case 'm': // phút
      return value * 60 * 1000; // chuyển đổi sang milliseconds
    case 's': // giây
      return value * 1000; // chuyển đổi sang milliseconds
    default:
      throw new Error('Invalid time format');
  }
}