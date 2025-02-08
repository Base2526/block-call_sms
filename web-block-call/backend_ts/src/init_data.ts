import { IAdminUser, IProvince, IBank } from "./utils/Interface"

// Define types for environment variables
const {
  USER_ADMIN_USERNAME,
  USER_ADMIN_PASSWORD,
  USER_ADMIN_EMAIL,
} = process.env;

// Initialize objects with types
export const init_admin: IAdminUser = {
    username: USER_ADMIN_USERNAME,
    password: USER_ADMIN_PASSWORD,
    display_name: USER_ADMIN_USERNAME,
    email: USER_ADMIN_EMAIL,
    tel: "0000000000",
    idCard: "0000000000000",
    roles: [1],
};

export const provinces_data: IProvince[] = [
  {
      "value": "กรุงเทพมหานคร",
      "label": "Bangkok",
  },
  {
      "value": "กระบี่",
      "label": "Krabi",
  },
  {
      "value": "กาญจนบุรี",
      "label": "Kanchanaburi",
  },
  {
      "value": "กาฬสินธุ์",
      "label": "Kalasin",
  },
  {
      "value": "กำแพงเพชร",
      "label": "Kamphaeng Phet",
  },
  {
      "value": "ขอนแก่น",
      "label": "Khon Kaen",
  },
  {
      "value": "จันทบุรี",
      "label": "Chanthaburi",
  },
  {
      "value": "ฉะเชิงเทรา",
      "label": "Chachoengsao",
  },
  {
      "value": "ชลบุรี",
      "label": "Chonburi",
  },
  {
      "value": "ชัยนาท",
      "label": "Chai Nat",
  },
  {
      "value": "ชัยภูมิ",
      "label": "Chaiyaphum",
  },
  {
      "value": "ชุมพร",
      "label": "Chumphon",
  },
  {
      "value": "เชียงราย",
      "label": "Chiang Rai",
  },
  {
      "value": "เชียงใหม่",
      "label": "Chiang Mai",
  },
  {
      "value": "ตรัง",
      "label": "Trang",
  },
  {
      "value": "ตราด",
      "label": "Trat",
  },
  {
      "value": "ตาก",
      "label": "Tak",
  },
  {
      "value": "นครนายก",
      "label": "Nakhon Nayok",
  },
  {
      "value": "นครปฐม",
      "label": "Nakhon Pathom",
  },
  {
      "value": "นครพนม",
      "label": "Nakhon Phanom",
  },
  {
      "value": "นครราชสีมา",
      "label": "Nakhon Ratchasima",
  },
  {
      "value": "นครศรีธรรมราช",
      "label": "Nakhon Si Thammarat",
  },
  {
      "value": "นครสวรรค์",
      "label": "Nakhon Sawan",
  },
  {
      "value": "นนทบุรี",
      "label": "Nonthaburi",
  },
  {
      "value": "นราธิวาส",
      "label": "Narathiwat",
  },
  {
      "value": "น่าน",
      "label": "Nan",
  },
  {
      "value": "บึงกาฬ",
      "label": "Bueng Kan",
  },
  {
      "value": "บุรีรัมย์",
      "label": "Buriram",
  },
  {
      "value": "ปทุมธานี",
      "label": "Pathum Thani",
  },
  {
      "value": "ประจวบคีรีขันธ์",
      "label": "Prachuap Khiri Khan",
  },
  {
      "value": "ปราจีนบุรี",
      "label": "Prachin Buri",
  },
  {
      "value": "ปัตตานี",
      "label": "Pattani",
  },
  {
      "value": "พระนครศรีอยุธยา",
      "label": "Phra Nakhon Si Ayutthaya",
  },
  {
      "value": "พังงา",
      "label": "Phang Nga",
  },
  {
      "value": "พัทลุง",
      "label": "Phatthalung",
  },
  {
      "value": "พิจิตร",
      "label": "Phichit",
  },
  {
      "value": "พิษณุโลก",
      "label": "Phitsanulok",
  },
  {
      "value": "เพชรบุรี",
      "label": "Phetchaburi",
  },
  {
      "value": "เพชรบูรณ์",
      "label": "Phetchabun",
  },
  {
      "value": "แพร่",
      "label": "Phrae",
  },
  {
      "value": "พะเยา",
      "label": "Phayao",
  },
  {
      "value": "ภูเก็ต",
      "label": "Phuket",
  },
  {
      "value": "มหาสารคาม",
      "label": "Maha Sarakham",
  },
  {
      "value": "มุกดาหาร",
      "label": "Mukdahan",
  },
  {
      "value": "แม่ฮ่องสอน",
      "label": "Mae Hong Son",
  },
  {
      "value": "ยะลา",
      "label": "Yala",
  },
  {
      "value": "ยโสธร",
      "label": "Yasothon",
  },
  {
      "value": "ร้อยเอ็ด",
      "label": "Roi Et",
  },
  {
      "value": "ระนอง",
      "label": "Ranong",
  },
  {
      "value": "ระยอง",
      "label": "Rayong",
  },
  {
      "value": "ราชบุรี",
      "label": "Ratchaburi",
  },
  {
      "value": "ลพบุรี",
      "label": "Lopburi",
  },
  {
      "value": "ลำปาง",
      "label": "Lampang",
  },
  {
      "value": "ลำพูน",
      "label": "Lamphun",
  },
  {
      "value": "เลย",
      "label": "Loei",
  },
  {
      "value": "ศรีสะเกษ",
      "label": "Si Sa Ket",
  },
  {
      "value": "สกลนคร",
      "label": "Sakon Nakhon",
  },
  {
      "value": "สงขลา",
      "label": "Songkhla",
  },
  {
      "value": "สตูล",
      "label": "Satun",
  },
  {
      "value": "สมุทรปราการ",
      "label": "Samut Prakan",
  },
  {
      "value": "สมุทรสงคราม",
      "label": "Samut Songkhram",
  },
  {
      "value": "สมุทรสาคร",
      "label": "Samut Sakhon",
  },
  {
      "value": "สระแก้ว",
      "label": "Sa Kaeo",
  },
  {
      "value": "สระบุรี",
      "label": "Saraburi",
  },
  {
      "value": "สิงห์บุรี",
      "label": "Sing Buri",
  },
  {
      "value": "สุโขทัย",
      "label": "Sukhothai",
  },
  {
      "value": "สุพรรณบุรี",
      "label": "Suphan Buri",
  },
  {
      "value": "สุราษฎร์ธานี",
      "label": "Surat Thani",
  },
  {
      "value": "สุรินทร์",
      "label": "Surin",
  },
  {
      "value": "หนองคาย",
      "label": "Nong Khai",
  },
  {
      "value": "หนองบัวลำภู",
      "label": "Nong Bua Lamphu",
  },
  {
      "value": "อ่างทอง",
      "label": "Ang Thong",
  },
  {
      "value": "อุดรธานี",
      "label": "Udon Thani",
  },
  {
      "value": "อุทัยธานี",
      "label": "Uthai Thani",
  },
  {
      "value": "อุตรดิตถ์",
      "label": "Uttaradit",
  },
  {
      "value": "อุบลราชธานี",
      "label": "Ubon Ratchathani",
  },
  {
      "value": "อำนาจเจริญ",
      "label": "Amnat Charoen",
  }
]

