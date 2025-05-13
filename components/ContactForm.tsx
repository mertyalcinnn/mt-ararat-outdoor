'use client';

import { useState, FormEvent } from 'react';
import { Locale } from '@/lib/i18n';

interface ContactFormProps {
  lang?: Locale;
}

export default function ContactForm({ lang = 'tr' }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    activity: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Dile göre çeviriler
  const translations = {
    tr: {
      fullName: "İsim Soyisim *",
      email: "E-posta *",
      phone: "Telefon",
      interestedActivity: "İlgilendiğiniz Aktivite",
      select: "Seçiniz",
      subject: "Konu *",
      message: "Mesajınız *",
      sending: "Gönderiliyor...",
      send: "Mesajı Gönder",
      success: {
        title: "Mesajınız Gönderildi!",
        message: "Teşekkürler! Mesajınızı aldık. En kısa sürede size geri dönüş yapacağız.",
        newMessage: "Yeni bir mesaj gönderin"
      },
      error: "Form gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
    },
    en: {
      fullName: "Full Name *",
      email: "Email *",
      phone: "Phone",
      interestedActivity: "Activity of Interest",
      select: "Select",
      subject: "Subject *",
      message: "Your Message *",
      sending: "Sending...",
      send: "Send Message",
      success: {
        title: "Message Sent!",
        message: "Thank you! We have received your message. We will get back to you as soon as possible.",
        newMessage: "Send a new message"
      },
      error: "An error occurred while sending the form. Please try again later."
    },
    ru: {
      fullName: "Имя Фамилия *",
      email: "Эл. почта *",
      phone: "Телефон",
      interestedActivity: "Интересующее мероприятие",
      select: "Выбрать",
      subject: "Тема *",
      message: "Ваше сообщение *",
      sending: "Отправка...",
      send: "Отправить сообщение",
      success: {
        title: "Сообщение отправлено!",
        message: "Спасибо! Мы получили ваше сообщение. Мы свяжемся с вами как можно скорее.",
        newMessage: "Отправить новое сообщение"
      },
      error: "Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже."
    }
  };
  
  const text = translations[lang];
  
  const activityOptions = {
    tr: {
      "ski-touring": "Kayak Turu",
      "climbing": "Tırmanış",
      "sea-kayak-sup": "Deniz Kaynağı & SUP",
      "hiking": "Doğa Yürüyüşü",
      "private-guidance": "Özel Rehberlik"
    },
    en: {
      "ski-touring": "Ski Touring",
      "climbing": "Climbing",
      "sea-kayak-sup": "Sea Kayak & SUP",
      "hiking": "Hiking",
      "private-guidance": "Private Guidance" 
    },
    ru: {
      "ski-touring": "Лыжный тур",
      "climbing": "Альпинизм",
      "sea-kayak-sup": "Морской каяк и SUP",
      "hiking": "Пеший туризм",
      "private-guidance": "Частное руководство"
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Burada gerçek bir form gönderimi yapılacak
      // Şimdilik sadece simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Başarılı form gönderimi
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        activity: ''
      });
    } catch (error) {
      setSubmitError(text.error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">
          <h3 className="text-lg font-bold mb-2">{text.success.title}</h3>
          <p>{text.success.message}</p>
          <button 
            className="text-primary font-medium mt-4 hover:underline"
            onClick={() => setSubmitSuccess(false)}
          >
            {text.success.newMessage}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
              {submitError}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">{text.fullName}</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">{text.email}</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">{text.phone}</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="activity" className="block text-sm font-medium mb-1">{text.interestedActivity}</label>
              <select 
                id="activity" 
                name="activity" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
                value={formData.activity}
                onChange={handleChange}
              >
                <option value="">{text.select}</option>
                {Object.entries(activityOptions[lang]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium mb-1">{text.subject}</label>
            <input 
              type="text" 
              id="subject" 
              name="subject" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-1">{text.message}</label>
            <textarea 
              id="message" 
              name="message" 
              rows={5} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? text.sending : text.send}
          </button>
        </form>
      )}
    </div>
  );
}