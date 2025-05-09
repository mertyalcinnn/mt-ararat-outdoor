'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Testimonial {
  name: string;
  quote: string;
  avatar: string;
  activity: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const router = useRouter();

  // Aktiviteleri al
  const [activities, setActivities] = useState<string[]>([]);
  
  useEffect(() => {
    // Müşteri yorumlarını yükle
    fetch('/api/admin/testimonials')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setTestimonials(data);
        
        // Aktivite isimlerini topla
        const uniqueActivities = Array.from(new Set(data.map((t: Testimonial) => t.activity))).filter(Boolean);
        setActivities(uniqueActivities as string[]);
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching testimonials:', err);
        setError('Müşteri yorumları yüklenirken bir hata oluştu');
        setIsLoading(false);
      });
  }, []);

  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
    const updatedTestimonials = [...testimonials];
    updatedTestimonials[index] = {
      ...updatedTestimonials[index],
      [field]: value
    };
    
    setTestimonials(updatedTestimonials);
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      name: '',
      quote: '',
      avatar: '/images/testimonial-default.jpg',
      activity: activities.length > 0 ? activities[0] : 'General'
    };
    
    setTestimonials([...testimonials, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    if (window.confirm('Bu müşteri yorumunu silmek istediğinize emin misiniz?')) {
      const updatedTestimonials = [...testimonials];
      updatedTestimonials.splice(index, 1);
      setTestimonials(updatedTestimonials);
    }
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updatedTestimonials = [...testimonials];
      [updatedTestimonials[index], updatedTestimonials[index - 1]] = 
        [updatedTestimonials[index - 1], updatedTestimonials[index]];
      setTestimonials(updatedTestimonials);
    } else if (direction === 'down' && index < testimonials.length - 1) {
      const updatedTestimonials = [...testimonials];
      [updatedTestimonials[index], updatedTestimonials[index + 1]] = 
        [updatedTestimonials[index + 1], updatedTestimonials[index]];
      setTestimonials(updatedTestimonials);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bilinmeyen bir hata oluştu');
      }
      
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3">Müşteri yorumları yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Müşteri Yorumları</h1>
          <p className="text-sm text-gray-600">Müşteri yorumlarını düzenle ve yönet</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={addTestimonial}
            className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <i className="fas fa-plus mr-1"></i> Yeni Yorum Ekle
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Hata</p>
          <p>{error}</p>
        </div>
      )}

      {lastSaved && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <i className="fas fa-check-circle mr-1"></i> Son kaydetme: {lastSaved}
        </div>
      )}

      {testimonials.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <i className="fas fa-comments text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 mb-4">Henüz müşteri yorumu bulunmuyor.</p>
          <button
            onClick={addTestimonial}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-plus mr-1"></i> İlk Yorumu Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-medium text-blue-800">
                  {testimonial.name || 'Yeni Müşteri Yorumu'}
                </h3>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveTestimonial(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${
                      index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-arrow-up"></i>
                  </button>
                  
                  <button
                    onClick={() => moveTestimonial(index, 'down')}
                    disabled={index === testimonials.length - 1}
                    className={`p-1 rounded ${
                      index === testimonials.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-arrow-down"></i>
                  </button>
                  
                  <button
                    onClick={() => removeTestimonial(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Müşteri Adı
                      </label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: Ahmet Yılmaz"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yorum Metni
                      </label>
                      <textarea
                        value={testimonial.quote}
                        onChange={(e) => handleTestimonialChange(index, 'quote', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Müşteri yorumu..."
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        İlgili Aktivite
                      </label>
                      <select
                        value={testimonial.activity}
                        onChange={(e) => handleTestimonialChange(index, 'activity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="General">Genel</option>
                        <option value="Climbing">Climbing</option>
                        <option value="Ski Touring">Ski Touring</option>
                        <option value="Hiking">Hiking</option>
                        <option value="Sea Kayak & SUP">Sea Kayak & SUP</option>
                        <option value="Private Guidance">Private Guidance</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profil Görseli
                      </label>
                      <input
                        type="text"
                        value={testimonial.avatar}
                        onChange={(e) => handleTestimonialChange(index, 'avatar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="/images/testimonial-1.jpg"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Müşteri profil görselinin URL'i
                      </p>
                    </div>
                    
                    {testimonial.avatar && (
                      <div className="mt-4 flex justify-center">
                        <div className="w-24 h-24 border border-gray-200 rounded-full overflow-hidden">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={addTestimonial}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <i className="fas fa-plus mr-1"></i> Yeni Yorum Ekle
        </button>
        
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 text-white rounded transition-colors ${
            isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1"></i> Kaydediliyor...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-1"></i> Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>
    </>
  );
}