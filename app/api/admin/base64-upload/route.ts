import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64Image } = await request.json();

    if (!base64Image) {
      return NextResponse.json(
        { error: 'Base64 görüntü verileri eksik' },
        { status: 400 }
      );
    }

    // Basit bir kontrol - düzgün formatlı bir base64 image string mi?
    if (!base64Image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Geçersiz base64 görüntü formatı' },
        { status: 400 }
      );
    }

    // Burada dosya kaydetmeden doğrudan aynı base64 veriyi kullan
    // Bu, sunucu hatalarını önler ama gönderilen veri boyutunu büyütür
    return NextResponse.json({ 
      success: true,
      url: base64Image,
      isBase64: true
    });
    
  } catch (error) {
    console.error('Base64 görüntü işleme hatası (detaylı):', error);
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : String(error);
      
    return NextResponse.json({
      error: 'Görüntü işlenirken bir hata oluştu',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}