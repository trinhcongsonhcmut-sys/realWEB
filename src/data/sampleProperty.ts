import { PropertyMetadata } from '../types';

export const SAMPLE_PROPERTY: PropertyMetadata = {
  propertyId: 'house-vn-the-green-horizon-01',
  title: 'Căn Nhà Phố Hiện Đại (My Housing)',
  tagline: 'Mặt tiền bo cong thời thượng, sân vườn tiểu cảnh và nội thất phòng khách cao cấp',
  type: 'Nhà Phố Hiện Đại 3 Tầng',
  address: 'Khu Đô Thị Mới, TP. Hồ Chí Minh',
  price: {
    value: 15500000000,
    currency: 'VND',
    display: '15.5 Tỷ VNĐ'
  },
  specifications: {
    landArea: '90 m² (4.5m x 20m)',
    usableArea: '260 m²',
    floors: 3,
    bedrooms: 4,
    bathrooms: 4,
    direction: 'Đông',
    status: 'Sẵn sàng bàn giao - Sổ hồng riêng',
    completionYear: 2026
  },
  features: [
    'Thiết kế thông tầng đón gió tự nhiên và ánh sáng ngập tràn',
    'Mặt tiền hiện đại ốp gỗ Conwood và ban công kính cường lực 12mm',
    'Phòng khách sang trọng liên thông bếp ăn phong cách mở',
    'Hệ thống cửa nhôm kính cao cấp cách âm, cách nhiệt tiêu chuẩn Châu Âu',
    'Sân trước đỗ ô tô và vườn tiểu cảnh xanh mát',
    'Hạ tầng thông minh Smarthome tích hợp điều khiển từ xa'
  ],
  cameraWaypoints: {
    exterior: {
      position: [13.0, 7.5, 17.0],
      target: [0, 3.2, 0]
    },
    approachFacade: {
      position: [0.0, 2.0, 6.0],
      target: [0.0, 1.8, 0]
    },
    frontDoor: {
      position: [0.2, 1.65, 2.3],
      target: [0.2, 1.65, -1.0]
    },
    interiorEntrance: {
      position: [0.0, 1.65, -2.2],
      target: [0.0, 1.65, -5.5]
    },
    dollhouse: {
      position: [0.0, 16.0, 15.0],
      target: [0, 2.8, 0]
    },
    floorplan: {
      position: [0.0, 21.0, 0.001],
      target: [0, 0, 0]
    }
  },
  hotspots: [
    {
      id: 'hs-living',
      name: 'Phòng Khách Wabi-Sabi Sang Trọng',
      roomType: 'living',
      position: [0.0, 1.0, -2.8],
      cameraView: {
        position: [0.0, 1.50, -0.6],
        target: [0.0, 1.40, -4.5]
      },
      description: 'Không gian phòng khách Wabi-Sabi cao cấp với sofa vải thô tự nhiên, bàn trà mộc nguyên khối, đèn chao giấy Washi và Smart TV 65".',
      floor: 1
    },
    {
      id: 'hs-dining-kitchen',
      name: 'Bếp Ăn & Đảo Bếp Wabi-Sabi',
      roomType: 'kitchen',
      position: [0.5, 1.0, -6.8],
      cameraView: {
        position: [0.0, 1.65, -5.0],
        target: [0.5, 1.45, -7.5]
      },
      description: 'Không gian bếp mở phong cách Wabi-Sabi đương đại với hệ tủ bếp gỗ tự nhiên, mặt đá cao cấp và đảo bếp tiện nghi.',
      floor: 1
    },
    {
      id: 'hs-master-bedroom',
      name: 'Phòng Ngủ Master',
      roomType: 'bedroom',
      position: [0.0, 4.4, -3.5],
      cameraView: {
        position: [0.0, 5.0, -2.0],
        target: [0.0, 4.8, -6.0]
      },
      description: 'Phòng ngủ chính lầu 1 rộng 28m² với sàn gỗ sồi sang trọng, hệ tủ quần áo kính âm tường và nhà tắm khép kín.',
      floor: 2
    },
    {
      id: 'hs-balcony',
      name: 'Ban Công Sky View',
      roomType: 'balcony',
      position: [0.0, 4.4, 2.6],
      cameraView: {
        position: [0.0, 5.0, 1.2],
        target: [0.0, 4.8, 6.5]
      },
      description: 'Ban công lầu 1 ngắm trọn công viên cây xanh nội khu, lan can kính cường lực an toàn và bồn hoa tiểu cảnh thư giãn.',
      floor: 2
    }
  ],
  customizableMaterials: {
    sofaFabric: [
      {
        id: 'sofa-charcoal',
        name: 'Xám Ghi Charcoal',
        color: '#2d3138',
        roughness: 0.85
      },
      {
        id: 'sofa-navy',
        name: 'Xanh Navy Hoàng Gia',
        color: '#1a2744',
        roughness: 0.8
      },
      {
        id: 'sofa-sand',
        name: 'Be Cát Sa Mạc',
        color: '#d0c6b4',
        roughness: 0.9
      },
      {
        id: 'sofa-terracotta',
        name: 'Cam Đất Terracotta',
        color: '#9e4732',
        roughness: 0.82
      }
    ],
    flooring: [
      {
        id: 'floor-oak',
        name: 'Gỗ Sồi Tự Nhiên (Oak Wood)',
        color: '#ad7e4e',
        roughness: 0.35
      },
      {
        id: 'floor-marble',
        name: 'Đá Cẩm Thạch Trắng Vân Mây',
        color: '#eaeaea',
        roughness: 0.15
      },
      {
        id: 'floor-concrete',
        name: 'Bê Tông Mài Industrial',
        color: '#76787b',
        roughness: 0.55
      }
    ],
    wallColor: [
      {
        id: 'wall-warm-white',
        name: 'Trắng Sữa Scandinavian',
        color: '#f5f4ef',
        roughness: 0.9
      },
      {
        id: 'wall-light-grey',
        name: 'Ghi Khói Hiện Đại',
        color: '#dcdde1',
        roughness: 0.92
      },
      {
        id: 'wall-sage-green',
        name: 'Xanh Xô Thơm Sage',
        color: '#c2ccc3',
        roughness: 0.88
      }
    ]
  }
};
