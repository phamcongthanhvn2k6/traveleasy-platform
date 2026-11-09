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
      if (u.busCompanyId) {
        const found = KNOWN_COMPANIES.find(c => c.id === Number(u.busCompanyId));
        if (found) return found;
        return {
          id: Number(u.busCompanyId),
          name: u.busCompanyName || u.fullName?.replace(/^Điều Hành\s+/i, '') || 'Nhà Xe Đối Tác',
          shortName: u.busCompanyName || u.fullName?.replace(/^Điều Hành\s+/i, '') || 'Nhà Xe',
          code: 'NX_' + u.busCompanyId,
          email: u.email || '',
          hotline: u.phone || '1900 8888',
        };
      }
      const name = (u.fullName || '').trim().toLowerCase();
      const email = (u.email || '').toLowerCase();

      // Check special aliases strictly by official domain email or exact name
      if (email.includes('xesaoviet') || name === 'sao việt') {
        return KNOWN_COMPANIES[2];
      }
      if (email.includes('futa') || name === 'phương trang') {
        return KNOWN_COMPANIES[0];
      }
      if (email.includes('thanhbuoi') || name === 'thành bưởi') {
        return KNOWN_COMPANIES[1];
      }
      if (email.includes('kumho') || name === 'kumho samco') {
        return KNOWN_COMPANIES[3];
      }
      if (email.includes('hoamai') || name === 'hoa mai') {
        return KNOWN_COMPANIES[4];
      }
      if (email.includes('hoanglongasia') || name === 'hoàng long asia') {
        return KNOWN_COMPANIES[5];
      }
      if (email.includes('vanminh') || name === 'văn minh') {
        return KNOWN_COMPANIES[6];
      }
      if (email.includes('cuctung') || name === 'cúc tùng') {
        return KNOWN_COMPANIES[7];
      }
      if (email.includes('haivan') || name === 'hải vân') {
        return KNOWN_COMPANIES[8];
      }
      if (email.includes('chinnghia') || name === 'chín nghĩa') {
        return KNOWN_COMPANIES[9];
      }
    }
  } catch (e) {
    console.error('Error resolving stored company:', e);
  }
  // Mặc định là Sao Việt nếu không tìm thấy
  return KNOWN_COMPANIES[2];
};

