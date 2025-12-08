'use client';

import { useState, FormEvent } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1t-q3w1EcaUYyT0P8M6ilRiWwdxSLFcqtIL6pHwA3nWYYPU4bh8kQYafZxJCLR4kaHA/exec';

const contactServices = [
  { value: '', textKey: 'contact-form-service', text: '-- Chọn dịch vụ quan tâm * --' },
  { value: 'web-app-development', textKey: 'service-option-web', text: 'Phát triển Website/App' },
  { value: 'automation', textKey: 'service-option-mobile', text: 'Ứng dụng di động' },
  { value: 'ui-ux-design', textKey: 'service-option-uiux', text: 'Thiết kế giao diện UI/UX' },
  { value: 'consulting-maintenance', textKey: 'service-option-ecommerce', text: 'Thương mại điện tử' },
  { value: 'digital-transformation', textKey: 'service-option-digital', text: 'Chuyển đổi số' },
  { value: 'other', textKey: 'service-option-other', text: 'Khác' }
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ và tên');
      return;
    }
    if (!validateEmail(formData.email)) {
      alert('Vui lòng nhập email hợp lệ');
      return;
    }
    if (!validatePhone(formData.phone)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10-11 số)');
      return;
    }
    if (!formData.service) {
      alert('Vui lòng chọn dịch vụ quan tâm');
      return;
    }
    if (!formData.message.trim()) {
      alert('Vui lòng nhập nội dung yêu cầu');
      return;
    }

    setFormState('loading');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Since we're using no-cors mode, we can't check response status
      // Assume success if no error was thrown
      setFormState('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });

      // Show success message
      alert('🎉 Cảm ơn bạn đã liên hệ!\n\nChúng tôi đã nhận được yêu cầu báo giá của bạn và sẽ phản hồi trong thời gian sớm nhất (thường trong vòng 24h).\n\nNếu cần hỗ trợ gấp, vui lòng liên hệ hotline: 0559526824');
      
      // Reset form state after a delay
      setTimeout(() => setFormState('idle'), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setFormState('error');
      alert('❌ Có lỗi xảy ra khi gửi yêu cầu.\n\nVui lòng thử lại hoặc liên hệ trực tiếp qua:\n📞 Hotline: 0559526824\n📧 Email: covasol.studio@gmail.com');
      setTimeout(() => setFormState('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="contact-form" data-aos="fade-up">
      <form id="quoteForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Họ và tên *"
            data-key="contact-form-name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={formState === 'loading'}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email *"
            data-key="contact-form-email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={formState === 'loading'}
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Số điện thoại *"
            data-key="contact-form-phone"
            required
            value={formData.phone}
            onChange={handleChange}
            disabled={formState === 'loading'}
          />
        </div>
        <div className="form-group">
          <select
            id="service"
            name="service"
            required
            value={formData.service}
            onChange={handleChange}
            disabled={formState === 'loading'}
          >
            {contactServices.map(option => (
              <option value={option.value} data-key={option.textKey} key={option.textKey}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Mô tả chi tiết yêu cầu của bạn... *"
            data-key="contact-form-message"
            required
            value={formData.message}
            onChange={handleChange}
            disabled={formState === 'loading'}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          id="submitBtn"
          disabled={formState === 'loading'}
        >
          {formState === 'loading' ? (
            <>
              <span>Đang gửi...</span>
              <i className="fas fa-spinner fa-spin" />
            </>
          ) : formState === 'success' ? (
            <>
              <span>Đã gửi thành công!</span>
              <i className="fas fa-check" />
            </>
          ) : (
            <>
              <span data-key="contact-form-submit">Gửi yêu cầu báo giá</span>
              <i className="fas fa-paper-plane" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
