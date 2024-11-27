import { IAdminUser, IProvince, IBank } from "../utils/Interface"

// Define types for environment variables
const {
  USER_ADMIN_ID,
  USER_ADMIN_USERNAME,
  USER_ADMIN_PASSWORD,
  USER_ADMIN_EMAIL,
} = process.env;

// Initialize objects with types
export const init_admin: IAdminUser = {
  _id: USER_ADMIN_ID,
  current: {
    username: USER_ADMIN_USERNAME,
    password: USER_ADMIN_PASSWORD,
    displayName: USER_ADMIN_USERNAME,
    email: USER_ADMIN_EMAIL,
    tel: "0000000000",
    idCard: "0000000000000",
    roles: [1],
  },
};

export const provinces_data: IProvince[] = [
  {
      "value": "กรุงเทพมหานคร",
      "label": "Bangkok",
      "_id": "6746a434fd1e4c8382255b8f"
  },
  {
      "value": "กระบี่",
      "label": "Krabi",
      "_id": "6746a434fd1e4c8382255b90"
  },
  {
      "value": "กาญจนบุรี",
      "label": "Kanchanaburi",
      "_id": "6746a434fd1e4c8382255b91"
  },
  {
      "value": "กาฬสินธุ์",
      "label": "Kalasin",
      "_id": "6746a434fd1e4c8382255b92"
  },
  {
      "value": "กำแพงเพชร",
      "label": "Kamphaeng Phet",
      "_id": "6746a434fd1e4c8382255b93"
  },
  {
      "value": "ขอนแก่น",
      "label": "Khon Kaen",
      "_id": "6746a434fd1e4c8382255b94"
  },
  {
      "value": "จันทบุรี",
      "label": "Chanthaburi",
      "_id": "6746a434fd1e4c8382255b95"
  },
  {
      "value": "ฉะเชิงเทรา",
      "label": "Chachoengsao",
      "_id": "6746a434fd1e4c8382255b96"
  },
  {
      "value": "ชลบุรี",
      "label": "Chonburi",
      "_id": "6746a434fd1e4c8382255b97"
  },
  {
      "value": "ชัยนาท",
      "label": "Chai Nat",
      "_id": "6746a434fd1e4c8382255b98"
  },
  {
      "value": "ชัยภูมิ",
      "label": "Chaiyaphum",
      "_id": "6746a434fd1e4c8382255b99"
  },
  {
      "value": "ชุมพร",
      "label": "Chumphon",
      "_id": "6746a434fd1e4c8382255b9a"
  },
  {
      "value": "เชียงราย",
      "label": "Chiang Rai",
      "_id": "6746a434fd1e4c8382255b9b"
  },
  {
      "value": "เชียงใหม่",
      "label": "Chiang Mai",
      "_id": "6746a434fd1e4c8382255b9c"
  },
  {
      "value": "ตรัง",
      "label": "Trang",
      "_id": "6746a434fd1e4c8382255b9d"
  },
  {
      "value": "ตราด",
      "label": "Trat",
      "_id": "6746a434fd1e4c8382255b9e"
  },
  {
      "value": "ตาก",
      "label": "Tak",
      "_id": "6746a434fd1e4c8382255b9f"
  },
  {
      "value": "นครนายก",
      "label": "Nakhon Nayok",
      "_id": "6746a434fd1e4c8382255ba0"
  },
  {
      "value": "นครปฐม",
      "label": "Nakhon Pathom",
      "_id": "6746a434fd1e4c8382255ba1"
  },
  {
      "value": "นครพนม",
      "label": "Nakhon Phanom",
      "_id": "6746a434fd1e4c8382255ba2"
  },
  {
      "value": "นครราชสีมา",
      "label": "Nakhon Ratchasima",
      "_id": "6746a434fd1e4c8382255ba3"
  },
  {
      "value": "นครศรีธรรมราช",
      "label": "Nakhon Si Thammarat",
      "_id": "6746a434fd1e4c8382255ba4"
  },
  {
      "value": "นครสวรรค์",
      "label": "Nakhon Sawan",
      "_id": "6746a434fd1e4c8382255ba5"
  },
  {
      "value": "นนทบุรี",
      "label": "Nonthaburi",
      "_id": "6746a434fd1e4c8382255ba6"
  },
  {
      "value": "นราธิวาส",
      "label": "Narathiwat",
      "_id": "6746a434fd1e4c8382255ba7"
  },
  {
      "value": "น่าน",
      "label": "Nan",
      "_id": "6746a434fd1e4c8382255ba8"
  },
  {
      "value": "บึงกาฬ",
      "label": "Bueng Kan",
      "_id": "6746a434fd1e4c8382255ba9"
  },
  {
      "value": "บุรีรัมย์",
      "label": "Buriram",
      "_id": "6746a434fd1e4c8382255baa"
  },
  {
      "value": "ปทุมธานี",
      "label": "Pathum Thani",
      "_id": "6746a434fd1e4c8382255bab"
  },
  {
      "value": "ประจวบคีรีขันธ์",
      "label": "Prachuap Khiri Khan",
      "_id": "6746a434fd1e4c8382255bac"
  },
  {
      "value": "ปราจีนบุรี",
      "label": "Prachin Buri",
      "_id": "6746a434fd1e4c8382255bad"
  },
  {
      "value": "ปัตตานี",
      "label": "Pattani",
      "_id": "6746a434fd1e4c8382255bae"
  },
  {
      "value": "พระนครศรีอยุธยา",
      "label": "Phra Nakhon Si Ayutthaya",
      "_id": "6746a434fd1e4c8382255baf"
  },
  {
      "value": "พังงา",
      "label": "Phang Nga",
      "_id": "6746a434fd1e4c8382255bb0"
  },
  {
      "value": "พัทลุง",
      "label": "Phatthalung",
      "_id": "6746a434fd1e4c8382255bb1"
  },
  {
      "value": "พิจิตร",
      "label": "Phichit",
      "_id": "6746a434fd1e4c8382255bb2"
  },
  {
      "value": "พิษณุโลก",
      "label": "Phitsanulok",
      "_id": "6746a434fd1e4c8382255bb3"
  },
  {
      "value": "เพชรบุรี",
      "label": "Phetchaburi",
      "_id": "6746a434fd1e4c8382255bb4"
  },
  {
      "value": "เพชรบูรณ์",
      "label": "Phetchabun",
      "_id": "6746a434fd1e4c8382255bb5"
  },
  {
      "value": "แพร่",
      "label": "Phrae",
      "_id": "6746a434fd1e4c8382255bb6"
  },
  {
      "value": "พะเยา",
      "label": "Phayao",
      "_id": "6746a434fd1e4c8382255bb7"
  },
  {
      "value": "ภูเก็ต",
      "label": "Phuket",
      "_id": "6746a434fd1e4c8382255bb8"
  },
  {
      "value": "มหาสารคาม",
      "label": "Maha Sarakham",
      "_id": "6746a434fd1e4c8382255bb9"
  },
  {
      "value": "มุกดาหาร",
      "label": "Mukdahan",
      "_id": "6746a434fd1e4c8382255bba"
  },
  {
      "value": "แม่ฮ่องสอน",
      "label": "Mae Hong Son",
      "_id": "6746a434fd1e4c8382255bbb"
  },
  {
      "value": "ยะลา",
      "label": "Yala",
      "_id": "6746a434fd1e4c8382255bbc"
  },
  {
      "value": "ยโสธร",
      "label": "Yasothon",
      "_id": "6746a434fd1e4c8382255bbd"
  },
  {
      "value": "ร้อยเอ็ด",
      "label": "Roi Et",
      "_id": "6746a434fd1e4c8382255bbe"
  },
  {
      "value": "ระนอง",
      "label": "Ranong",
      "_id": "6746a434fd1e4c8382255bbf"
  },
  {
      "value": "ระยอง",
      "label": "Rayong",
      "_id": "6746a434fd1e4c8382255bc0"
  },
  {
      "value": "ราชบุรี",
      "label": "Ratchaburi",
      "_id": "6746a434fd1e4c8382255bc1"
  },
  {
      "value": "ลพบุรี",
      "label": "Lopburi",
      "_id": "6746a434fd1e4c8382255bc2"
  },
  {
      "value": "ลำปาง",
      "label": "Lampang",
      "_id": "6746a434fd1e4c8382255bc3"
  },
  {
      "value": "ลำพูน",
      "label": "Lamphun",
      "_id": "6746a434fd1e4c8382255bc4"
  },
  {
      "value": "เลย",
      "label": "Loei",
      "_id": "6746a434fd1e4c8382255bc5"
  },
  {
      "value": "ศรีสะเกษ",
      "label": "Si Sa Ket",
      "_id": "6746a434fd1e4c8382255bc6"
  },
  {
      "value": "สกลนคร",
      "label": "Sakon Nakhon",
      "_id": "6746a434fd1e4c8382255bc7"
  },
  {
      "value": "สงขลา",
      "label": "Songkhla",
      "_id": "6746a434fd1e4c8382255bc8"
  },
  {
      "value": "สตูล",
      "label": "Satun",
      "_id": "6746a434fd1e4c8382255bc9"
  },
  {
      "value": "สมุทรปราการ",
      "label": "Samut Prakan",
      "_id": "6746a434fd1e4c8382255bca"
  },
  {
      "value": "สมุทรสงคราม",
      "label": "Samut Songkhram",
      "_id": "6746a434fd1e4c8382255bcb"
  },
  {
      "value": "สมุทรสาคร",
      "label": "Samut Sakhon",
      "_id": "6746a434fd1e4c8382255bcc"
  },
  {
      "value": "สระแก้ว",
      "label": "Sa Kaeo",
      "_id": "6746a434fd1e4c8382255bcd"
  },
  {
      "value": "สระบุรี",
      "label": "Saraburi",
      "_id": "6746a434fd1e4c8382255bce"
  },
  {
      "value": "สิงห์บุรี",
      "label": "Sing Buri",
      "_id": "6746a434fd1e4c8382255bcf"
  },
  {
      "value": "สุโขทัย",
      "label": "Sukhothai",
      "_id": "6746a434fd1e4c8382255bd0"
  },
  {
      "value": "สุพรรณบุรี",
      "label": "Suphan Buri",
      "_id": "6746a434fd1e4c8382255bd1"
  },
  {
      "value": "สุราษฎร์ธานี",
      "label": "Surat Thani",
      "_id": "6746a434fd1e4c8382255bd2"
  },
  {
      "value": "สุรินทร์",
      "label": "Surin",
      "_id": "6746a434fd1e4c8382255bd3"
  },
  {
      "value": "หนองคาย",
      "label": "Nong Khai",
      "_id": "6746a434fd1e4c8382255bd4"
  },
  {
      "value": "หนองบัวลำภู",
      "label": "Nong Bua Lamphu",
      "_id": "6746a434fd1e4c8382255bd5"
  },
  {
      "value": "อ่างทอง",
      "label": "Ang Thong",
      "_id": "6746a434fd1e4c8382255bd6"
  },
  {
      "value": "อุดรธานี",
      "label": "Udon Thani",
      "_id": "6746a434fd1e4c8382255bd7"
  },
  {
      "value": "อุทัยธานี",
      "label": "Uthai Thani",
      "_id": "6746a434fd1e4c8382255bd8"
  },
  {
      "value": "อุตรดิตถ์",
      "label": "Uttaradit",
      "_id": "6746a434fd1e4c8382255bd9"
  },
  {
      "value": "อุบลราชธานี",
      "label": "Ubon Ratchathani",
      "_id": "6746a434fd1e4c8382255bda"
  },
  {
      "value": "อำนาจเจริญ",
      "label": "Amnat Charoen",
      "_id": "6746a434fd1e4c8382255bdb"
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