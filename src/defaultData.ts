import type { AppData } from './types';

export const defaultData: AppData = {
  links: [
    {
      title: 'Header 1',
      entries: [
        { title: 'Google', url: 'https://www.google.com' },
        { title: 'Facebook', url: 'https://www.facebook.com' },
      ],
    },
    {
      title: 'Header 2',
      entries: [
        { title: 'Twitter', url: 'https://www.twitter.com' },
        "Separator",
        { title: 'LinkedIn', url: 'https://www.linkedin.com' },
      ],
    },
    {
      title: 'Header 3',
      entries: [
        { title: 'GitHub', url: 'https://www.github.com' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
        {
          title: 'Programming',
          links: [
            { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
            "Separator",
            { title: 'W3Schools', url: 'https://www.w3schools.com' },
          ],
        },
      ],
    },
  ],
  preferences: {
    background: '/bg.png',
    style: {
      favicons: true,
      linkButtons: true,
      theme: 'system',
    },
  },
};