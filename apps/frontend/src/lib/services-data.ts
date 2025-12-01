export type ServiceOverview = {
  icon: string;
  titleKey: string;
  title: string;
  descriptionKey: string;
  description: string;
  features: string[];
};

export type DetailedService = {
  icon: string;
  titleKey: string;
  title: string;
  descriptionKey: string;
  description: string;
  targetKey: string;
  target: string;
};

export const servicesOverview: ServiceOverview[] = [
  {
    icon: 'fas fa-laptop-code',
    titleKey: 'service1-title',
    title: 'Phát triển phần mềm',
    descriptionKey: 'service1-desc',
    description: 'Xây dựng giải pháp công nghệ theo nhu cầu',
    features: ['Web / Mobile App', 'Hệ thống quản trị nội bộ', 'Tư vấn kiến trúc dữ liệu', 'Bảo trì & tối ưu hiệu năng']
  },
  {
    icon: 'fas fa-palette',
    titleKey: 'service2-title',
    title: 'Thiết kế & Giao diện',
    descriptionKey: 'service2-desc',
    description: 'Tạo trải nghiệm thương hiệu tinh gọn – rõ ràng – dễ dùng',
    features: ['Thiết kế UI/UX đa nền tảng', 'Prototype & usability test', 'Design system', 'Thương hiệu & ấn phẩm số']
  },
  {
    icon: 'fas fa-diagram-project',
    titleKey: 'service3-title',
    title: 'Chuyển đổi số',
    descriptionKey: 'service3-desc',
    description: 'Đưa công nghệ vào hoạt động thực tế',
    features: ['Khảo sát quy trình', 'Automation & tích hợp', 'Đào tạo & chuyển giao', 'Vận hành hệ thống số']
  },
  {
    icon: 'fas fa-handshake-angle',
    titleKey: 'service4-title',
    title: 'Tư vấn & Bảo trì',
    descriptionKey: 'service4-desc',
    description: 'Đồng hành dài hạn cùng doanh nghiệp',
    features: ['Kế hoạch tối ưu chi phí', 'Giám sát SLA', 'Đội ngũ hỗ trợ 24/7', 'Nâng cấp định kỳ']
  },
  {
    icon: 'fas fa-bullhorn',
    titleKey: 'service5-title',
    title: 'Marketing & Chiến lược',
    descriptionKey: 'service5-desc',
    description: 'Hợp nhất công nghệ và marketing',
    features: ['Tư vấn GTM', 'Triển khai chiến dịch digital', 'Phân tích dữ liệu tăng trưởng', 'Đồng bộ CRM & bán hàng']
  },
  {
    icon: 'fas fa-flask',
    titleKey: 'service6-title',
    title: 'Giải pháp đặc biệt',
    descriptionKey: 'service6-desc',
    description: 'Xây dựng sản phẩm riêng có khả năng thương mại hóa',
    features: ['POC nhanh trong 2-4 tuần', 'R&D cùng chuyên gia', 'Bảo vệ sở hữu trí tuệ', 'Mô hình vận hành linh hoạt']
  }
];

export const detailedServices: DetailedService[] = [
  {
    icon: 'fas fa-globe',
    titleKey: 'web-dev-title',
    title: 'Web Application Development',
    descriptionKey: 'web-dev-desc',
    description: 'Thiết kế & phát triển website, web app, portal khách hàng với trải nghiệm tối ưu.',
    targetKey: 'web-dev-target',
    target: 'Startup, SME, tổ chức cần hệ thống quản lý hoặc kênh tương tác.'
  },
  {
    icon: 'fas fa-mobile-screen-button',
    titleKey: 'mobile-dev-title',
    title: 'Mobile App Development',
    descriptionKey: 'mobile-dev-desc',
    description: 'Ứng dụng iOS/Android hiệu năng cao với trải nghiệm người dùng thân thiện.',
    targetKey: 'mobile-dev-target',
    target: 'Doanh nghiệp cần sản phẩm hướng tới người dùng cuối.'
  },
  {
    icon: 'fas fa-server',
    titleKey: 'api-dev-title',
    title: 'API & Backend Development',
    descriptionKey: 'api-dev-desc',
    description: 'Xây dựng hệ thống API, CSDL, microservice, bảo mật và mở rộng nền tảng.',
    targetKey: 'api-dev-target',
    target: 'Các dự án cần kết nối dữ liệu hoặc nền tảng mở rộng.'
  },
  {
    icon: 'fas fa-robot',
    titleKey: 'automation-title',
    title: 'Automation & Integration',
    descriptionKey: 'automation-desc',
    description: 'Tự động hóa quy trình, kết nối ứng dụng (Zapier, n8n, custom API).',
    targetKey: 'automation-target',
    target: 'Doanh nghiệp muốn giảm thao tác thủ công, tăng hiệu suất.'
  }
];
