import { useState } from 'react';

export function useChatBackgroundState() {
  const [chatBackgroundUrl, setChatBackgroundUrl] = useState<string | null>(null);

  return { 
    chatBackgroundUrl, 
    setChatBackgroundUrl 
  };
}
