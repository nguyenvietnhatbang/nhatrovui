export interface VietQRParams {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferNote: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export const SUPPORTED_BANKS = [
  { code: 'VCB', name: 'Vietcombank (Ngoại thương)', bin: '970436' },
  { code: 'MB', name: 'MBBank (Quân đội)', bin: '970422' },
  { code: 'TCB', name: 'Techcombank (Kỹ thương)', bin: '970407' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { code: 'ICB', name: 'VietinBank (Công thương)', bin: '970415' },
  { code: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)', bin: '970418' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970423' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)', bin: '970403' },
];

/**
 * Tạo link ảnh mã VietQR chuẩn Napas 247
 * Cú pháp VietQR API chính thức không cần đăng ký API key
 */
export function generateVietQRUrl({
  bankCode,
  accountNumber,
  accountName,
  amount,
  transferNote,
  template = 'compact2',
}: VietQRParams): string {
  const cleanBank = bankCode.trim().toUpperCase();
  const cleanAccount = accountNumber.trim().replace(/\s+/g, '');
  const cleanAmount = Math.round(amount);
  const encodedNote = encodeURIComponent(transferNote.trim());
  const encodedName = encodeURIComponent(accountName.trim());

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAccount}-${template}.png?amount=${cleanAmount}&addInfo=${encodedNote}&accountName=${encodedName}`;
}

/**
 * Chuẩn hóa nội dung chuyển khoản không dấu, ngắn gọn, chuẩn ngân hàng
 * Ví dụ: "SUNSHINE P201 T9 2026"
 */
export function formatTransferSyntax(propertyShortName: string, roomNumber: string, month: string): string {
  const cleanRoom = roomNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const [year, m] = month.split('-');
  const cleanProp = propertyShortName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8);

  return `${cleanProp} ${cleanRoom} T${parseInt(m, 10)} ${year}`;
}
