import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import './faq.css';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp (FAQ)',
  description: 'Giải đáp các câu hỏi thường gặp về dịch vụ phát triển phần mềm, tư vấn công nghệ và các giải pháp số của COVASOL.',
  alternates: {
    canonical: '/faq'
  },
  openGraph: {
    title: 'Câu hỏi thường gặp (FAQ) | COVASOL',
    description: 'Giải đáp các câu hỏi thường gặp về dịch vụ phát triển phần mềm, tư vấn công nghệ và các giải pháp số của COVASOL.',
    url: 'https://covasol.com.vn/faq',
    type: 'website'
  }
};

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Dịch vụ
  {
    category: 'Dịch vụ',
    question: 'COVASOL cung cấp những dịch vụ gì?',
    answer: 'COVASOL cung cấp các dịch vụ bao gồm: Phát triển phần mềm theo yêu cầu (Web, Mobile, Desktop), Thiết kế UI/UX, Tư vấn chuyển đổi số, Phát triển AI & Chatbot, Tích hợp hệ thống, và Bảo trì & hỗ trợ kỹ thuật.'
  },
  {
    category: 'Dịch vụ',
    question: 'COVASOL có làm việc với doanh nghiệp nhỏ không?',
    answer: 'Có, COVASOL làm việc với mọi quy mô doanh nghiệp từ startup đến doanh nghiệp lớn. Chúng tôi có các gói giải pháp phù hợp với ngân sách và nhu cầu của từng loại hình doanh nghiệp.'
  },
  {
    category: 'Dịch vụ',
    question: 'Thời gian hoàn thành một dự án phần mềm là bao lâu?',
    answer: 'Thời gian phụ thuộc vào quy mô và độ phức tạp của dự án. Một website đơn giản có thể hoàn thành trong 2-4 tuần, trong khi các hệ thống phức tạp có thể mất 3-6 tháng hoặc hơn. Chúng tôi sẽ cung cấp timeline chi tiết sau khi phân tích yêu cầu.'
  },
  // Quy trình
  {
    category: 'Quy trình',
    question: 'Quy trình làm việc với COVASOL như thế nào?',
    answer: 'Quy trình làm việc gồm 5 bước: 1) Tư vấn miễn phí & phân tích yêu cầu, 2) Lập kế hoạch & báo giá chi tiết, 3) Thiết kế & phát triển theo Sprint, 4) Testing & QA, 5) Triển khai & hỗ trợ sau bàn giao.'
  },
  {
    category: 'Quy trình',
    question: 'Khách hàng có thể theo dõi tiến độ dự án không?',
    answer: 'Có, chúng tôi cung cấp báo cáo tiến độ định kỳ (hàng tuần hoặc theo yêu cầu), demo sản phẩm theo từng giai đoạn, và kênh liên lạc trực tiếp với team dự án. Khách hàng luôn nắm rõ tình hình dự án.'
  },
  {
    category: 'Quy trình',
    question: 'Nếu có thay đổi yêu cầu trong quá trình phát triển thì sao?',
    answer: 'Chúng tôi áp dụng phương pháp Agile nên việc thay đổi yêu cầu là bình thường. Với mỗi thay đổi, team sẽ đánh giá impact về thời gian và chi phí, sau đó thống nhất với khách hàng trước khi thực hiện.'
  },
  // Chi phí
  {
    category: 'Chi phí',
    question: 'Chi phí phát triển phần mềm được tính như thế nào?',
    answer: 'Chi phí được tính dựa trên: độ phức tạp của tính năng, công nghệ sử dụng, thời gian phát triển, và yêu cầu bảo trì. Chúng tôi cung cấp báo giá minh bạch, không phát sinh chi phí ẩn.'
  },
  {
    category: 'Chi phí',
    question: 'COVASOL có chính sách thanh toán như thế nào?',
    answer: 'Thông thường: 30% khi ký hợp đồng, 40% khi hoàn thành development, 30% khi nghiệm thu. Với dự án lớn, chúng tôi có thể linh hoạt chia thành nhiều đợt thanh toán theo milestones.'
  },
  {
    category: 'Chi phí',
    question: 'Có tư vấn và báo giá miễn phí không?',
    answer: 'Có, COVASOL cung cấp dịch vụ tư vấn và báo giá hoàn toàn miễn phí. Bạn chỉ cần liên hệ qua form trên website hoặc hotline, chúng tôi sẽ sắp xếp buổi tư vấn trong vòng 24h.'
  },
  // Hỗ trợ
  {
    category: 'Hỗ trợ',
    question: 'Sau khi bàn giao, COVASOL có hỗ trợ không?',
    answer: 'Có, chúng tôi cung cấp gói bảo hành miễn phí 3-6 tháng (tùy dự án) để fix bugs và hỗ trợ kỹ thuật. Sau đó, khách hàng có thể ký hợp đồng bảo trì hàng năm với chi phí ưu đãi.'
  },
  {
    category: 'Hỗ trợ',
    question: 'Làm thế nào để liên hệ hỗ trợ khi có vấn đề?',
    answer: 'Bạn có thể liên hệ qua: Email hỗ trợ (support@covasol.com.vn), Hotline, Zalo Official, hoặc hệ thống ticket trên website. Thời gian phản hồi trong vòng 2-4 giờ làm việc.'
  },
  {
    category: 'Hỗ trợ',
    question: 'COVASOL có đào tạo sử dụng phần mềm không?',
    answer: 'Có, mọi dự án đều bao gồm đào tạo sử dụng cho đội ngũ của khách hàng. Chúng tôi cung cấp tài liệu hướng dẫn, video training, và buổi hands-on practice.'
  },
  // Công nghệ
  {
    category: 'Công nghệ',
    question: 'COVASOL sử dụng những công nghệ nào?',
    answer: 'Chúng tôi sử dụng các công nghệ hiện đại: Frontend (React, Next.js, Vue.js), Backend (Node.js, .NET, Python, Java), Mobile (React Native, Flutter), Database (PostgreSQL, MySQL, MongoDB), Cloud (AWS, Azure, GCP).'
  },
  {
    category: 'Công nghệ',
    question: 'Phần mềm có thể tích hợp với hệ thống hiện có không?',
    answer: 'Có, COVASOL có kinh nghiệm tích hợp với nhiều hệ thống như ERP, CRM, Payment Gateway, các API bên thứ 3, và hệ thống legacy. Chúng tôi đảm bảo tích hợp mượt mà và an toàn dữ liệu.'
  },
  {
    category: 'Công nghệ',
    question: 'Dữ liệu và source code có được bảo mật không?',
    answer: 'Tuyệt đối! Chúng tôi ký NDA bảo mật với mọi khách hàng. Source code và dữ liệu được lưu trữ trên server riêng, mã hóa, và chỉ những người được ủy quyền mới có quyền truy cập.'
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQPage() {
  // JSON-LD Schema for FAQ
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="faq-page">
        {/* Hero Section */}
        <section className="faq-hero">
          <div className="container">
            <Breadcrumbs
              items={[
                { label: 'Trang chủ', href: '/' },
                { label: 'Câu hỏi thường gặp' }
              ]}
            />
            <h1 data-aos="fade-up">Câu hỏi thường gặp</h1>
            <p data-aos="fade-up" data-aos-delay="100">
              Tìm hiểu thêm về dịch vụ và quy trình làm việc của COVASOL
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="faq-content">
          <div className="container">
            {categories.map((category, categoryIndex) => (
              <div key={category} className="faq-category" data-aos="fade-up" data-aos-delay={categoryIndex * 50}>
                <h2 className="category-title">
                  <i className={getCategoryIcon(category)} aria-hidden="true" />
                  {category}
                </h2>
                <div className="faq-list">
                  {faqData
                    .filter(item => item.category === category)
                    .map((item, index) => (
                      <details key={index} className="faq-item">
                        <summary className="faq-question">
                          <span>{item.question}</span>
                          <i className="fas fa-chevron-down" aria-hidden="true" />
                        </summary>
                        <div className="faq-answer">
                          <p>{item.answer}</p>
                        </div>
                      </details>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="faq-cta">
          <div className="container">
            <div className="cta-content" data-aos="fade-up">
              <h2>Vẫn còn thắc mắc?</h2>
              <p>Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
              <div className="cta-buttons">
                <Link href="/#contact" className="btn btn-primary">
                  <i className="fas fa-paper-plane" aria-hidden="true" />
                  Liên hệ ngay
                </Link>
                <a href="tel:0123456789" className="btn btn-outline">
                  <i className="fas fa-phone" aria-hidden="true" />
                  Gọi hotline
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Dịch vụ': 'fas fa-cogs',
    'Quy trình': 'fas fa-tasks',
    'Chi phí': 'fas fa-money-bill-wave',
    'Hỗ trợ': 'fas fa-headset',
    'Công nghệ': 'fas fa-code'
  };
  return icons[category] || 'fas fa-question-circle';
}
