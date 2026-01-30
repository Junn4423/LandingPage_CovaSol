'use client';

import Script from 'next/script';

// GA4 Measurement ID - Replace with your actual GA4 ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}

// Helper functions for tracking events
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
}

export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title
    });
  }
}

// Track blog view
export function trackBlogView(postSlug: string, postTitle: string, category?: string) {
  trackEvent('view_blog_post', {
    post_slug: postSlug,
    post_title: postTitle,
    category: category || 'uncategorized'
  });
}

// Track product view
export function trackProductView(productSlug: string, productName: string, category?: string) {
  trackEvent('view_product', {
    product_slug: productSlug,
    product_name: productName,
    category: category || 'uncategorized'
  });
}

// Track contact form submission
export function trackContactSubmission() {
  trackEvent('contact_form_submit', {
    event_category: 'engagement',
    event_label: 'Contact Form'
  });
}

// Track social share
export function trackSocialShare(platform: string, contentType: string, contentTitle: string) {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    item_id: contentTitle
  });
}

// Track newsletter signup
export function trackNewsletterSignup() {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
    event_label: 'Newsletter'
  });
}
