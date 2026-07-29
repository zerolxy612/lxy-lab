import { contactLinks } from '../content/contact'

export function ContactLinks() {
  return (
    <nav className="contact-links" aria-label="Contact Xiangyu">
      <span aria-hidden="true">Open channel</span>
      {contactLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          aria-label={`Contact Xiangyu via ${link.label}: ${link.display}`}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'me noopener noreferrer' : undefined}
        >
          <span>{link.label}</span>
          <b>{link.display}</b>
          {link.external && <i aria-hidden="true">↗</i>}
        </a>
      ))}
    </nav>
  )
}
