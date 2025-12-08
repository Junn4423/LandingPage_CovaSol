import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | COVASOL',
  description:
    'Chính sách bảo mật và quyền riêng tư của COVASOL: cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của khách hàng/doanh nghiệp.'
};

const updatedAt = 'Cập nhật lần cuối: 08/12/2025';

const sections = [
  {
    title: 'Mục đích áp dụng',
    bullets: [
      'Chính sách này giải thích cách COVASOL thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân khi bạn truy cập website, gửi yêu cầu hoặc sử dụng dịch vụ.',
      'Bằng việc sử dụng website hoặc cung cấp thông tin, bạn đồng ý với các nội dung nêu trong Chính sách bảo mật này.'
    ]
  },
  {
    title: 'Loại dữ liệu chúng tôi thu thập',
    bullets: [
      'Thông tin liên hệ: họ tên, email, số điện thoại, công ty, chức danh.',
      'Thông tin giao dịch: yêu cầu tư vấn, lịch sử trao đổi, phạm vi dự án, tài liệu làm việc do bạn cung cấp.',
      'Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt, thiết bị, cookie, hành vi truy cập trang để cải thiện trải nghiệm người dùng.'
    ]
  },
  {
    title: 'Cách thức thu thập',
    bullets: [
      'Bạn cung cấp trực tiếp qua form liên hệ, email, cuộc gọi hoặc trong quá trình triển khai dự án.',
      'Thu thập tự động qua cookie và công cụ phân tích lưu lượng (ví dụ: thông tin thiết bị, thời gian truy cập, trang đã xem).',
      'Nhận từ bên thứ ba khi có ủy quyền hợp pháp của bạn hoặc theo yêu cầu tích hợp hệ thống.'
    ]
  },
  {
    title: 'Mục đích sử dụng',
    bullets: [
      'Phản hồi yêu cầu tư vấn, cung cấp báo giá và triển khai dịch vụ theo thỏa thuận.',
      'Cải thiện tính năng website, bảo mật hệ thống và trải nghiệm người dùng.',
      'Gửi thông tin cập nhật, khuyến nghị hoặc tài liệu chuyên môn khi bạn đồng ý nhận.',
      'Thực hiện nghĩa vụ pháp lý, kiểm toán, phòng chống gian lận và đảm bảo tuân thủ.'
    ]
  },
  {
    title: 'Lưu trữ và thời gian bảo quản',
    bullets: [
      'Dữ liệu được lưu trữ trên hạ tầng có kiểm soát truy cập và sao lưu định kỳ.',
      'Thời gian lưu trữ phụ thuộc mục đích sử dụng và yêu cầu pháp luật; chúng tôi xóa hoặc ẩn danh dữ liệu khi không còn cần thiết.',
      'Bạn có thể yêu cầu xóa dữ liệu cá nhân; chúng tôi sẽ xem xét và phản hồi theo quy định pháp luật hiện hành.'
    ]
  },
  {
    title: 'Chia sẻ với bên thứ ba',
    bullets: [
      'Chỉ chia sẻ khi cần thiết cho mục đích cung cấp dịch vụ (ví dụ: đối tác hạ tầng, nhà cung cấp thanh toán, chuyên gia tư vấn) và có cam kết bảo mật tương đương.',
      'Chia sẻ theo yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.',
      'Không bán hoặc cho thuê dữ liệu cá nhân của bạn cho bên thứ ba.'
    ]
  },
  {
    title: 'Quyền của bạn',
    bullets: [
      'Quyền truy cập, cập nhật, chỉnh sửa thông tin cá nhân đã cung cấp.',
      'Quyền yêu cầu xóa hoặc hạn chế xử lý dữ liệu khi không còn mục đích hợp pháp.',
      'Quyền từ chối nhận thông tin marketing bất cứ lúc nào qua liên kết hủy đăng ký hoặc liên hệ trực tiếp.',
      'Quyền được thông báo khi có vi phạm bảo mật nghiêm trọng ảnh hưởng đến dữ liệu của bạn.'
    ]
  },
  {
    title: 'Bảo mật thông tin',
    bullets: [
      'Áp dụng biện pháp kỹ thuật và tổ chức để bảo vệ dữ liệu: mã hóa trong truyền tải, kiểm soát truy cập, sao lưu định kỳ.',
      'Giới hạn truy cập nội bộ theo vai trò và đào tạo nhân sự về bảo mật thông tin.',
      'Dù nỗ lực tối đa, không phương thức truyền dẫn nào an toàn tuyệt đối; bạn cần thận trọng khi chia sẻ thông tin qua Internet.'
    ]
  },
  {
    title: 'Cookie và công cụ theo dõi',
    bullets: [
      'Cookie dùng để ghi nhớ tùy chọn, cải thiện trải nghiệm và phân tích hiệu quả website.',
      'Bạn có thể điều chỉnh trình duyệt để từ chối hoặc xóa cookie, tuy nhiên một số tính năng có thể không hoạt động tối ưu.'
    ]
  },
  {
    title: 'Chuyển dữ liệu ra ngoài lãnh thổ',
    bullets: [
      'Dữ liệu có thể được xử lý hoặc lưu trữ trên máy chủ đặt tại các khu vực pháp lý khác nhằm đảm bảo hiệu năng.',
      'Chúng tôi bảo đảm tiêu chuẩn bảo mật tương đương và tuân thủ quy định pháp luật hiện hành khi chuyển dữ liệu.'
    ]
  },
  {
    title: 'Cập nhật chính sách',
    bullets: [
      'Chính sách có thể được điều chỉnh để đáp ứng yêu cầu pháp lý hoặc thay đổi hoạt động. Phiên bản mới có hiệu lực kể từ thời điểm công bố.',
      'Tiếp tục sử dụng website hoặc dịch vụ sau khi cập nhật đồng nghĩa bạn đồng ý với các thay đổi.'
    ]
  }
];

const contact = [
  { label: 'Email', value: 'covasol.studio@gmail.com', href: 'mailto:covasol.studio@gmail.com' },
  { label: 'Hotline', value: '0559526824', href: 'tel:0559526824' },
  { label: 'Địa chỉ', value: 'Hồ Chí Minh, Việt Nam' }
];

export default function PrivacyPage() {
  return (
    <main className="legal-page container">
      <header className="legal-hero">
        <p className="legal-kicker">Chính sách bảo mật</p>
        <h1>Chính sách bảo mật & quyền riêng tư</h1>
        <p className="legal-updated">{updatedAt}</p>
        <p className="legal-lead">
          COVASOL cam kết bảo vệ thông tin cá nhân và dữ liệu doanh nghiệp của bạn. Chính sách này mô tả rõ cách chúng tôi thu thập, sử dụng và
          bảo vệ dữ liệu trong suốt quá trình cung cấp dịch vụ.
        </p>
      </header>

      <div className="legal-sections">
        {sections.map(section => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            <ul>
              {section.bullets.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="legal-section">
          <h2>Liên hệ về quyền riêng tư</h2>
          <p>Nếu bạn có yêu cầu về dữ liệu cá nhân hoặc cần báo cáo sự cố bảo mật, vui lòng liên hệ:</p>
          <ul>
            {contact.map(info => (
              <li key={info.label}>
                <strong>{info.label}:</strong> {info.href ? <a href={info.href}>{info.value}</a> : info.value}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
