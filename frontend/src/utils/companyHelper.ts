export interface CompanyInfo {
  id: number;
  name: string;
  shortName: string;
  code: string;
  email: string;
  hotline: string;
}

export const KNOWN_COMPANIES: CompanyInfo[] = [
  { id: 1, name: 'Phương Trang (FUTA Bus Lines)', shortName: 'Phương Trang', code: 'FUTA', email: 'hotro@futa.vn', hotline: '1900 6067' },
  { id: 2, name: 'Thành Bưởi', shortName: 'Thành Bưởi', code: 'THANHBUOI', email: 'info@thanhbuoi.com.vn', hotline: '1900 6079' },
  { id: 3, name: 'Sao Việt', shortName: 'Sao Việt', code: 'SAOVIET', email: 'contact@xesaoviet.com.vn', hotline: '1900 6746' },
  { id: 4, name: 'Kumho Samco Buslines', shortName: 'Kumho Samco', code: 'KUMHO', email: 'cskh@kumhosamco.com.vn', hotline: '1900 6065' },
  { id: 5, name: 'Xe Khách Hoa Mai', shortName: 'Hoa Mai', code: 'HOAMAI', email: 'info@hoamaivungtau.com.vn', hotline: '1900 599 997' },
  { id: 6, name: 'Hoàng Long Asia', shortName: 'Hoàng Long', code: 'HOANGLONG', email: 'info@hoanglongasia.com', hotline: '0225 3920 920' },
  { id: 7, name: 'Nhà Xe Văn Minh', shortName: 'Văn Minh', code: 'VANMINH', email: 'vanminh@vanminh74.vn', hotline: '1900 6467' },
  { id: 8, name: 'Cúc Tùng Limousine', shortName: 'Cúc Tùng', code: 'CUCTUNG', email: 'cuctunglimousine@gmail.com', hotline: '1900 6606' },
  { id: 9, name: 'Hải Vân Express', shortName: 'Hải Vân', code: 'HAIVAN', email: 'cskh@haivan.com', hotline: '1900 6763' },
  { id: 10, name: 'Chín Nghĩa', shortName: 'Chín Nghĩa', code: 'CHINNGHIA', email: 'chinnghiaquangngai@gmail.com', hotline: '1900 636 636' },
];

export const getStoredCompany = (): CompanyInfo => {
  try {
    const saved = localStorage.getItem('traveleasy_user');
    if (saved) {
      const u = JSON.parse(saved);
      const name = (u.fullName || '').trim().toLowerCase();
      const email = (u.email || '').toLowerCase();

      // Check special aliases
      if (name.includes('sao việt') || name.includes('sao viet') || email.includes('xesaoviet')) {
        return KNOWN_COMPANIES[2];
      }
      if (name.includes('phương trang') || name.includes('phuong trang') || name.includes('futa') || email.includes('futa')) {
        return KNOWN_COMPANIES[0];
      }
      if (name.includes('thành bưởi') || name.includes('thanh buoi') || email.includes('thanhbuoi')) {
        return KNOWN_COMPANIES[1];
      }
      if (name.includes('kumho') || email.includes('kumho')) {
        return KNOWN_COMPANIES[3];
      }
      if (name.includes('hoa mai') || email.includes('hoamai')) {
        return KNOWN_COMPANIES[4];
      }
      if (name.includes('hoàng long') || name.includes('hoang long') || email.includes('hoanglong')) {
        return KNOWN_COMPANIES[5];
      }
      if (name.includes('văn minh') || name.includes('van minh') || email.includes('vanminh')) {
        return KNOWN_COMPANIES[6];
      }
      if (name.includes('cúc tùng') || name.includes('cuc tung') || email.includes('cuctung')) {
        return KNOWN_COMPANIES[7];
      }
      if (name.includes('hải vân') || name.includes('hai van') || email.includes('haivan')) {
        return KNOWN_COMPANIES[8];
      }
      if (name.includes('chín nghĩa') || name.includes('chin nghia') || email.includes('chinnghia')) {
        return KNOWN_COMPANIES[9];
      }

      for (const comp of KNOWN_COMPANIES) {
        if (
          name.includes(comp.shortName.toLowerCase()) ||
          name.includes(comp.code.toLowerCase()) ||
          email.includes(comp.code.toLowerCase())
        ) {
          return comp;
        }
      }
    }
  } catch (e) {
    console.error('Error resolving stored company:', e);
  }
  // Mặc định là Sao Việt nếu không tìm thấy
  return KNOWN_COMPANIES[2];
};
