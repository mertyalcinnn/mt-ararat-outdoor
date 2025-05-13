// Global window tipi için Instagram embed API'sini tanımlama
interface Window {
  instgrm?: {
    Embeds: {
      process: () => void;
    };
  };
}
