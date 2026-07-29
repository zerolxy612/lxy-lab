export interface ContactLink {
  id: 'email' | 'github'
  label: string
  display: string
  href: string
  external: boolean
}

export const contactLinks: readonly ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    display: 'zerolxy612@gmail.com',
    href: 'mailto:zerolxy612@gmail.com',
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    display: '@zerolxy612',
    href: 'https://github.com/zerolxy612',
    external: true,
  },
]
