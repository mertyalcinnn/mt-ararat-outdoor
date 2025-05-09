import Image from 'next/image';
import { Locale } from '@/lib/i18n';

interface TeamMemberProps {
  name: string;
  role: string;
  bio: string;
  image: string;
  lang?: Locale;
}

export default function TeamMember({ name, role, bio, image, lang = 'tr' }: TeamMemberProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-3 aspect-h-4 relative h-80">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-primary font-medium mb-4">{role}</p>
        <p className="text-dark/70">{bio}</p>
      </div>
    </div>
  );
}