// Create an array of bank objects with type annotations
export const banks_data: IBank[] = [
  { name_th: 'ธนาคารไทยพาณิชย์ (SCB)', name_en: 'Siam Commercial Bank (SCB)' },
  { name_th: 'ธนาคารกสิกรไทย (KBank)', name_en: 'Kasikorn Bank (KBank)' },
  { name_th: 'ธนาคารกรุงเทพ (BBL)', name_en: 'Bangkok Bank (BBL)' },
  { name_th: 'ธนาคารกรุงไทย (KTB)', name_en: 'Krungthai Bank (KTB)' },
  { name_th: 'ธนาคารกรุงศรีอยุธยา (BAY)', name_en: 'Bank of Ayudhya (Krungsri)' },
  { name_th: 'ธนาคารทหารไทยธนชาต (TTB)', name_en: 'TMBThanachart Bank (TTB)' },
  { name_th: 'ธนาคารออมสิน (GSB)', name_en: 'Government Savings Bank (GSB)' },
  { name_th: 'ธนาคารอิสลามแห่งประเทศไทย (IBank)', name_en: 'Islamic Bank of Thailand (IBank)' },
  { name_th: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)', name_en: 'Bank for Agriculture and Agricultural Cooperatives (BAAC)' },
  { name_th: 'ธนาคารแห่งประเทศไทย', name_en: 'Bank of Thailand' }
];